/**
 * Configuration tests for the web research plugin.
 */

import { describe, it, expect } from 'vitest';
import { validateConfig } from '../src/config.js';

describe('Config Validation', () => {
  it('should accept valid configuration', () => {
    const config = {
      provider: 'searxng',
      providers: {
        searxng: {
          url: 'http://localhost:8080',
        },
      },
      search: {
        maxResults: 10,
      },
    };

    const result = validateConfig(config);
    
    expect(result.provider).toBe('searxng');
    expect(result.providers?.searxng?.url).toBe('http://localhost:8080');
    expect(result.search?.maxResults).toBe(10);
  });

  it('should apply defaults for missing values', () => {
    const config = {
      provider: 'duckduckgo',
    };

    const result = validateConfig(config);
    
    // Should have reasonable defaults
    expect(result.search?.maxResults).toBe(8);
    expect(result.logging?.debug).toBe(false);
  });

  it('should validate URL format', () => {
    const validUrls = [
      'https://searx.be',
      'http://localhost:8080',
      'https://api.duckduckgo.com',
    ];

    for (const url of validUrls) {
      expect(() => validateConfig({
        providers: { searxng: { url } },
      })).not.toThrow();
    }
  });

  it('should reject invalid URLs', () => {
    expect(() => validateConfig({
      providers: { searxng: { url: 'not-a-url' } },
    })).toThrow();
  });
});
