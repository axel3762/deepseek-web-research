/**
 * DuckDuckGo search provider implementation.
 *
 * Uses DuckDuckGo's instant answer API and fallback to HTML parsing when needed.
 */
import type { SearchProvider, SearchOptions, SearchResponse } from './types.js';
/**
 * DuckDuckGo API configuration.
 */
declare const DUCKDUCKGO_CONFIG: {
    apiUrl: string;
    timeoutMs: number;
    maxResults: number;
};
export interface DDGConfig extends Omit<typeof DUCKDUCKGO_CONFIG, 'apiUrl'> {
    apiUrl?: string;
}
/**
 * DuckDuckGo search provider.
 */
export declare class DuckDuckGoProvider implements SearchProvider {
    readonly name = "duckduckgo";
    readonly description = "Privacy-focused search engine with instant answer API";
    readonly enabled = true;
    private config;
    constructor(config?: Partial<DDGConfig>);
    /**
     * Execute a search using DuckDuckGo API.
     */
    search(query: string, options: SearchOptions): Promise<SearchResponse>;
    /**
     * Normalize raw DuckDuckGo response to our internal format.
     */
    private normalizeResponse;
    /**
     * Parse HTML response to extract search results.
     */
    private parseHtml;
    /**
     * Wrap results with metadata.
     */
    private wrapResults;
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
//# sourceMappingURL=duckduckgo.d.ts.map