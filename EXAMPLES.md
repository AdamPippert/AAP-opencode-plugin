# OpenCode AAP Plugin Examples

This document provides practical examples for using the OpenCode AAP Plugin with your Ansible Automation Platform cluster.

## Cluster Information

**Base URL**: `https://aap-aap.ocp-lab.demodomain.us`

## Setup

First, configure the plugin to connect to your AAP cluster:

```
Configure AAP connection with:
- baseUrl: https://aap-aap.ocp-lab.demodomain.us
- username: adam
- password: [from hyde ~/Development or ~/Knowledge]
```

Or use an OAuth token:

```
Configure AAP connection with:
- baseUrl: https://aap-aap.ocp-lab.demodomain.us
- oauthToken: [your-oauth-token]
```

## Example Workflows

### 1. Discover and Launch a Job Template

```
List all job templates from the AAP cluster
```

**Expected response**:
```
Found 5 job templates:
- Deploy Web Application (ID: 10): Deploys the web app to production
- Update Database (ID: 11): Updates the database schema
- Backup Systems (ID: 12): Performs system backup
- Configure Monitoring (ID: 13): Sets up monitoring agents
- Run Health Checks (ID: 14): Validates system health
```

Then launch a specific job:

```
Launch job template ID 10 with limit "webservers" and extra_vars '{"version": "2.0"}'
```

**Expected response**:
```
Job launched successfully. Job ID: 156
```

Monitor the job:

```
Get the status of job ID 156
```

**Expected response**:
```
Job Deploy Web Application (ID: 156):
Status: running
Started: 2024-01-15T10:30:00Z
Finished: N/A
Elapsed: 45s
Failed: false
```

Get the output:

```
Get the output of job ID 156
```

### 2. Inventory and Host Management

List all inventories:

```
List all inventories
```

**Expected response**:
```
Found 3 inventories:
- Production (ID: 1): Production environment - Hosts: 25
- Staging (ID: 2): Staging environment - Hosts: 10
- Development (ID: 3): Development environment - Hosts: 5
```

List hosts in an inventory:

```
List hosts in inventory ID 1
```

**Expected response**:
```
Found 25 hosts in inventory:
- webserver01 (ID: 101): Enabled: true
- webserver02 (ID: 102): Enabled: true
- dbserver01 (ID: 103): Enabled: true
...
```

### 3. Project Management

List all projects:

```
List all projects
```

**Expected response**:
```
Found 4 projects:
- Web Application (ID: 20): Web app source code - Status: successful - SCM: git
- Infrastructure (ID: 21): Infrastructure playbooks - Status: successful - SCM: git
- Monitoring (ID: 22): Monitoring configuration - Status: successful - SCM: git
- Database (ID: 23): Database automation - Status: failed - SCM: git
```

Sync a project:

```
Sync project ID 20
```

**Expected response**:
```
Project sync initiated. Job ID: 200
```

### 4. Generate Ansible Content

Generate a simple playbook:

```
Generate a playbook named "install_nginx" targeting "webservers" with tasks:
[
  {
    "name": "Install nginx",
    "package": {
      "name": "nginx",
      "state": "present"
    }
  },
  {
    "name": "Start nginx service",
    "service": {
      "name": "nginx",
      "state": "started",
      "enabled": true
    }
  }
]
```

**Expected response** (YAML):
```yaml
- name: install_nginx
  hosts: webservers
  tasks:
    - name: Install nginx
      package:
        name: nginx
        state: present
    - name: Start nginx service
      service:
        name: nginx
        state: started
        enabled: true
```

Generate a role structure:

```
Generate a role named "database_config" with description "Configure PostgreSQL database", author "Adam"
```

**Expected response**:
```
Generated role structure for "database_config" with 8 files:
- meta/main.yml
- tasks/main.yml
- handlers/main.yml
- defaults/main.yml
- vars/main.yml
- files/.gitkeep
- templates/.gitkeep
- README.md
```

Generate a collection structure:

```
Generate a collection with namespace "company", name "infrastructure", version "1.0.0", description "Infrastructure automation collection"
```

**Expected response**:
```
Generated collection structure "company.infrastructure" with 4 files:
- galaxy.yml
- README.md
- roles/.gitkeep
- plugins/.gitkeep
```

### 5. Organization Management

List organizations:

```
List all organizations
```

**Expected response**:
```
Found 2 organizations:
- Default (ID: 1): Default organization
- Operations (ID: 2): Operations team organization
```

### 6. Authentication Management

Create an OAuth token:

```
Create an OAuth2 token
```

**Expected response**:
```
OAuth2 token created. Token: abc123xyz789
Expires: 2024-02-15T00:00:00Z
```

## Advanced Examples

### Complex Job Launch with Multiple Parameters

```
Launch job template ID 15 with:
- limit: "webservers:dbservers"
- extra_vars: '{"app_version": "3.2.1", "deploy_env": "production"}'
- job_tags: "deploy,config"
- skip_tags: "test"
- inventory: 1
- scm_branch: "release/v3.2"
```

### Search and Filter

Search for specific job templates:

```
List job templates with search "deploy"
```

Search for inventories:

```
List inventories with search "prod"
```

### Cancel a Running Job

```
Cancel job ID 156
```

**Expected response**:
```
Job 156 cancelled successfully
```

## Troubleshooting

### Connection Issues

If you can't connect to the cluster:

```
Verify the cluster is accessible at https://aap-aap.ocp-lab.demodomain.us/api/
```

### Authentication Errors

If you get authentication errors:

```
Create a new OAuth token using the configured credentials
```

Then use the new token:

```
Configure AAP connection with:
- baseUrl: https://aap-aap.ocp-lab.demodomain.us
- oauthToken: [new-token-from-previous-step]
```

### Job Failures

If a job fails, get detailed output:

```
Get the output of job ID [failed-job-id] in ansi format
```

## Best Practices

1. **Always verify connection** before running operations
2. **Use OAuth tokens** for programmatic access instead of passwords
3. **Check job status** after launching jobs
4. **Use inventory limits** when testing to avoid affecting all hosts
5. **Store sensitive data** in AAP credentials rather than extra_vars
6. **Sync projects** before launching jobs to ensure latest code

## API Endpoints Used

The plugin interacts with these AAP API endpoints:

- `/api/` - API versions
- `/api/gateway/v1/login/` - Session authentication
- `/api/gateway/v1/tokens/` - OAuth token management
- `/api/gateway/v1/organizations/` - Organizations
- `/api/controller/v2/job_templates/` - Job templates
- `/api/controller/v2/jobs/` - Jobs
- `/api/controller/v2/inventories/` - Inventories
- `/api/controller/v2/hosts/` - Hosts
- `/api/controller/v2/projects/` - Projects
- `/api/controller/v2/credentials/` - Credentials
- `/api/controller/v2/settings/all/` - Settings

## Support

For issues or questions about this plugin, please refer to the main README.md or create an issue in the repository.
