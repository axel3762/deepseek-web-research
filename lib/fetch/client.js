/**
 * HTTP client for fetching web pages.
 */
import { BlockedUrlError, FetchError, HttpError, ResponseTooLargeError, TimeoutError } from '../utils/errors.js';
import { validateUrl } from '../utils/url.js';
/**
 * HTTP client with SSRF protection.
 */
export class HttpClient {
    defaultOptions;
    constructor(options) {
        this.defaultOptions = {
            maxChars: 100000,
            maxRedirects: 5,
            timeoutMs: 30000,
            userAgent: `DeepSeekWebResearch/1.0`,
            withCredentials: false,
            ...options,
        };
    }
    /**
     * Fetch a URL and return its content.
     */
    async fetch(url, options) {
        const startTime = Date.now();
        // Validate the URL first
        const validation = validateUrl(url, this.defaultOptions.maxRedirects);
        if (!validation.valid) {
            return this.failure(new BlockedUrlError(`URL blocked: ${validation.error}`, validation.error, url));
        }
        // Apply options with defaults
        const opts = { ...this.defaultOptions, ...options };
        try {
            return await this.fetchWithValidation(url, opts);
        }
        catch (error) {
            if (error instanceof TimeoutError) {
                return this.failure(error);
            }
            // Wrap unexpected errors
            return this.failure(new FetchError(`Failed to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`, error));
        }
    }
    /**
     * Fetch with SSRF validation on redirects.
     */
    async fetchWithValidation(url, opts) {
        let currentUrl = url;
        let redirectCount = 0;
        while (redirectCount <= opts.maxRedirects) {
            const validation = validateUrl(currentUrl, opts.maxRedirects);
            if (!validation.valid) {
                return this.failure(new BlockedUrlError(`Blocked redirect to: ${currentUrl} (${validation.error})`, validation.error, currentUrl));
            }
            try {
                const response = await this.safeFetch(currentUrl, opts);
                if (!response) {
                    // Request was cancelled or timed out
                    return this.failure(new TimeoutError('Request timed out', opts.timeoutMs));
                }
                // Check for redirect
                if (response.type === 'redirect') {
                    redirectCount++;
                    currentUrl = response.url;
                    if (redirectCount > opts.maxRedirects) {
                        return this.failure(new HttpError(`Too many redirects: ${currentUrl}`, 308, url));
                    }
                    continue;
                }
                // Success - process the response
                return await this.processResponse(response, currentUrl);
            }
            catch (error) {
                if (error instanceof TimeoutError) {
                    throw error;
                }
                throw new FetchError(`Network error fetching ${url}: ${error instanceof Error ? error.message : String(error)}`, error);
            }
        }
        return this.failure(new HttpError('Too many redirects', 308, url));
    }
    /**
     * Safe fetch with timeout.
     */
    async safeFetch(url, opts) {
        const controller = new AbortController();
        // Set up abort timeout
        const timeoutId = setTimeout(() => controller.abort(), opts.timeoutMs);
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': opts.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                },
            });
            clearTimeout(timeoutId);
            return {
                ok: response.ok,
                status: response.status,
                type: this.determineResponseType(response),
                url: response.url,
                headers: Object.fromEntries(response.headers.entries()),
                async text() {
                    return response.text();
                },
            };
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new TimeoutError('Request timed out', opts.timeoutMs, error);
            }
            throw error;
        }
    }
    /**
     * Process the response and extract content.
     */
    async processResponse(response, finalUrl) {
        // Check status code
        if (!response.ok) {
            return this.failure(new HttpError(`HTTP ${response.status}: ${this.getHttpStatusMessage(response.status)}`, response.status, finalUrl));
        }
        // Get content type
        const contentType = response.headers?.['content-type'] || '';
        // Determine if it's text-based content
        const isTextType = /text\/(html|xml|plain)/i.test(contentType);
        const isJsonType = /^application\/(?:json|ld\+\?json)/.test(contentType);
        let content;
        let actualBytes = 0;
        try {
            content = await response.text();
            actualBytes = new Blob([content]).size;
        }
        catch (error) {
            return this.failure(new FetchError(`Failed to read response body for ${finalUrl}: ${error instanceof Error ? error.message : String(error)}`));
        }
        // Check size limits
        const maxBytes = this.defaultOptions.maxChars * 2; // Allow ~2x char limit in bytes
        if (actualBytes > maxBytes) {
            return this.failure(new ResponseTooLargeError(`Response too large for ${finalUrl}`, maxBytes, actualBytes));
        }
        // Handle different content types
        if (isJsonType && /application\/json/i.test(contentType)) {
            return this.jsonResult(content, finalUrl, contentType);
        }
        if (!isTextType) {
            return this.failure(new FetchError(`Unsupported content type: ${contentType} for ${finalUrl}. Only HTML, XML, and plain text are supported.`));
        }
        // Extract title from HTML if present
        let extractedTitle;
        if (isTextType && contentType.includes('html')) {
            extractedTitle = this.extractHtmlTitle(content);
        }
        return {
            success: true,
            url: finalUrl,
            content: content.substring(0, this.defaultOptions.maxChars),
            contentType,
            status: response.status,
            headers: response.headers,
            title: extractedTitle || this.extractHtmlTitle(content),
            canonicalUrl: this.extractCanonicalUrl(content),
        };
    }
    /**
     * Extract title from HTML content.
     */
    extractHtmlTitle(html) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            // Try title tag first
            let title = doc.querySelector('title')?.textContent;
            if (title) {
                return title.trim();
            }
            // Try h1 as fallback
            const h1 = doc.querySelector('h1');
            if (h1) {
                return h1.textContent?.trim();
            }
        }
        catch {
            // If parsing fails, return undefined
        }
        return undefined;
    }
    /**
     * Extract canonical URL from HTML.
     */
    extractCanonicalUrl(html) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
            if (canonical) {
                return new URL(canonical, html).toString();
            }
        }
        catch {
            // Ignore parsing errors
        }
        return undefined;
    }
    /**
     * Handle JSON responses.
     */
    jsonResult(content, url, contentType) {
        try {
            const json = JSON.parse(content);
            // Pretty print if it's an object
            let formatted = content;
            if (typeof json === 'object' && json !== null) {
                formatted = JSON.stringify(json, null, 2);
            }
            return {
                success: true,
                url,
                content: formatted,
                contentType,
                status: 200,
                headers: { 'content-type': contentType },
            };
        }
        catch {
            // If it's not valid JSON, treat as plain text
            return {
                success: true,
                url,
                content,
                contentType,
                status: 200,
                headers: { 'content-type': contentType },
            };
        }
    }
    /**
     * Determine the response type for redirect handling.
     */
    determineResponseType(response) {
        const status = response.status;
        if (status >= 300 && status < 400) {
            return 'redirect';
        }
        if (status >= 400) {
            return 'error';
        }
        return 'success';
    }
    /**
     * Get HTTP status message.
     */
    getHttpStatusMessage(status) {
        const messages = {
            404: 'Not Found',
            403: 'Forbidden',
            429: 'Too Many Requests',
            500: 'Internal Server Error',
            502: 'Bad Gateway',
            503: 'Service Unavailable',
        };
        return messages[status] || `Error ${status}`;
    }
    /**
     * Create a failure result.
     */
    failure(error) {
        return {
            success: false,
            error,
        };
    }
}
//# sourceMappingURL=client.js.map