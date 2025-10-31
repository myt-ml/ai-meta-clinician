/**
 * Ollama Client
 *
 * Local-first inference client for Ollama models
 * Provides fast, privacy-preserving inference without external dependencies
 */

export interface OllamaModel {
  name: string;
  displayName: string;
  size: string;
  description: string;
  contextWindow: number;
  task: "general" | "arabic" | "safety" | "coding";
}

export interface OllamaResponse {
  model: string;
  response: string;
  context?: number[];
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

export interface OllamaHealthStatus {
  available: boolean;
  version?: string;
  models: string[];
}

/**
 * Recommended small models for clinical system
 */
export const OLLAMA_MODELS: OllamaModel[] = [
  {
    name: "llama3.2:3b",
    displayName: "Llama 3.2 3B",
    size: "2GB",
    description: "Fast general reasoning for clinical responses",
    contextWindow: 8192,
    task: "general",
  },
  {
    name: "qwen2.5:1.5b",
    displayName: "Qwen 2.5 1.5B",
    size: "1GB",
    description: "Best Arabic language support for multilingual users",
    contextWindow: 4096,
    task: "arabic",
  },
  {
    name: "phi3:mini",
    displayName: "Phi-3 Mini",
    size: "2.3GB",
    description: "Efficient safety validation and structured outputs",
    contextWindow: 4096,
    task: "safety",
  },
  {
    name: "smollm:1.7b",
    displayName: "SmolLM 1.7B",
    size: "1GB",
    description: "Internal tooling and development tasks",
    contextWindow: 2048,
    task: "coding",
  },
];

/**
 * Default Ollama server URL
 */
const OLLAMA_BASE_URL = "http://localhost:11434";

/**
 * Check if Ollama server is available
 */
export async function checkOllamaHealth(): Promise<OllamaHealthStatus> {
  try {
    const versionRes = await fetch(`${OLLAMA_BASE_URL}/api/version`, {
      method: "GET",
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });

    if (!versionRes.ok) {
      return { available: false, models: [] };
    }

    const versionData = await versionRes.json();

    // Get list of available models
    const modelsRes = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    const modelsData = modelsRes.ok ? await modelsRes.json() : { models: [] };

    return {
      available: true,
      version: versionData.version,
      models: modelsData.models?.map((m: any) => m.name) || [],
    };
  } catch (error) {
    // Server not running or unreachable
    return { available: false, models: [] };
  }
}

/**
 * Query Ollama model for inference
 */
export async function ollamaQuery(
  model: string,
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    timeout?: number;
  }
): Promise<string> {
  const {
    temperature = 0.7,
    maxTokens = 1000,
    stream = false,
    timeout = 30000,
  } = options || {};

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false, // Always use non-streaming for simplicity
        options: {
          temperature,
          num_predict: maxTokens,
        },
      }),
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();

    if (!data.response) {
      throw new Error("No response from Ollama model");
    }

    return data.response;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Ollama query failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Pull a model from Ollama registry (for setup)
 */
export async function pullOllamaModel(
  modelName: string,
  onProgress?: (progress: string) => void
): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: modelName }),
    });

    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.statusText}`);
    }

    // Stream progress updates
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.status && onProgress) {
              onProgress(data.status);
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Failed to pull Ollama model:", error);
    return false;
  }
}

/**
 * Delete a model from local storage
 */
export async function deleteOllamaModel(modelName: string): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: modelName }),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to delete Ollama model:", error);
    return false;
  }
}

/**
 * Get model info
 */
export async function getOllamaModelInfo(
  modelName: string
): Promise<any | null> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/show`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: modelName }),
    });

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    return null;
  }
}
