import { generateText } from "ai";
import { z } from "zod";
import { ModelProvider, ModelType } from "../config/models.js";
import { FileSystemService, defaultFileSystemService } from "../services/file-system.js";
import { fileSystemTools } from "../tools.js";

export interface ParallelTasksInput {
  prompts: string[];
  model: ModelType;
  "relevant-files"?: string[];
  "relevant-directories"?: string[];
}

export interface TaskResponse {
  promptIndex: number;
  prompt: string;
  response: string;
  success: boolean;
}

export class ParallelTasksHandler {
  constructor(
    private fileSystemService: FileSystemService = defaultFileSystemService
  ) {}

  async execute(input: ParallelTasksInput): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      const { prompts, model, "relevant-files": relevantFiles, "relevant-directories": relevantDirectories } = input;

      const contextContent = await this.buildContextContent(relevantFiles, relevantDirectories);
      const responses = await this.generateResponses(prompts, model, contextContent);
      const formattedResponse = this.formatResponses(responses);

      return {
        content: [
          {
            type: "text" as const,
            text: formattedResponse,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error generating AI response: ${error}`,
          },
        ],
      };
    }
  }

  private async buildContextContent(
    relevantFiles?: string[],
    relevantDirectories?: string[]
  ): Promise<string> {
    let contextContent = "";

    if (relevantFiles && relevantFiles.length > 0) {
      const fileContents = await Promise.all(
        relevantFiles.map(async (filePath) => {
          try {
            return await this.fileSystemService.getPathContent(filePath);
          } catch (error) {
            return `\n--- Error reading ${filePath}: ${error} ---\n`;
          }
        })
      );
      contextContent = `\nFile Context:\n${fileContents.join("\n")}\n`;
    }

    if (relevantDirectories && relevantDirectories.length > 0) {
      contextContent += `\nDirectory Context:\n${relevantDirectories.join("\n")}\n`;
    }

    return contextContent;
  }

  private async generateResponses(
    prompts: string[],
    model: ModelType,
    contextContent: string
  ): Promise<TaskResponse[]> {
    return await Promise.all(
      prompts.map(async (prompt, index) => {
        try {
          const { text } = await generateText({
            model: ModelProvider.getModel(model),
            system: ModelProvider.getSystemPrompt(model),
            prompt: `${contextContent}${prompt}`,
            tools: fileSystemTools,
            maxSteps: 10,
            maxTokens: 10000,
          });
          return {
            promptIndex: index,
            prompt: prompt,
            response: text,
            success: true,
          };
        } catch (error) {
          return {
            promptIndex: index,
            prompt: prompt,
            response: `Error generating response: ${error}`,
            success: false,
          };
        }
      })
    );
  }

  private formatResponses(responses: TaskResponse[]): string {
    return responses
      .map((resp) => {
        const status = resp.success ? "✓" : "✗";
        return `${status} Prompt ${resp.promptIndex + 1}: ${
          resp.prompt
        }\n\nResponse:\n${resp.response}\n${"=".repeat(80)}`;
      })
      .join("\n\n");
  }
}

export const parallelTasksSchema = {
  prompts: z
    .array(z.string())
    .describe("The prompts to send to the AI model"),
  model: z
    .enum([
      "ultra-light",
      "light",
      "medium",
      "heavy",
      "reasoning:medium",
      "reasoning:heavy",
      "code:medium",
      "code:heavy",
    ])
    .describe("AI mode to use"),
  "relevant-files": z
    .array(z.string())
    .optional()
    .describe(
      "List of file paths to read and include as context. Use the exact file path, starting at ~/"
    ),
  "relevant-directories": z
    .array(z.string())
    .optional()
    .describe(
      "List of directory paths to read and include as context. Use the exact directory path, starting at ~/"
    ),
};