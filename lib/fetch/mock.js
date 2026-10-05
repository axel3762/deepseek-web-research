/**
 * Mock HTTP client for testing without network access.
 */
import { FetchError } from '../utils/errors.js';
export class MockHttpClient {
    mocks = new Map();
    constructor(initialMocks) {
        if (initialMocks) {
            Object.entries(initialMocks).forEach(([url, data]) => {
                this.mocks.set(url.toLowerCase(), data);
            });
        }
    }
    addMock(url, data) {
        this.mocks.set(url.toLowerCase(), data);
    }
    async fetch(url, options) {
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
                error: new (class extends Error {
                    code = 'FETCH_ERROR';
                    name = 'FetchError';
                })('No mock defined for URL'),
            };
        }
        const response = mock.response;
        const body = typeof response.body === 'string'
            ? response.body
            : Buffer.from(response.body).toString();
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
//# sourceMappingURL=mock.js.map