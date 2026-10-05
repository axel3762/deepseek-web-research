/**
 * Search provider module exports.
 */

export { SearXNGProvider, type SearXNGConfig } from './searxng.js';
export { DuckDuckGoProvider, type DDGConfig } from './duckduckgo.js';

// Re-export types for convenience
export type {
  SearchProvider,
  SearchOptions,
  SearchResponse,
  SearchResult,
  ProviderConfig,
} from './types.js';

// Re-export error creation helpers
export { 
  createSearchError,
  createSearchTimeoutError,
  createSearchRateLimitError,
} from './types.js';
