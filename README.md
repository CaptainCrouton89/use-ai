# MCP Server for Async Claude Code

An MCP (Model Context Protocol) server that enables asynchronous Claude Code execution. This server allows AI assistants like Claude, Cursor, or other MCP-compatible tools to run Claude Code commands in the background and save results for later retrieval.

## Purpose

This MCP server provides:

- **Async Claude Code Execution**: Run Claude Code commands in the background without blocking the AI assistant
- **File-based Results**: Automatically saves command outputs to JSON files in an `async-claude` directory
- **Project Context**: Supports project-relative file paths using `@` notation for better context awareness
- **Background Processing**: Commands run independently, allowing for long-running operations (up to 5 minutes)

## Features

- Background execution of Claude Code commands
- Automatic output file management with incremental naming
- Project root context for file path resolution
- JSON output format for structured results
- Error handling and validation
- TypeScript support with proper type definitions

## How It Works

The server exposes a single tool `claude-code-async` that:

1. Takes a prompt and project root directory as input
2. Creates an `async-claude` directory in the project root
3. Generates a unique output filename (`claude-0.json`, `claude-1.json`, etc.)
4. Executes the Claude Code command in the background
5. Returns immediately with the output file path
6. Saves the actual Claude Code response to the file when complete

## Getting Started

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Start the server
pnpm start
```

## Installation Scripts

Install the MCP server for different clients:

```bash
# For Claude Desktop
pnpm run install-desktop

# For Cursor
pnpm run install-cursor

# For Claude Code
pnpm run install-code

# Generic installation
pnpm run install-server
```

## Usage

Once installed, the AI assistant can use the `claude-code-async` tool:

**Parameters:**

- `prompt`: The prompt to send to Claude Code, including file paths using `@directory/file` notation
- `projectRoot`: Absolute path to the project root directory

**Example:**

```
Use the claude-code-async tool with:
- prompt: "Analyze the code structure in @src/handlers and suggest improvements"
- projectRoot: "/Users/username/my-project"
```

The tool will:

1. Start Claude Code in the background
2. Return the output file path immediately
3. Save results to `/Users/username/my-project/async-claude/claude-X.json`

## File Path Notation

Use `@` to reference files relative to the project root:

- `@src/index.ts` → `/project/root/src/index.ts`
- `@package.json` → `/project/root/package.json`
- `@docs/api.md` → `/project/root/docs/api.md`

## Output Format

Results are saved as JSON files in the `async-claude` directory with incremental naming:

- `claude-0.json` - First command
- `claude-1.json` - Second command
- `claude-2.json` - Third command
- etc.

## Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "use-ai": {
      "command": "node",
      "args": ["/path/to/your/dist/index.js"]
    }
  }
}
```

### Cursor

The installation script will automatically configure Cursor's MCP settings.

## Project Structure

```
├── src/
│   ├── handlers/
│   │   └── claude-code.ts    # Main Claude Code handler
│   ├── services/
│   │   └── file-system.ts    # File system operations
│   ├── utils/               # Utility functions
│   └── index.ts             # MCP server setup
├── scripts/                 # Installation scripts
├── async-claude/            # Generated output directory
├── dist/                    # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Development

1. Make changes to the source files
2. Run `pnpm run build` to compile
3. Test with `pnpm start`
4. Use installation scripts to update MCP client configurations

## Requirements

- Node.js (for running the MCP server)
- Claude Code CLI tool installed and accessible in PATH
- MCP-compatible AI assistant (Claude Desktop, Cursor, etc.)

## License

MIT

:)
:(
:(
