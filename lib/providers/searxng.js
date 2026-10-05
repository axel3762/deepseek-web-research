/**
 * SearXNG search provider implementation.
 *
 * SearXNG is a self-hosted, anonymous metasearch engine that aggregates results from multiple search engines.
 */
import { createSearchError, createSearchTimeoutError } from './types.js';
import { normalizeUrl } from '../utils/url.js';
/**
 * Default SearXNG configuration.
 */
const DEFAULT_SEARXNG_CONFIG = {
    url: 'https://searx.be', // Default public instance
    timeoutMs: 10000,
    maxResults: 20,
};
/**
 * SearXNG search provider.
 */
export class SearXNGProvider {
    name = 'searxng';
    description = 'Self-hosted metasearch engine supporting multiple backends';
    enabled = true;
    config;
    constructor(config) {
        this.config = { ...DEFAULT_SEARXNG_CONFIG, ...config };
    }
    /**
     * Execute a search using SearXNG API.
     */
    async search(query, options) {
        const startTime = Date.now();
        const timeoutMs = this.config.timeoutMs || options.timeoutMs || DEFAULT_SEARXNG_CONFIG.timeoutMs;
        const signal = AbortSignal.timeout(timeoutMs);
        try {
            const url = this.buildSearchUrl(query, options);
            const response = await fetch(url, {
                method: 'GET',
                signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': `DeepSeekWebResearch/${this.config.url}`,
                },
            });
            if (!response.ok) {
                throw new Error(`SearXNG HTTP error: ${response.status}`);
            }
            const data = await response.json();
            return this.normalizeResponse(query, data, options.maxResults || DEFAULT_SEARXNG_CONFIG.maxResults);
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw createSearchTimeoutError('Search timed out after connecting to SearXNG', this.name, timeoutMs, error);
            }
            throw createSearchError(`Failed to search via SearXNG: ${error instanceof Error ? error.message : String(error)}`, this.name, error);
        }
    }
    /**
     * Build the API URL for a search query.
     */
    buildSearchUrl(query, options) {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            // Default categories to cover general web search
            categories: 'general,science,sports,news,resources',
            // Limit results
            pageno: '1',
        });
        if (options.recency) {
            switch (options.recency) {
                case 'day':
                    params.set('time_range', '1d');
                    break;
                case 'week':
                    params.set('time_range', '1w');
                    break;
                case 'month':
                    params.set('time_range', '1m');
                    break;
                case 'year':
                    params.set('time_range', '1y');
                    break;
            }
        }
        if (options.domains?.length) {
            params.set('safesearch', '0'); // Disable safe search for custom domains
            options.domains.forEach(domain => {
                params.append('categories', `website:${domain}`);
            });
        }
        if (options.language) {
            params.set('language', options.language);
        }
        return `${this.config.url}/search?${params.toString()}`;
    }
    /**
     * Normalize raw SearXNG response to our internal format.
     */
    normalizeResponse(query, data, maxResults) {
        const results = [];
        if (!data.results) {
            return {
                results: [],
                query,
                source: { name: 'searxng' },
                success: false,
            };
        }
        // Process each result from the provider
        for (let i = 0; i < data.results.length && i < maxResults; i++) {
            const result = data.results[i];
            if (!result.url || !result.title) {
                continue;
            }
            results.push({
                id: this.generateId(),
                rank: i + 1,
                url: normalizeUrl(result.url),
                title: this.normalizeTitle(result.title),
                snippet: result.content?.substring(0, 300) || undefined,
                domain: result.domain || extractDomain(result.url),
                source: extractDomain(result.url),
                publishedAt: result.formatted_date || result.published || undefined,
                engine: result.engine || 'searxng',
                ...(result.anon && { isPrivateSearch: true }),
            });
        }
        return {
            results,
            totalResults: data.number_of_results || undefined,
            query,
            source: { name: 'searxng', version: data.version },
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
/**
 * Extract domain from a URL without protocol or path.
 */
function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace(/^www\./, '');
    }
    catch {
        return url;
    }
}
//# sourceMappingURL=searxng.js.map