/** Plugin configuration using Schemastery. */
import z from '@deepseek-ai/schemastery';
const positiveInt = () => z.number().step(1).min(1);
export const ConfigSchema = z.object({
    provider: z.union([z.const('auto'), z.const('searxng'), z.const('duckduckgo')]).default('auto'),
    providers: z.object({
        searxng: z.object({ enabled: z.boolean(), url: z.string(), timeoutMs: positiveInt(), maxResults: positiveInt().max(100) }),
        duckduckgo: z.object({ enabled: z.boolean(), apiUrl: z.string(), timeoutMs: positiveInt(), maxResults: positiveInt().max(100) }),
        brave: z.object({ enabled: z.boolean(), apiKey: z.string(), timeoutMs: positiveInt(), maxResults: positiveInt().max(100) }),
    }),
    search: z.object({
        maxResults: positiveInt().max(20).default(8),
        timeoutMs: positiveInt().default(10000),
        enableFallback: z.boolean().default(true),
        cache: z.object({ enabled: z.boolean().default(true), ttlMs: positiveInt().default(60000) }),
    }),
    fetch: z.object({ timeoutMs: positiveInt().default(30000), maxResponseBytes: positiveInt().default(5 * 1024 * 1024), maxRedirects: z.natural().max(10).default(5), userAgent: z.string().default('DeepSeekWebResearch/1.0') }),
    extraction: z.object({ maxExtractChars: positiveInt().default(30000), keepInternalLinks: z.boolean().default(true), removeJunk: z.boolean().default(true) }),
    cache: z.object({ enabled: z.boolean().default(true), maxSize: positiveInt().default(100), searchTtlMs: positiveInt().default(60000), pageTtlMs: positiveInt().default(300000) }),
    concurrency: z.object({ maxRequests: positiveInt().default(4) }),
    rateLimit: z.object({ requestsPerMinute: positiveInt(), retryDelayMs: positiveInt() }),
    logging: z.object({ debug: z.boolean().default(false) }),
});
export function validateConfig(config) {
    const result = ConfigSchema(config);
    result.providers ??= {};
    if (result.providers.searxng?.url) {
        try {
            const parsed = new URL(result.providers.searxng.url);
            if (parsed.protocol !== 'http:' &&
                parsed.protocol !== 'https:') {
                throw new Error('URL must use HTTP or HTTPS');
            }
        }
        catch {
            throw new Error(`Invalid SearXNG URL: ${result.providers.searxng.url}`);
        }
    }
    if (result.provider === 'searxng' &&
        !result.providers.searxng) {
        result.providers.searxng = {
            url: 'https://searx.be',
            enabled: true,
        };
    }
    if (result.provider === 'duckduckgo' &&
        !result.providers.duckduckgo) {
        result.providers.duckduckgo = {
            apiUrl: 'https://api.duckduckgo.com',
            enabled: true,
        };
    }
    return result;
}
//# sourceMappingURL=config.js.map