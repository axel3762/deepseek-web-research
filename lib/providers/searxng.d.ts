/**
 * SearXNG search provider implementation.
 *
 * SearXNG is a self-hosted, anonymous metasearch engine that aggregates results from multiple search engines.
 */
import type { SearchProvider, SearchOptions, SearchResponse } from './types.js';
/**
 * Default SearXNG configuration.
 */
declare const DEFAULT_SEARXNG_CONFIG: {
    url: string;
    timeoutMs: number;
    maxResults: number;
};
export interface SearXNGConfig extends Omit<typeof DEFAULT_SEARXNG_CONFIG, 'url'> {
    url: string;
}
/**
 * SearXNG search provider.
 */
export declare class SearXNGProvider implements SearchProvider {
    readonly name = "searxng";
    readonly description = "Self-hosted metasearch engine supporting multiple backends";
    readonly enabled = true;
    private config;
    constructor(config?: Partial<SearXNGConfig>);
    /**
     * Execute a search using SearXNG API.
     */
    search(query: string, options: SearchOptions): Promise<SearchResponse>;
    /**
     * Build the API URL for a search query.
     */
    private buildSearchUrl;
    /**
     * Normalize raw SearXNG response to our internal format.
     */
    private normalizeResponse;
    /**
     * Normalize the title to remove excessive punctuation and special characters.
     */
    private normalizeTitle;
    /**
     * Generate a unique ID for request tracking.
     */
    private generateId;
}
export {};
//# sourceMappingURL=searxng.d.ts.map