# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `pnpm build` - Compile TypeScript to JavaScript in `dist/` directory
- `pnpm start` - Run the compiled MCP server
- `pnpm install-desktop` - Build and install to Claude Desktop config
- `pnpm install-cursor` - Build and install to Cursor config
- `pnpm install-code` - Build and install to Claude Code config

## Architecture Overview

This is an MCP (Model Context Protocol) server that provides a `run-parallel-tasks` tool for generating AI responses in parallel with file context support.

### Core Components

- **MCP Server** (`src/index.ts`): Main server entry point using `@modelcontextprotocol/sdk`
- **ParallelTasksHandler** (`src/handlers/parallel-tasks.ts`): Core business logic for parallel AI task execution
- **ModelProvider** (`src/config/models.ts`): Model configuration and abstraction layer supporting OpenAI and Anthropic
- **FileSystemService** (`src/services/file-system.ts`): Secure file system operations with path validation
- **PathValidator** (`src/utils/path-validator.ts`): Security layer restricting file access to home directory and current working directory

### Model Types

The server supports multiple model tiers:
- `ultra-light`, `light`, `medium`, `heavy` - General purpose models
- `reasoning:medium`, `reasoning:heavy` - Reasoning-focused models  
- `code:medium`, `code:heavy` - Code-focused models with specialized system prompts

### Security Model

File system access is restricted to:
- User's home directory (`~/`)
- Current working directory

All paths are validated through `PathValidator` before file system operations.

### Tool Interface

The `run-parallel-tasks` tool accepts:
- `prompts`: Array of prompts to execute in parallel
- `model`: Model type from supported enum
- `relevant-files`: Optional array of file paths for context
- `relevant-directories`: Optional array of directory paths for context

Responses are formatted with status indicators and separators for readability.