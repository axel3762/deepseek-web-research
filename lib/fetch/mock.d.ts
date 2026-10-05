/**
 * Mock HTTP client for testing without network access.
 */
import type { FetchOptions, FetchResult, FetchFailure } from './client.js';
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
export declare class MockHttpClient implements HttpClientInterface {
    private mocks;
    constructor(initialMocks?: Record<string, MockFetchData>);
    addMock(url: string, data: MockFetchData): void;
    fetch(url: string, options?: FetchOptions): Promise<FetchResult | FetchFailure>;
}
interface HttpClientInterface {
    fetch(url: string, options?: FetchOptions): Promise<FetchResult | FetchFailure>;
}
export {};
//# sourceMappingURL=mock.d.ts.map