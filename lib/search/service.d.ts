/** Multi-provider search service. */
import type { SearchOptions, SearchResponse } from '../providers/types.js';
export interface SearchServiceConfig {
    enableFallback?: boolean;
    maxResults?: number;
    timeoutMs?: number;
    cacheTTL?: number;
}
export declare class SearchService {
    private providers;
    private config;
    private resultCache;
    constructor(config?: SearchServiceConfig);
    search(query: string, options?: SearchOptions): Promise<SearchResponse>;
    private deduplicateAndRank;
    private relevance;
    private cacheKey;
    setCacheTtl(ttl: number): void;
    getProviders(): {
        name: string;
        enabled: boolean;
        description: string | undefined;
    }[];
}
//# sourceMappingURL=service.d.ts.map