/**
 * LLM Router
 *
 * Intelligent routing between Ollama (local) and WebLLM (browser) based on:
 * - Task type (general, arabic, safety, coding)
 * - Model availability
 * - Performance requirements
 * - Network status
 */

import type { Message, RiskLevel, Language } from "../store/types";
import type { LLMResponse } from "./types";
import {
  ollamaQuery,
  checkOllamaHealth,
  OLLAMA_MODELS,
  type OllamaModel,
} from "./ollamaClient";
import { generateResponse as generateWebLLMResponse } from "./llm";
import { buildPrompt, buildCrisisPrompt } from "./prompts";

/**
 * Task types for model selection
 */
export type TaskType = "general" | "arabic" | "safety" | "crisis" | "assessment";

/**
 * Model selection strategy
 */
export interface ModelStrategy {
  preferLocal: boolean; // Prefer Ollama over WebLLM
  allowFallback: boolean; // Allow fallback if primary fails
  timeout: number; // Timeout in ms
}

/**
 * Router state
 */
let ollamaAvailable = false;
let ollamaModels: string[] = [];
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 60000; // 1 minute

/**
 * Initialize router and check Ollama availability
 */
export async function initializeRouter(): Promise<void> {
  const health = await checkOllamaHealth();
  ollamaAvailable = health.available;
  ollamaModels = health.models;
  lastHealthCheck = Date.now();

  if (ollamaAvailable) {
    console.log("✅ Ollama available with models:", ollamaModels);
  } else {
    console.log("⚠️ Ollama not available, will use WebLLM fallback");
  }
}

/**
 * Refresh Ollama health status if needed
 */
async function refreshHealthCheck(): Promise<void> {
  if (Date.now() - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return;
  }

  const health = await checkOllamaHealth();
  ollamaAvailable = health.available;
  ollamaModels = health.models;
  lastHealthCheck = Date.now();
}

/**
 * Select appropriate Ollama model for task
 */
function selectOllamaModel(
  taskType: TaskType,
  language: Language
): OllamaModel | null {
  // Arabic language → use Qwen
  if (language === "ar") {
    const arabicModel = OLLAMA_MODELS.find((m) => m.task === "arabic");
    if (arabicModel && ollamaModels.includes(arabicModel.name)) {
      return arabicModel;
    }
  }

  // Safety validation → use Phi-3
  if (taskType === "safety") {
    const safetyModel = OLLAMA_MODELS.find((m) => m.task === "safety");
    if (safetyModel && ollamaModels.includes(safetyModel.name)) {
      return safetyModel;
    }
  }

  // General clinical reasoning → use Llama
  const generalModel = OLLAMA_MODELS.find((m) => m.task === "general");
  if (generalModel && ollamaModels.includes(generalModel.name)) {
    return generalModel;
  }

  return null;
}

/**
 * Route inference request to appropriate model
 */
export async function routeInference(
  userMessage: string,
  conversationHistory: Message[],
  riskLevel: RiskLevel,
  language: Language,
  taskType: TaskType = "general",
  strategy: ModelStrategy = {
    preferLocal: true,
    allowFallback: true,
    timeout: 30000,
  }
): Promise<LLMResponse> {
  // Refresh health check if needed
  await refreshHealthCheck();

  // Build prompt
  const prompt =
    riskLevel === "critical"
      ? buildCrisisPrompt(userMessage)
      : buildPrompt(userMessage, conversationHistory, riskLevel);

  // Try Ollama first (if available and preferred)
  if (strategy.preferLocal && ollamaAvailable) {
    const selectedModel = selectOllamaModel(taskType, language);

    if (selectedModel) {
      try {
        console.log(`🚀 Using Ollama model: ${selectedModel.displayName}`);

        const startTime = Date.now();
        const response = await ollamaQuery(
          selectedModel.name,
          prompt,
          {
            temperature: 0.7,
            maxTokens: 1000,
            timeout: strategy.timeout,
          }
        );
        const duration = Date.now() - startTime;

        return {
          content: response,
          provider: "webllm", // Keep consistent interface
          model: selectedModel.name,
          confidence: 0.85,
          metadata: {
            duration,
            temperature: 0.7,
          },
        };
      } catch (error) {
        console.warn("Ollama inference failed:", error);

        // If no fallback allowed, throw
        if (!strategy.allowFallback) {
          throw error;
        }

        console.log("⚠️ Falling back to WebLLM...");
      }
    }
  }

  // Fallback to WebLLM (browser-based)
  try {
    console.log("🌐 Using WebLLM for inference");
    return await generateWebLLMResponse(
      userMessage,
      conversationHistory,
      riskLevel,
      "webllm"
    );
  } catch (error) {
    throw new Error(
      `All inference methods failed. Ollama: ${!ollamaAvailable}, WebLLM: failed`
    );
  }
}

/**
 * Check if Ollama is currently available
 */
export async function isOllamaAvailable(): Promise<boolean> {
  await refreshHealthCheck();
  return ollamaAvailable;
}

/**
 * Get available Ollama models
 */
export function getAvailableOllamaModels(): string[] {
  return ollamaModels;
}

/**
 * Get recommended models that should be downloaded
 */
export function getRecommendedModels(): OllamaModel[] {
  return OLLAMA_MODELS;
}

/**
 * Check which recommended models are missing
 */
export async function getMissingModels(): Promise<OllamaModel[]> {
  await refreshHealthCheck();

  return OLLAMA_MODELS.filter(
    (model) => !ollamaModels.includes(model.name)
  );
}

/**
 * Run local safety check using Phi-3 (fast validation)
 */
export async function runLocalSafetyCheck(
  message: string
): Promise<{ safe: boolean; reason?: string }> {
  await refreshHealthCheck();

  if (!ollamaAvailable) {
    return { safe: true }; // Skip if Ollama unavailable
  }

  const safetyModel = OLLAMA_MODELS.find((m) => m.task === "safety");
  if (!safetyModel || !ollamaModels.includes(safetyModel.name)) {
    return { safe: true }; // Skip if model unavailable
  }

  try {
    const prompt = `You are a safety validator for a mental health support system. Analyze this message for harmful content, medical advice, or emergency situations.

Message: "${message}"

Respond with JSON only:
{
  "safe": true/false,
  "reason": "brief explanation if unsafe"
}`;

    const response = await ollamaQuery(safetyModel.name, prompt, {
      temperature: 0.3,
      maxTokens: 200,
      timeout: 5000, // Fast timeout
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        safe: result.safe === true,
        reason: result.reason,
      };
    }

    return { safe: true }; // Default to safe if parse fails
  } catch (error) {
    console.warn("Local safety check failed:", error);
    return { safe: true }; // Fail open (let validation layer handle it)
  }
}
