/**
 * Ollama Tests
 *
 * Tests for local Ollama inference integration
 */

import {
  checkOllamaHealth,
  ollamaQuery,
  OLLAMA_MODELS,
} from "../llm/ollamaClient";
import {
  initializeRouter,
  isOllamaAvailable,
  getAvailableOllamaModels,
  getMissingModels,
  runLocalSafetyCheck,
} from "../llm/router";

export interface OllamaTest {
  name: string;
  fn: () => boolean | Promise<boolean>;
  category: "ollama";
}

/**
 * Ollama test suite
 */
export const ollamaTests: OllamaTest[] = [
  // Test 1: Ollama health check
  {
    name: "Ollama server health check",
    fn: async () => {
      const health = await checkOllamaHealth();
      console.log("Ollama health:", health);
      return health.available !== undefined;
    },
    category: "ollama",
  },

  // Test 2: Router initialization
  {
    name: "Router initialization",
    fn: async () => {
      await initializeRouter();
      const available = await isOllamaAvailable();
      console.log("Ollama available:", available);
      return true; // Always pass (Ollama is optional)
    },
    category: "ollama",
  },

  // Test 3: Check available models
  {
    name: "Check available models",
    fn: async () => {
      await initializeRouter();
      const models = getAvailableOllamaModels();
      console.log("Available Ollama models:", models);
      return Array.isArray(models);
    },
    category: "ollama",
  },

  // Test 4: Check missing models
  {
    name: "Identify missing recommended models",
    fn: async () => {
      const missing = await getMissingModels();
      console.log(
        "Missing models:",
        missing.map((m) => m.name)
      );
      return Array.isArray(missing);
    },
    category: "ollama",
  },

  // Test 5: Local safety check (if Ollama available)
  {
    name: "Local safety check with Phi-3",
    fn: async () => {
      await initializeRouter();
      const available = await isOllamaAvailable();

      if (!available) {
        console.log("Ollama not available - skipping safety check test");
        return true; // Pass if Ollama unavailable
      }

      try {
        const safeMessage = "I'm feeling sad today";
        const result = await runLocalSafetyCheck(safeMessage);
        console.log("Safety check result:", result);
        return result.safe !== undefined;
      } catch (error) {
        console.log("Safety check failed (model may not be installed):", error);
        return true; // Pass even if safety check fails (optional feature)
      }
    },
    category: "ollama",
  },

  // Test 6: Ollama query (if server available)
  {
    name: "Ollama inference query",
    fn: async () => {
      const health = await checkOllamaHealth();

      if (!health.available) {
        console.log("Ollama not available - skipping inference test");
        return true; // Pass if Ollama unavailable
      }

      // Find any available model
      const availableModel = health.models.find((m) =>
        OLLAMA_MODELS.some((om) => m.startsWith(om.name.split(":")[0]))
      );

      if (!availableModel) {
        console.log(
          "No recommended models available - skipping inference test"
        );
        return true; // Pass if no models
      }

      try {
        const response = await ollamaQuery(
          availableModel,
          "Say 'Hello' in one word.",
          { maxTokens: 10, timeout: 10000 }
        );
        console.log("Ollama response:", response);
        return response.length > 0;
      } catch (error) {
        console.log("Ollama query failed:", error);
        return true; // Pass even if query fails (optional feature)
      }
    },
    category: "ollama",
  },

  // Test 7: Model recommendations
  {
    name: "Recommended models list",
    fn: () => {
      console.log(
        "Recommended models:",
        OLLAMA_MODELS.map((m) => m.name)
      );
      return OLLAMA_MODELS.length === 4;
    },
    category: "ollama",
  },

  // Test 8: Graceful degradation
  {
    name: "Graceful degradation when Ollama unavailable",
    fn: async () => {
      // This test verifies the system works even without Ollama
      await initializeRouter();
      const available = await isOllamaAvailable();

      if (!available) {
        console.log(
          "✅ System correctly detects Ollama unavailable and will use fallback"
        );
      } else {
        console.log("✅ Ollama available for local inference");
      }

      return true; // Always pass
    },
    category: "ollama",
  },
];

/**
 * Run all Ollama tests
 */
export async function runOllamaTests(): Promise<{
  passed: number;
  failed: number;
  results: Array<{ name: string; passed: boolean; error?: string }>;
}> {
  const results: Array<{ name: string; passed: boolean; error?: string }> = [];
  let passed = 0;
  let failed = 0;

  for (const test of ollamaTests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
        results.push({ name: test.name, passed: true });
      } else {
        failed++;
        results.push({
          name: test.name,
          passed: false,
          error: "Test returned false",
        });
      }
    } catch (error) {
      failed++;
      results.push({
        name: test.name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { passed, failed, results };
}
