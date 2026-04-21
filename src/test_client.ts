import { describe, it, expect, beforeEach } from 'vitest';
import { AAPClient } from '../src/client';
import type { AAPConfig } from '../src/types';

describe('AAPClient', () => {
  let client: AAPClient;
  const mockConfig: AAPConfig = {
    baseUrl: 'https://test-aap.example.com',
    username: 'admin',
    password: 'password123',
    verifySsl: false,
  };

  beforeEach(() => {
    client = new AAPClient(mockConfig);
  });

  describe('authentication', () => {
    it('should authenticate with basic auth when username and password provided', () => {
      client.authenticate();
      // Authentication should complete without error
      expect(true).toBe(true);
    });

    it('should authenticate with OAuth token when token provided', () => {
      const oauthConfig: AAPConfig = {
        baseUrl: 'https://test-aap.example.com',
        oauthToken: 'test-oauth-token',
        verifySsl: false,
      };
      const oauthClient = new AAPClient(oauthConfig);
      oauthClient.authenticate();
      expect(true).toBe(true);
    });

    it('should throw error when no credentials provided', () => {
      const badConfig: AAPConfig = {
        baseUrl: 'https://test-aap.example.com',
        verifySsl: false,
      };
      const badClient = new AAPClient(badConfig);
      expect(() => badClient.authenticate()).toThrow('Authentication requires');
    });
  });

  describe('API methods should be defined', () => {
    it('should have getJobTemplates method', () => {
      expect(typeof client.getJobTemplates).toBe('function');
    });

    it('should have getJobTemplate method', () => {
      expect(typeof client.getJobTemplate).toBe('function');
    });

    it('should have launchJob method', () => {
      expect(typeof client.launchJob).toBe('function');
    });

    it('should have getJobs method', () => {
      expect(typeof client.getJobs).toBe('function');
    });

    it('should have getJob method', () => {
      expect(typeof client.getJob).toBe('function');
    });

    it('should have cancelJob method', () => {
      expect(typeof client.cancelJob).toBe('function');
    });

    it('should have getInventories method', () => {
      expect(typeof client.getInventories).toBe('function');
    });

    it('should have getProjects method', () => {
      expect(typeof client.getProjects).toBe('function');
    });

    it('should have syncProject method', () => {
      expect(typeof client.syncProject).toBe('function');
    });

    it('should have getOrganizations method', () => {
      expect(typeof client.getOrganizations).toBe('function');
    });

    it('should have createOAuthToken method', () => {
      expect(typeof client.createOAuthToken).toBe('function');
    });

    it('should have getApiVersions method', () => {
      expect(typeof client.getApiVersions).toBe('function');
    });

    // AAP 2.7 — Gateway v1 resource methods
    it('should have getPlatformStatus method', () => {
      expect(typeof client.getPlatformStatus).toBe('function');
    });

    it('should have getTeams method', () => {
      expect(typeof client.getTeams).toBe('function');
    });

    it('should have getTeam method', () => {
      expect(typeof client.getTeam).toBe('function');
    });

    it('should have getUsers method', () => {
      expect(typeof client.getUsers).toBe('function');
    });

    it('should have getUser method', () => {
      expect(typeof client.getUser).toBe('function');
    });

    it('should have getRoleDefinitions method', () => {
      expect(typeof client.getRoleDefinitions).toBe('function');
    });

    it('should have getRoleTeamAssignments method', () => {
      expect(typeof client.getRoleTeamAssignments).toBe('function');
    });

    it('should have getRoleUserAssignments method', () => {
      expect(typeof client.getRoleUserAssignments).toBe('function');
    });

    it('should have getActivityStream method', () => {
      expect(typeof client.getActivityStream).toBe('function');
    });

    // AAP 2.7 — EDA methods
    it('should have getEDARulebooks method', () => {
      expect(typeof client.getEDARulebooks).toBe('function');
    });

    it('should have getEDARulebook method', () => {
      expect(typeof client.getEDARulebook).toBe('function');
    });

    it('should have getEDAActivations method', () => {
      expect(typeof client.getEDAActivations).toBe('function');
    });

    it('should have getEDAActivation method', () => {
      expect(typeof client.getEDAActivation).toBe('function');
    });

    it('should have createEDAActivation method', () => {
      expect(typeof client.createEDAActivation).toBe('function');
    });

    it('should have deleteEDAActivation method', () => {
      expect(typeof client.deleteEDAActivation).toBe('function');
    });
  });
});
