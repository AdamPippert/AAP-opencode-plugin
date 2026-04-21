// Type declarations for @opencode-ai/plugin
// These types are provided by OpenCode at runtime

declare module '@opencode-ai/plugin' {
  export interface PluginContext {
    project: {
      name: string;
      path: string;
    };
    directory: string;
    worktree: string;
    client: {
      app: {
        log: (options: {
          service: string;
          level: 'debug' | 'info' | 'warn' | 'error';
          message: string;
          extra?: Record<string, unknown>;
        }) => Promise<void>;
      };
    };
    $: {
      (strings: TemplateStringsArray, ...values: unknown[]): Promise<{ text: () => string }>;
    };
  }

  export interface ToolSchema {
    string: () => StringSchema;
    number: () => NumberSchema;
    boolean: () => BooleanSchema;
    object: () => ObjectSchema;
    array: () => ArraySchema;
    optional: <T>(schema: T) => T;
  }

  export interface StringSchema {
    describe: (description: string) => StringSchema;
  }

  export interface NumberSchema {
    describe: (description: string) => NumberSchema;
  }

  export interface BooleanSchema {
    describe: (description: string) => BooleanSchema;
  }

  export interface ObjectSchema {
    describe: (description: string) => ObjectSchema;
  }

  export interface ArraySchema {
    describe: (description: string) => ArraySchema;
  }

  export interface ToolConfig {
    description: string;
    args: Record<string, unknown>;
    execute: (
      args: Record<string, unknown>,
      context: { directory: string; worktree: string }
    ) => Promise<string>;
  }

  export interface ToolHelper {
    schema: ToolSchema;
    (config: ToolConfig): unknown;
  }

  export const tool: ToolHelper;

  export interface PluginHooks {
    tool?: Record<string, unknown>;
    [key: string]: unknown;
  }

  export type Plugin = (ctx: PluginContext) => Promise<PluginHooks> | PluginHooks;
}
