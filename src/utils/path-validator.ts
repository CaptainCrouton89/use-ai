import fs from "fs/promises";
import os from "os";
import path from "path";

export class PathValidator {
  private readonly allowedDirectories: string[];

  constructor(allowedDirectories: string[] = [os.homedir(), process.cwd()]) {
    this.allowedDirectories = allowedDirectories;
  }

  expandHome(filepath: string): string {
    if (filepath.startsWith("~/") || filepath === "~") {
      return path.join(os.homedir(), filepath.slice(1));
    }
    return filepath;
  }

  private normalizePath(p: string): string {
    return path.normalize(this.expandHome(p)).toLowerCase();
  }

  async isPathAllowed(pathToCheck: string): Promise<boolean> {
    let normalizedPathToCheck = this.normalizePath(pathToCheck);
    if (normalizedPathToCheck.slice(-1) === path.sep) {
      normalizedPathToCheck = normalizedPathToCheck.slice(0, -1);
    }

    return this.allowedDirectories.some((allowedDir) => {
      let normalizedAllowedDir = this.normalizePath(allowedDir);
      if (normalizedAllowedDir.slice(-1) === path.sep) {
        normalizedAllowedDir = normalizedAllowedDir.slice(0, -1);
      }

      if (normalizedPathToCheck === normalizedAllowedDir) {
        return true;
      }

      return normalizedPathToCheck.startsWith(normalizedAllowedDir + path.sep);
    });
  }

  async validatePath(requestedPath: string): Promise<string> {
    const expandedPath = this.expandHome(requestedPath);
    
    const absolute = path.isAbsolute(expandedPath)
      ? path.resolve(expandedPath)
      : path.resolve(process.cwd(), expandedPath);

    if (!(await this.isPathAllowed(absolute))) {
      throw new Error(
        `Path not allowed: ${requestedPath}. Must be within home directory or current working directory.`
      );
    }

    try {
      await fs.stat(absolute);
      return await fs.realpath(absolute);
    } catch (error) {
      return absolute;
    }
  }
}

export const defaultPathValidator = new PathValidator();