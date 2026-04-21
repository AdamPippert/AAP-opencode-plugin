export interface AAPConfig {
  baseUrl: string;
  username?: string;
  password?: string;
  oauthToken?: string;
  verifySsl?: boolean;
}

export interface AAPAuth {
  type: 'basic' | 'oauth' | 'session';
  token?: string;
  username?: string;
  password?: string;
  sessionCookie?: string;
}

export interface APIResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface JobTemplate {
  id: number;
  name: string;
  description: string;
  job_type: string;
  inventory: number;
  project: number;
  playbook: string;
  forks: number;
  limit: string;
  verbosity: number;
  extra_vars: string;
  job_tags: string;
  force_handlers: boolean;
  skip_tags: string;
  start_at_task: string;
  timeout: number;
  use_fact_cache: boolean;
  execution_environment: number | null;
  host_config_key: string;
  ask_scm_branch_on_launch: boolean;
  ask_diff_mode_on_launch: boolean;
  ask_variables_on_launch: boolean;
  ask_limit_on_launch: boolean;
  ask_tags_on_launch: boolean;
  ask_skip_tags_on_launch: boolean;
  ask_job_type_on_launch: boolean;
  ask_verbosity_on_launch: boolean;
  ask_inventory_on_launch: boolean;
  ask_credential_on_launch: boolean;
  ask_execution_environment_on_launch: boolean;
  ask_labels_on_launch: boolean;
  ask_forks_on_launch: boolean;
  ask_job_slice_count_on_launch: boolean;
  ask_timeout_on_launch: boolean;
  survey_enabled: boolean;
  become_enabled: boolean;
  diff_mode: boolean;
  allow_simultaneous: boolean;
  custom_virtualenv: string | null;
  job_slice_count: number;
  webhook_service: string;
  webhook_credential: number | null;
  related?: {
    launch: string;
    schedules: string;
    webhook_key: string;
    webhook_receiver: string;
  };
}

export interface Job {
  id: number;
  name: string;
  type: string;
  url: string;
  related: {
    created_by: string;
    labels: string;
    inventory: string;
    project: string;
    organization: string;
    credentials: string;
    unified_job_template: string;
    stdout: string;
    execution_environment: string;
    job_events: string;
    job_host_summaries: string;
    activity_stream: string;
    notifications: string;
    create_schedule: string;
  };
  summary_fields: {
    organization: {
      id: number;
      name: string;
      description: string;
    };
    inventory: {
      id: number;
      name: string;
      description: string;
    };
    execution_environment: {
      id: number;
      name: string;
      description: string;
    } | null;
    project: {
      id: number;
      name: string;
      description: string;
      status: string;
      scm_type: string;
    };
    job_template: {
      id: number;
      name: string;
      description: string;
    };
    unified_job_template: {
      id: number;
      name: string;
      description: string;
      unified_job_type: string;
    };
    credentials: Array<{
      id: number;
      name: string;
      description: string;
      kind: string;
      cloud: boolean;
    }>;
  };
  created: string;
  modified: string;
  job_template: number;
  project: number;
  inventory: number;
  organization: number;
  execution_environment: number | null;
  credentials: number[];
  execution_node: string;
  controller_node: string;
  resolved_execution_environment: number | null;
  hosts: number;
  playbook: string;
  forks: number;
  limit: string;
  verbosity: number;
  extra_vars: string;
  job_tags: string;
  force_handlers: boolean;
  skip_tags: string;
  start_at_task: string;
  timeout: number;
  use_fact_cache: boolean;
  job_type: string;
  scm_branch: string;
  diff_mode: boolean;
  job_slice_number: number;
  job_slice_count: number;
  webhook_service: string;
  webhook_credential: number | null;
  status: 'new' | 'pending' | 'waiting' | 'running' | 'successful' | 'failed' | 'error' | 'canceled';
  failed: boolean;
  started: string | null;
  finished: string | null;
  canceled_on: string | null;
  elapsed: number;
  job_explanation: string;
  execution_node_text: string;
  controller_node_text: string;
}

export interface Inventory {
  id: number;
  name: string;
  description: string;
  organization: number;
  kind: string;
  host_filter: string | null;
  variables: string;
  has_active_failures: boolean;
  total_hosts: number;
  hosts_with_active_failures: number;
  total_groups: number;
  has_inventory_sources: boolean;
  total_inventory_sources: number;
  inventory_sources_with_failures: number;
  pending_deletion: boolean;
  prevent_instance_group_fallback: boolean;
}

