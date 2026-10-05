# DeepSeek Web Research Plugin

A production-quality web research plugin for DeepSeek Harness that provides the local model with reliable internet access through controlled, secure tool calls.

## Features

- **Multi-Provider Search**: Automatic fallback across SearXNG, DuckDuckGo, and Brave Search
- **Secure Web Fetching**: SSRF protection, URL validation, redirect security
- **Smart HTML Extraction**: Removes junk content while preserving main articles
- **Result Deduplication & Ranking**: Intelligent normalization and scoring
- **Configurable Caching**: LRU cache with TTL for better performance
- **Rate Limiting**: Configurable request limits per provider

## Architecture

```
                     LOCAL DEEPSEEK MODEL
                              |
              web_search / web_fetch / web_extract
                              |
                    deepseek-web-research
                              |
        +---------------------+---------------------+
        |                     |                     |
    web_search          web_fetch           web_extract
        |                     |                     |
        v                     v                     v
  Search Providers         HTTP Client       HTML Parser
   (SearXNG/DDG/Brave)    (SSRF Protected)   (Junk Removal)
```

## Requirements

- Node.js 18+ with TypeScript support
- DeepSeek Harness 0.2.0-rc.2 or later
- pnpm package manager

## Installation

### Option 1: Install as a Bundle

From your Harness workspace:

```bash
cd deepseek-web-research
pnpm install

# Install the bundle in your profile
pnpm dsh install ./examples/cordis.yml
```

### Option 2: Development Mode

```bash
cd deepseek-web-research
pnpm build
```

Then load the plugin manually through Harness's plugin manager UI.

## Configuration

The plugin configuration is specified in `cordis.yml` or through Harness's config editor.

### Key Settings

```yaml
# Primary provider selection
provider: auto  # or 'searxng' / 'duckduckgo'

# Provider configurations
providers:
  searxng:
    enabled: true
    url: https://searx.be  # Your self-hosted instance URL
    timeoutMs: 10000
    
  duckduckgo:
    enabled: true
    apiUrl: https://api.duckduckgo.com
    
  brave:
    enabled: false
    apiKey: YOUR_API_KEY  # Optional Brave Search API key

# Search settings
search:
  maxResults: 8        # Results per query (1-20)
  timeoutMs: 10000     # Per-provider timeout
  enableFallback: true # Try other providers on failure

# Fetch security
fetch:
  timeoutMs: 30000     # Page fetch timeout
  maxResponseBytes: 5242880  # ~5MB limit
  maxRedirects: 5      # Redirect chain limit

# Extraction
extraction:
  maxExtractChars: 30000
  removeJunk: true     # Strip ads, nav, scripts
```

## Tools

### `web_search`

Search the public web for current or historical information.

**Parameters:**
- `query` (required): Search query string
- `max_results`: Maximum results (default: 8, max: 20)
- `recency`: Filter by date - 'day', 'week', 'month', 'year', 'any' (default: 'any')
- `domains`: Only search specific domains (e.g., `["github.com", "arxiv.org"]`)
- `exclude_domains`: Exclude specific domains
- `language`: Language preference (e.g., 'en')

**Example usage:**
> Search for the latest developments in local LLMs.

### `web_fetch`

Fetch and read a specific public HTTP/HTTPS webpage.

