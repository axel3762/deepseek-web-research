/**
 * Error types for the web research plugin.
 * Provides typed errors for consistent error handling and user-friendly messages.
 */

import type { ToolExecutionFailure } from '@deepseek-ai/dsh-tools';

export interface BaseError {
  name: string;
  code: string;
  message: string;
  cause?: unknown;
}

/**
 * Search provider errors.
 */
export class SearchProviderError extends Error implements BaseError {
  readonly name = 'SearchProviderError';
  readonly code = 'SEARCH_PROVIDER_ERROR';
  
  constructor(
    message: string,
    public readonly providerName: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.message = message;
    
    if (cause) {
      this.cause = cause;
    }
  }
}

export class SearchTimeoutError extends Error implements BaseError {
  readonly name = 'SearchTimeoutError';
  readonly code = 'SEARCH_TIMEOUT';
  
  constructor(
    message: string,
    public readonly providerName: string,
    public readonly timeoutMs: number,
    cause?: unknown
  ) {
    super(message);
    
    if (cause) {
      this.cause = cause;
    }
  }
}

export class SearchRateLimitError extends Error implements BaseError {
  readonly name = 'SearchRateLimitError';
  readonly code = 'SEARCH_RATE_LIMIT';
  
  constructor(
    message: string,
    public readonly providerName: string,
    public readonly retryAfter?: number,
    cause?: unknown
  ) {
    super(message);
    
    if (cause) {
      this.cause = cause;
    }
  }
}

/**
 * Fetch errors.
 */
export class FetchError extends Error implements BaseError {
  readonly name = 'FetchError';
  readonly code = 'FETCH_ERROR';
  
  constructor(message: string, cause?: unknown) {
    super(message);
    
    if (cause) {
      this.cause = cause;
    }
  }
}

export class BlockedUrlError extends Error implements BaseError {
  readonly name = 'BlockedUrlError';
  readonly code = 'BLOCKED_URL';
  
  constructor(
    message: string,
    public readonly reason: BlockedReason,
    url: string
  ) {
    super(message);
    
    this.reason = reason;
  }
}

export type BlockedReason = 
  | 'PRIVATE_IP'
  | 'METADATA_ENDPOINT'
  | 'LOCALHOST'
  | 'INVALID_SCHEME'
  | 'CREDENTIALS_IN_URL'
  | 'OversizedResponse'
  | 'UNSUPPORTED_CONTENT_TYPE';

export class TimeoutError extends Error implements BaseError {
  readonly name = 'TimeoutError';
  readonly code = 'TIMEOUT';
  
  constructor(
    message: string,
    public readonly timeoutMs: number,
    cause?: unknown
  ) {
    super(message);
    
    if (cause) {
      this.cause = cause;
    }
  }
}

export class ResponseTooLargeError extends Error implements BaseError {
  readonly name = 'ResponseTooLargeError';
  readonly code = 'RESPONSE_TOO_LARGE';
  readonly actualBytes: number;
  
  constructor(message: string, public readonly maxBytes: number, actualBytes: number) {
    super(message);
    this.actualBytes = actualBytes;
  }
}

export class UnsupportedContentTypeError extends Error implements BaseError {
  readonly name = 'UnsupportedContentTypeError';
  readonly code = 'UNSUPPORTED_CONTENT_TYPE';
  
  constructor(
    message: string,
    public readonly contentType: string
  ) {
    super(message);
    
    this.contentType = contentType;
  }
}

export class RedirectLoopError extends Error implements BaseError {
  readonly name = 'RedirectLoopError';
  readonly code = 'REDIRECT_LOOP';
  
  constructor(
    message: string,
    public readonly maxRedirects: number
  ) {
    super(message);
    
    this.maxRedirects = maxRedirects;
  }
}

export class HttpError extends Error implements BaseError {
  readonly name = 'HttpError';
  readonly code = 'HTTP_ERROR';
  
  constructor(
    message: string,
    public readonly statusCode: number,
    url: string,
    cause?: unknown
  ) {
    super(message);
    
    this.statusCode = statusCode;
    
    if (cause) {
      this.cause = cause;
    }
  }
}

/**
 * Extract errors.
 */
export class ExtractError extends Error implements BaseError {
  readonly name = 'ExtractError';
  readonly code = 'EXTRACT_ERROR';
  
  constructor(message: string, cause?: unknown) {
    super(message);
    
    if (cause) {
      this.cause = cause;
    }
  }
}

/**
 * Configuration errors.
 */
export class ConfigError extends Error implements BaseError {
  readonly name = 'ConfigError';
  readonly code = 'CONFIG_ERROR';
  
  constructor(
    message: string,
    public readonly field?: string,
    cause?: unknown
  ) {
    super(message);
    
    this.field = field;
    
    if (cause) {
      this.cause = cause;
    }
  }
}

/**
 * Caching errors.
 */
export class CacheError extends Error implements BaseError {
  readonly name = 'CacheError';
  readonly code = 'CACHE_ERROR';
  
  constructor(message: string, cause?: unknown) {
    super(message);
    
    if (cause) {
      this.cause = cause;
    }
  }
}

/**
 * Converts internal errors to model-friendly error responses.
 */
export function toToolError(error: BaseError): ToolExecutionFailure {
  return {
    isError: true,
    error: {
      message: error.message,
      info: {
        name: error.name,
        code: error.code,
        reason: getReasonString(error),
      },
    },
    content: [{ type: 'text', text: formatErrorMessage(error) }],
  };
}

function getReasonString(error: BaseError): string | undefined {
  if (error instanceof BlockedUrlError) {
    return `Blocked destination: ${error.reason}`;
  }
  
  if (error instanceof ResponseTooLargeError) {
    return `Response exceeded maximum size (${error.maxBytes} bytes)`;
  }
  
  if (error instanceof UnsupportedContentTypeError) {
    return `Unsupported content type: ${error.contentType}`;
  }
  
  if (error instanceof HttpError) {
    return `HTTP ${error.statusCode}`;
  }
  
  return undefined;
}

function formatErrorMessage(error: BaseError): string {
  switch (error.code) {
    case 'BLOCKED_URL':
      return error.message;
    
    case 'SEARCH_TIMEOUT':
    case 'FETCH_ERROR':
    case 'TIMEOUT':
      if (process.env.DSH_DEBUG === 'true') {
        return `${error.name}: ${error.message}`;
      }
      return `Operation timed out`;
    
    default:
      return error.message;
  }
}
