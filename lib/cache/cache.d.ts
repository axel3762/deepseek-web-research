/**
 * Simple LRU cache implementation for search results.
 */
export interface CacheEntry<T> {
    value: T;
    timestamp: number;
    ttlMs: number;
}
export interface CacheConfig {
    /** Maximum number of items in the cache. */
    maxSize?: number;
    /** Default TTL for search results in milliseconds. */
    searchTtlMs?: number;
    /** Default TTL for fetched pages in milliseconds. */
    pageTtlMs?: number;
}
export declare class Cache<T> {
    private entries;
    private config;
    constructor(config?: CacheConfig);
    /**
     * Get a value from the cache.
     */
    get(key: string): T | undefined;
    /**
     * Set a value in the cache.
     */
    set(key: string, value: T, ttlMs?: number): void;
    /**
     * Delete a value from the cache.
     */
    delete(key: string): void;
    /**
     * Check if a key exists in the cache.
     */
    has(key: string): boolean;
    /**
     * Get the number of items in the cache.
     */
    size(): number;
    /**
     * Clear all entries from the cache.
     */
    clear(): void;
    /**
     * Evict oldest entries if at capacity.
     */
    private evictIfFull;
}
/**
 * Search cache with specific configuration.
 */
export declare class SearchCache extends Cache<string[]> {
    constructor(config?: CacheConfig);
}
/**
 * Page cache for fetched content.
 */
export declare class PageCache extends Cache<string> {
    constructor(config?: CacheConfig);
}
//# sourceMappingURL=cache.d.ts.map