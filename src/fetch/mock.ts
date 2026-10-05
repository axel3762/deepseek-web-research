/**
 * Mock HTTP client for testing without network access.
 */

import type { FetchOptions, FetchResult, FetchFailure } from './client.js';
import { FetchError } from '../utils/errors.js';

export interface MockResponse {
  status?: number;
  headers?: Record<string, string>;
  body?: string | Buffer | PromiseLike<string | Buffer>;
}

export interface MockFetchData {
  url: string;
  response?: MockResponse;
  error?: Error;
  delay?: number;
}

export class MockHttpClient implements HttpClientInterface {
  private mocks: Map<string, MockFetchData> = new Map();
  
  constructor(initialMocks?: Record<string, MockFetchData>) {
    if (initialMocks) {
      Object.entries(initialMocks).forEach(([url, data]) => {
        this.mocks.set(url.toLowerCase(), data);
      });
    }
  }
  
  addMock(url: string, data: MockFetchData): void {
    this.mocks.set(url.toLowerCase(), data);
  }
  
  async fetch(url: string, options?: FetchOptions): Promise<FetchResult | FetchFailure> {
    const urlKey = url.toLowerCase();
    const mock = this.mocks.get(urlKey) || this.mocks.get('*');
    
    if (mock?.error) {
      return {
        success: false,
        error: new FetchError(`Mock fetch failed for ${url}: ${mock.error.message}`, mock.error),
      };
    }
    
    if (!mock?.response) {
      return {
        success: false,
        error: new (class extends Error { readonly code = 'FETCH_ERROR'; readonly name = 'FetchError'; })('No mock defined for URL'),
      };
    }
    
    const response = mock.response!;
    const body = typeof response.body === 'string' 
      ? response.body 
      : Buffer.from(response.body as Buffer).toString();
    
    return {
      success: true,
      url,
      content: body,
      contentType: response.headers?.['content-type'] || 'text/html',
      status: response.status || 200,
      headers: response.headers,
    };
  }
}

interface HttpClientInterface {
  fetch(url: string, options?: FetchOptions): Promise<FetchResult | FetchFailure>;
}