**Parameters:**
- `url` (required): URL to fetch (must be http:// or https://)
- `max_chars`: Maximum characters to return (default: 100000)

**Security:** This tool blocks localhost, private IPs, metadata endpoints, and limits response sizes.

### `web_extract`

Fetch a webpage and extract the main article content intelligently.

**Parameters:**
- `url` (required): URL to extract from
- `instructions`: Optional extraction guidance
- `max_chars`: Maximum characters to extract (default: 30000)

This removes navigation, ads, scripts, and other junk while preserving the main content.

## Search Providers

### SearXNG

Self-hosted metasearch engine that aggregates results from multiple search engines.

**Pros:**
- Privacy-focused
- No API key required
- Can use any backend
- Good for local deployment

**Cons:**
- Requires self-hosting or using a public instance
- May have rate limits on public instances

**Configuration:**
```yaml
providers:
  searxng:
    url: https://searx.be  # Change to your instance
    timeoutMs: 10000
    maxResults: 20
```

### DuckDuckGo

Privacy-focused search engine with instant answer API.

**Pros:**
- No API key needed
- Reliable and well-maintained
- Good instant answers

**Cons:**
- Limited structured data compared to paid APIs
- Rate limits apply

### Brave Search

Brave's own search engine (requires API key).

**Pros:**
- Excellent image/video results
- No rate limiting for basic searches
- High-quality results

**Cons:**
- Requires paid API key (~$25/month)
- Must be configured with API key

## Security Features

### SSRF Protection

The `web_fetch` tool implements comprehensive SSRF protection:

- **URL Scheme Validation**: Only http:// and https:// allowed
- **Private IP Blocking**: Detects and blocks private IP ranges (10.x, 192.168.x, etc.)
- **Loopback Detection**: Blocks localhost, 127.0.0.1, ::1, etc.
- **Metadata Endpoint Protection**: Blocks cloud metadata services (169.254.169.254)
- **Credential Rejection**: Rejects URLs with embedded credentials
- **Redirect Validation**: Every redirect is validated for SSRF

### Content Safety

- All web content is treated as untrusted data
- Fetched content is never interpreted as instructions
- No execution of webpage content
- Clear separation between tool metadata and webpage content

### Rate Limiting

Configurable per-provider rate limits with automatic backoff on 429 responses.

### Caching Security

Cache contains only public search results and fetched pages - no credentials or sensitive data.

## Usage Examples

### Basic Search

```text
Search for the latest DeepSeek models released in 2025.
```

Expected behavior:
1. Model calls `web_search` with query
2. Plugin searches SearXNG first
3. Returns structured results with URLs, titles, snippets

### Fetch and Read

```text
Find the official documentation for DeepSeek Harness plugins, then show me the installation steps.
```

Expected behavior:
1. Model calls `web_search`
2. Selects a promising result from search results
3. Calls `web_fetch` on that URL
4. Returns readable page content

### Intelligent Extraction

```text
Search for recent benchmarks comparing local LLMs, then extract the main table of results.
```

Expected behavior:
1. Model calls `web_search`
2. Calls `web_extract` on relevant pages
3. Gets clean article content with tables preserved

## Testing

### Unit Tests

```bash
pnpm test
```

Tests cover:
- Configuration validation
- URL validation and normalization
- SSRF protection rules
- Cache behavior

### Integration Tests

To test with real providers, set environment variables:

```bash
export SEARXNG_URL=http://localhost:8080
pnpm test:integration
```

Or use Harness's built-in testing through the Web UI.

## Troubleshooting

### Search Returns No Results

1. Check if your provider is enabled in config
2. Verify SearXNG URL is reachable (if using searxng)
3. Check fallback is enabled (`enableFallback: true`)
4. Try a simpler query to test functionality

### Fetch Blocked by Security

This is expected behavior. The plugin blocks:
- localhost/private IP addresses
- Cloud metadata endpoints  
- Invalid URL schemes
- URLs with embedded credentials

**Solution**: Use only public https:// URLs from search results.

### Slow Search Performance

1. Reduce `maxResults` per query
2. Increase timeouts if using slow providers
3. Enable caching for repeated queries
4. Consider using a faster SearXNG backend

### Extraction Produces Poor Results

Some websites are difficult to parse. Try:
- Adjusting `removeJunk` setting
- Using `web_fetch` instead of `web_extract` for full control
- Providing specific `instructions` in `web_extract`

## Development

### Building

```bash
pnpm build
```

### Running Tests

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
```

### Adding Providers

1. Create new provider file in `src/providers/`
2. Implement `SearchProvider` interface from `src/providers/types.ts`
3. Register with search service in `src/search/service.ts`
4. Update configuration schema if needed

### Extending Extraction

Modify the junk removal patterns in `src/fetch/extract.ts`:

```typescript
const JUNK_CLASSES = [
  'ad', 'advertisement', 'adsbygoogle',
  // Add your custom classes here
];
```

## Limitations

- **No PDF extraction**: Binary files are not parsed as text
- **Basic HTML parsing**: Complex layouts may need manual `web_fetch` calls
- **Single-threaded**: No browser automation or JavaScript rendering
- **Cookie restrictions**: Session cookies are not used by default
- **Public web only**: Cannot access private/internal networks

## Roadmap

- [ ] Add support for more search providers (Bing, Google Custom Search)
- [ ] Implement image extraction from pages
- [ ] Add table-to-markdown conversion
- [ ] Support for follow-up navigation on pages
- [ ] Enhanced caching with external storage options
- [ ] Multi-language extraction improvements

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation in examples/
- Review the DeepSeek Harness docs

---

**Version**: 1.0.0  
**Built for**: DeepSeek Harness 0.2.0-rc.2  
**Last Updated**: 2026-10
