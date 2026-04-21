import { describe, it, expect } from 'vitest';
import { AnsibleContentBuilder } from '../src/content';
import type { Playbook, RoleMetadata, CollectionMetadata } from '../src/content';

describe('AnsibleContentBuilder', () => {
  describe('generatePlaybook', () => {
    it('should generate a basic playbook with single play', () => {
      const playbook: Playbook = {
        plays: [
          {
            name: 'Test Play',
            hosts: 'all',
            tasks: [
              {
                name: 'Test Task',
                debug: { msg: 'Hello World' },
              },
            ],
          },
        ],
      };

      const yaml = AnsibleContentBuilder.generatePlaybook(playbook);
      expect(yaml).toContain('name: Test Play');
      expect(yaml).toContain('hosts: all');
      expect(yaml).toContain('name: Test Task');
    });

    it('should generate playbook with multiple plays', () => {
      const playbook: Playbook = {
        plays: [
          {
            name: 'First Play',
            hosts: 'webservers',
            tasks: [{ name: 'Task 1', debug: { msg: 'First' } }],
          },
          {
            name: 'Second Play',
            hosts: 'dbservers',
            tasks: [{ name: 'Task 2', debug: { msg: 'Second' } }],
          },
        ],
      };

      const yaml = AnsibleContentBuilder.generatePlaybook(playbook);
      expect(yaml).toContain('name: First Play');
      expect(yaml).toContain('name: Second Play');
      expect(yaml).toContain('hosts: webservers');
      expect(yaml).toContain('hosts: dbservers');
    });

    it('should include become when specified', () => {
      const playbook: Playbook = {
        plays: [
          {
            name: 'Privileged Play',
            hosts: 'all',
            become: true,
            tasks: [{ name: 'Root Task', debug: { msg: 'Root' } }],
          },
        ],
      };

      const yaml = AnsibleContentBuilder.generatePlaybook(playbook);
      expect(yaml).toContain('become: true');
    });

    it('should include vars when specified', () => {
      const playbook: Playbook = {
        plays: [
          {
            name: 'Vars Play',
            hosts: 'all',
            vars: { my_var: 'value', number: 42 },
            tasks: [{ name: 'Vars Task', debug: { var: 'my_var' } }],
          },
        ],
      };

      const yaml = AnsibleContentBuilder.generatePlaybook(playbook);
      expect(yaml).toContain('my_var: value');
      expect(yaml).toContain('number: 42');
    });
  });

  describe('generateRoleStructure', () => {
    it('should generate all required role files', () => {
      const metadata: RoleMetadata = {
        name: 'test-role',
        description: 'A test role',
        author: 'Test Author',
        version: '1.0.0',
      };

      const files = AnsibleContentBuilder.generateRoleStructure(metadata);
      
      expect(files.has('meta/main.yml')).toBe(true);
      expect(files.has('tasks/main.yml')).toBe(true);
      expect(files.has('handlers/main.yml')).toBe(true);
      expect(files.has('defaults/main.yml')).toBe(true);
      expect(files.has('vars/main.yml')).toBe(true);
      expect(files.has('files/.gitkeep')).toBe(true);
      expect(files.has('templates/.gitkeep')).toBe(true);
      expect(files.has('README.md')).toBe(true);
    });

    it('should include role name in meta', () => {
      const metadata: RoleMetadata = {
        name: 'my-role',
        description: 'My role description',
      };

      const files = AnsibleContentBuilder.generateRoleStructure(metadata);
      const metaContent = files.get('meta/main.yml') ?? '';
      expect(metaContent).toContain('role_name: my-role');
    });

    it('should include author in README', () => {
      const metadata: RoleMetadata = {
        name: 'author-role',
        author: 'John Doe',
      };

      const files = AnsibleContentBuilder.generateRoleStructure(metadata);
      const readmeContent = files.get('README.md') ?? '';
      expect(readmeContent).toContain('John Doe');
    });
  });

  describe('generateCollectionStructure', () => {
    it('should generate collection files', () => {
      const metadata: CollectionMetadata = {
        namespace: 'my_namespace',
        name: 'my_collection',
        version: '1.0.0',
        description: 'My test collection',
      };

      const files = AnsibleContentBuilder.generateCollectionStructure(metadata);
      
      expect(files.has('galaxy.yml')).toBe(true);
      expect(files.has('README.md')).toBe(true);
      expect(files.has('roles/.gitkeep')).toBe(true);
      expect(files.has('plugins/.gitkeep')).toBe(true);
    });

    it('should include correct namespace and name in galaxy.yml', () => {
      const metadata: CollectionMetadata = {
        namespace: 'test_ns',
        name: 'test_col',
        version: '2.0.0',
      };

      const files = AnsibleContentBuilder.generateCollectionStructure(metadata);
      const galaxyContent = files.get('galaxy.yml') ?? '';
      expect(galaxyContent).toContain('namespace: test_ns');
      expect(galaxyContent).toContain('name: test_col');
      expect(galaxyContent).toContain('version: 2.0.0');
    });
  });

  describe('task generators', () => {
    it('should generate task with correct module', () => {
      const task = AnsibleContentBuilder.generateTask('Install package', 'package', { name: 'nginx', state: 'present' });
      expect(task.name).toBe('Install package');
      expect(task.package).toEqual({ name: 'nginx', state: 'present' });
    });

    it('should generate template task', () => {
      const task = AnsibleContentBuilder.generateTemplate('config.j2', '/etc/config', '0644');
      expect(task.name).toContain('Deploy template');
      expect(task.template).toEqual({ src: 'config.j2', dest: '/etc/config', mode: '0644' });
    });

    it('should generate copy task', () => {
      const task = AnsibleContentBuilder.generateCopy('/src/file', '/dest/file');
      expect(task.name).toContain('Copy');
      expect(task.copy).toEqual({ src: '/src/file', dest: '/dest/file' });
    });

    it('should generate service task', () => {
      const task = AnsibleContentBuilder.generateService('nginx', 'started', true);
      expect(task.name).toContain('Manage service');
      expect(task.service).toEqual({ name: 'nginx', state: 'started', enabled: true });
    });

    it('should generate debug task with message', () => {
      const task = AnsibleContentBuilder.generateDebug('Hello message');
      expect(task.name).toBe('Hello message');
      expect(task.debug).toEqual({ msg: 'Hello message' });
    });

    it('should generate debug task with variable', () => {
      const task = AnsibleContentBuilder.generateDebug('', 'my_variable');
      expect(task.debug).toEqual({ var: 'my_variable' });
    });

    it('should generate command task', () => {
      const task = AnsibleContentBuilder.generateCommand('ls -la');
      expect(task.name).toContain('Execute command');
      expect(task.command).toBe('ls -la');
    });

    it('should generate shell task', () => {
      const task = AnsibleContentBuilder.generateShell('echo $HOME');
      expect(task.name).toBe('Execute shell command');
      expect(task.shell).toBe('echo $HOME');
    });

    it('should generate lineinfile task', () => {
      const task = AnsibleContentBuilder.generateLineinfile('/etc/hosts', '127.0.0.1 localhost');
      expect(task.name).toContain('Ensure line');
      expect(task.lineinfile).toEqual({
        path: '/etc/hosts',
        line: '127.0.0.1 localhost',
      });
    });

    it('should generate user task', () => {
      const task = AnsibleContentBuilder.generateUser('john', { uid: 1001 });
      expect(task.name).toContain('Manage user');
      expect(task.user).toEqual({ name: 'john', uid: 1001 });
    });

    it('should generate group task', () => {
      const task = AnsibleContentBuilder.generateGroup('admins', { gid: 1000 });
      expect(task.name).toContain('Manage group');
      expect(task.group).toEqual({ name: 'admins', gid: 1000 });
    });
  });
});
