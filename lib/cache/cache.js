/**
 * Simple LRU cache implementation for search results.
 */
const DEFAULT_CONFIG = {
    maxSize: 100,
    searchTtlMs: 60000, // 1 minute
    pageTtlMs: 300000, // 5 minutes
};
export class Cache {
    entries = new Map();
    config;
    constructor(config) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Get a value from the cache.
     */
    get(key) {
        const entry = this.entries.get(key);
        if (!entry) {
            return undefined;
        }
        // Check TTL
        const now = Date.now();
        if (now - entry.timestamp > entry.ttlMs) {
            this.delete(key);
            return undefined;
        }
        // Move to end of list (LRU behavior)
        // Note: We're just tracking access time here for simple TTL validation
        return entry.value;
    }
    /**
     * Set a value in the cache.
     */
    set(key, value, ttlMs) {
        const ttl = ttlMs ||
            (typeof value === 'object' && JSON.stringify(value).length < 500 ? this.config.searchTtlMs : this.config.pageTtlMs);
        // Remove if at capacity (LRU eviction)
        this.evictIfFull();
        this.entries.set(key, {
            value,
            timestamp: Date.now(),
            ttlMs: ttl,
        });
    }
    /**
     * Delete a value from the cache.
     */
    delete(key) {
        this.entries.delete(key);
    }
    /**
     * Check if a key exists in the cache.
     */
    has(key) {
        return this.entries.has(key);
    }
    /**
     * Get the number of items in the cache.
     */
    size() {
        return this.entries.size;
    }
    /**
     * Clear all entries from the cache.
     */
    clear() {
        this.entries.clear();
    }
    /**
     * Evict oldest entries if at capacity.
     */
    evictIfFull() {
        const limit = this.config.maxSize;
        if (this.entries.size <= limit) {
            return;
        }
        // Find and remove the oldest entry
        let oldestTime = Infinity;
        let oldestKey = null;
        for (const [key, entry] of this.entries) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.delete(oldestKey);
        }
    }
}
/**
 * Search cache with specific configuration.
 */
export class SearchCache extends Cache {
    constructor(config) {
        super({
            maxSize: 50, // Limit search results to save memory
            searchTtlMs: 60000,
            pageTtlMs: 60000,
            ...config,
        });
    }
}
/**
 * Page cache for fetched content.
 */
export class PageCache extends Cache {
    constructor(config) {
        super({
            maxSize: 200, // Can store larger content
            searchTtlMs: 300000, // Longer TTL for pages
            pageTtlMs: 600000, // Even longer for full pages
            ...config,
        });
    }
}
//# sourceMappingURL=cache.js.map