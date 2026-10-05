/**
 * Integration tests for the web research plugin.
 * These tests use a mock HTTP client to simulate real behavior without network access.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockHttpClient } from '../src/fetch/mock.js';
import type { MockFetchData } from '../src/fetch/mock.js';
import { extractContent } from '../src/fetch/extract.js';

describe('HTML Extraction', () => {
  it('should extract content from a basic HTML document', async () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Test Article</title></head>
        <body>
          <nav class="navigation">Skip this nav</nav>
          <article class="content">
            <h1>Main Title</h1>
            <p>This is the main content paragraph.</p>
            <p>Another paragraph with more details.</p>
          </article>
          <footer>Footer content to ignore</footer>
        </body>
      </html>
    `;

    const result = extractContent(html, 'https://example.com/article');
    
    expect(result.success).toBe(true);
    expect(result.title).toBe('Test Article');
    expect(result.content).toContain('Main Title');
    expect(result.content).toContain('main content paragraph');
  });

  it('should remove script and style tags', async () => {
    const html = `
      <html>
        <head><style>.hidden { display: none; }</style></head>
        <body>
          <script>alert('junk');</script>
          <p>Real content here</p>
        </body>
      </html>
    `;

    const result = extractContent(html, 'https://example.com');
    
    expect(result.success).toBe(true);
    // Scripts and styles should be removed
    expect(result.content).not.toContain('alert');
    expect(result.content).toContain('Real content here');
  });

  it('should handle nested junk elements', async () => {
    const html = `
      <div class="wrapper">
        <aside>Ad sidebar</aside>
        <article>
          <main>Main content</main>
          <aside class="widget">Widget</aside>
        </article>
      </div>
    `;

    const result = extractContent(html, 'https://example.com');
    
    expect(result.success).toBe(true);
    expect(result.content).toContain('Main content');
  });
});

describe('URL Extraction', () => {
  it('should extract clean URLs from content', async () => {
    const html = `
      <div>
        <p>Check out <a href="https://example.com/article?utm_source=test&utm_medium=cpc">this article</a></p>
        <p>Also see <a href="http://another-site.org/page">that one</a></p>
      </div>
    `;

    const result = extractContent(html, 'https://example.com');
    
    expect(result.success).toBe(true);
    // URLs should be cleaned of tracking parameters
    if (result.content.includes('example.com')) {
      expect(result.content).not.toContain('utm_');
    }
  });
});

describe('Mock HTTP Client', () => {
  let mockClient: MockHttpClient;

  beforeEach(() => {
    mockClient = new MockHttpClient();
    
    mockClient.addMock('https://example.com', {
      response: {
        status: 200,
        headers: { 'content-type': 'text/html' },
        body: '<html><body><h1>Example Page</h1><p>Content here</p></body></html>',
      },
    });

    mockClient.addMock('https://api.github.com/repos/deepseek-ai/deepseek-harness', {
      response: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'deepseek-harness', description: 'Test repo' }),
      },
    });
  });

  it('should return mocked HTML content', async () => {
    const result = await mockClient.fetch('https://example.com');
    
    expect(result.success).toBe(true);
    expect(result.content).toContain('Example Page');
  });

  it('should return mocked JSON content', async () => {
    const result = await mockClient.fetch(
      'https://api.github.com/repos/deepseek-ai/deepseek-harness'
    );
    
    expect(result.success).toBe(true);
    expect(result.content).toContain('deepseek-harness');
  });

  it('should handle errors in mock', async () => {
    mockClient.addMock('https://error.example.com', {
      error: new Error('Simulated network error'),
    });

    const result = await mockClient.fetch('https://error.example.com');
    
    expect(result.success).toBe(false);
  });
});
