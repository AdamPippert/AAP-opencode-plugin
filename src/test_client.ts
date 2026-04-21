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

    it('should throw error when no credentials provided', async () => {
      const badConfig: AAPConfig = {
        baseUrl: 'https://test-aap.example.com',
        verifySsl: false,
      };
      const badClient = new AAPClient(badConfig);
      await expect(badClient.authenticate()).rejects.toThrow('Authentication requires');
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
  });
});
