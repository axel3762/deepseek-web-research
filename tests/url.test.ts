/**
 * URL validation tests.
 */

import { describe, it, expect } from 'vitest';
import { validateUrl, normalizeUrl, extractDomain } from '../src/utils/url.js';

describe('URL Validation', () => {
  describe('validateUrl', () => {
    it('should accept valid http URLs', () => {
      expect(validateUrl('https://example.com')).toEqual({
        valid: true,
        url: 'https://example.com',
      });
    });

    it('should reject localhost', () => {
      const result = validateUrl('http://localhost');
      expect(result.valid).toBe(false);
      expect((result as any).error).toBe('LOCALHOST');
    });

    it('should reject private IPs', () => {
      expect(validateUrl('http://192.168.1.1')).toEqual({
        valid: false,
        error: 'PRIVATE_IP',
      });
    });

    it('should reject metadata endpoints', () => {
      const result = validateUrl('http://169.254.169.254');
      expect(result.valid).toBe(false);
      expect((result as any).error).toBe('METADATA_ENDPOINT');
    });

    it('should reject invalid schemes', () => {
      expect(validateUrl('file:///etc/passwd')).toEqual({
        valid: false,
        error: 'INVALID_SCHEME',
      });
    });

    it('should reject credentials in URL', () => {
      const result = validateUrl('http://user:password@example.com');
      expect(result.valid).toBe(false);
      expect((result as any).error).toBe('CREDENTIALS_IN_URL');
    });
  });

  describe('normalizeUrl', () => {
    it('should remove UTM parameters', () => {
      const normalized = normalizeUrl(
        'https://example.com/article?utm_source=test&utm_medium=cpc'
      );
      
      expect(normalized).not.toContain('utm_');
    });

    it('should remove trailing slashes', () => {
      const normalized = normalizeUrl('https://example.com/page/');
      expect(normalized).toBe('https://example.com/page');
    });

    it('should preserve root slash', () => {
      expect(normalizeUrl('https://example.com/')).toBe('https://example.com/');
    });
  });

  describe('extractDomain', () => {
    it('should extract domain without protocol', () => {
      expect(extractDomain('https://example.com/page')).toBe('example.com');
    });

    it('should remove www prefix', () => {
      expect(extractDomain('https://www.example.com')).toBe('example.com');
    });

    it('should handle invalid URLs gracefully', () => {
      expect(extractDomain('not-a-url')).toBe('not-a-url');
    });
  });
});
