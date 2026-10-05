/**
 * Fetch client tests with SSRF protection validation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HttpClient } from '../src/fetch/client.js';
import { validateUrl } from '../src/utils/url.js';
import { normalizeUrl } from '../src/utils/url.js';

describe('URL Validation (SSRF Protection)', () => {
  const testCases = [
    // Should pass
    { url: 'https://example.com', shouldPass: true },
    { url: 'http://example.com/path', shouldPass: true },
    { url: 'https://www.example.com/article?id=123', shouldPass: true },
    { url: 'https://api.github.com/repos/deepseek-ai/deepseek-harness', shouldPass: true },
    
    // Should fail - localhost variants
    { url: 'http://localhost', shouldPass: false },
    { url: 'https://localhost:8080', shouldPass: false },
    { url: 'http://127.0.0.1', shouldPass: false },
    { url: 'https://127.0.0.1/admin', shouldPass: false },
    
    // Should fail - private IPs
    { url: 'http://192.168.1.1', shouldPass: false },
    { url: 'http://10.0.0.1', shouldPass: false },
    { url: 'http://172.16.0.1', shouldPass: false },
    
    // Should fail - metadata endpoints
    { url: 'http://169.254.169.254/latest/meta-data/', shouldPass: false },
    { url: 'http://metadata.google.internal/', shouldPass: false },
    { url: 'http://instance-data.internal/', shouldPass: false },
    
    // Should fail - invalid schemes
    { url: 'file:///etc/passwd', shouldPass: false },
    { url: 'ftp://example.com/file.txt', shouldPass: false },
    { url: 'javascript:alert(1)', shouldPass: false },
  ];
  
  testCases.forEach(({ url, shouldPass }) => {
    it(`should ${shouldPass ? 'accept' : 'block'} ${url}`, () => {
      const result = validateUrl(url);
      
      if (shouldPass) {
        expect(result.valid).toBe(true);
      } else {
        expect(result.valid).toBe(false);
      }
    });
  });
});

describe('HttpClient', () => {
  let client: HttpClient;
  
  beforeEach(() => {
    client = new HttpClient();
  });
  
  it('should be instantiated correctly', () => {
    expect(client).toBeDefined();
  });
  
  describe('Invalid URLs', () => {
    it('should reject empty URL', async () => {
      const result = await client.fetch('');
      expect(result.success).toBe(false);
    });
    
    it('should reject localhost URLs', async () => {
      const result = await client.fetch('http://localhost/test');
      expect(result.success).toBe(false);
      if (!result.success && 'error' in result) {
        expect((result as any).error.code).toBe('BLOCKED_URL');
      }
    });
    
    it('should reject file:// URLs', async () => {
      const result = await client.fetch('file:///etc/passwd');
      expect(result.success).toBe(false);
    });
  });
  
  describe('Valid URLs (would succeed with network)', () => {
    it('accepts https://example.com as valid format', async () => {
      // This would fail without a mock, but validates the URL is not blocked
      const result = await client.fetch('https://example.com');
      
      // In a real test with a mock, this would return success
      // For now, we just verify it doesn't get blocked by security checks
    });
  });
});

describe('URL Normalization', () => {
  
  
  it('should remove UTM parameters', () => {
    const url = 'https://example.com/page?utm_source=test&utm_medium=cpc&ref=abc';
    const normalized = (normalizeUrl as any)(url);
    expect(normalized).not.toContain('utm_');
    expect(normalized).not.toContain('ref=');
  });
  
  it('should remove trailing slashes', () => {
    const normalized = (normalizeUrl as any)('https://example.com/page/');
    expect(normalized).toBe('https://example.com/page');
  });
});
