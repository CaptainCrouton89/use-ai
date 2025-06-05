import fs from "fs/promises";
import path from "path";
import { PathValidator, defaultPathValidator } from "../utils/path-validator.js";

export class FileSystemService {
  constructor(private pathValidator: PathValidator = defaultPathValidator) {}

  async listDirectory(dirPath: string): Promise<string[]> {
    const validPath = await this.pathValidator.validatePath(dirPath);
    const entries = await fs.readdir(validPath, { withFileTypes: true });
    return entries.map(
      (entry) => `${entry.isDirectory() ? "[DIR]" : "[FILE]"} ${entry.name}`
    );
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

}

export const defaultFileSystemService = new FileSystemService();