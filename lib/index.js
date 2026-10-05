/** DeepSeek Harness web research plugin. */
import { defineTool } from '@deepseek-ai/dsh-tools';
import { validateConfig } from './config.js';
import { SearchService } from './search/service.js';
import { HttpClient } from './fetch/client.js';
import { extractContent } from './fetch/extract.js';
const toJson = (value) => JSON.parse(JSON.stringify(value));
const text = (description) => ({ type: 'string', description });
const integer = (description) => ({ type: 'integer', description });
const output = { schema: { type: 'json' }, render(_args, value) { return [{ type: 'text', text: JSON.stringify(value) }]; } };
export function apply(ctx) {
    const config = validateConfig(ctx.get('web-research-config') ?? {});
    const searchService = new SearchService({ enableFallback: config.search?.enableFallback, maxResults: config.search?.maxResults, timeoutMs: config.search?.timeoutMs, cacheTTL: config.search?.cache?.ttlMs });
    const httpClient = new HttpClient({ timeoutMs: config.fetch?.timeoutMs, maxChars: config.extraction?.maxExtractChars ?? 100000, maxRedirects: config.fetch?.maxRedirects, userAgent: config.fetch?.userAgent });
    const webSearch = defineTool({
        name: 'web_search', description: 'Search the public web for current or historical information.',
        parameters: {
            query: { ...text('Search query. Must be non-empty.'), required: true },
            max_results: { ...integer('Maximum results (1-20).'), default: 8 },
            recency: { type: 'string', enum: ['day', 'week', 'month', 'year', 'any'], default: 'any' },
            domains: { type: 'array', items: { type: 'string' }, description: 'Only search these domains.' },
            exclude_domains: { type: 'array', items: { type: 'string' }, description: 'Exclude these domains.' },
            language: text('Language preference, e.g. en.')
        },
        output,
        timeoutMs: config.search?.timeoutMs,
        async execute(args) {
            try {
                if (!args.query.trim())
                    throw new Error('Search query cannot be empty');
                const response = await searchService.search(args.query, { maxResults: Math.min(args.max_results ?? 8, 20), recency: args.recency ?? 'any', domains: args.domains?.filter(x => x.trim()), excludeDomains: args.exclude_domains?.filter(x => x.trim()), language: args.language });
                return toJson({
                    results: response.results.map(r => ({
                        id: r.id,
                        rank: r.rank,
                        title: r.title,
                        url: r.url,
                        domain: r.domain,
                        ...(r.snippet !== undefined
                            ? { snippet: r.snippet.slice(0, 200) }
                            : {}),
                        ...(r.publishedAt !== undefined
                            ? { publishedAt: r.publishedAt }
                            : {}),
                        ...(r.source !== undefined
                            ? { source: r.source }
                            : {}),
                    })),
                    totalResults: response.totalResults ?? response.results.length,
                    query: args.query,
                    source: response.source,
                    success: response.success,
                });
            }
            catch (e) {
                return { results: [], totalResults: 0, query: args.query, source: { name: 'unknown' }, success: false, error: e instanceof Error ? e.message : String(e) };
            }
        }
    });
    const webFetch = defineTool({
        name: 'web_fetch', description: 'Fetch a public HTTP/HTTPS webpage and return its content.',
        parameters: { url: { ...text('URL to fetch. Must use http or https.'), required: true }, max_chars: { ...integer('Maximum characters (1-200000).'), default: 100000 } },
        output, timeoutMs: config.fetch?.timeoutMs,
        async execute(args) {
            try {
                return toJson(await httpClient.fetch(args.url, {
                    maxChars: Math.min(args.max_chars ?? 100000, 200000),
                    timeoutMs: config.fetch?.timeoutMs,
                    maxRedirects: config.fetch?.maxRedirects,
                }));
            }
            catch (e) {
                return toJson({
                    success: false,
                    error: e instanceof Error ? e.message : String(e),
                });
            }
        }
    });
    const webExtract = defineTool({
        name: 'web_extract', description: 'Fetch a webpage and extract its main readable content.',
        parameters: { url: { ...text('URL to extract. Must use http or https.'), required: true }, instructions: text('Optional extraction guidance.'), max_chars: { ...integer('Maximum characters (1-200000).'), default: 30000 } },
        output, timeoutMs: config.fetch?.timeoutMs,
        async execute(args) {
            try {
                const fetched = await httpClient.fetch(args.url, { maxChars: 100000, timeoutMs: config.fetch?.timeoutMs, maxRedirects: config.fetch?.maxRedirects });
                if (!fetched.success) {
                    return toJson(fetched);
                }
                return toJson(extractContent(fetched.content, args.url, {
                    maxChars: Math.min(args.max_chars ?? 30000, 200000),
                    keepInternalLinks: args.instructions?.includes('keep links') ??
                        config.extraction?.keepInternalLinks,
                }));
            }
            catch (e) {
                return toJson({
                    success: false,
                    url: args.url,
                    error: e instanceof Error ? e.message : String(e),
                });
            }
        }
    });
    ctx.tools.register(webSearch);
    ctx.tools.register(webFetch);
    ctx.tools.register(webExtract);
}
//# sourceMappingURL=index.js.map