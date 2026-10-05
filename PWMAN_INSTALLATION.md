# Installation Guide - Fixing PowerShell Execution Policy Issue

## Problem
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled
```

This happens because PowerShell's execution policy blocks script files.

---

## Solution 1: Use Command Prompt (cmd.exe) Instead of PowerShell

**Recommended - No admin rights needed!**

### Step 1: Open Command Prompt as User (not Admin)
- Press `Windows + R`
- Type: `cmd`
- Press Enter

### Step 2: Navigate to Plugin Directory
```cmd
cd /d C:\Users\allsy\Downloads\deepseek-web-research
```

### Step 3: Install pnpm Globally
```cmd
C:\Program Files\nodejs\npm.cmd install -g pnpm
```

### Step 4: Install Plugin Dependencies
```cmd
pnpm install
```

### Step 5: Build the Plugin
```cmd
pnpm build
```

### Step 6: Install in Harness
You have two options:

**A. Via Command Prompt:**
```cmd
C:\Users\allsy\AppData\Local\npm-cache\_npx\1e7f6d9597241db0\node_modules\.bin\dsh.cmd install ./examples/cordis.yml
```

**B. Via Harness Web UI:**
1. Open DeepSeek Harness in browser (http://localhost:3080 or similar)
2. Click "Settings" → "Plugins"
3. Click "Install Bundle" button
4. Navigate to and select `C:\Users\allsy\Downloads\deepseek-web-research\examples\cordis.yml`
5. Wait for installation to complete

---

## Solution 2: Use PowerShell with Execution Policy Override

**Requires User-level permissions (no admin needed)**

### Step 1: Change Execution Policy (Run in PowerShell)
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

You'll get a prompt asking for confirmation. Type `Y` and press Enter.

### Step 2: Install pnpm
```powershell
npm install -g pnpm
```

### Step 3: Continue as before
```powershell
cd C:\Users\allsy\Downloads\deepseek-web-research
pnpm install
pnpm build
pnpm dsh install ./examples/cordis.yml
```

---

## Solution 3: Use Administrator PowerShell

**If you have admin rights**

1. Search for "PowerShell" in Start Menu
2. Right-click → "Run as administrator"
3. Run all commands with `pnpm` and `npm` normally

---

## Verification After Installation

### Check pnpm is available
```cmd
where pnpm
```
Should show the full path to pnpm.cmd

### Verify plugin installation
Open DeepSeek Harness Web UI and check:
1. Settings → Plugins
2. Look for "deepseek-web-research" in the list
3. Make sure it's **Enabled** (not just installed)

### Test the tools are available
Send a test prompt to your agent:
```
Search for the latest news about DeepSeek models.
```

Expected behavior:
1. Agent should call `web_search` tool
2. You'll see search results with titles, URLs, and snippets
3. The plugin is working!

---

## Troubleshooting

### Issue: "npm is not recognized"

**Solution:** Use full path or add to PATH:
```cmd
C:\Program Files\nodejs\npm.cmd install -g pnpm
```

### Issue: "pnpm install failed - network error"

**Solutions:**
1. Check internet connection
2. Try clearing npm cache: `npm cache clean --force`
3. Use a mirror if in China: Change registry in `.npmrc`

### Issue: Build fails with TypeScript errors

**Check:**
1. All files are present (especially src/index.ts)
2. No file encoding issues (should be UTF-8)
3. Run: `pnpm lint` to check for syntax issues

### Issue: Plugin installed but tools not showing up

**Solutions:**
1. **Restart DeepSeek Harness completely**
2. Check if plugin is enabled in Settings → Plugins
3. Try clearing Harness cache (if available)
4. Restart the agent loop

---

## Quick Reference Commands

Copy and paste these into your terminal:

```bash
# Install pnpm globally
C:\Program Files\nodejs\npm.cmd install -g pnpm

# Navigate to plugin directory
cd /d C:\Users\allsy\Downloads\deepseek-web-research

# Install dependencies
pnpm install

# Build TypeScript code
pnpm build

# Install in Harness (via CLI)
C:\Users\allsy\AppData\Local\npm-cache\_npx\1e7f6d9597241db0\node_modules\.bin\dsh.cmd install ./examples/cordis.yml

# OR via Harness Web UI:
# 1. Open Harness in browser
# 2. Settings → Plugins → "Install Bundle"
# 3. Select examples\cordis.yml
```

---

## Expected Results

After successful installation, you should see:

**In plugin_manager output:**
- Application: `applied`
- Warnings: none or minor (can be ignored)

**In Harness Web UI:**
- Settings → Plugins shows "deepseek-web-research" as **enabled**

**When agent runs:**
- Tool calls work without errors
- Search results appear correctly
- Page fetching is secure (blocks localhost, etc.)

---

## Contact

If you encounter issues, check:
1. This document for troubleshooting steps
2. Plugin README.md in the plugin directory
3. DeepSeek Harness documentation

---

**Last Updated:** 2026-10
