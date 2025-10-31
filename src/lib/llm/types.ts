/**
 * LLM Service Types
 *
 * Type definitions for Large Language Model integration layer
 */

/**
 * LLM provider types
 */
export type LLMProvider = "webllm" | "cloud" | "offline";

/**
 * Available WebLLM models
 */
export type ModelName =
  | "Llama-3.2-3B-Instruct-q4f16_1-MLC"
  | "Llama-3.2-1B-Instruct-q4f16_1-MLC"
  | "gemma-2-2b-it-q4f16_1-MLC"
  | "Phi-3.5-mini-instruct-q4f16_1-MLC";

/**
 * Model loading status
 */
export type ModelStatus =
  | "idle"
  | "downloading"
  | "loading"
  | "ready"
  | "error"
  | "unavailable";

/**
 * Model configuration
 */
export interface ModelConfig {
  name: ModelName;
  displayName: string;
  size: string; // e.g., "1.8GB"
  description: string;
  contextWindow: number;
  recommended: boolean;
}

/**
 * LLM response
 */
export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model?: string;
  confidence?: number;
  metadata?: {
    tokens?: number;
    duration?: number;
    temperature?: number;
  };
}

/**
 * Model loading progress
 */
export interface ModelProgress {
  progress: number; // 0-100
  text: string;
  timeElapsed?: number;
}

/**
 * LLM generation options
 */
export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
}

/**
 * Available model configurations
 */
export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    name: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    displayName: "Llama 3.2 1B (Fast)",
    size: "0.9GB",
    description: "Fastest, lightweight model for quick responses",
    contextWindow: 4096,
    recommended: true,
  },
  {
    name: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    displayName: "Llama 3.2 3B (Balanced)",
    size: "1.8GB",
    description: "Balanced performance and quality",
    contextWindow: 8192,
    recommended: false,
  },
  {
    name: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    displayName: "Phi 3.5 Mini (Efficient)",
    size: "2.1GB",
    description: "Microsoft Phi model, excellent reasoning",
    contextWindow: 4096,
    recommended: false,
  },
  {
    name: "gemma-2-2b-it-q4f16_1-MLC",
    displayName: "Gemma 2 2B (Quality)",
    size: "1.4GB",
    description: "Google Gemma model, high quality responses",
    contextWindow: 8192,
    recommended: false,
  },
];
