import { describe, it, expect } from 'vitest';
import type { 
  AAPConfig, 
  APIResponse, 
  JobTemplate, 
  Job, 
  LaunchJobRequest 
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
