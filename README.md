# cxmcp - Codex MCP Control Panel

🔧 Interactive MCP server management tool for Codex CLI

English | [日本語](./README.ja.md)

## Features

- **📋 List MCP servers** - View all configured MCP servers
- **🔄 Toggle servers** - Enable/disable MCP servers with simple keystrokes
- **📊 Status monitoring** - Check if MCP servers are running
- **🎮 Interactive interface** - Navigate with arrow keys, toggle with space
- **📤 Export to mmcp** - Export Codex settings to mmcp for cross-CLI management
- **🚀 Fast and lightweight** - Built with TypeScript for speed

## Installation

### Option 1: Using npx (Recommended)

```bash
# Run directly without installation
npx cxmcp@latest

# Or run specific version
npx cxmcp@1.0.0
```

### Option 2: Global Installation

```bash
# Install globally from npm
npm install -g cxmcp

# Then run anywhere
cxmcp
```

### Option 3: Development Setup

```bash
# Clone the repository
git clone https://github.com/karaage0703/cxmcp.git
cd cxmcp
npm install
npm run build

# Run directly
npm start

# Or install globally from local build
npm install -g .
cxmcp
```

## Usage

### mmcp Integration

Export your Codex MCP servers to [mmcp](https://www.npmjs.com/package/mmcp) for cross-CLI management:

```bash
# 1. Install mmcp first (if not already installed)
npm install -g mmcp

# 2. Export Codex settings to mmcp format
cxmcp export-to-mmcp

# 3. Add target CLI agents (e.g., Claude Code)
mmcp agents add claude-code

# 4. Apply settings to target CLIs
mmcp apply
```

**What is mmcp?**
[mmcp](https://github.com/kou-pg-0131/mmcp) is a CLI tool that centrally manages MCP server configurations across multiple AI agents (Claude Code, Codex CLI, Cursor, Gemini CLI, etc.).

### Interactive Mode (Default)

Simply run `cxmcp` to start the interactive interface:

```bash
# Using npx
npx cxmcp@latest

# Or if installed globally
cxmcp

# Or from development setup
npm start
```

**Controls:**
- `↑/↓` - Navigate through servers
- `SPACE` - Toggle server (disable/enable)
- `Q` - Quit

### Non-Interactive Mode

Perfect for CI/scripts or non-TTY environments:

```bash
# Using npx
CI=true npx cxmcp@latest

# Or if installed globally
CI=true cxmcp

# Or from development setup
CI=true npm start
```

Shows list of all configured servers without interactive interface.

## How It Works

cxmcp manages your Codex MCP servers using a safe backup system:

- **Config Path**: `~/.codex.json` (main Codex configuration)
- **Backup Path**: `~/.cxmcp_backup.json` (disabled servers storage)
- **Server Management**: Moves servers between active and backup files
- **Status Monitoring**: Tests server commands to check availability

### Server States

- **Enabled**: Server exists in `~/.codex.json` and is active
- **Disabled**: Server is moved to `~/.cxmcp_backup.json` and hidden from Codex

This approach ensures:
- ✅ Codex correctly recognizes disabled servers as unavailable
- ✅ Server configurations are safely preserved for restoration
- ✅ No interference with Codex's configuration format

## Configuration Files

### Active servers (`~/.codex.json`)
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

### Disabled servers (`~/.cxmcp_backup.json`)
```json
{
  "disabledServers": {
    "markitdown": {
      "command": "uvx",
      "args": ["markitdown-mcp"]
    }
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Type check
npm run typecheck

# Build for distribution
npm run build
```

## Requirements

- Node.js 20.19.4 or later
- Codex CLI installed and configured
- macOS (current implementation assumes macOS paths)

## Architecture

- **TypeScript** - Type-safe development
- **Native Node.js** - No external dependencies for UI
- **Direct file manipulation** - Reads/writes Codex config directly
- **Process monitoring** - Tests server availability

## Related Projects

- [ccmcp](https://github.com/karaage0703/ccmcp) - Claude Code MCP Control Panel (sister project)
- [ccusage](https://github.com/ryoppippi/ccusage) - Claude Code usage analysis tool

## License

MIT License - Feel free to use and modify!
