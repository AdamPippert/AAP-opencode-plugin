export class AAPError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: string
  ) {
    super(message);
    this.name = 'AAPError';
  }
}

export class AAPAuthError extends AAPError {
  constructor(message: string, statusCode?: number, response?: string) {
    super(message, statusCode, response);
    this.name = 'AAPAuthError';
  }
}

export class AAPNotFoundError extends AAPError {
  constructor(resource: string, id: number | string) {
    super(`${resource} with ID ${id} not found`, 404);
    this.name = 'AAPNotFoundError';
  }
}

export class AAPValidationError extends AAPError {
  constructor(message: string, public readonly errors: Record<string, string[]>) {
    super(message, 400);
    this.name = 'AAPValidationError';
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof AAPError) {
    throw error;
  }
  
  if (error instanceof Error) {
    throw new AAPError(error.message);
  }
  
  throw new AAPError(String(error));
}
