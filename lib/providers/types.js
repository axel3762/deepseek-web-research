/**
 * Search provider interface and common types.
 */
import { SearchProviderError, SearchTimeoutError, SearchRateLimitError } from '../utils/errors.js';
/**
 * Creates a search provider error with consistent structure.
 */
export function createSearchError(message, providerName, cause) {
    return new SearchProviderError(message, providerName, cause);
}
/**
 * Creates a timeout error for search operations.
 */
export function createSearchTimeoutError(message, providerName, timeoutMs, cause) {
    return new SearchTimeoutError(message, providerName, timeoutMs, cause);
}
/**
 * Creates a rate limit error for search operations.
 */
export function createSearchRateLimitError(message, providerName, retryAfter, cause) {
    return new SearchRateLimitError(message, providerName, retryAfter, cause);
}
//# sourceMappingURL=types.js.map