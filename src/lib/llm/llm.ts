/**
 * LLM Service
 *
 * Core integration layer for Large Language Models (WebLLM + Cloud fallback)
 */

import type {
  LLMProvider,
  LLMResponse,
  ModelName,
  ModelStatus,
  ModelProgress,
  GenerationOptions,
} from "./types";
import { buildPrompt, buildCrisisPrompt } from "./prompts";
import type { Message, RiskLevel } from "../store/types";

// Dynamic import to avoid SSR issues with WebLLM
let CreateMLCEngine: any = null;
let mlcEngine: any = null;

/**
 * Initialize WebLLM engine
 */
export async function initializeWebLLM(): Promise<boolean> {
  try {
    // Check if already initialized
    if (mlcEngine) {
      return true;
    }

    // Dynamic import (only in browser)
    if (typeof window === "undefined") {
      console.warn("WebLLM can only run in browser environment");
      return false;
    }

    // Import CreateMLCEngine
    const webllm = await import("@mlc-ai/web-llm");
    CreateMLCEngine = webllm.CreateMLCEngine;

    console.log("WebLLM module loaded successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize WebLLM:", error);
    return false;
  }
}

/**
 * Load a specific model
 */
export async function loadModel(
  modelName: ModelName,
  onProgress?: (progress: ModelProgress) => void
): Promise<boolean> {
  try {
    // Ensure WebLLM is initialized
    const initialized = await initializeWebLLM();
    if (!initialized || !CreateMLCEngine) {
      throw new Error("WebLLM not initialized");
    }

    // Create engine with progress callback
    const startTime = Date.now();
    mlcEngine = await CreateMLCEngine(modelName, {
      initProgressCallback: (report: any) => {
        const progress = Math.round(report.progress * 100);
        const elapsed = Math.round((Date.now() - startTime) / 1000);

        onProgress?.({
          progress,
          text: report.text || `Loading model: ${progress}%`,
          timeElapsed: elapsed,
        });
      },
    });

    console.log(`Model ${modelName} loaded successfully`);
    return true;
  } catch (error) {
    console.error("Failed to load model:", error);
    mlcEngine = null;
    return false;
  }
}

/**
 * Unload current model
 */
export async function unloadModel(): Promise<void> {
  if (mlcEngine) {
    try {
      await mlcEngine.unload();
      mlcEngine = null;
      console.log("Model unloaded successfully");
    } catch (error) {
      console.error("Failed to unload model:", error);
    }
  }
}

/**
 * Check if model is ready
 */
export function isModelReady(): boolean {
  return mlcEngine !== null;
}

/**
 * Generate response using WebLLM
 */
export async function generateWebLLMResponse(
  userMessage: string,
  conversationHistory: Message[],
  currentRiskLevel: RiskLevel,
  options: GenerationOptions = {}
): Promise<LLMResponse> {
  try {
    if (!mlcEngine) {
      throw new Error("Model not loaded");
    }

    // Build prompt
    const isCrisis = currentRiskLevel === "critical";
    const prompt = isCrisis
      ? buildCrisisPrompt(userMessage)
      : buildPrompt(userMessage, conversationHistory, currentRiskLevel);

    // Generate response
    const startTime = Date.now();
    const response = await mlcEngine.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 512,
      top_p: options.topP ?? 0.95,
    });

    const content = response.choices[0]?.message?.content || "";
    const duration = Date.now() - startTime;

    return {
      content,
      provider: "webllm",
      confidence: 0.85,
      metadata: {
        duration,
        temperature: options.temperature ?? 0.7,
        tokens: response.usage?.total_tokens,
      },
    };
  } catch (error) {
    console.error("WebLLM generation failed:", error);
    throw error;
  }
}

/**
 * Generate streaming response (for future implementation)
 */
export async function* generateStreamingResponse(
  userMessage: string,
  conversationHistory: Message[],
  currentRiskLevel: RiskLevel,
  options: GenerationOptions = {}
): AsyncGenerator<string, void, unknown> {
  try {
    if (!mlcEngine) {
      throw new Error("Model not loaded");
    }

    // Build prompt
    const prompt = buildPrompt(
      userMessage,
      conversationHistory,
      currentRiskLevel
    );

    // Stream response
    const stream = await mlcEngine.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 512,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  } catch (error) {
    console.error("Streaming generation failed:", error);
    throw error;
  }
}

/**
 * Cloud API fallback (placeholder for future implementation)
 */
export async function generateCloudResponse(
  userMessage: string,
  conversationHistory: Message[],
  currentRiskLevel: RiskLevel,
  options: GenerationOptions = {}
): Promise<LLMResponse> {
  // TODO: Implement cloud API integration (OpenAI, Anthropic, etc.)
  throw new Error("Cloud API not yet implemented");
}

/**
 * Main generation function with automatic fallback
 */
export async function generateResponse(
  userMessage: string,
  conversationHistory: Message[],
  currentRiskLevel: RiskLevel,
  preferredProvider: LLMProvider = "webllm",
  options: GenerationOptions = {}
): Promise<LLMResponse> {
  // Try preferred provider first
  if (preferredProvider === "webllm" && isModelReady()) {
    try {
      return await generateWebLLMResponse(
        userMessage,
        conversationHistory,
        currentRiskLevel,
        options
      );
    } catch (error) {
      console.warn("WebLLM failed, will use offline fallback");
    }
  }

  // Try cloud as secondary option
  if (preferredProvider === "cloud") {
    try {
      return await generateCloudResponse(
        userMessage,
        conversationHistory,
        currentRiskLevel,
        options
      );
    } catch (error) {
      console.warn("Cloud API failed, will use offline fallback");
    }
  }

  // All LLM options failed, signal to use offline reasoning
  throw new Error("LLM_UNAVAILABLE");
}
