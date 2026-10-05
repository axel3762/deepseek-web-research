# Installation Guide for @deepseek-ai/dsh-plugin-web-research

## Prerequisites

This guide assumes you have:
1. DeepSeek Harness installed (0.2.0-rc.2 or later)
2. Access to the plugin directory: `C:\Users\allsy\Downloads\deepseek-web-research`
3. A working pnpm installation

## Option 1: Install via Command Line

### Step 1: Navigate to Plugin Directory

```powershell
cd C:\Users\allsy\Downloads\deepseek-web-research
```

### Step 2: Install Dependencies

```powershell
pnpm install
```

This will download all required packages including:
- `@deepseek-ai/cordis` - Cordis runtime context
- `@deepseek-ai/dsh-tools` - Tool definition framework  
- `@deepseek-ai/schemastery` - Configuration validation
- TypeScript and Vitest (dev dependencies)

### Step 3: Build the Plugin

```powershell
pnpm build
```

This compiles all TypeScript files to JavaScript in the `lib/` directory.

### Step 4: Install in Harness

You have two options:

#### A. Via CLI (recommended)

```powershell
pnpm dsh install ./examples/cordis.yml
```

#### B. Via Plugin Manager UI

1. Open DeepSeek Harness Web UI
2. Go to Settings → Plugins
3. Click "Install Bundle"
4. Select `C:\Users\allsy\Downloads\deepseek-web-research\examples\cordis.yml`
5. Wait for installation to complete

### Step 5: Verify Installation

Check that the plugin is enabled:

```powershell
pnpm dsh plugins list | findstr "web-research"
```

Or in the Harness Web UI, check that three new tools appear:
- `web_search`
- `web_fetch`  
- `web_extract`

## Option 2: Load Without Building (Development Only)

For rapid testing without compilation:

1. Copy all files from `src/` to your Harness workspace
2. Use the plugin_manager tool in Harness
3. Install as a local bundle pointing to the source directory

**Note:** This only works if TypeScript files are not required at runtime. For production, always build.

## Configuration After Installation

Once installed, configure through Harness's settings UI or by adding a config entry:

```yaml
web-research-config:
  provider: auto  # or 'searxng' / 'duckduckgo'
  
  providers:
    searxng:
      enabled: true
      url: https://searx.be
      
  search:
    maxResults: 8
    timeoutMs: 10000
    
  fetch:
    maxResponseBytes: 5242880
    timeoutMs: 30000
    
  extraction:
    maxExtractChars: 30000
```

## Troubleshooting Installation Issues

### Issue: "pnpm not found"

**Solution:** Install pnpm first:
```powershell
npm install -g pnpm
```

### Issue: Build fails with TypeScript errors

**Check:**
1. Verify all source files exist in `src/`
2. Check that imports use `.js` extensions (ES modules)
3. Ensure no circular dependencies

### Issue: Plugin doesn't appear in tool list

**Solutions:**
1. Restart Harness after installation
2. Check plugin is enabled (not just installed)
3. Clear Harness cache and reload
4. Verify `lib/index.js` exists after build

### Issue: Search returns no results

**Check:**
1. Provider URL is reachable (`curl https://searx.be`)
2. Fallback is enabled in config
3. Try a simple query: "latest news"

## Development Mode

For local development with hot reload:

```powershell
# Terminal 1: Start watcher
pnpm watch

# Terminal 2: Run tests
pnpm test:watch

# Terminal 3: Test with Harness (separate process)
pnpm dsh web --load ./examples/cordis.yml
```

## Uninstalling

To remove the plugin:

```powershell
# Via CLI
pnpm dsh plugins remove @deepseek-ai/dsh-plugin-web-research

# Or via plugin_manager tool in Harness
```

## File Structure Reference

```
deepseek-web-research/
├── examples/
│   └── cordis.yml          # Installation specification
├── lib/                    # Compiled output (after build)
├── src/                    # Source files
│   ├── index.ts            # Plugin entry point
│   ├── config.ts           # Configuration schema
│   ├── providers/          # Search providers
│   ├── search/             # Search service
│   ├── fetch/              # HTTP client and extraction
│   ├── cache/              # LRU cache
│   └── utils/              # Utilities
├── tests/                  # Test files
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

## Next Steps After Installation

1. **Test basic search:**
   - Send prompt: "Search for the latest DeepSeek model releases"
   - Verify `web_search` tool is called and returns results

2. **Test fetching:**
   - From search results, pick a URL
   - Model should call `web_fetch` on it
   - Verify content is returned cleanly

3. **Test extraction:**
   - Use `web_extract` for complex pages
   - Check that ads/navigation are removed

## Getting Help

- Plugin README: `README.md` in plugin directory
- Implementation report: `IMPLEMENTATION_REPORT.md`
- DeepSeek Harness docs: https://docs.deepseek.ai/harness
- Plugin manager help: Use `plugin_manager` tool with action `help`
