import { tool } from "ai";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { z } from "zod";

// Path validation functions (copied from index.ts)
function expandHome(filepath: string): string {
  if (filepath.startsWith("~/") || filepath === "~") {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
}

function normalizePath(p: string): string {
  return path.normalize(expandHome(p)).toLowerCase();
}

async function isPathAllowed(pathToCheck: string): Promise<boolean> {
  // For this simple implementation, allow access to user's home directory and current working directory
  const allowedDirectories = [os.homedir(), process.cwd()];

  let normalizedPathToCheck = normalizePath(pathToCheck);
  if (normalizedPathToCheck.slice(-1) === path.sep) {
    normalizedPathToCheck = normalizedPathToCheck.slice(0, -1);
  }

  return allowedDirectories.some((allowedDir) => {
    let normalizedAllowedDir = normalizePath(allowedDir);
    if (normalizedAllowedDir.slice(-1) === path.sep) {
      normalizedAllowedDir = normalizedAllowedDir.slice(0, -1);
    }

    // Check if path is exactly the allowed directory
    if (normalizedPathToCheck === normalizedAllowedDir) {
      return true;
    }

    // Check if path is a subdirectory of the allowed directory
    return normalizedPathToCheck.startsWith(normalizedAllowedDir + path.sep);
  });
}

async function validatePath(requestedPath: string): Promise<string> {
  // Expand home directory if present
  const expandedPath = expandHome(requestedPath);

  // Convert to absolute path
  const absolute = path.isAbsolute(expandedPath)
    ? path.resolve(expandedPath)
    : path.resolve(process.cwd(), expandedPath);

  // Check if path is allowed
  if (!(await isPathAllowed(absolute))) {
    throw new Error(
      `Path not allowed: ${requestedPath}. Must be within home directory or current working directory.`
    );
  }

  // Check if path exists
  try {
    await fs.stat(absolute);
    return await fs.realpath(absolute);
  } catch (error) {
    // Return the absolute path even if it doesn't exist (for error handling)
    return absolute;
  }
}

async function listDirectory(dirPath: string): Promise<string[]> {
  const validPath = await validatePath(dirPath);
  const entries = await fs.readdir(validPath, { withFileTypes: true });
  return entries.map(
    (entry) => `${entry.isDirectory() ? "[DIR]" : "[FILE]"} ${entry.name}`
  );
}

async function readFileContent(filePath: string): Promise<string> {
  try {
    const validPath = await validatePath(filePath);
    const content = await fs.readFile(validPath, "utf-8");
    return content;
  } catch (error) {
    throw new Error(`Error reading ${filePath}: ${error}`);
  }
}

// Tool for listing directory contents
export const listDirectoryTool = tool({
  description: "List the contents of a directory",
  parameters: z.object({
    directoryPath: z.string().describe("The path to the directory to list"),
  }),
  execute: async ({ directoryPath }) => {
    try {
      const entries = await listDirectory(directoryPath);
      return {
        success: true,
        directoryPath,
        contents: entries,
        message: `Successfully listed ${entries.length} items in ${directoryPath}`,
      };
    } catch (error) {
      return {
        success: false,
        directoryPath,
        error: `Error listing directory ${directoryPath}: ${error}`,
      };
    }
  },
});

// Tool for reading file contents
export const readFileTool = tool({
  description: "Read the contents of a file",
  parameters: z.object({
    filePath: z.string().describe("The path to the file to read"),
  }),
  execute: async ({ filePath }) => {
    try {
      const content = await readFileContent(filePath);
      return {
        success: true,
        filePath,
        content,
        message: `Successfully read file ${filePath} (${content.length} characters)`,
      };
    } catch (error) {
      return {
        success: false,
        filePath,
        error: `Error reading file ${filePath}: ${error}`,
      };
    }
  },
});

// Combined tools object for easy import
export const fileSystemTools = {
  listDirectory: listDirectoryTool,
  readFile: readFileTool,
};
