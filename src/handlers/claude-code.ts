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
  relativeOutputPath?: string;
}

export class ClaudeCodeHandler {
  constructor(
    private fileSystemService: FileSystemService = defaultFileSystemService
  ) {}

  async execute(
    input: ClaudeCodeInput
  ): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      const {
        prompt,
        projectRoot,
        relativeOutputPath = "claude_output.txt",
      } = input;

      // Build the full output file path
      const fullOutputPath = path.join(projectRoot, relativeOutputPath);

      // Validate path and create directories if needed
      const validatedPath =
        await this.fileSystemService.validateAndPrepareFilePath(fullOutputPath);

      // // Write initial "working" message to output file
      // await this.fileSystemService.writeFile(validatedPath, "working... check back later");

      // Escape the prompt for shell safety
      const escapedPrompt = prompt.replace(/"/g, '\\"');

      // Build and execute the claude command asynchronously in background
      const command = `nohup claude -p "${escapedPrompt}" > "${validatedPath}" 2>&1 &`;
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
      const { projectRoot, relativeOutputPath } = input;
      const fullOutputPath = path.join(
        projectRoot,
        relativeOutputPath || "claude_output.txt"
      );
      return {
        content: [
          {
            type: "text" as const,
            text: `Error running claude-code: ${error}. Failed to start command for output to ${fullOutputPath}`,
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
      "The prompt to send to Claude Code, including any relevant file paths"
    ),
  projectRoot: z
    .string()
    .describe(
      "Absolute path to the project root directory where output should be saved"
    ),
  relativeOutputPath: z
    .string()
    .optional()
    .describe(
      "Relative path from project root for the output file (defaults to 'claude_output.txt')"
    ),
};
