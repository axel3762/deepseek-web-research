export interface Config {
    provider?: 'auto' | 'searxng' | 'duckduckgo';
    providers?: {
        searxng?: SearXNGConfig;
        duckduckgo?: DuckDuckGoConfig;
        brave?: BraveConfig;
    };
    search?: SearchConfig;
    fetch?: FetchConfig;
    extraction?: ExtractionConfig;
    cache?: CacheConfig;
    concurrency?: ConcurrencyConfig;
    rateLimit?: RateLimitConfig;
    logging?: LoggingConfig;
}
export interface SearXNGConfig {
    enabled?: boolean;
    url: string;
    timeoutMs?: number;
    maxResults?: number;
}
export interface DuckDuckGoConfig {
    enabled?: boolean;
    apiUrl?: string;
    timeoutMs?: number;
    maxResults?: number;
}
export interface BraveConfig {
    enabled?: boolean;
    apiKey?: string;
    timeoutMs?: number;
    maxResults?: number;
}
export interface SearchConfig {
    maxResults?: number;
    timeoutMs?: number;
    enableFallback?: boolean;
    cache?: {
        enabled?: boolean;
        ttlMs?: number;
    };
}
export interface FetchConfig {
    timeoutMs?: number;
    maxResponseBytes?: number;
    maxRedirects?: number;
    userAgent?: string;
}
export interface ExtractionConfig {
    maxExtractChars?: number;
    keepInternalLinks?: boolean;
    removeJunk?: boolean;
}
export interface CacheConfig {
    enabled?: boolean;
    maxSize?: number;
    searchTtlMs?: number;
    pageTtlMs?: number;
}
export interface ConcurrencyConfig {
    maxRequests?: number;
}
export interface RateLimitConfig {
    requestsPerMinute?: number;
    retryDelayMs?: number;
}
export interface LoggingConfig {
    debug?: boolean;
}
export declare const ConfigSchema: any;
export type InferredConfig = ReturnType<typeof ConfigSchema>;
export declare function validateConfig(config: Partial<Config>): Config;
//# sourceMappingURL=config.d.ts.map