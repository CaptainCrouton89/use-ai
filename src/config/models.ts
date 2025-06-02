import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

export type ModelType = 
  | "ultra-light"
  | "light"
  | "medium"
  | "heavy"
  | "reasoning:medium"
  | "reasoning:heavy"
  | "code:medium"
  | "code:heavy";

export interface ModelConfig {
  provider: "openai" | "anthropic";
  modelId: string;
  systemPrompt?: string;
}

export class ModelProvider {
  private static readonly modelConfigs: Record<ModelType, ModelConfig> = {
    "heavy": { provider: "openai", modelId: "o4-mini-high" },
    "reasoning:medium": { provider: "openai", modelId: "o4-mini-high" },
    "reasoning:heavy": { provider: "openai", modelId: "o3-mini" },
    "code:medium": { 
      provider: "anthropic", 
      modelId: "claude-4-sonnet-20250514",
      systemPrompt: "You are a code assistant. Output strictly code with no explanations, comments, or other text unless specifically requested."
    },
    "code:heavy": { 
      provider: "anthropic", 
      modelId: "claude-4-opus-20250219",
      systemPrompt: "You are a code assistant. Output strictly code with no explanations, comments, or other text unless specifically requested."
    },
    "medium": { provider: "openai", modelId: "gpt-4.1" },
    "light": { provider: "openai", modelId: "gpt-4.1-mini" },
    "ultra-light": { provider: "openai", modelId: "gpt-4.1-nano" },
  };

  static getModel(modelType: ModelType) {
    const config = this.modelConfigs[modelType];
    if (!config) {
      return openai("gpt-4.1-nano");
    }

    switch (config.provider) {
      case "anthropic":
        return anthropic(config.modelId);
      case "openai":
        return openai(config.modelId);
      default:
        return openai("gpt-4.1-nano");
    }
  }

  static getSystemPrompt(modelType: ModelType): string {
    const config = this.modelConfigs[modelType];
    return config?.systemPrompt || "";
  }

  static isCodeModel(modelType: ModelType): boolean {
    return modelType.includes("code");
  }
}