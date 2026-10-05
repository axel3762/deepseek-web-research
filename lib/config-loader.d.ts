/**
 * Configuration loader for the web research plugin.
 */
import { Context } from '@deepseek-ai/cordis';
import { type Config } from './config.js';
export declare class ConfigLoader {
    private ctx;
    private configMap;
    constructor(ctx: Context);
    /**
     * Load configuration for the plugin.
     */
    load(pluginName?: string): Config;
    /**
     * Get the default configuration.
     */
    private getDefaultConfig;
    /**
     * Get a cached config entry.
     */
    private getCacheKey;
    /**
     * Store a config in the cache.
     */
    private setConfig;
    /**
     * Get a cached config if available.
     */
    private getCachedConfig;
}
//# sourceMappingURL=config-loader.d.ts.map