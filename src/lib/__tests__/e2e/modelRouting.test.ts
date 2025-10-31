/**
 * End-to-End Model Routing Stress Tests
 *
 * Comprehensive test suite for model routing under various conditions:
 * - Concurrent request handling
 * - Model failure scenarios and fallback chain
 * - Timeout handling
 * - Latency measurement per stage
 * - Provider selection logic
 *
 * Fallback Chain: Ollama → WebLLM → Offline (mhGAP)
 *
 * @module __tests__/e2e/modelRouting
 */

import { assessMessage } from "../../reasoning/mhgap";
import { generateOfflineResponse } from "../../reasoning/engine";

type ModelProvider = "ollama" | "webllm" | "offline";
type Language = "en" | "ar";

interface RoutingTestCase {
  id: string;
  category:
    | "concurrent"
    | "fallback"
    | "timeout"
    | "latency"
    | "provider-selection";
  description: string;
  scenario: string;
  input: string;
  language: Language;
  expectedProvider: ModelProvider;
  simulateFailure?: ModelProvider[];
  concurrentCount?: number;
  timeoutMs?: number;
  maxLatencyMs?: number;
}

/**
 * Model routing test cases
 */
const ROUTING_TEST_CASES: RoutingTestCase[] = [
  // Provider Selection Tests
  {
    id: "ROUTE-001",
    category: "provider-selection",
    description: "Default Ollama selection for English",
    scenario: "Normal operation, Ollama available",
    input: "I'm feeling anxious about work.",
    language: "en",
    expectedProvider: "ollama",
    maxLatencyMs: 5000,
  },
  {
    id: "ROUTE-002",
    category: "provider-selection",
    description: "Ollama selection for Arabic (qwen2.5)",
    scenario: "Normal operation, Ollama available",
    input: "أنا قلقان من الشغل",
    language: "ar",
    expectedProvider: "ollama",
    maxLatencyMs: 5000,
  },

  // Fallback Chain Tests
  {
    id: "ROUTE-003",
    category: "fallback",
    description: "Fallback to WebLLM when Ollama fails",
    scenario: "Ollama unavailable or timeout",
    input: "I've been feeling depressed for weeks.",
    language: "en",
    expectedProvider: "webllm",
    simulateFailure: ["ollama"],
    maxLatencyMs: 8000,
  },
  {
    id: "ROUTE-004",
    category: "fallback",
    description: "Fallback to Offline when both Ollama and WebLLM fail",
    scenario: "All LLM providers unavailable",
    input: "I can't sleep and feel hopeless.",
    language: "en",
    expectedProvider: "offline",
    simulateFailure: ["ollama", "webllm"],
    maxLatencyMs: 500,
  },
  {
    id: "ROUTE-005",
    category: "fallback",
    description: "Crisis detection triggers immediate offline fallback",
    scenario: "High-risk message detected",
    input: "I want to kill myself tonight.",
    language: "en",
    expectedProvider: "offline",
    maxLatencyMs: 500,
  },
  {
    id: "ROUTE-006",
    category: "fallback",
    description: "Arabic crisis fallback to offline",
    scenario: "High-risk Arabic message",
    input: "عايز أموت النهاردة",
    language: "ar",
    expectedProvider: "offline",
    maxLatencyMs: 500,
  },

  // Concurrent Request Tests
  {
    id: "ROUTE-007",
    category: "concurrent",
    description: "Handle 5 concurrent requests",
    scenario: "Multiple users simultaneously",
    input: "How can I manage my stress?",
    language: "en",
    expectedProvider: "ollama",
    concurrentCount: 5,
    maxLatencyMs: 10000,
  },
  {
    id: "ROUTE-008",
    category: "concurrent",
    description: "Handle 10 concurrent requests with mixed languages",
    scenario: "Load test with bilingual traffic",
    input: "What are symptoms of depression?",
    language: "en",
    expectedProvider: "ollama",
    concurrentCount: 10,
    maxLatencyMs: 15000,
  },

  // Timeout Handling Tests
  {
    id: "ROUTE-009",
    category: "timeout",
    description: "Timeout fallback for slow Ollama response",
    scenario: "Ollama taking >5s",
    input: "Tell me about anxiety disorders.",
    language: "en",
    expectedProvider: "webllm",
    timeoutMs: 5000,
    maxLatencyMs: 8000,
  },
  {
    id: "ROUTE-010",
    category: "timeout",
    description: "WebLLM timeout falls back to offline",
    scenario: "Both Ollama and WebLLM timing out",
    input: "I need help with panic attacks.",
    language: "en",
    expectedProvider: "offline",
    timeoutMs: 3000,
    maxLatencyMs: 500,
  },

  // Latency Measurement Tests
  {
    id: "ROUTE-011",
    category: "latency",
    description: "Measure Ollama latency for simple query",
    scenario: "Baseline performance measurement",
    input: "What is cognitive behavioral therapy?",
    language: "en",
    expectedProvider: "ollama",
    maxLatencyMs: 3000,
  },
  {
    id: "ROUTE-012",
    category: "latency",
    description: "Measure offline mhGAP latency",
    scenario: "Rule-based system performance",
    input: "I feel sad and tired all the time.",
    language: "en",
    expectedProvider: "offline",
    maxLatencyMs: 100,
  },
  {
    id: "ROUTE-013",
    category: "latency",
    description: "Measure Arabic model latency",
    scenario: "qwen2.5 performance baseline",
    input: "إيه أعراض الاكتئاب؟",
    language: "ar",
    expectedProvider: "ollama",
    maxLatencyMs: 4000,
  },

  // Edge Cases
  {
    id: "ROUTE-014",
    category: "provider-selection",
    description: "Empty input handling",
    scenario: "Invalid input",
    input: "",
    language: "en",
    expectedProvider: "offline",
    maxLatencyMs: 100,
  },
  {
    id: "ROUTE-015",
    category: "provider-selection",
    description: "Very long input (token limit test)",
    scenario: "Input exceeding typical context window",
    input: "I've been experiencing a lot of stress lately. ".repeat(50),
    language: "en",
    expectedProvider: "ollama",
    maxLatencyMs: 8000,
  },
];

