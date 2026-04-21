import * as yaml from 'yaml';

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

export class AnsibleContentBuilder {
  static generatePlaybook(playbook: Playbook): string {
    return yaml.stringify(playbook.plays, {
      indent: 2,
      lineWidth: 0,
    });
  }

  static generateRoleStructure(metadata: RoleMetadata): Map<string, string> {
    const files = new Map<string, string>();

    // meta/main.yml
    const metaContent = {
      galaxy_info: {
        role_name: metadata.name,
        version: metadata.version ?? '1.0.0',
        description: metadata.description ?? '',
        author: metadata.author ?? '',
        company: metadata.company ?? '',
        license: metadata.license ?? 'MIT',
        min_ansible_version: metadata.min_ansible_version ?? '2.9',
        platforms: metadata.platforms ?? [],
        galaxy_tags: metadata.galaxy_tags ?? [],
      },
      dependencies: metadata.dependencies ?? [],
    };
    files.set('meta/main.yml', yaml.stringify(metaContent));

    // tasks/main.yml
    files.set('tasks/main.yml', '---\n# tasks file for ' + metadata.name + '\n');

    // handlers/main.yml
    files.set('handlers/main.yml', '---\n# handlers file for ' + metadata.name + '\n');

    // defaults/main.yml
    files.set('defaults/main.yml', '---\n# defaults file for ' + metadata.name + '\n');

    // vars/main.yml
    files.set('vars/main.yml', '---\n# vars file for ' + metadata.name + '\n');

    // files/ (empty directory marker)
    files.set('files/.gitkeep', '');

    // templates/ (empty directory marker)
    files.set('templates/.gitkeep', '');

    // README.md
    const readmeContent = `# ${metadata.name}

${metadata.description ?? 'A brief description of the role goes here.'}

## Requirements

Any pre-requisites that may not be covered by Ansible itself or the role should be mentioned here.

## Role Variables

A description of the settable variables for this role should go here.

## Dependencies

A list of other roles hosted on Galaxy should go here.

## Example Playbook

Including an example of how to use your role:

\`\`\`yaml
- hosts: servers
  roles:
    - ${metadata.name}
\`\`\`

## License

${metadata.license ?? 'MIT'}

## Author Information

${metadata.author ?? ''}
`;
    files.set('README.md', readmeContent);

    return files;
  }

  static generateCollectionStructure(metadata: CollectionMetadata): Map<string, string> {
    const files = new Map<string, string>();

    // galaxy.yml
    const galaxyContent = {
      namespace: metadata.namespace,
      name: metadata.name,
      version: metadata.version,
      readme: 'README.md',
      authors: metadata.authors ?? [],
      description: metadata.description ?? '',
      license: metadata.license ?? ['MIT'],
      tags: metadata.tags ?? [],
      dependencies: metadata.dependencies ?? {},
      repository: metadata.repository ?? '',
      homepage: metadata.homepage ?? '',
      issues: metadata.issues ?? '',
    };
    files.set('galaxy.yml', yaml.stringify(galaxyContent));

    // README.md
    const readmeContent = `# ${metadata.namespace}.${metadata.name}

${metadata.description ?? 'A brief description of the collection goes here.'}

## Installation

\`\`\`bash
ansible-galaxy collection install ${metadata.namespace}.${metadata.name}
\`\`\`

## Usage

\`\`\`yaml
- hosts: all
  collections:
    - ${metadata.namespace}.${metadata.name}
  tasks:
    - import_role:
        name: role_name
\`\`\`

## License

${(metadata.license ?? ['MIT']).join(', ')}
`;
    files.set('README.md', readmeContent);

    // Create role placeholder
    files.set('roles/.gitkeep', '');
    files.set('plugins/.gitkeep', '');

    return files;
  }

  static generateTask(name: string, module: string, args: Record<string, unknown>): PlaybookTask {
    return {
      name,
      [module]: args,
    };
  }

  static generateTemplate(src: string, dest: string, mode?: string): PlaybookTask {
    const args: Record<string, unknown> = {
      src,
      dest,
    };
    if (mode) {
      args.mode = mode;
    }
    return {
      name: `Deploy template ${src} to ${dest}`,
      template: args,
    };
  }

  static generateCopy(src: string, dest: string, mode?: string): PlaybookTask {
    const args: Record<string, unknown> = {
      src,
      dest,
    };
    if (mode) {
      args.mode = mode;
    }
    return {
      name: `Copy ${src} to ${dest}`,
      copy: args,
    };
  }

  static generateService(name: string, state: 'started' | 'stopped' | 'restarted' | 'reloaded', enabled?: boolean): PlaybookTask {
    const args: Record<string, unknown> = {
      name,
      state,
    };
    if (enabled !== undefined) {
      args.enabled = enabled;
    }
    return {
      name: `Manage service ${name}`,
      service: args,
    };
  }

  static generatePackage(name: string | string[], state: 'present' | 'absent' | 'latest'): PlaybookTask {
    return {
      name: `Manage package ${Array.isArray(name) ? name.join(', ') : name}`,
      package: {
        name,
        state,
      },
    };
  }

  static generateCommand(cmd: string, args?: Record<string, unknown>): PlaybookTask {
    return {
      name: `Execute command: ${cmd}`,
      command: args ? { cmd, ...args } : cmd,
    };
  }

  static generateShell(cmd: string, args?: Record<string, unknown>): PlaybookTask {
    return {
      name: `Execute shell command`,
      shell: args ? { cmd, ...args } : cmd,
    };
  }

  static generateLineinfile(path: string, line: string, regexp?: string): PlaybookTask {
    const args: Record<string, unknown> = {
      path,
      line,
    };
    if (regexp) {
      args.regexp = regexp;
    }
    return {
      name: `Ensure line in file ${path}`,
      lineinfile: args,
    };
  }

  static generateUser(name: string, args?: Record<string, unknown>): PlaybookTask {
    return {
      name: `Manage user ${name}`,
      user: {
        name,
        ...args,
      },
    };
  }

  static generateGroup(name: string, args?: Record<string, unknown>): PlaybookTask {
    return {
      name: `Manage group ${name}`,
      group: {
        name,
        ...args,
      },
    };
  }

  static generateDebug(msg: string, var_name?: string): PlaybookTask {
    const args: Record<string, unknown> = {};
    if (var_name) {
      args.var = var_name;
    } else {
      args.msg = msg;
    }
    return {
      name: msg,
      debug: args,
    };
  }
}
