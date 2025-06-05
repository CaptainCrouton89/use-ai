import { exec } from "child_process";
import path from "path";
import { promisify } from "util";
import { z } from "zod";
import {
  FileSystemService,
  defaultFileSystemService,
} from "../services/file-system.js";

const execAsync = promisify(exec);

export interface ClaudeCodeInput {
  prompt: string;
  projectRoot: string;
}

export class ClaudeCodeHandler {
  constructor(
    private fileSystemService: FileSystemService = defaultFileSystemService
  ) {}

  async execute(
    input: ClaudeCodeInput
  ): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      const { prompt, projectRoot } = input;

      // Create async-claude directory path
      const asyncClaudeDir = path.join(projectRoot, "async-claude");

      // Ensure async-claude directory exists
      await this.fileSystemService.ensureDirectoryExists(asyncClaudeDir);

      // Find next available ID by counting existing files
      const existingFiles = await this.fileSystemService.listDirectory(
        asyncClaudeDir
      );
      const claudeFiles = existingFiles.filter(
        (entry) => entry.includes("[FILE]") && entry.includes("claude-")
      );
      const nextId = claudeFiles.length;

      // Build the full output file path
      const outputFileName = `claude-${nextId}.json`;
      const fullOutputPath = path.join(asyncClaudeDir, outputFileName);

      // Validate the path
      const validatedPath =
        await this.fileSystemService.validateAndPrepareFilePath(fullOutputPath);

      // Escape the prompt for shell safety
      const escapedPrompt = prompt
        .replace(/"/g, '\\"')
        .replace(/@/g, "/" + projectRoot);

      // Build and execute the claude command asynchronously in background
      const command = `nohup claude -p "Project root directory: ${projectRoot}\n\n${escapedPrompt}" --output-format json > "${validatedPath}" 2>&1 &`;
      await execAsync(command);

      return {
        content: [
          {
            type: "text" as const,
            text: `Claude Code command started in background.\nOutput will be saved to: ${validatedPath}. This can take up to 5 minutes to complete.`,
          },
        ],
      };
    } catch (error) {
      const { projectRoot } = input;
      return {
        content: [
          {
            type: "text" as const,
            text: `Error running claude-code: ${error}. Failed to start command for output to ${projectRoot}/async-claude/`,
          },
        ],
      };
    }
  }
}

export const claudeCodeSchema = {
  prompt: z
    .string()
    .describe(
      "The prompt to send to Claude Code, including any relevant file paths and directories, written as @directory/file, where @ is the root directory of the project"
    ),
  projectRoot: z
    .string()
    .describe("Absolute path to the project root directory"),
};