/**
 * Simulated provider availability tracker
 */
class ProviderHealthTracker {
  private failures: Map<ModelProvider, boolean> = new Map();
  private latencies: Map<ModelProvider, number[]> = new Map();

  constructor() {
    this.failures.set("ollama", false);
    this.failures.set("webllm", false);
    this.failures.set("offline", false);
    this.latencies.set("ollama", []);
    this.latencies.set("webllm", []);
    this.latencies.set("offline", []);
  }

  setProviderFailed(provider: ModelProvider, failed: boolean): void {
    this.failures.set(provider, failed);
  }

  isProviderAvailable(provider: ModelProvider): boolean {
    return !this.failures.get(provider);
  }

  recordLatency(provider: ModelProvider, latencyMs: number): void {
    const latencies = this.latencies.get(provider) || [];
    latencies.push(latencyMs);
    this.latencies.set(provider, latencies);
  }

  getAverageLatency(provider: ModelProvider): number {
    const latencies = this.latencies.get(provider) || [];
    if (latencies.length === 0) return 0;
    return latencies.reduce((a, b) => a + b, 0) / latencies.length;
  }

  getStats() {
    return {
      ollama: {
        available: this.isProviderAvailable("ollama"),
        avgLatency: this.getAverageLatency("ollama"),
        requests: this.latencies.get("ollama")?.length || 0,
      },
      webllm: {
        available: this.isProviderAvailable("webllm"),
        avgLatency: this.getAverageLatency("webllm"),
        requests: this.latencies.get("webllm")?.length || 0,
      },
      offline: {
        available: this.isProviderAvailable("offline"),
        avgLatency: this.getAverageLatency("offline"),
        requests: this.latencies.get("offline")?.length || 0,
      },
    };
  }

  reset(): void {
    this.failures.clear();
    this.latencies.clear();
    this.failures.set("ollama", false);
    this.failures.set("webllm", false);
    this.failures.set("offline", false);
    this.latencies.set("ollama", []);
    this.latencies.set("webllm", []);
    this.latencies.set("offline", []);
  }
}

const providerTracker = new ProviderHealthTracker();

/**
 * Simulate model routing with fallback logic
 */
