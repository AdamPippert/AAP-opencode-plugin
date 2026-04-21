import { AAPClient } from './client';
import { AnsibleContentBuilder } from './content';
import type { AAPConfig, LaunchJobRequest, Playbook, PlaybookTask, RoleMetadata, CollectionMetadata } from './types';

// Plugin context interface matching OpenCode's structure
interface PluginContext {
  project: {
    name: string;
    path: string;
  };
  directory: string;
  worktree: string;
  client: {
    app: {
      log: (options: {
        service: string;
        level: 'debug' | 'info' | 'warn' | 'error';
        message: string;
        extra?: Record<string, unknown>;
      }) => Promise<void>;
    };
  };
  $: {
    (strings: TemplateStringsArray, ...values: unknown[]): Promise<{ text: () => string }>;
  };
}

// Tool schema interfaces
interface StringSchema {
  describe: (description: string) => StringSchema;
}

interface NumberSchema {
  describe: (description: string) => NumberSchema;
}

interface BooleanSchema {
  describe: (description: string) => BooleanSchema;
}

interface ToolSchema {
  string: () => StringSchema;
  number: () => NumberSchema;
  boolean: () => BooleanSchema;
  optional: <T>(schema: T) => T;
}

interface ToolConfig {
  description: string;
  args: Record<string, unknown>;
  execute: (
    args: Record<string, unknown>,
    context: { directory: string; worktree: string }
  ) => Promise<string>;
}

interface ToolHelper {
  schema: ToolSchema;
  (config: ToolConfig): unknown;
}

// The tool function will be provided by OpenCode at runtime
declare const tool: ToolHelper;

let aapClient: AAPClient | null = null;

function initializeClient(config: AAPConfig): AAPClient {
  aapClient = new AAPClient(config);
  return aapClient;
}

function getClient(): AAPClient {
  if (!aapClient) {
    throw new Error('AAP client not initialized. Please configure the AAP connection first.');
  }
  return aapClient;
}