export interface Host {
  id: number;
  name: string;
  description: string;
  inventory: number;
  enabled: boolean;
  instance_id: string;
  variables: string;
  has_active_failures: boolean;
  has_inventory_sources: boolean;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  organization: number;
  scm_type: string;
  scm_url: string;
  scm_branch: string;
  scm_refspec: string;
  scm_clean: boolean;
  scm_delete_on_update: boolean;
  credential: number | null;
  timeout: number;
  scm_update_on_launch: boolean;
  scm_update_cache_timeout: number;
  allow_override: boolean;
  default_environment: number | null;
  custom_virtualenv: string | null;
  status: 'new' | 'pending' | 'waiting' | 'running' | 'successful' | 'failed' | 'error' | 'canceled';
  last_job_run: string | null;
  last_job_failed: boolean;
  next_job_run: string | null;
}

export interface Organization {
  id: number;
  name: string;
  description: string;
  max_hosts: number;
  default_environment: number | null;
}

export interface Credential {
  id: number;
  name: string;
  description: string;
  credential_type: number;
  organization: number | null;
  inputs: Record<string, unknown>;
}

export interface LaunchJobRequest {
  limit?: string;
  extra_vars?: string;
  job_tags?: string;
  skip_tags?: string;
  inventory?: number;
  credentials?: number[];
  execution_environment?: number;
  scm_branch?: string;
  forks?: number;
  verbosity?: number;
  diff_mode?: boolean;
}

export interface LaunchJobResponse {
  job: number;
  ignored_fields: {
    extra_vars?: string[];
    limit?: string;
    job_tags?: string;
    skip_tags?: string;
    inventory?: number;
    credentials?: number[];
  };
}

export type FilterOperator = 
  | 'exact' | 'iexact' 
  | 'contains' | 'icontains' 
  | 'startswith' | 'istartswith'
  | 'endswith' | 'iendswith'
  | 'regex' | 'iregex'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'isnull' | 'in';

export interface FilterOptions {
  [key: string]: string | number | boolean | string[] | { operator: FilterOperator; value: unknown };
}

// AAP 2.7 — Gateway v1 resource types

export interface Team {
  id: number;
  name: string;
  description: string;
  organization: number;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_superuser: boolean;
  is_system_auditor: boolean;
}

export interface RoleDefinition {
  id: number;
  name: string;
  description: string;
  content_type: string | null;
  permissions: string[];
  managed: boolean;
}

export interface RoleTeamAssignment {
  id: number;
  team: number;
  role_definition: number;
  object_id: number | null;
  content_type: string | null;
}

export interface RoleUserAssignment {
  id: number;
  user: number;
  role_definition: number;
  object_id: number | null;
  content_type: string | null;
}

export interface PlatformStatus {
  status: string;
  version: string;
  install_uuid?: string;
  active_node?: string;
  error?: string;
}

export interface ActivityStreamEntry {
  id: number;
  timestamp: string;
  operation: 'create' | 'update' | 'delete' | 'associate' | 'disassociate' | string;
  object1: string;
  object2: string;
  object_type: string;
  object_id: number;
  actor?: {
    id: number;
    username: string;
  } | null;
  changes?: Record<string, unknown>;
}

// AAP 2.7 — Event-Driven Ansible types

export interface EDARulebook {
  id: number;
  name: string;
  description: string;
  project: number;
  rule_count: number;
  fire_count: number;
  created_at: string;
  modified_at: string;
}

export interface EDAActivation {
  id: number;
  name: string;
  description: string;
  status: 'running' | 'stopped' | 'failed' | 'completed' | 'starting' | 'unresponsive' | string;
  rulebook: number;
  decision_environment: number;
  project: number | null;
  enabled: boolean;
  restart_policy: 'on-failure' | 'always' | 'never' | string;
  restart_count?: number;
  created_at: string;
  modified_at: string;
}

export interface CreateEDAActivationRequest {
  name: string;
  description?: string;
  rulebook: number;
  decision_environment: number;
  project?: number;
  enabled?: boolean;
  restart_policy?: 'on-failure' | 'always' | 'never';
  extra_var?: string;
}

// Content generation types
export interface PlaybookTask {
  name: string;
  [key: string]: unknown;
}

export interface Play {
  name: string;
  hosts: string;
  become?: boolean;
  vars?: Record<string, unknown>;
  pre_tasks?: PlaybookTask[];
  tasks: PlaybookTask[];
  post_tasks?: PlaybookTask[];
  handlers?: PlaybookTask[];
  roles?: string[] | { role: string; vars?: Record<string, unknown> }[];
}

export interface Playbook {
  plays: Play[];
}

export interface RoleMetadata {
  name: string;
  version?: string;
  description?: string;
  author?: string;
  company?: string;
  license?: string;
  min_ansible_version?: string;
  platforms?: Array<{
    name: string;
    versions: string[];
  }>;
  galaxy_tags?: string[];
  dependencies?: string[];
}

export interface CollectionMetadata {
  namespace: string;
  name: string;
  version: string;
  description?: string;
  authors?: string[];
  license?: string[];
  tags?: string[];
  dependencies?: Record<string, string>;
  repository?: string;
  homepage?: string;
  issues?: string;
}
