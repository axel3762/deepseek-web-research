/**
 * Error types for the web research plugin.
 * Provides typed errors for consistent error handling and user-friendly messages.
 */
/**
 * Search provider errors.
 */
export class SearchProviderError extends Error {
    providerName;
    cause;
    name = 'SearchProviderError';
    code = 'SEARCH_PROVIDER_ERROR';
    constructor(message, providerName, cause) {
        super(message);
        this.providerName = providerName;
        this.cause = cause;
        this.message = message;
        if (cause) {
            this.cause = cause;
        }
    }
}
export class SearchTimeoutError extends Error {
    providerName;
    timeoutMs;
    name = 'SearchTimeoutError';
    code = 'SEARCH_TIMEOUT';
    constructor(message, providerName, timeoutMs, cause) {
        super(message);
        this.providerName = providerName;
        this.timeoutMs = timeoutMs;
        if (cause) {
            this.cause = cause;
        }
    }
}
export class SearchRateLimitError extends Error {
    providerName;
    retryAfter;
    name = 'SearchRateLimitError';
    code = 'SEARCH_RATE_LIMIT';
    constructor(message, providerName, retryAfter, cause) {
        super(message);
        this.providerName = providerName;
        this.retryAfter = retryAfter;
        if (cause) {
            this.cause = cause;
        }
    }
}
/**
 * Fetch errors.
 */
export class FetchError extends Error {
    name = 'FetchError';
    code = 'FETCH_ERROR';
    constructor(message, cause) {
        super(message);
        if (cause) {
            this.cause = cause;
        }
    }
}
export class BlockedUrlError extends Error {
    reason;
    name = 'BlockedUrlError';
    code = 'BLOCKED_URL';
    constructor(message, reason, url) {
        super(message);
        this.reason = reason;
        this.reason = reason;
    }
}
export class TimeoutError extends Error {
    timeoutMs;
    name = 'TimeoutError';
    code = 'TIMEOUT';
    constructor(message, timeoutMs, cause) {
        super(message);
        this.timeoutMs = timeoutMs;
        if (cause) {
            this.cause = cause;
        }
    }
}
export class ResponseTooLargeError extends Error {
    maxBytes;
    name = 'ResponseTooLargeError';
    code = 'RESPONSE_TOO_LARGE';
    actualBytes;
    constructor(message, maxBytes, actualBytes) {
        super(message);
        this.maxBytes = maxBytes;
        this.actualBytes = actualBytes;
    }
}
export class UnsupportedContentTypeError extends Error {
    contentType;
    name = 'UnsupportedContentTypeError';
    code = 'UNSUPPORTED_CONTENT_TYPE';
    constructor(message, contentType) {
        super(message);
        this.contentType = contentType;
        this.contentType = contentType;
    }
}
export class RedirectLoopError extends Error {
    maxRedirects;
    name = 'RedirectLoopError';
    code = 'REDIRECT_LOOP';
    constructor(message, maxRedirects) {
        super(message);
        this.maxRedirects = maxRedirects;
        this.maxRedirects = maxRedirects;
    }
}
export class HttpError extends Error {
    statusCode;
    name = 'HttpError';
    code = 'HTTP_ERROR';
    constructor(message, statusCode, url, cause) {
        super(message);
        this.statusCode = statusCode;
        this.statusCode = statusCode;
        if (cause) {
            this.cause = cause;
        }
    }
}
/**
 * Extract errors.
 */
export class ExtractError extends Error {
    name = 'ExtractError';
    code = 'EXTRACT_ERROR';
    constructor(message, cause) {
        super(message);
        if (cause) {
            this.cause = cause;
        }
    }
}
/**
 * Configuration errors.
 */
export class ConfigError extends Error {
    field;
    name = 'ConfigError';
    code = 'CONFIG_ERROR';
    constructor(message, field, cause) {
        super(message);
        this.field = field;
        this.field = field;
        if (cause) {
            this.cause = cause;
        }
    }
}
/**
 * Caching errors.
 */
export class CacheError extends Error {
    name = 'CacheError';
    code = 'CACHE_ERROR';
    constructor(message, cause) {
        super(message);
        if (cause) {
            this.cause = cause;
        }
    }
}
/**
 * Converts internal errors to model-friendly error responses.
 */
export function toToolError(error) {
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
function getReasonString(error) {
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
function formatErrorMessage(error) {
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
//# sourceMappingURL=errors.js.map