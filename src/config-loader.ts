/**
 * Configuration loader for the web research plugin.
 */

import { Context } from '@deepseek-ai/cordis';
import { validateConfig, type Config } from './config.js';

export class ConfigLoader {
  private ctx: Context;
  private configMap = new Map<string, Config>();
  
  constructor(ctx: Context) {
    this.ctx = ctx;
  }
  
  /**
   * Load configuration for the plugin.
   */
  load(pluginName: string = 'web-research'): Config {
    // Try to get config from Cordis
    try {
      const configEntry = this.ctx.get(pluginName);
      
      if (configEntry && typeof configEntry === 'object') {
        const validated = validateConfig(configEntry as Partial<Config>);
        return validated;
      }
    } catch (error) {
      console.error('[web-research] Failed to load config:', error);
    }
    
    // Return defaults if no config found
    return this.getDefaultConfig();
  }
  
  /**
   * Get the default configuration.
   */
  private getDefaultConfig(): Config {
    return {
      provider: 'auto',
      
      providers: {
        searxng: {
          enabled: true,
          url: 'https://searx.be',
        },
        duckduckgo: {
          enabled: true,
        },
        brave: {
          enabled: false,
        },
      },
      
      search: {
        maxResults: 8,
        timeoutMs: 10000,
        enableFallback: true,
      },
      
      fetch: {
        timeoutMs: 30000,
        maxResponseBytes: 5 * 1024 * 1024, // 5MB
        maxRedirects: 5,
        userAgent: 'DeepSeekWebResearch/1.0',
      },
      
      extraction: {
        maxExtractChars: 30000,
        keepInternalLinks: true,
        removeJunk: true,
      },
      
      cache: {
        enabled: true,
        maxSize: 100,
        searchTtlMs: 60000,
        pageTtlMs: 300000,
      },
      
      concurrency: {
        maxRequests: 4,
      },
      
      rateLimit: {},
      
      logging: {
        debug: false,
      },
    };
  }
  
  /**
   * Get a cached config entry.
   */
  private getCacheKey(pluginName: string): string {
    return `config:${pluginName}`;
  }
  
  /**
   * Store a config in the cache.
   */
  private setConfig(key: string, config: Config): void {
    this.configMap.set(key, config);
  }
  
  /**
   * Get a cached config if available.
   */
  private getCachedConfig(pluginName: string): Config | undefined {
    return this.configMap.get(this.getCacheKey(pluginName));
  }
}
