import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ClaudeCodeHandler, claudeCodeSchema } from "./handlers/claude-code.js";

const server = new McpServer({
  name: "ai-response-mcp",
  version: "1.0.0",
});

const claudeCodeHandler = new ClaudeCodeHandler();

server.tool(
  "claude-code-async",
  "Run Claude Code commands in background",
  claudeCodeSchema,
  async (input) => claudeCodeHandler.execute(input)
);

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("AI Response MCP Server running...");
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main().catch(console.error);
