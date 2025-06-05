# Async Claude MCP

## Installation

I haven't set this up with smithery, but local install is super easy.

1. Download
2. `npm i`
3. `npm run install-server` (this will install on all available platforms) or `npm run install-code` to just install in claude code. Other options include `install-desktop` for claude desktop and `install-cursor` for cursor.

## How It Works

Requests accept a project root and a prompt. Both get passed to headless Claude, which then makes changes to the files, like normal. It runs in background, and saves output to `async-claude/claude-[id]` at project root.