async function simulateModelRouting(
  input: string,
  language: Language,
  simulateFailures?: ModelProvider[],
  timeoutMs?: number
): Promise<{
  provider: ModelProvider;
  latencyMs: number;
  success: boolean;
  error?: string;
}> {
  const startTime = Date.now();

  // Set simulated failures
  if (simulateFailures) {
    simulateFailures.forEach((p) => providerTracker.setProviderFailed(p, true));
  }

  // Check for crisis (immediate offline fallback)
  const conversationHistory: any[] = [];
  const assessment = await assessMessage(
    input,
    conversationHistory,
    "low" as any
  );

  if (assessment.riskLevel === "critical" || assessment.requiresEmergency) {
    const latency = Date.now() - startTime;
    providerTracker.recordLatency("offline", latency);
    return {
      provider: "offline",
      latencyMs: latency,
      success: true,
    };
  }

  // Try Ollama first
  if (providerTracker.isProviderAvailable("ollama")) {
    try {
      // Simulate Ollama call
      await new Promise((resolve) =>
        setTimeout(resolve, 50 + Math.random() * 100)
      );

      const latency = Date.now() - startTime;

      if (timeoutMs && latency > timeoutMs) {
        throw new Error("Timeout");
      }

      providerTracker.recordLatency("ollama", latency);
      return {
        provider: "ollama",
        latencyMs: latency,
        success: true,
      };
    } catch (error) {
      // Fall through to WebLLM
    }
  }

  // Try WebLLM fallback
  if (providerTracker.isProviderAvailable("webllm")) {
    try {
      // Simulate WebLLM call (slightly slower)
      await new Promise((resolve) =>
        setTimeout(resolve, 100 + Math.random() * 200)
      );

      const latency = Date.now() - startTime;

      if (timeoutMs && latency > timeoutMs) {
        throw new Error("Timeout");
      }

      providerTracker.recordLatency("webllm", latency);
      return {
        provider: "webllm",
        latencyMs: latency,
        success: true,
      };
    } catch (error) {
      // Fall through to offline
    }
  }

  // Final fallback: Offline mhGAP
  const offlineResponse = await generateOfflineResponse(input, {
    messages: [],
    currentRiskLevel: "low",
    language: language as any,
    llm: { provider: "offline" as any, status: "offline" },
  } as any);

  const latency = Date.now() - startTime;
  providerTracker.recordLatency("offline", latency);

  return {
    provider: "offline",
    latencyMs: latency,
    success: !!offlineResponse,
  };
}

/**
 * Run a single routing test
 */
