/**
 * HTTP client for fetching web pages.
 */
import { BlockedUrlError, FetchError, HttpError, ResponseTooLargeError, TimeoutError } from '../utils/errors.js';
export interface FetchOptions {
    /** Maximum characters to return. */
    maxChars?: number;
    /** Maximum redirects to follow. */
    maxRedirects?: number;
    /** Timeout in milliseconds. */
    timeoutMs?: number;
    /** User agent string. */
    userAgent?: string;
    /** Whether to enable cookies. */
    withCredentials?: boolean;
}
export interface FetchResult {
    success: true;
    url: string;
    content: string;
    contentType?: string;
    status: number;
    headers?: Record<string, string>;
    title?: string;
    canonicalUrl?: string;
}
export interface FetchFailure {
    success: false;
    error: BlockedUrlError | HttpError | TimeoutError | ResponseTooLargeError | FetchError;
}
/**
 * HTTP client with SSRF protection.
 */
export declare class HttpClient {
    private defaultOptions;
    constructor(options?: FetchOptions);
    /**
     * Fetch a URL and return its content.
     */
    fetch(url: string, options?: FetchOptions): Promise<FetchResult | FetchFailure>;
    /**
     * Fetch with SSRF validation on redirects.
     */
    private fetchWithValidation;
    /**
     * Safe fetch with timeout.
     */
    private safeFetch;
    /**
     * Process the response and extract content.
     */
    private processResponse;
    /**
     * Extract title from HTML content.
     */
    private extractHtmlTitle;
    /**
     * Extract canonical URL from HTML.
     */
    private extractCanonicalUrl;
    /**
     * Handle JSON responses.
     */
    private jsonResult;
    /**
     * Determine the response type for redirect handling.
     */
    private determineResponseType;
    /**
     * Get HTTP status message.
     */
    private getHttpStatusMessage;
    /**
     * Create a failure result.
     */
    private failure;
}
//# sourceMappingURL=client.d.ts.map