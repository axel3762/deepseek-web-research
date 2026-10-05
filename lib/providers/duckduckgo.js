/**
 * DuckDuckGo search provider implementation.
 *
 * Uses DuckDuckGo's instant answer API and fallback to HTML parsing when needed.
 */
import { createSearchError, createSearchTimeoutError } from './types.js';
import { normalizeUrl, extractDomain } from '../utils/url.js';
/**
 * DuckDuckGo API configuration.
 */
const DUCKDUCKGO_CONFIG = {
    apiUrl: 'https://api.duckduckgo.com',
    timeoutMs: 10000,
    maxResults: 20,
};
/**
 * DuckDuckGo search provider.
 */
export class DuckDuckGoProvider {
    name = 'duckduckgo';
    description = 'Privacy-focused search engine with instant answer API';
    enabled = true;
    config;
    constructor(config) {
        this.config = { ...DUCKDUCKGO_CONFIG, ...config };
    }
    /**
     * Execute a search using DuckDuckGo API.
     */
    async search(query, options) {
        const startTime = Date.now();
        const timeoutMs = this.config.timeoutMs || options.timeoutMs || DUCKDUCKGO_CONFIG.timeoutMs;
        const signal = AbortSignal.timeout(timeoutMs);
        try {
            const url = `${this.config.apiUrl ?? DUCKDUCKGO_CONFIG.apiUrl}?q=${encodeURIComponent(query)}`;
            const response = await fetch(url, {
                method: 'GET',
                signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': `DeepSeekWebResearch/${this.config.apiUrl ?? DUCKDUCKGO_CONFIG.apiUrl}`,
                },
            });
            if (!response.ok) {
                throw new Error(`DuckDuckGo HTTP error: ${response.status}`);
            }
            const data = await response.json();
            return this.normalizeResponse(query, data, options.maxResults || DUCKDUCKGO_CONFIG.maxResults, signal);
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw createSearchTimeoutError('Search timed out after connecting to DuckDuckGo', this.name, timeoutMs, error);
            }
            throw createSearchError(`Failed to search via DuckDuckGo: ${error instanceof Error ? error.message : String(error)}`, this.name, error);
        }
    }
    /**
     * Normalize raw DuckDuckGo response to our internal format.
     */
    async normalizeResponse(query, data, maxResults, signal) {
        const results = [];
        // First try instant answers (often structured results)
        if (data.AbstractText && data.Type === 'Top') {
            // Single best result from instant answer
            results.push({
                id: this.generateId(),
                rank: 1,
                url: normalizeUrl(data.AbstractURL),
                title: this.normalizeTitle(data.Title),
                snippet: data.AbstractText.substring(0, 300) || undefined,
                domain: extractDomain(data.AbstractURL),
                source: 'duckduckgo',
            });
        }
        // Process related topics if available (may have URLs)
        if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
            for (let i = 0; i < data.RelatedTopics.length && i < maxResults - results.length; i++) {
                const topic = data.RelatedTopics[i];
                if (topic.Type === 'Link') {
                    results.push({
                        id: this.generateId(),
                        rank: results.length + 1,
                        url: normalizeUrl(topic.URL),
                        title: this.normalizeTitle(topic.Text),
                        snippet: topic.Description?.substring(0, 300) || undefined,
                        domain: extractDomain(topic.URL),
                        source: 'duckduckgo',
                    });
                }
                else if (topic.Type === 'Article' && topic.URL) {
                    results.push({
                        id: this.generateId(),
                        rank: results.length + 1,
                        url: normalizeUrl(topic.URL),
                        title: this.normalizeTitle(topic.Text),
                        snippet: topic.Description?.substring(0, 300) || undefined,
                        domain: extractDomain(topic.URL),
                        source: 'duckduckgo',
                    });
                }
            }
        }
        // If no results from structured data, try HTML parsing as fallback
        if (results.length === 0 && (this.config.apiUrl ?? DUCKDUCKGO_CONFIG.apiUrl).includes('api.duckduckgo.com')) {
            const htmlUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
            try {
                const htmlResponse = await fetch(htmlUrl, {
                    method: 'GET',
                    signal,
                    headers: {
                        'User-Agent': `DeepSeekWebResearch/${this.config.apiUrl ?? DUCKDUCKGO_CONFIG.apiUrl}`,
                    },
                });
                if (!htmlResponse.ok) {
                    return this.wrapResults([], query);
                }
                const htmlText = await htmlResponse.text();
                const parsed = this.parseHtml(htmlText, maxResults);
                results.push(...parsed);
            }
            catch (parseError) {
                // Fallback to empty if parsing fails
                console.error('DDG HTML parsing failed:', parseError);
            }
        }
        return this.wrapResults(results, query);
    }
    /**
     * Parse HTML response to extract search results.
     */
    parseHtml(html, maxResults) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const results = [];
        const anchors = doc.querySelectorAll('h2 a[href]');
        for (let i = 0; i < Math.min(anchors.length, maxResults); i++) {
            const anchor = anchors[i];
            const href = anchor.getAttribute('href');
            if (!href)
                continue;
            results.push({
                id: this.generateId(),
                rank: i + 1,
                url: normalizeUrl(href),
                title: this.normalizeTitle(anchor.textContent || 'No title'),
                snippet: undefined, // HTML parsing often lacks good snippets
                domain: extractDomain(href),
                source: 'duckduckgo',
            });
        }
        return results;
    }
    /**
     * Wrap results with metadata.
     */
    wrapResults(results, query) {
        return {
            results,
            totalResults: undefined, // DDG doesn't provide exact count
            query,
            source: { name: 'duckduckgo' },
            success: true,
        };
    }
    /**
     * Normalize the title to remove excessive punctuation and special characters.
     */
    normalizeTitle(title) {
        // Remove extra whitespace
        return title.replace(/\s+/g, ' ').trim();
    }
    /**
     * Generate a unique ID for request tracking.
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
}
//# sourceMappingURL=duckduckgo.js.map