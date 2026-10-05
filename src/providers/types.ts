/**
 * Search provider interface and common types.
 */

import { SearchProviderError, SearchTimeoutError, SearchRateLimitError } from '../utils/errors.js';

/**
 * Common search options that can be passed to any provider.
 */
export interface SearchOptions {
  /** Maximum number of results to return. */
  maxResults?: number;
  
  /** Recency filter for results. */
  recency?: 'day' | 'week' | 'month' | 'year' | 'any';
  
  /** Domains to include in results. */
  domains?: string[];
  
  /** Domains to exclude from results. */
  excludeDomains?: string[];
  
  /** Language preference. */
  language?: string;
  
  /** Time limit for the search operation. */
  timeoutMs?: number;
  provider?: string;
}

/**
 * Normalized search result across all providers.
 */
export interface SearchResult {
  /** Unique identifier for this result (may be auto-generated). */
  id: string;
  
  /** The ranking position from the provider's perspective. */
  rank: number;
  
  /** URL of the search result. */
  url: string;
  
  /** Display title for the result. */
  title: string;
  
  /** Description/snippet of the result. */
  snippet?: string;
  
  /** Domain of the source. */
  domain: string;
  
  /** Publication date if available (ISO 8601 format). */
  publishedAt?: string;
  
  /** Source information (e.g., "github.com", "news.ycombinator.com"). */
  source?: string;
  
  /** Any additional metadata from the provider. */
  [key: string]: unknown;
}

/**
 * Response from a search provider.
 */
export interface SearchResponse {
  /** Array of normalized search results. */
  results: SearchResult[];
  
  /** Total number of results available (if known). */
  totalResults?: number | string;
  
  /** Query that was searched. */
  query: string;
  
  /** Source provider information. */
  source: {
    name: string;
    version?: string;
  };
  
  /** Whether the search succeeded. */
  success: boolean;
}

/**
 * Base interface for all search providers.
 */
export interface SearchProvider {
  /** Provider name (should be unique). */
  readonly name: string;
  
  /** Optional human-readable description. */
  readonly description?: string;
  
  /** Whether this provider is enabled. */
  readonly enabled: boolean;
  
  /** Execute a search and return normalized results. */
  search(
    query: string,
    options: SearchOptions
  ): Promise<SearchResponse>;
}

/**
 * Provider configuration interface.
 */
export interface ProviderConfig {
  name: string;
  enabled: boolean;
  
  // SearXNG specific config
  searxngUrl?: string;
  searxngApiKey?: string;
  
  // DuckDuckGo specific config (usually no API key needed)
  duckduckgoMaxResults?: number;
  
  // Brave specific config
  braveApiKey?: string;
}

/**
 * Creates a search provider error with consistent structure.
 */
export function createSearchError(
  message: string,
  providerName: string,
  cause?: unknown
): SearchProviderError {
  return new SearchProviderError(message, providerName, cause);
}

/**
 * Creates a timeout error for search operations.
 */
export function createSearchTimeoutError(
  message: string,
  providerName: string,
  timeoutMs: number,
  cause?: unknown
): SearchTimeoutError {
  return new SearchTimeoutError(message, providerName, timeoutMs, cause);
}

/**
 * Creates a rate limit error for search operations.
 */
export function createSearchRateLimitError(
  message: string,
  providerName: string,
  retryAfter?: number,
  cause?: unknown
): SearchRateLimitError {
  return new SearchRateLimitError(message, providerName, retryAfter, cause);
}
