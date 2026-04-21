import type { AAPConfig, AAPAuth, APIResponse, JobTemplate, Job, Inventory, Host, Project, Organization, Credential, LaunchJobRequest, LaunchJobResponse, FilterOptions, Team, User, RoleDefinition, RoleTeamAssignment, RoleUserAssignment, PlatformStatus, ActivityStreamEntry, EDARulebook, EDAActivation, CreateEDAActivationRequest } from './types';

export class AAPClient {
  private config: AAPConfig;
  private auth: AAPAuth | null = null;

  constructor(config: AAPConfig) {
    this.config = {
      verifySsl: true,
      ...config,
    };
  }

  authenticate(): void {
    if (this.config.oauthToken) {
      this.auth = {
        type: 'oauth',
        token: this.config.oauthToken,
      };
    } else if (this.config.username && this.config.password) {
      this.auth = {
        type: 'basic',
        username: this.config.username,
        password: this.config.password,
      };
    } else {
      throw new Error('Authentication requires either oauthToken or username/password');
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<T> {
    if (!this.auth) {
      this.authenticate();
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.auth) {
      switch (this.auth.type) {
        case 'oauth':
          headers['Authorization'] = `Bearer ${this.auth.token}`;
          break;
        case 'basic': {
          const credentials = btoa(`${this.auth.username}:${this.auth.password}`);
          headers['Authorization'] = `Basic ${credentials}`;
          break;
        }
        case 'session':
          if (this.auth.sessionCookie) {
            headers['Cookie'] = this.auth.sessionCookie;
          }
          break;
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    if (!this.config.verifySsl) {
      // Note: In production, this should be handled differently
      // This is for development/testing only
      // SSL verification disabled
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  private buildQueryString(filters?: FilterOptions, search?: string, orderBy?: string): string {
    const params = new URLSearchParams();

    if (search) {
      params.append('search', search);
    }

    if (orderBy) {
      params.append('order_by', orderBy);
    }

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (typeof value === 'object' && value !== null && 'operator' in value) {
          const filterKey = `${key}__${(value as { operator: string }).operator}`;
          params.append(filterKey, String((value as { value: unknown }).value));
        } else if (Array.isArray(value)) {
          params.append(`${key}__in`, value.join(','));
        } else {
          params.append(key, String(value));
        }
      }
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Job Templates
  async getJobTemplates(filters?: FilterOptions, search?: string, orderBy?: string): Promise<APIResponse<JobTemplate>> {
    const queryString = this.buildQueryString(filters, search, orderBy);
    return this.makeRequest<APIResponse<JobTemplate>>(`/api/controller/v2/job_templates/${queryString}`);
  }

  async getJobTemplate(id: number): Promise<JobTemplate> {
    return this.makeRequest<JobTemplate>(`/api/controller/v2/job_templates/${id}/`);
  }

  async createJobTemplate(template: Partial<JobTemplate>): Promise<JobTemplate> {
    return this.makeRequest<JobTemplate>('/api/controller/v2/job_templates/', 'POST', template);
  }

  async updateJobTemplate(id: number, template: Partial<JobTemplate>): Promise<JobTemplate> {
    return this.makeRequest<JobTemplate>(`/api/controller/v2/job_templates/${id}/`, 'PUT', template);
  }

  async deleteJobTemplate(id: number): Promise<void> {
    return this.makeRequest<void>(`/api/controller/v2/job_templates/${id}/`, 'DELETE');
  }

  // Jobs
  async launchJob(templateId: number, request?: LaunchJobRequest): Promise<LaunchJobResponse> {
    return this.makeRequest<LaunchJobResponse>(
      `/api/controller/v2/job_templates/${templateId}/launch/`,
      'POST',
      request
    );
  }

  async getJobs(filters?: FilterOptions, search?: string, orderBy?: string): Promise<APIResponse<Job>> {
    const queryString = this.buildQueryString(filters, search, orderBy);
    return this.makeRequest<APIResponse<Job>>(`/api/controller/v2/jobs/${queryString}`);
  }

  async getJob(id: number): Promise<Job> {
    return this.makeRequest<Job>(`/api/controller/v2/jobs/${id}/`);
  }

  async cancelJob(id: number): Promise<void> {
    return this.makeRequest<void>(`/api/controller/v2/jobs/${id}/cancel/`, 'POST');
  }

  async getJobStdout(id: number, format: 'json' | 'txt' | 'ansi' = 'json'): Promise<string> {
    const response = await this.makeRequest<{ content: string }>(
      `/api/controller/v2/jobs/${id}/stdout/?format=${format}`
    );
    return response.content;
  }

  // Inventories
  async getInventories(filters?: FilterOptions, search?: string, orderBy?: string): Promise<APIResponse<Inventory>> {
    const queryString = this.buildQueryString(filters, search, orderBy);
    return this.makeRequest<APIResponse<Inventory>>(`/api/controller/v2/inventories/${queryString}`);
  }

  async getInventory(id: number): Promise<Inventory> {
    return this.makeRequest<Inventory>(`/api/controller/v2/inventories/${id}/`);
  }

  async createInventory(inventory: Partial<Inventory>): Promise<Inventory> {
    return this.makeRequest<Inventory>('/api/controller/v2/inventories/', 'POST', inventory);
  }

  async updateInventory(id: number, inventory: Partial<Inventory>): Promise<Inventory> {
    return this.makeRequest<Inventory>(`/api/controller/v2/inventories/${id}/`, 'PUT', inventory);
  }

  async deleteInventory(id: number): Promise<void> {
    return this.makeRequest<void>(`/api/controller/v2/inventories/${id}/`, 'DELETE');
  }

  // Hosts
  async getHosts(inventoryId: number, filters?: FilterOptions, search?: string, orderBy?: string): Promise<APIResponse<Host>> {
    const queryString = this.buildQueryString(filters, search, orderBy);
    return this.makeRequest<APIResponse<Host>>(`/api/controller/v2/inventories/${inventoryId}/hosts/${queryString}`);
  }

  async getHost(id: number): Promise<Host> {
    return this.makeRequest<Host>(`/api/controller/v2/hosts/${id}/`);
  }

  async createHost(inventoryId: number, host: Partial<Host>): Promise<Host> {
    return this.makeRequest<Host>(`/api/controller/v2/inventories/${inventoryId}/hosts/`, 'POST', host);
  }

  async updateHost(id: number, host: Partial<Host>): Promise<Host> {
    return this.makeRequest<Host>(`/api/controller/v2/hosts/${id}/`, 'PUT', host);
  }

  async deleteHost(id: number): Promise<void> {
    return this.makeRequest<void>(`/api/controller/v2/hosts/${id}/`, 'DELETE');
  }

  // Projects
  async getProjects(filters?: FilterOptions, search?: string, orderBy?: string): Promise<APIResponse<Project>> {
    const queryString = this.buildQueryString(filters, search, orderBy);
    return this.makeRequest<APIResponse<Project>>(`/api/controller/v2/projects/${queryString}`);
  }

  async getProject(id: number): Promise<Project> {
    return this.makeRequest<Project>(`/api/controller/v2/projects/${id}/`);
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    return this.makeRequest<Project>('/api/controller/v2/projects/', 'POST', project);
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project> {
    return this.makeRequest<Project>(`/api/controller/v2/projects/${id}/`, 'PUT', project);
  }

  async deleteProject(id: number): Promise<void> {
    return this.makeRequest<void>(`/api/controller/v2/projects/${id}/`, 'DELETE');
  }

  async syncProject(id: number): Promise<Job> {
    return this.makeRequest<Job>(`/api/controller/v2/projects/${id}/update/`, 'POST');
  }

  // Organizations
  async getOrganizations(filters?: FilterOptions, search?: string, orderBy?: string): Promise<APIResponse<Organization>> {
    const queryString = this.buildQueryString(filters, search, orderBy);
    return this.makeRequest<APIResponse<Organization>>(`/api/gateway/v1/organizations/${queryString}`);
  }

  async getOrganization(id: number): Promise<Organization> {
    return this.makeRequest<Organization>(`/api/gateway/v1/organizations/${id}/`);
  }

  // Credentials
  async getCredentials(filters?: FilterOptions, search?: string, orderBy?: string): Promise<APIResponse<Credential>> {
    const queryString = this.buildQueryString(filters, search, orderBy);
    return this.makeRequest<APIResponse<Credential>>(`/api/controller/v2/credentials/${queryString}`);
  }

  async getCredential(id: number): Promise<Credential> {
    return this.makeRequest<Credential>(`/api/controller/v2/credentials/${id}/`);
  }

  // OAuth Tokens
  async createOAuthToken(): Promise<{ token: string; expires: string }> {
    if (!this.config.username || !this.config.password) {
      throw new Error('Username and password required to create OAuth token');
    }
    
    return this.makeRequest<{ token: string; expires: string }>(
      '/api/gateway/v1/tokens/',
      'POST'
    );
  }

  // API Info
  async getApiVersions(): Promise<{ current_version: string; available_versions: Record<string, string> }> {
    return this.makeRequest('/api/');
  }

  async getSettings(): Promise<Record<string, unknown>> {
    return this.makeRequest('/api/controller/v2/settings/all/');
  }

  // AAP 2.7 — Gateway v1: Platform Status
  async getPlatformStatus(): Promise<PlatformStatus> {
    return this.makeRequest<PlatformStatus>('/api/gateway/v1/status/');
  }

  // AAP 2.7 — Gateway v1: Teams
  async getTeams(filters?: FilterOptions, search?: string, orderBy?: string): Promise<APIResponse<Team>> {
    const queryString = this.buildQueryString(filters, search, orderBy);
    return this.makeRequest<APIResponse<Team>>(`/api/gateway/v1/teams/${queryString}`);
  }

  async getTeam(id: number): Promise<Team> {
    return this.makeRequest<Team>(`/api/gateway/v1/teams/${id}/`);
  }

  // AAP 2.7 — Gateway v1: Users
  async getUsers(filters?: FilterOptions, search?: string, orderBy?: string): Promise<APIResponse<User>> {
    const queryString = this.buildQueryString(filters, search, orderBy);
    return this.makeRequest<APIResponse<User>>(`/api/gateway/v1/users/${queryString}`);
  }

  async getUser(id: number): Promise<User> {
    return this.makeRequest<User>(`/api/gateway/v1/users/${id}/`);
  }

  // AAP 2.7 — Gateway v1: RBAC
  async getRoleDefinitions(filters?: FilterOptions, search?: string): Promise<APIResponse<RoleDefinition>> {
    const queryString = this.buildQueryString(filters, search);
    return this.makeRequest<APIResponse<RoleDefinition>>(`/api/gateway/v1/role_definitions/${queryString}`);
  }

  async getRoleTeamAssignments(filters?: FilterOptions): Promise<APIResponse<RoleTeamAssignment>> {
    const queryString = this.buildQueryString(filters);
    return this.makeRequest<APIResponse<RoleTeamAssignment>>(`/api/gateway/v1/role_team_assignments/${queryString}`);
  }

  async getRoleUserAssignments(filters?: FilterOptions): Promise<APIResponse<RoleUserAssignment>> {
    const queryString = this.buildQueryString(filters);
    return this.makeRequest<APIResponse<RoleUserAssignment>>(`/api/gateway/v1/role_user_assignments/${queryString}`);
  }

  // AAP 2.7 — Gateway v1: Activity Stream
  async getActivityStream(filters?: FilterOptions, orderBy?: string): Promise<APIResponse<ActivityStreamEntry>> {
    const queryString = this.buildQueryString(filters, undefined, orderBy);
    return this.makeRequest<APIResponse<ActivityStreamEntry>>(`/api/gateway/v1/activitystream/${queryString}`);
  }

  // AAP 2.7 — Event-Driven Ansible (EDA)
  async getEDARulebooks(filters?: FilterOptions, search?: string): Promise<APIResponse<EDARulebook>> {
    const queryString = this.buildQueryString(filters, search);
    return this.makeRequest<APIResponse<EDARulebook>>(`/api/eda/v1/rulebooks/${queryString}`);
  }

  async getEDARulebook(id: number): Promise<EDARulebook> {
    return this.makeRequest<EDARulebook>(`/api/eda/v1/rulebooks/${id}/`);
  }

  async getEDAActivations(filters?: FilterOptions, search?: string): Promise<APIResponse<EDAActivation>> {
    const queryString = this.buildQueryString(filters, search);
    return this.makeRequest<APIResponse<EDAActivation>>(`/api/eda/v1/activations/${queryString}`);
  }

  async getEDAActivation(id: number): Promise<EDAActivation> {
    return this.makeRequest<EDAActivation>(`/api/eda/v1/activations/${id}/`);
  }

  async createEDAActivation(request: CreateEDAActivationRequest): Promise<EDAActivation> {
    return this.makeRequest<EDAActivation>('/api/eda/v1/activations/', 'POST', request);
  }

  async deleteEDAActivation(id: number): Promise<void> {
    return this.makeRequest<void>(`/api/eda/v1/activations/${id}/`, 'DELETE');
  }
}
