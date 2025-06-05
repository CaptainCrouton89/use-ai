# Async Claude MCP

An MCP server that provides asynchronous execution of Claude Code commands. Run long-running coding tasks in the background without blocking your current conversation.

## Installation

### Prerequisites

- Node.js and pnpm installed
- Claude CLI available in your system PATH

### Setup

1. Clone this repository
2. Install dependencies: `pnpm install`
3. Build the project: `pnpm build`
4. Install the MCP server:
   - **Claude Code**: `pnpm install-code`
   - **Claude Desktop**: `pnpm install-desktop`
   - **Cursor**: `pnpm install-cursor`
   - **All platforms**: `pnpm install-server`

## How It Works

The server provides a `claude-code-async` tool that:

1. **Executes Claude Code commands in the background** using `nohup`
2. **Saves results to `async-claude/claude-{id}.json`** in your project root
3. **Returns immediately** with the output file path
4. **Handles file references** using `@` notation (e.g., `@src/index.ts`)

Commands can take up to 5 minutes to complete and continue running even if the MCP server stops.

## Usage Examples

### Basic Code Refactoring

```json
{
  "tool": "claude-code-async",
  "arguments": {
    "prompt": "Refactor @src/index.ts to use async/await instead of promises",
    "projectRoot": "/Users/username/my-project"
  }
}
```

### Multi-file Analysis

```json
{
  "tool": "claude-code-async",
  "arguments": {
    "prompt": "Add TypeScript types to all files in @src/ directory and fix any type errors",
    "projectRoot": "/Users/username/my-project"
  }
}
```

### Documentation Generation

```json
{
  "tool": "claude-code-async",
  "arguments": {
    "prompt": "Generate comprehensive JSDoc comments for @src/api/ and create API documentation",
    "projectRoot": "/Users/username/my-project"
  }
}
```

### Test Creation

```json
{
  "tool": "claude-code-async",
  "arguments": {
    "prompt": "Create unit tests for @src/utils/helpers.ts using Jest",
    "projectRoot": "/Users/username/my-project"
  }
}
```

## Tool Parameters

- **`prompt`** (required): The command to send to Claude Code. Use `@` notation to reference files and directories relative to the project root.
- **`projectRoot`** (required): Absolute path to your project directory.

## Output

The tool returns immediately with a message like:

```
Claude Code command started in background.
Output will be saved to: /Users/username/my-project/async-claude/claude-0.json.
This can take up to 5 minutes to complete.
```

Results are saved as JSON files with auto-incrementing IDs (claude-0.json, claude-1.json, etc.).

## Security

File system access is restricted to:

- Your home directory (`~/`)
- Current working directory
- Specified project root

All paths are validated before execution to prevent unauthorized access.

## Use Cases

- **Long-running refactoring tasks** that would otherwise block your conversation
- **Batch processing** of multiple files or directories
- **Complex code generation** that requires analyzing many files
- **Background analysis** while you continue working on other tasks