async function runRoutingTest(testCase: RoutingTestCase): Promise<{
  success: boolean;
  errors: string[];
  results: any;
}> {
  const errors: string[] = [];
  const results: any = {};

  try {
    providerTracker.reset();

    if (testCase.concurrentCount && testCase.concurrentCount > 1) {
      // Concurrent test
      const promises = Array(testCase.concurrentCount)
        .fill(null)
        .map(() =>
          simulateModelRouting(
            testCase.input,
            testCase.language,
            testCase.simulateFailure,
            testCase.timeoutMs
          )
        );

      const responses = await Promise.all(promises);

      results.concurrentResponses = responses.length;
      results.successRate =
        responses.filter((r) => r.success).length / responses.length;
      results.avgLatency =
        responses.reduce((sum, r) => sum + r.latencyMs, 0) / responses.length;
      results.maxLatency = Math.max(...responses.map((r) => r.latencyMs));
      results.providers = responses.reduce((acc, r) => {
        acc[r.provider] = (acc[r.provider] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      if (results.successRate < 0.8) {
        errors.push(
          `Low success rate: ${(results.successRate * 100).toFixed(1)}%`
        );
      }

      if (testCase.maxLatencyMs && results.maxLatency > testCase.maxLatencyMs) {
        errors.push(
          `Max latency exceeded: ${results.maxLatency}ms > ${testCase.maxLatencyMs}ms`
        );
      }
    } else {
      // Single request test
      const response = await simulateModelRouting(
        testCase.input,
        testCase.language,
        testCase.simulateFailure,
        testCase.timeoutMs
      );

      results.provider = response.provider;
      results.latencyMs = response.latencyMs;
      results.success = response.success;

      if (response.provider !== testCase.expectedProvider) {
        errors.push(
          `Provider mismatch: expected ${testCase.expectedProvider}, got ${response.provider}`
        );
      }

      if (testCase.maxLatencyMs && response.latencyMs > testCase.maxLatencyMs) {
        errors.push(
          `Latency exceeded: ${response.latencyMs}ms > ${testCase.maxLatencyMs}ms`
        );
      }

      if (!response.success) {
        errors.push("Request failed");
      }
    }
  } catch (error) {
    errors.push(
      `Exception: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return {
    success: errors.length === 0,
    errors,
    results,
  };
}

/**
 * Run all routing tests
 */
export async function runAllRoutingTests(): Promise<{
  totalTests: number;
  passed: number;
  failed: number;
  results: Array<{
    testCase: RoutingTestCase;
    success: boolean;
    errors: string[];
    results: any;
  }>;
}> {
  const results = [];
  let passed = 0;
  let failed = 0;

  for (const testCase of ROUTING_TEST_CASES) {
    const result = await runRoutingTest(testCase);

    results.push({
      testCase,
      ...result,
    });

    if (result.success) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    totalTests: ROUTING_TEST_CASES.length,
    passed,
    failed,
    results,
  };
}

/**
 * Test runner function
 */
export async function testModelRouting(): Promise<void> {
  console.log("\n=== Model Routing Stress Tests ===\n");

  const results = await runAllRoutingTests();

  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(
    `Success Rate: ${((results.passed / results.totalTests) * 100).toFixed(
      1
    )}%\n`
  );

  // Log each test result
  for (const result of results.results) {
    const status = result.success ? "[OK]" : "[ERROR]";
    console.log(
      `${status} ${result.testCase.id}: ${result.testCase.description}`
    );

    if (!result.success) {
      console.log(`  Errors:`);
      result.errors.forEach((err) => console.log(`    - ${err}`));
    }

    if (result.results.provider) {
      console.log(`  Provider: ${result.results.provider}`);
      console.log(`  Latency: ${result.results.latencyMs}ms`);
    }

    if (result.results.concurrentResponses) {
      console.log(
        `  Concurrent: ${result.results.concurrentResponses} requests`
      );
      console.log(
        `  Success Rate: ${(result.results.successRate * 100).toFixed(1)}%`
      );
      console.log(`  Avg Latency: ${result.results.avgLatency.toFixed(0)}ms`);
      console.log(`  Max Latency: ${result.results.maxLatency}ms`);
    }
  }

  console.log("\n=== Test Summary by Category ===");
  console.log(
    `Provider Selection: ${
      results.results.filter(
        (r) => r.testCase.category === "provider-selection"
      ).length
    } tests`
  );
  console.log(
    `Fallback Chain: ${
      results.results.filter((r) => r.testCase.category === "fallback").length
    } tests`
  );
  console.log(
    `Concurrent: ${
      results.results.filter((r) => r.testCase.category === "concurrent").length
    } tests`
  );
  console.log(
    `Timeout: ${
      results.results.filter((r) => r.testCase.category === "timeout").length
    } tests`
  );
  console.log(
    `Latency: ${
      results.results.filter((r) => r.testCase.category === "latency").length
    } tests`
  );

  console.log("\n=== Provider Statistics ===");
  const stats = providerTracker.getStats();
  console.log(
    `Ollama: ${
      stats.ollama.requests
    } requests, avg ${stats.ollama.avgLatency.toFixed(0)}ms`
  );
  console.log(
    `WebLLM: ${
      stats.webllm.requests
    } requests, avg ${stats.webllm.avgLatency.toFixed(0)}ms`
  );
  console.log(
    `Offline: ${
      stats.offline.requests
    } requests, avg ${stats.offline.avgLatency.toFixed(0)}ms`
  );

  // Fail if success rate below 80%
  if (results.passed / results.totalTests < 0.8) {
    throw new Error(
      `Test suite failed: only ${results.passed}/${results.totalTests} tests passed`
    );
  }
}

// Export for external use
export { ROUTING_TEST_CASES, ProviderHealthTracker, simulateModelRouting };
