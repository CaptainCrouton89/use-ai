import fs from "fs/promises";
import path from "path";
import { PathValidator, defaultPathValidator } from "../utils/path-validator.js";

export class FileSystemService {
  constructor(private pathValidator: PathValidator = defaultPathValidator) {}

  async readFileContent(filePath: string): Promise<string> {
    try {
      const validPath = await this.pathValidator.validatePath(filePath);
      const content = await fs.readFile(validPath, "utf-8");
      return content;
    } catch (error) {
      throw new Error(`Error reading ${filePath}: ${error}`);
    }
  }

  async listDirectory(dirPath: string): Promise<string[]> {
    const validPath = await this.pathValidator.validatePath(dirPath);
    const entries = await fs.readdir(validPath, { withFileTypes: true });
    return entries.map(
      (entry) => `${entry.isDirectory() ? "[DIR]" : "[FILE]"} ${entry.name}`
    );
  }

  async writeFileContent(filePath: string, content: string): Promise<void> {
    try {
      const validPath = await this.pathValidator.validatePath(filePath);
      await fs.writeFile(validPath, content, "utf-8");
    } catch (error) {
      throw new Error(`Error writing ${filePath}: ${error}`);
    }
  }

  async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      const validPath = await this.pathValidator.validatePath(dirPath);
      await fs.mkdir(validPath, { recursive: true });
    } catch (error) {
      throw new Error(`Error creating directory ${dirPath}: ${error}`);
    }
  }

  async validateAndPrepareFilePath(filePath: string): Promise<string> {
    try {
      // Validate the full file path first
      const validPath = await this.pathValidator.validatePath(filePath);
      
      // Extract directory from file path and ensure it exists
      const dirPath = path.dirname(validPath);
      await this.ensureDirectoryExists(dirPath);
      
      return validPath;
    } catch (error) {
      throw new Error(`Error preparing file path ${filePath}: ${error}`);
    }
  }

  async getPathContent(pathStr: string): Promise<string> {
    try {
      const validPath = await this.pathValidator.validatePath(pathStr);
      const stat = await fs.stat(validPath);

      if (stat.isDirectory()) {
        const entries = await this.listDirectory(pathStr);
        return `\n--- Directory: ${pathStr} ---\n${entries.join(
          "\n"
        )}\n--- End of ${pathStr} ---\n`;
      } else {
        const content = await this.readFileContent(pathStr);
        return `\n--- File: ${pathStr} ---\n${content}\n--- End of ${pathStr} ---\n`;
      }
    } catch (error) {
      return `\n--- Error reading ${pathStr}: ${error} ---\n`;
    }
  }
}

export const defaultFileSystemService = new FileSystemService();