import { describe, it, expect } from 'vitest';
import type {
  AAPConfig,
  APIResponse,
  JobTemplate,
  Job,
  LaunchJobRequest,
  Team,
  User,
  RoleDefinition,
  RoleTeamAssignment,
  RoleUserAssignment,
  PlatformStatus,
  ActivityStreamEntry,
  EDARulebook,
  EDAActivation,
} from '../src/types';

describe('Types', () => {
  describe('AAPConfig', () => {
    it('should accept minimal config', () => {
      const config: AAPConfig = {
        baseUrl: 'https://aap.example.com',
      };
      expect(config.baseUrl).toBe('https://aap.example.com');
    });

    it('should accept full config with credentials', () => {
      const config: AAPConfig = {
        baseUrl: 'https://aap.example.com',
        username: 'admin',
        password: 'secret',
        oauthToken: 'token123',
        verifySsl: true,
      };
      expect(config.username).toBe('admin');
      expect(config.verifySsl).toBe(true);
    });
  });

  describe('APIResponse', () => {
    it('should have correct structure', () => {
      const response: APIResponse<JobTemplate> = {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            name: 'Template 1',
            description: 'First template',
            job_type: 'run',
            inventory: 1,
            project: 1,
            playbook: 'site.yml',
            forks: 0,
            limit: '',
            verbosity: 0,
            extra_vars: '',
            job_tags: '',
            force_handlers: false,
            skip_tags: '',
            start_at_task: '',
            timeout: 0,
            use_fact_cache: false,
            execution_environment: null,
            host_config_key: '',
            ask_scm_branch_on_launch: false,
            ask_diff_mode_on_launch: false,
            ask_variables_on_launch: false,
            ask_limit_on_launch: false,
            ask_tags_on_launch: false,
            ask_skip_tags_on_launch: false,
            ask_job_type_on_launch: false,
            ask_verbosity_on_launch: false,
            ask_inventory_on_launch: false,
            ask_credential_on_launch: false,
            ask_execution_environment_on_launch: false,
            ask_labels_on_launch: false,
            ask_forks_on_launch: false,
            ask_job_slice_count_on_launch: false,
            ask_timeout_on_launch: false,
            survey_enabled: false,
            become_enabled: false,
            diff_mode: false,
            allow_simultaneous: false,
            custom_virtualenv: null,
            job_slice_count: 1,
            webhook_service: '',
            webhook_credential: null,
          },
        ],
      };
      expect(response.count).toBe(2);
      expect(response.results[0].name).toBe('Template 1');
    });
  });

  describe('Job', () => {
    it('should have all required fields', () => {
      const job: Job = {
        id: 1,
        name: 'Test Job',
        type: 'job',
        url: '/api/controller/v2/jobs/1/',
        related: {
          created_by: '',
          labels: '',
          inventory: '',
          project: '',
          organization: '',
          credentials: '',
          unified_job_template: '',
          stdout: '',
          execution_environment: '',
          job_events: '',
          job_host_summaries: '',
          activity_stream: '',
          notifications: '',
          create_schedule: '',
        },
        summary_fields: {
          organization: { id: 1, name: 'Default', description: '' },
          inventory: { id: 1, name: 'Local', description: '' },
          execution_environment: null,
          project: { id: 1, name: 'Project', description: '', status: 'successful', scm_type: 'git' },
          job_template: { id: 1, name: 'Template', description: '' },
          unified_job_template: { id: 1, name: 'Template', description: '', unified_job_type: 'job' },
          credentials: [],
        },
        created: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        job_template: 1,
        project: 1,
        inventory: 1,
        organization: 1,
        execution_environment: null,
        credentials: [],
        execution_node: '',
        controller_node: '',
        resolved_execution_environment: null,
        hosts: 0,
        playbook: 'site.yml',
        forks: 0,
        limit: '',
        verbosity: 0,
        extra_vars: '',
        job_tags: '',
        force_handlers: false,
        skip_tags: '',
        start_at_task: '',
        timeout: 0,
        use_fact_cache: false,
        job_type: 'run',
        scm_branch: '',
        diff_mode: false,
        job_slice_number: 0,
        job_slice_count: 1,
        webhook_service: '',
        webhook_credential: null,
        status: 'successful',
        failed: false,
        started: '2024-01-01T00:00:00Z',
        finished: '2024-01-01T00:01:00Z',
        canceled_on: null,
        elapsed: 60,
        job_explanation: '',
        execution_node_text: '',
        controller_node_text: '',
      };
      expect(job.status).toBe('successful');
      expect(job.failed).toBe(false);
    });
  });

  describe('Team', () => {
    it('should have required gateway v1 fields', () => {
      const team: Team = {
        id: 1,
        name: 'Ops Team',
        description: 'Operations team',
        organization: 1,
      };
      expect(team.name).toBe('Ops Team');
      expect(team.organization).toBe(1);
    });
  });

  describe('User', () => {
    it('should have required gateway v1 fields', () => {
      const user: User = {
        id: 1,
        username: 'jsmith',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jsmith@example.com',
        is_superuser: false,
        is_system_auditor: false,
      };
      expect(user.username).toBe('jsmith');
      expect(user.is_superuser).toBe(false);
    });
  });

  describe('RoleDefinition', () => {
    it('should have required gateway v1 fields', () => {
      const role: RoleDefinition = {
        id: 1,
        name: 'Organization Admin',
        description: 'Full control of organization',
        content_type: 'aap.organization',
        permissions: ['add', 'change', 'delete', 'view'],
        managed: true,
      };
      expect(role.name).toBe('Organization Admin');
      expect(role.managed).toBe(true);
    });
  });

  describe('RoleTeamAssignment', () => {
    it('should have required gateway v1 fields', () => {
      const assignment: RoleTeamAssignment = {
        id: 1,
        team: 1,
        role_definition: 1,
        object_id: 2,
        content_type: 'aap.organization',
      };
      expect(assignment.team).toBe(1);
      expect(assignment.role_definition).toBe(1);
    });
  });

  describe('RoleUserAssignment', () => {
    it('should have required gateway v1 fields', () => {
      const assignment: RoleUserAssignment = {
        id: 1,
        user: 1,
        role_definition: 1,
        object_id: 2,
        content_type: 'aap.organization',
      };
      expect(assignment.user).toBe(1);
      expect(assignment.content_type).toBe('aap.organization');
    });
  });

  describe('PlatformStatus', () => {
    it('should have required gateway v1 status fields', () => {
      const status: PlatformStatus = {
        status: 'ok',
        version: '2.7.0',
      };
      expect(status.status).toBe('ok');
    });
  });

  describe('ActivityStreamEntry', () => {
    it('should have required gateway v1 fields', () => {
      const entry: ActivityStreamEntry = {
        id: 1,
        timestamp: '2024-01-01T00:00:00Z',
        operation: 'create',
        object1: 'organization',
        object2: '',
        object_type: 'aap.organization',
        object_id: 1,
      };
      expect(entry.operation).toBe('create');
    });
  });

  describe('EDARulebook', () => {
    it('should have required EDA fields', () => {
      const rulebook: EDARulebook = {
        id: 1,
        name: 'my-rulebook',
        description: 'Handles alerts',
        project: 1,
        rule_count: 3,
        fire_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        modified_at: '2024-01-01T00:00:00Z',
      };
      expect(rulebook.name).toBe('my-rulebook');
      expect(rulebook.rule_count).toBe(3);
    });
  });

  describe('EDAActivation', () => {
    it('should have required EDA fields', () => {
      const activation: EDAActivation = {
        id: 1,
        name: 'my-activation',
        description: 'Active rule listener',
        status: 'running',
        rulebook: 1,
        decision_environment: 1,
        project: 1,
        enabled: true,
        restart_policy: 'on-failure',
        created_at: '2024-01-01T00:00:00Z',
        modified_at: '2024-01-01T00:00:00Z',
      };
      expect(activation.status).toBe('running');
      expect(activation.enabled).toBe(true);
    });
  });

  describe('LaunchJobRequest', () => {
    it('should accept empty request', () => {
      const request: LaunchJobRequest = {};
      expect(Object.keys(request)).toHaveLength(0);
    });

    it('should accept full request', () => {
      const request: LaunchJobRequest = {
        limit: 'webservers',
        extra_vars: '{"key": "value"}',
        job_tags: 'deploy',
        skip_tags: 'skip',
        inventory: 1,
        credentials: [1, 2],
        scm_branch: 'main',
        forks: 5,
        verbosity: 2,
        diff_mode: true,
      };
      expect(request.limit).toBe('webservers');
    });
  });
});