const AAPPlugin = (_ctx: PluginContext): { tool: Record<string, unknown> } => {
  return {
    tool: {
      // Configuration tool
      aap_configure: tool({
        description: 'Configure connection to Ansible Automation Platform cluster',
        args: {
          baseUrl: tool.schema.string().describe('Base URL of the AAP cluster (e.g., https://aap-aap.ocp-lab.demodomain.us)'),
          username: tool.schema.optional(tool.schema.string()).describe('Username for authentication'),
          password: tool.schema.optional(tool.schema.string()).describe('Password for authentication'),
          oauthToken: tool.schema.optional(tool.schema.string()).describe('OAuth2 token for authentication'),
          verifySsl: tool.schema.optional(tool.schema.boolean()).describe('Whether to verify SSL certificates'),
        },
        async execute(args) {
          const config: AAPConfig = {
            baseUrl: args.baseUrl as string,
            username: args.username as string | undefined,
            password: args.password as string | undefined,
            oauthToken: args.oauthToken as string | undefined,
            verifySsl: args.verifySsl as boolean | undefined ?? true,
          };
          
          initializeClient(config);
          
          try {
            getClient().authenticate();
            const versions = await getClient().getApiVersions();
            return `Successfully connected to AAP cluster. API version: ${versions.current_version}`;
          } catch (error) {
            throw new Error(`Failed to connect to AAP cluster: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      }),

      // Job Template tools
      aap_list_job_templates: tool({
        description: 'List job templates from Ansible Automation Platform',
        args: {
          search: tool.schema.optional(tool.schema.string()).describe('Search term to filter templates'),
          limit: tool.schema.optional(tool.schema.number()).describe('Maximum number of results to return'),
        },
        async execute(args) {
          const client = getClient();
          const filters: { page_size?: number } = {};
          if (args.limit) {
            filters.page_size = args.limit as number;
          }
          
          const response = await client.getJobTemplates(filters, args.search as string | undefined);
          const templates = response.results.map(t => `- ${t.name} (ID: ${t.id}): ${t.description ?? 'No description'}`).join('\n');
          return `Found ${response.count} job templates:\n${templates}`;
        },
      }),

      aap_get_job_template: tool({
        description: 'Get detailed information about a specific job template',
        args: {
          id: tool.schema.number().describe('ID of the job template'),
        },
        async execute(args) {
          const client = getClient();
          const template = await client.getJobTemplate(args.id as number);
          return `Job Template: ${template.name}\nID: ${template.id}\nDescription: ${template.description || 'N/A'}\nPlaybook: ${template.playbook}\nInventory ID: ${template.inventory}\nProject ID: ${template.project}`;
        },
      }),

      aap_launch_job: tool({
        description: 'Launch a job from a job template',
        args: {
          templateId: tool.schema.number().describe('ID of the job template to launch'),
          limit: tool.schema.optional(tool.schema.string()).describe('Limit execution to specific hosts'),
          extraVars: tool.schema.optional(tool.schema.string()).describe('Extra variables as JSON string'),
          jobTags: tool.schema.optional(tool.schema.string()).describe('Tags to execute'),
          skipTags: tool.schema.optional(tool.schema.string()).describe('Tags to skip'),
          inventory: tool.schema.optional(tool.schema.number()).describe('Inventory ID to use'),
          scmBranch: tool.schema.optional(tool.schema.string()).describe('SCM branch to use'),
        },
        async execute(args) {
          const client = getClient();
          const request: LaunchJobRequest = {};
          if (args.limit) request.limit = args.limit as string;
          if (args.extraVars) request.extra_vars = args.extraVars as string;
          if (args.jobTags) request.job_tags = args.jobTags as string;
          if (args.skipTags) request.skip_tags = args.skipTags as string;
          if (args.inventory) request.inventory = args.inventory as number;
          if (args.scmBranch) request.scm_branch = args.scmBranch as string;
          
          const response = await client.launchJob(args.templateId as number, request);
          return `Job launched successfully. Job ID: ${response.job}`;
        },
      }),

      aap_get_job_status: tool({
        description: 'Get the status of a running or completed job',
        args: {
          jobId: tool.schema.number().describe('ID of the job'),
        },
        async execute(args) {
          const client = getClient();
          const job = await client.getJob(args.jobId as number);
          return `Job ${job.name} (ID: ${job.id}):\nStatus: ${job.status}\nStarted: ${job.started ?? 'N/A'}\nFinished: ${job.finished ?? 'N/A'}\nElapsed: ${job.elapsed}s\nFailed: ${job.failed}`;
        },
      }),

      aap_get_job_output: tool({
        description: 'Get the stdout output of a completed job',
        args: {
          jobId: tool.schema.number().describe('ID of the job'),
          format: tool.schema.optional(tool.schema.string()).describe('Output format (json, txt, or ansi)'),
        },
        async execute(args) {
          const client = getClient();
          const format = (args.format as 'json' | 'txt' | 'ansi' | undefined) ?? 'txt';
          const output = await client.getJobStdout(args.jobId as number, format);
          return output;
        },
      }),

      aap_cancel_job: tool({
        description: 'Cancel a running job',
        args: {
          jobId: tool.schema.number().describe('ID of the job to cancel'),
        },
        async execute(args) {
          const client = getClient();
          await client.cancelJob(args.jobId as number);
          return `Job ${String(args.jobId)} cancelled successfully`;
        },
      }),

      // Inventory tools
      aap_list_inventories: tool({
        description: 'List inventories from Ansible Automation Platform',
        args: {
          search: tool.schema.optional(tool.schema.string()).describe('Search term to filter inventories'),
        },
        async execute(args) {
          const client = getClient();
          const response = await client.getInventories(undefined, args.search as string | undefined);
          const inventories = response.results.map(i => `- ${i.name} (ID: ${i.id}): ${i.description ?? 'No description'} - Hosts: ${i.total_hosts}`).join('\n');
          return `Found ${response.count} inventories:\n${inventories}`;
        },
      }),

      aap_list_hosts: tool({
        description: 'List hosts in an inventory',
        args: {
          inventoryId: tool.schema.number().describe('ID of the inventory'),
          search: tool.schema.optional(tool.schema.string()).describe('Search term to filter hosts'),
        },
        async execute(args) {
          const client = getClient();
          const response = await client.getHosts(args.inventoryId as number, undefined, args.search as string | undefined);
          const hosts = response.results.map(h => `- ${h.name} (ID: ${h.id}): Enabled: ${h.enabled}`).join('\n');
          return `Found ${response.count} hosts in inventory:\n${hosts}`;
        },
      }),

      // Project tools
      aap_list_projects: tool({
        description: 'List projects from Ansible Automation Platform',
        args: {
          search: tool.schema.optional(tool.schema.string()).describe('Search term to filter projects'),
        },
        async execute(args) {
          const client = getClient();
          const response = await client.getProjects(undefined, args.search as string | undefined);
          const projects = response.results.map(p => `- ${p.name} (ID: ${p.id}): ${p.description ?? 'No description'} - Status: ${p.status} - SCM: ${p.scm_type}`).join('\n');
          return `Found ${response.count} projects:\n${projects}`;
        },
      }),

      aap_sync_project: tool({
        description: 'Sync a project from its SCM source',
        args: {
          projectId: tool.schema.number().describe('ID of the project to sync'),
        },
        async execute(args) {
          const client = getClient();
          const job = await client.syncProject(args.projectId as number);
          return `Project sync initiated. Job ID: ${job.id}`;
        },
      }),

      // Organization tools
      aap_list_organizations: tool({
        description: 'List organizations from Ansible Automation Platform',
        args: {
          search: tool.schema.optional(tool.schema.string()).describe('Search term to filter organizations'),
        },
        async execute(args) {
          const client = getClient();
          const response = await client.getOrganizations(undefined, args.search as string | undefined);
          const orgs = response.results.map(o => `- ${o.name} (ID: ${o.id}): ${o.description ?? 'No description'}`).join('\n');
          return `Found ${response.count} organizations:\n${orgs}`;
        },
      }),

      // Content generation tools
      aap_generate_playbook: tool({
        description: 'Generate an Ansible playbook YAML content',
        args: {
          name: tool.schema.string().describe('Name of the playbook'),
          hosts: tool.schema.string().describe('Target hosts pattern'),
          tasks: tool.schema.string().describe('Tasks as JSON array'),
          vars: tool.schema.optional(tool.schema.string()).describe('Variables as JSON object'),
          become: tool.schema.optional(tool.schema.boolean()).describe('Whether to use privilege escalation'),
        },
        execute(args) {
          const play = {
            name: args.name as string,
            hosts: args.hosts as string,
            tasks: JSON.parse(args.tasks as string) as PlaybookTask[],
          };
          
          if (args.become !== undefined) {
            (play as Record<string, unknown>).become = args.become as boolean;
          }
          if (args.vars) {
            (play as Record<string, unknown>).vars = JSON.parse(args.vars as string) as Record<string, unknown>;
          }
          
          const playbook: Playbook = {
            plays: [play as import('./content').Play],
          };
          
          const yaml = AnsibleContentBuilder.generatePlaybook(playbook);
          return Promise.resolve(yaml);
        },
      }),

      aap_generate_role: tool({
        description: 'Generate an Ansible role structure',
        args: {
          name: tool.schema.string().describe('Name of the role'),
          description: tool.schema.optional(tool.schema.string()).describe('Description of the role'),
          author: tool.schema.optional(tool.schema.string()).describe('Author name'),
          version: tool.schema.optional(tool.schema.string()).describe('Version (default: 1.0.0)'),
        },
        execute(args) {
          const metadata: RoleMetadata = {
            name: args.name as string,
            description: args.description as string | undefined,
            author: args.author as string | undefined,
            version: args.version as string | undefined,
          };
          
          const files = AnsibleContentBuilder.generateRoleStructure(metadata);
          const fileList = Array.from(files.keys()).map(f => `- ${f}`).join('\n');
          return Promise.resolve(`Generated role structure for "${metadata.name}" with ${files.size} files:\n${fileList}`);
        },
      }),

      aap_generate_collection: tool({
        description: 'Generate an Ansible collection structure',
        args: {
          namespace: tool.schema.string().describe('Namespace for the collection'),
          name: tool.schema.string().describe('Name of the collection'),
          version: tool.schema.string().describe('Version (e.g., 1.0.0)'),
          description: tool.schema.optional(tool.schema.string()).describe('Description of the collection'),
        },
        execute(args) {
          const metadata: CollectionMetadata = {
            namespace: args.namespace as string,
            name: args.name as string,
            version: args.version as string,
            description: args.description as string | undefined,
          };
          
          const files = AnsibleContentBuilder.generateCollectionStructure(metadata);
          const fileList = Array.from(files.keys()).map(f => `- ${f}`).join('\n');
          return Promise.resolve(`Generated collection structure "${metadata.namespace}.${metadata.name}" with ${files.size} files:\n${fileList}`);
        },
      }),

      aap_create_oauth_token: tool({
        description: 'Create an OAuth2 token for API authentication',
        args: {},
        async execute() {
          const client = getClient();
          const token = await client.createOAuthToken();
          return `OAuth2 token created. Token: ${token.token}\nExpires: ${token.expires}`;
        },
      }),

      // AAP 2.7 — Platform status
      aap_get_platform_status: tool({
        description: 'Get the overall health and version status of the AAP platform (gateway v1)',
        args: {},
        async execute() {
          const client = getClient();
          const status = await client.getPlatformStatus();
          const lines = [
            `Status: ${status.status}`,
            `Version: ${status.version}`,
          ];
          if (status.active_node) lines.push(`Active node: ${status.active_node}`);
          if (status.install_uuid) lines.push(`Install UUID: ${status.install_uuid}`);
          if (status.error) lines.push(`Error: ${status.error}`);
          return lines.join('\n');
        },
      }),

      // AAP 2.7 — Teams
      aap_list_teams: tool({
        description: 'List teams from the AAP platform gateway (AAP 2.7+)',
        args: {
          search: tool.schema.optional(tool.schema.string()).describe('Search term to filter teams'),
        },
        async execute(args) {
          const client = getClient();
          const response = await client.getTeams(undefined, args.search as string | undefined);
          const teams = response.results.map(t => `- ${t.name} (ID: ${t.id}): ${t.description ?? 'No description'} [org: ${t.organization}]`).join('\n');
          return `Found ${response.count} teams:\n${teams}`;
        },
      }),

      // AAP 2.7 — Users
      aap_list_users: tool({
        description: 'List users from the AAP platform gateway (AAP 2.7+)',
        args: {
          search: tool.schema.optional(tool.schema.string()).describe('Search term to filter users'),
        },
        async execute(args) {
          const client = getClient();
          const response = await client.getUsers(undefined, args.search as string | undefined);
          const users = response.results.map(u => `- ${u.username} (ID: ${u.id}): ${u.first_name} ${u.last_name} <${u.email}> superuser=${u.is_superuser}`).join('\n');
          return `Found ${response.count} users:\n${users}`;
        },
      }),

      // AAP 2.7 — RBAC
      aap_list_role_definitions: tool({
        description: 'List role definitions from the AAP platform gateway (AAP 2.7+)',
        args: {
          search: tool.schema.optional(tool.schema.string()).describe('Search term to filter role definitions'),
          contentType: tool.schema.optional(tool.schema.string()).describe('Filter by content type (e.g. aap.organization)'),
        },
        async execute(args) {
          const client = getClient();
          const filters = args.contentType ? { content_type__model: args.contentType as string } : undefined;
          const response = await client.getRoleDefinitions(filters, args.search as string | undefined);
          const roles = response.results.map(r => `- ${r.name} (ID: ${r.id}): ${r.description} [managed=${r.managed}, type=${r.content_type ?? 'system'}]`).join('\n');
          return `Found ${response.count} role definitions:\n${roles}`;
        },
      }),

      aap_list_role_assignments: tool({
        description: 'List role assignments for a user or team from the AAP platform gateway (AAP 2.7+)',
        args: {
          userId: tool.schema.optional(tool.schema.number()).describe('Filter assignments by user ID'),
          teamId: tool.schema.optional(tool.schema.number()).describe('Filter assignments by team ID'),
        },
        async execute(args) {
          const client = getClient();
          const lines: string[] = [];

          if (args.userId) {
            const response = await client.getRoleUserAssignments({ user: args.userId as number });
            lines.push(`User ${String(args.userId)} has ${response.count} role assignment(s):`);
            response.results.forEach(a => {
              lines.push(`  - role_definition=${a.role_definition} on ${a.content_type ?? 'system'} id=${a.object_id ?? '*'}`);
            });
          }

          if (args.teamId) {
            const response = await client.getRoleTeamAssignments({ team: args.teamId as number });
            lines.push(`Team ${String(args.teamId)} has ${response.count} role assignment(s):`);
            response.results.forEach(a => {
              lines.push(`  - role_definition=${a.role_definition} on ${a.content_type ?? 'system'} id=${a.object_id ?? '*'}`);
            });
          }

          if (!args.userId && !args.teamId) {
            const [users, teams] = await Promise.all([
              client.getRoleUserAssignments(),
              client.getRoleTeamAssignments(),
            ]);
            lines.push(`Total user role assignments: ${users.count}`);
            lines.push(`Total team role assignments: ${teams.count}`);
          }

          return lines.join('\n');
        },
      }),

      // AAP 2.7 — Activity stream
      aap_get_activity_stream: tool({
        description: 'Get the platform activity stream showing recent create/update/delete operations (AAP 2.7+)',
        args: {
          limit: tool.schema.optional(tool.schema.number()).describe('Maximum number of entries to return (default 20)'),
          objectType: tool.schema.optional(tool.schema.string()).describe('Filter by object type (e.g. aap.organization)'),
        },
        async execute(args) {
          const client = getClient();
          const filters: Record<string, unknown> = {};
          if (args.limit) filters.page_size = args.limit as number;
          if (args.objectType) filters.object_type = args.objectType as string;
          const response = await client.getActivityStream(filters as Parameters<typeof client.getActivityStream>[0], '-timestamp');
          const entries = response.results.map(e => {
            const actor = e.actor ? e.actor.username : 'system';
            return `- [${e.timestamp}] ${e.operation} ${e.object_type}#${e.object_id} by ${actor}`;
          }).join('\n');
          return `Activity stream (${response.count} total, showing ${response.results.length}):\n${entries}`;
        },
      }),

      // AAP 2.7 — Event-Driven Ansible
      aap_list_eda_rulebooks: tool({
        description: 'List Event-Driven Ansible rulebooks (AAP 2.7+)',
        args: {
          search: tool.schema.optional(tool.schema.string()).describe('Search term to filter rulebooks'),
        },
        async execute(args) {
          const client = getClient();
          const response = await client.getEDARulebooks(undefined, args.search as string | undefined);
          const books = response.results.map(r => `- ${r.name} (ID: ${r.id}): ${r.description ?? 'No description'} [rules=${r.rule_count}, fires=${r.fire_count}]`).join('\n');
          return `Found ${response.count} EDA rulebooks:\n${books}`;
        },
      }),

      aap_list_eda_activations: tool({
        description: 'List Event-Driven Ansible activations (AAP 2.7+)',
        args: {
          search: tool.schema.optional(tool.schema.string()).describe('Search term to filter activations'),
          status: tool.schema.optional(tool.schema.string()).describe('Filter by status (running, stopped, failed, completed)'),
        },
        async execute(args) {
          const client = getClient();
          const filters = args.status ? { status: args.status as string } : undefined;
          const response = await client.getEDAActivations(filters, args.search as string | undefined);
          const activations = response.results.map(a => `- ${a.name} (ID: ${a.id}): status=${a.status} enabled=${a.enabled} restart=${a.restart_policy}`).join('\n');
          return `Found ${response.count} EDA activations:\n${activations}`;
        },
      }),

      aap_create_eda_activation: tool({
        description: 'Create an Event-Driven Ansible activation to start listening on a rulebook (AAP 2.7+)',
        args: {
          name: tool.schema.string().describe('Name of the activation'),
          rulebookId: tool.schema.number().describe('ID of the rulebook to activate'),
          decisionEnvironmentId: tool.schema.number().describe('ID of the decision environment to use'),
          description: tool.schema.optional(tool.schema.string()).describe('Description of the activation'),
          projectId: tool.schema.optional(tool.schema.number()).describe('ID of the project (if rulebook is from a project)'),
          restartPolicy: tool.schema.optional(tool.schema.string()).describe('Restart policy: on-failure, always, or never'),
          extraVar: tool.schema.optional(tool.schema.string()).describe('Extra variables as JSON string'),
        },
        async execute(args) {
          const client = getClient();
          const activation = await client.createEDAActivation({
            name: args.name as string,
            rulebook: args.rulebookId as number,
            decision_environment: args.decisionEnvironmentId as number,
            description: args.description as string | undefined,
            project: args.projectId as number | undefined,
            restart_policy: (args.restartPolicy as 'on-failure' | 'always' | 'never' | undefined) ?? 'on-failure',
            extra_var: args.extraVar as string | undefined,
          });
          return `EDA activation "${activation.name}" created (ID: ${activation.id}). Status: ${activation.status}`;
        },
      }),
    },
  };
};

export default AAPPlugin;
export { AAPClient, AnsibleContentBuilder };
export type * from './types';
