# OpenCode AAP Plugin

An OpenCode plugin for integrating with Ansible Automation Platform (AAP) 2.6 and above. This plugin enables coding agents to build Ansible content and interact with AAP clusters.

## Features

- **Cluster Management**: Connect to and manage AAP clusters
- **Job Operations**: Launch, monitor, and cancel jobs
- **Inventory Management**: List and manage inventories and hosts
- **Project Management**: Sync projects from SCM sources
- **Content Generation**: Generate playbooks, roles, and collections
- **OAuth Authentication**: Create and manage API tokens

## Installation

### From npm (when published)

```bash
npm install opencode-aap-plugin
```

### From source

```bash
git clone <repository-url>
cd AAP-opencode-plugin
npm install
npm run build
```

## Configuration

### Environment Variables

Set the following environment variables for AAP connection:

```bash
export AAP_BASE_URL="https://aap-aap.ocp-lab.demodomain.us"
export AAP_USERNAME="admin"
export AAP_PASSWORD="your-password"
# OR
export AAP_OAUTH_TOKEN="your-oauth-token"
```

### OpenCode Configuration

Add to your `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-aap-plugin"],
  "tools": {
    "aap_configure": true,
    "aap_list_job_templates": true,
    "aap_launch_job": true,
    "aap_get_job_status": true,
    "aap_generate_playbook": true
  }
}
```

## Available Tools

### Configuration

- **aap_configure**: Configure connection to AAP cluster
  - `baseUrl`: Base URL of the AAP cluster
  - `username`: Username for authentication (optional if using OAuth token)
  - `password`: Password for authentication (optional if using OAuth token)
  - `oauthToken`: OAuth2 token for authentication (optional)
  - `verifySsl`: Whether to verify SSL certificates (default: true)

### Job Templates

- **aap_list_job_templates**: List all job templates
  - `search`: Search term to filter templates (optional)
  - `limit`: Maximum number of results (optional)

- **aap_get_job_template**: Get details of a specific job template
  - `id`: ID of the job template

- **aap_launch_job**: Launch a job from a template
  - `templateId`: ID of the job template
  - `limit`: Limit execution to specific hosts (optional)
  - `extraVars`: Extra variables as JSON string (optional)
  - `jobTags`: Tags to execute (optional)
  - `skipTags`: Tags to skip (optional)
  - `inventory`: Inventory ID to use (optional)
  - `scmBranch`: SCM branch to use (optional)

### Job Management

- **aap_get_job_status**: Get status of a job
  - `jobId`: ID of the job

- **aap_get_job_output**: Get stdout of a completed job
  - `jobId`: ID of the job
  - `format`: Output format - json, txt, or ansi (optional, default: txt)

- **aap_cancel_job**: Cancel a running job
  - `jobId`: ID of the job

### Inventory Management

- **aap_list_inventories**: List all inventories
  - `search`: Search term to filter inventories (optional)

- **aap_list_hosts**: List hosts in an inventory
  - `inventoryId`: ID of the inventory
  - `search`: Search term to filter hosts (optional)

### Project Management

- **aap_list_projects**: List all projects
  - `search`: Search term to filter projects (optional)

- **aap_sync_project**: Sync a project from SCM
  - `projectId`: ID of the project

### Organizations

- **aap_list_organizations**: List all organizations
  - `search`: Search term to filter organizations (optional)

### Content Generation

- **aap_generate_playbook**: Generate Ansible playbook YAML
  - `name`: Name of the playbook
  - `hosts`: Target hosts pattern
  - `tasks`: Tasks as JSON array
  - `vars`: Variables as JSON object (optional)
  - `become`: Whether to use privilege escalation (optional)

- **aap_generate_role**: Generate Ansible role structure
  - `name`: Name of the role
  - `description`: Description (optional)
  - `author`: Author name (optional)
  - `version`: Version (optional, default: 1.0.0)

- **aap_generate_collection**: Generate Ansible collection structure
  - `namespace`: Namespace for the collection
  - `name`: Name of the collection
  - `version`: Version (e.g., 1.0.0)
  - `description`: Description (optional)

### Authentication

- **aap_create_oauth_token**: Create an OAuth2 token
  - No arguments required (uses configured credentials)

## Usage Examples

### Connect to AAP Cluster

```
Configure AAP connection with base URL https://aap-aap.ocp-lab.demodomain.us, username admin, and password from environment
```

### List and Launch a Job

```
List all job templates, then launch the "Deploy Application" template
```

### Generate a Playbook

```
Generate a playbook named "deploy.yml" targeting hosts "webservers" with tasks to install nginx and start the service
```

### Monitor Job Status

```
Get the status of job ID 123 and display its output
```

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

## API Reference

The plugin uses the Ansible Automation Platform REST API:

- Controller API: `/api/controller/v2/`
- Gateway API: `/api/gateway/v1/`

Authentication methods supported:
- Basic Authentication
- OAuth2 Token Authentication
- Session Authentication (UI/browser)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Run the test suite
6. Submit a pull request

## License

Apache-2.0

## Support

For issues and feature requests, please use the GitHub issue tracker.

## References

- [Ansible Automation Platform Documentation](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.6/)
- [Automation Execution API Overview](https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.6/html-single/automation_execution_api_overview/index)
- [OpenCode Plugin Documentation](https://opencode.ai/docs/plugins/)
