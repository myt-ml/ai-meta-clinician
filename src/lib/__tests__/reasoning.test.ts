/**
 * Reasoning Layer Tests
 *
 * Tests for offline clinical reasoning engine
 */

import {
  assessMessage,
  interpretPHQ9,
  interpretGAD7,
} from "../reasoning/mhgap";
import { generateOfflineResponse } from "../reasoning/engine";
import type { ClinicalState, Message } from "../store/types";

/**
 * Test 1: Crisis keyword detection
 */
export async function testCrisisDetection(): Promise<{
  pass: boolean;
  message: string;
}> {
  try {
    const messages: Message[] = [];
    const testCases = [
      "I want to kill myself",
      "thinking about suicide",
      "no reason to live",
      "better off dead",
    ];

    for (const testCase of testCases) {
      const assessment = assessMessage(testCase, messages, "low");

      if (assessment.primaryCondition !== "suicide_risk") {
        return {
          pass: false,
          message: `Crisis detection failed for: "${testCase}"`,
        };
      }

      if (assessment.riskLevel !== "critical") {
        return {
          pass: false,
          message: `Risk level should be critical for: "${testCase}"`,
        };
      }

      if (!assessment.requiresEmergency) {
        return {
          pass: false,
          message: `Should require emergency for: "${testCase}"`,
        };
      }
    }

    return { pass: true, message: "Crisis detection working correctly" };
  } catch (error) {
    return {
      pass: false,
      message: `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Test 2: Depression pattern matching
 */
export async function testDepressionDetection(): Promise<{
  pass: boolean;
  message: string;
}> {
  try {
    const messages: Message[] = [];
    const testMessage =
      "I feel so sad and empty. I have no interest in anything anymore. I can't sleep and have no energy. Everything feels hopeless.";

    const assessment = assessMessage(testMessage, messages, "low");

    if (assessment.primaryCondition !== "depression") {
      return {
        pass: false,
        message: `Expected depression, got: ${assessment.primaryCondition}`,
      };
    }

    if (assessment.confidence < 0.5) {
      return {
        pass: false,
        message: `Confidence too low: ${assessment.confidence}`,
      };
    }

    return { pass: true, message: "Depression detection working correctly" };
  } catch (error) {
    return {
      pass: false,
      message: `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Test 3: Anxiety pattern matching
 */
export async function testAnxietyDetection(): Promise<{
  pass: boolean;
  message: string;
}> {
  try {
    const messages: Message[] = [];
    const testMessage =
      "I'm constantly worried and anxious. My heart races and I can't stop the nervous thoughts. I feel restless all the time.";

    const assessment = assessMessage(testMessage, messages, "low");

    if (assessment.primaryCondition !== "anxiety") {
      return {
        pass: false,
        message: `Expected anxiety, got: ${assessment.primaryCondition}`,
      };
    }

    if (assessment.confidence < 0.5) {
      return {
        pass: false,
        message: `Confidence too low: ${assessment.confidence}`,
      };
    }

    return { pass: true, message: "Anxiety detection working correctly" };
  } catch (error) {
    return {
      pass: false,
      message: `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Test 4: Self-harm detection
 */
export async function testSelfHarmDetection(): Promise<{
  pass: boolean;
  message: string;
}> {
  try {
    const messages: Message[] = [];
    const testCases = [
      "I've been cutting myself",
      "I hurt myself when I feel this way",
      "self-harm helps me cope",
    ];

    for (const testCase of testCases) {
      const assessment = assessMessage(testCase, messages, "low");

      if (assessment.primaryCondition !== "self_harm") {
        return {
          pass: false,
          message: `Self-harm detection failed for: "${testCase}" - Got: ${assessment.primaryCondition} (confidence: ${assessment.confidence})`,
        };
      }

      if (assessment.riskLevel !== "high") {
        return {
          pass: false,
          message: `Risk level should be high for self-harm`,
        };
      }
    }

    return { pass: true, message: "Self-harm detection working correctly" };
  } catch (error) {
    return {
      pass: false,
      message: `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Test 5: PHQ-9 interpretation
 */
export async function testPHQ9Interpretation(): Promise<{
  pass: boolean;
  message: string;
}> {
  try {
    // Test severe depression (score 20+)
    const severe = interpretPHQ9(22);
    if (severe.riskLevel !== "high" || !severe.severity.includes("Severe")) {
      return {
        pass: false,
        message: "PHQ-9 severe interpretation incorrect",
      };
    }

    // Test moderate depression (score 10-14)
    const moderate = interpretPHQ9(12);
    if (
      moderate.riskLevel !== "moderate" ||
      !moderate.severity.includes("Moderate")
    ) {
      return {
        pass: false,
        message: "PHQ-9 moderate interpretation incorrect",
      };
    }

    // Test minimal depression (score 0-4)
    const minimal = interpretPHQ9(2);
    if (minimal.riskLevel !== "low" || !minimal.severity.includes("Minimal")) {
      return {
        pass: false,
        message: "PHQ-9 minimal interpretation incorrect",
      };
    }

    return {
      pass: true,
      message: "PHQ-9 interpretation working correctly",
    };
  } catch (error) {
    return {
      pass: false,
      message: `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Test 6: GAD-7 interpretation
 */
export async function testGAD7Interpretation(): Promise<{
  pass: boolean;
  message: string;
}> {
  try {
    // Test severe anxiety (score 15+)
    const severe = interpretGAD7(16);
    if (severe.riskLevel !== "high" || !severe.severity.includes("Severe")) {
      return {
        pass: false,
        message: "GAD-7 severe interpretation incorrect",
      };
    }

    // Test moderate anxiety (score 10-14)
    const moderate = interpretGAD7(11);
    if (
      moderate.riskLevel !== "moderate" ||
      !moderate.severity.includes("Moderate")
    ) {
      return {
        pass: false,
        message: "GAD-7 moderate interpretation incorrect",
      };
    }

    // Test minimal anxiety (score 0-4)
    const minimal = interpretGAD7(3);
    if (minimal.riskLevel !== "low" || !minimal.severity.includes("Minimal")) {
      return {
        pass: false,
        message: "GAD-7 minimal interpretation incorrect",
      };
    }

    return {
      pass: true,
      message: "GAD-7 interpretation working correctly",
    };
  } catch (error) {
    return {
      pass: false,
      message: `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Test 7: Offline response generation
 */
export async function testOfflineResponseGeneration(): Promise<{
  pass: boolean;
  message: string;
}> {
  try {
    const mockState: ClinicalState = {
      // Session
      session: {
        id: "test-session",
        startTime: Date.now(),
        lastActivity: Date.now(),
        language: "en",
        messageCount: 0,
        riskFlags: [],
        triageCategory: "undetermined",
        encrypted: false,
      },

      // Messages
      messages: [],

      // Language
      language: "en",

      // Risk & Safety
      currentRiskLevel: "low",
      triageCategory: "undetermined",
      riskFlags: [],

      // PHQ-9
      phq: {
        started: false,
        completed: false,
        currentQuestion: 0,
        responses: [],
        totalScore: undefined,
      },

      // ASR
      asr: {
        isListening: false,
        isProcessing: false,
        transcript: "",
        confidence: 0,
        language: "en",
        error: undefined,
      },

      // LLM
      llm: {
        provider: "offline",
        status: "offline",
        modelName: undefined,
        availableModels: [],
        isStreaming: false,
        error: undefined,
        lastInference: undefined,
        fallbackActive: false,
      },

      // Audit
      auditLog: [],

      // Encryption
      encryptionEnabled: false,
      encryptionKey: undefined,

      // Persistence
      persistenceEnabled: false,
      lastSaved: undefined,
    };

    const result = generateOfflineResponse(
      "I feel very anxious and worried all the time",
      mockState
    );

    if (!result.response) {
      return {
        pass: false,
        message: "No response generated",
      };
    }

    if (result.metadata.reasoningMode !== "offline") {
      return {
        pass: false,
        message: "Reasoning mode should be offline",
      };
    }

    if (result.assessment.primaryCondition !== "anxiety") {
      return {
        pass: false,
        message: `Expected anxiety condition, got: ${result.assessment.primaryCondition}`,
      };
    }

    return {
      pass: true,
      message: "Offline response generation working correctly",
    };
  } catch (error) {
    return {
      pass: false,
      message: `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Test 8: Multilingual crisis keywords
 */
export async function testMultilingualCrisis(): Promise<{
  pass: boolean;
  message: string;
}> {
  try {
    const messages: Message[] = [];

    // Arabic
    const arabicAssessment = assessMessage("انتحار", messages, "low");
    if (arabicAssessment.primaryCondition !== "suicide_risk") {
      return {
        pass: false,
        message: "Arabic crisis keyword not detected",
      };
    }

    // Spanish
    const spanishAssessment = assessMessage("suicidio", messages, "low");
    if (spanishAssessment.primaryCondition !== "suicide_risk") {
      return {
        pass: false,
        message: "Spanish crisis keyword not detected",
      };
    }

    return {
      pass: true,
      message: "Multilingual crisis detection working correctly",
    };
  } catch (error) {
    return {
      pass: false,
      message: `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Run all reasoning tests
 */
export async function runReasoningTests(): Promise<{
  totalTests: number;
  passed: number;
  failed: number;
  results: Array<{ name: string; pass: boolean; message: string }>;
}> {
  const tests = [
    { name: "Crisis Detection", fn: testCrisisDetection },
    { name: "Depression Detection", fn: testDepressionDetection },
    { name: "Anxiety Detection", fn: testAnxietyDetection },
    { name: "Self-Harm Detection", fn: testSelfHarmDetection },
    { name: "PHQ-9 Interpretation", fn: testPHQ9Interpretation },
    { name: "GAD-7 Interpretation", fn: testGAD7Interpretation },
    { name: "Offline Response Generation", fn: testOfflineResponseGeneration },
    { name: "Multilingual Crisis", fn: testMultilingualCrisis },
  ];

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`Running: ${test.name}...`);
    const result = await test.fn();
    results.push({ name: test.name, ...result });

    if (result.pass) {
      passed++;
      console.log(`✓ ${test.name}: ${result.message}`);
    } else {
      failed++;
      console.error(`✗ ${test.name}: ${result.message}`);
    }
  }

  return {
    totalTests: tests.length,
    passed,
    failed,
    results,
  };
}

// Export for browser testing
if (typeof window !== "undefined") {
  (window as any).runReasoningTests = runReasoningTests;
}
