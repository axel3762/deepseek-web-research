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
export declare class SearchProviderError extends Error implements BaseError {
    readonly providerName: string;
    readonly cause?: unknown | undefined;
    readonly name = "SearchProviderError";
    readonly code = "SEARCH_PROVIDER_ERROR";
    constructor(message: string, providerName: string, cause?: unknown | undefined);
}
export declare class SearchTimeoutError extends Error implements BaseError {
    readonly providerName: string;
    readonly timeoutMs: number;
    readonly name = "SearchTimeoutError";
    readonly code = "SEARCH_TIMEOUT";
    constructor(message: string, providerName: string, timeoutMs: number, cause?: unknown);
}
export declare class SearchRateLimitError extends Error implements BaseError {
    readonly providerName: string;
    readonly retryAfter?: number | undefined;
    readonly name = "SearchRateLimitError";
    readonly code = "SEARCH_RATE_LIMIT";
    constructor(message: string, providerName: string, retryAfter?: number | undefined, cause?: unknown);
}
/**
 * Fetch errors.
 */
export declare class FetchError extends Error implements BaseError {
    readonly name = "FetchError";
    readonly code = "FETCH_ERROR";
    constructor(message: string, cause?: unknown);
}
export declare class BlockedUrlError extends Error implements BaseError {
    readonly reason: BlockedReason;
    readonly name = "BlockedUrlError";
    readonly code = "BLOCKED_URL";
    constructor(message: string, reason: BlockedReason, url: string);
}
export type BlockedReason = 'PRIVATE_IP' | 'METADATA_ENDPOINT' | 'LOCALHOST' | 'INVALID_SCHEME' | 'CREDENTIALS_IN_URL' | 'OversizedResponse' | 'UNSUPPORTED_CONTENT_TYPE';
export declare class TimeoutError extends Error implements BaseError {
    readonly timeoutMs: number;
    readonly name = "TimeoutError";
    readonly code = "TIMEOUT";
    constructor(message: string, timeoutMs: number, cause?: unknown);
}
export declare class ResponseTooLargeError extends Error implements BaseError {
    readonly maxBytes: number;
    readonly name = "ResponseTooLargeError";
    readonly code = "RESPONSE_TOO_LARGE";
    readonly actualBytes: number;
    constructor(message: string, maxBytes: number, actualBytes: number);
}
export declare class UnsupportedContentTypeError extends Error implements BaseError {
    readonly contentType: string;
    readonly name = "UnsupportedContentTypeError";
    readonly code = "UNSUPPORTED_CONTENT_TYPE";
    constructor(message: string, contentType: string);
}
export declare class RedirectLoopError extends Error implements BaseError {
    readonly maxRedirects: number;
    readonly name = "RedirectLoopError";
    readonly code = "REDIRECT_LOOP";
    constructor(message: string, maxRedirects: number);
}
export declare class HttpError extends Error implements BaseError {
    readonly statusCode: number;
    readonly name = "HttpError";
    readonly code = "HTTP_ERROR";
    constructor(message: string, statusCode: number, url: string, cause?: unknown);
}
/**
 * Extract errors.
 */
export declare class ExtractError extends Error implements BaseError {
    readonly name = "ExtractError";
    readonly code = "EXTRACT_ERROR";
    constructor(message: string, cause?: unknown);
}
/**
 * Configuration errors.
 */
export declare class ConfigError extends Error implements BaseError {
    readonly field?: string | undefined;
    readonly name = "ConfigError";
    readonly code = "CONFIG_ERROR";
    constructor(message: string, field?: string | undefined, cause?: unknown);
}
/**
 * Caching errors.
 */
export declare class CacheError extends Error implements BaseError {
    readonly name = "CacheError";
    readonly code = "CACHE_ERROR";
    constructor(message: string, cause?: unknown);
}
/**
 * Converts internal errors to model-friendly error responses.
 */
export declare function toToolError(error: BaseError): ToolExecutionFailure;
//# sourceMappingURL=errors.d.ts.map