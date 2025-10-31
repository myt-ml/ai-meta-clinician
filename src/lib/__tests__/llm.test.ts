/**
 * LLM Layer Tests
 *
 * Tests for the LLM integration layer (WebLLM + Cloud fallback)
 */

import type { Message } from "../store/types";

/**
 * Run all LLM tests
 */
export async function runLLMTests(): Promise<void> {
  console.log("🧪 Running LLM Layer Tests...\n");

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Module imports
  try {
    console.log("✓ LLM Module Structure");
    const llmModule = await import("../llm");
    if (
      !llmModule.initializeWebLLM ||
      !llmModule.loadModel ||
      !llmModule.generateResponse
    ) {
      throw new Error("Missing required exports");
    }
    passedTests++;
  } catch (error) {
    console.error("✗ LLM Module Structure:", error);
    failedTests++;
  }

  // Test 2: Type definitions
  try {
    console.log("✓ LLM Type Definitions");
    const types = await import("../llm/types");
    if (!types.AVAILABLE_MODELS || types.AVAILABLE_MODELS.length === 0) {
      throw new Error("No models available");
    }
    passedTests++;
  } catch (error) {
    console.error("✗ LLM Type Definitions:", error);
    failedTests++;
  }

  // Test 3: Prompt building
  try {
    console.log("✓ Clinical Prompt Building");
    const { buildPrompt } = await import("../llm/prompts");

    const testMessages: Message[] = [
      {
        id: "1",
        role: "user",
        text: "I'm feeling anxious",
        timestamp: Date.now(),
        language: "en",
      },
    ];

    const prompt = buildPrompt(
      "I can't sleep at night",
      testMessages,
      "moderate"
    );

    if (!prompt.includes("anxious") || !prompt.includes("sleep")) {
      throw new Error("Prompt doesn't include conversation context");
    }

    if (!prompt.includes("compassionate") && !prompt.includes("safety")) {
      throw new Error("Prompt missing clinical guidance");
    }

    passedTests++;
  } catch (error) {
    console.error("✗ Clinical Prompt Building:", error);
    failedTests++;
  }

  // Test 4: Crisis prompt override
  try {
    console.log("✓ Crisis Prompt Override");
    const { buildCrisisPrompt } = await import("../llm/prompts");

    const crisisPrompt = buildCrisisPrompt("I want to end my life");

    if (!crisisPrompt.includes("CRISIS") && !crisisPrompt.includes("crisis")) {
      throw new Error("Crisis prompt missing crisis indicator");
    }

    if (!crisisPrompt.includes("988") || !crisisPrompt.includes("741741")) {
      throw new Error("Crisis prompt missing hotline numbers");
    }

    passedTests++;
  } catch (error) {
    console.error("✗ Crisis Prompt Override:", error);
    failedTests++;
  }

  // Test 5: Model availability check
  try {
    console.log("✓ Model Availability Check");
    const { isModelReady } = await import("../llm");

    const ready = isModelReady();
    if (typeof ready !== "boolean") {
      throw new Error("isModelReady should return boolean");
    }

    // Should be false initially (no model loaded yet)
    if (ready !== false) {
      console.warn("  ⚠️  Warning: Model reported as ready without loading");
    }

    passedTests++;
  } catch (error) {
    console.error("✗ Model Availability Check:", error);
    failedTests++;
  }

  // Test 6: Assessment prompt generation
  try {
    console.log("✓ Assessment Prompt Generation");
    const { buildAssessmentPrompt } = await import("../llm/prompts");

    const phqPrompt = buildAssessmentPrompt("PHQ-9", 15);
    if (!phqPrompt.includes("15") || !phqPrompt.includes("PHQ-9")) {
      throw new Error("Assessment prompt missing score or type");
    }

    const gadPrompt = buildAssessmentPrompt(
      "GAD-7",
      12,
      "I worry constantly about everything"
    );
    if (!gadPrompt.includes("12") || !gadPrompt.includes("worry constantly")) {
      throw new Error("Assessment prompt missing context");
    }

    passedTests++;
  } catch (error) {
    console.error("✗ Assessment Prompt Generation:", error);
    failedTests++;
  }

  // Summary
  console.log(`\n${"=".repeat(50)}`);
  console.log(`LLM Tests: ${passedTests} passed, ${failedTests} failed`);
  console.log(`${"=".repeat(50)}\n`);

  if (failedTests > 0) {
    throw new Error(`${failedTests} LLM test(s) failed`);
  }
}
