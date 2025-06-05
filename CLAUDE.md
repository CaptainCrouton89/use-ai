# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `pnpm build` - Compile TypeScript to JavaScript in `dist/` directory
- `pnpm start` - Run the compiled MCP server
- `pnpm install-desktop` - Build and install to Claude Desktop config
- `pnpm install-cursor` - Build and install to Cursor config
- `pnpm install-code` - Build and install to Claude Code config
- `pnpm install-server` - Install to all platforms

## Architecture Overview

This is an MCP (Model Context Protocol) server that provides a `claude-code-async` tool for asynchronous execution of Claude Code commands in the background.

### Core Components

- **MCP Server** (`src/index.ts`): Main server entry point using `@modelcontextprotocol/sdk`
- **ClaudeCodeHandler** (`src/handlers/claude-code.ts`): Core handler for async Claude Code execution
- **FileSystemService** (`src/services/file-system.ts`): Secure file system operations with path validation
- **PathValidator** (`src/utils/path-validator.ts`): Security layer restricting file access to home directory and current working directory

### How It Works

The server provides a `claude-code-async` tool that:

1. **Executes Claude Code commands in the background** using `nohup`
2. **Saves results to `async-claude/claude-{id}.json`** in your project root
3. **Returns immediately** with the output file path
4. **Handles file references** using `@` notation (e.g., `@src/index.ts`)
5. **Commands can run up to 5 minutes** and continue even if the MCP server stops

### Security Model

File system access is restricted to:
- User's home directory (`~/`)
- Current working directory
- Specified project root

All paths are validated through `PathValidator` before file system operations.

### Tool Interface

The `claude-code-async` tool accepts:
- `prompt`: The command to send to Claude Code (required). Use `@` notation to reference files and directories relative to the project root
- `projectRoot`: Absolute path to your project directory (required)

Output is saved to `{projectRoot}/async-claude/claude-{id}.json` with auto-incrementing IDs.