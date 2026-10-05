export type BlockedReason = 'PRIVATE_IP' | 'METADATA_ENDPOINT' | 'LOCALHOST' | 'INVALID_SCHEME' | 'CREDENTIALS_IN_URL' | 'OversizedResponse' | 'UNSUPPORTED_CONTENT_TYPE';
export type UrlValidationResult = {
    valid: true;
    url: string;
} | {
    valid: false;
    error: BlockedReason;
};
export declare function validateUrl(url: string, _maxRedirects?: number): UrlValidationResult;
export declare function normalizeHostname(hostname: string): UrlValidationResult;
export declare function normalizeUrl(url: string): string;
export declare function extractDomain(url: string): string;
export declare function urlsAreEqual(a: string, b: string): boolean;
//# sourceMappingURL=url.d.ts.map