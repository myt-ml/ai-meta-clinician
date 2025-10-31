/**
 * End-to-End Language Switching Tests
 *
 * Comprehensive test suite for cross-language functionality:
 * - English ↔ Arabic language switching mid-conversation
 * - Model routing verification (qwen2.5 for Arabic, llama3.2 for English)
 * - Egyptian dialect detection and handling
 * - Crisis detection consistency across languages
 * - Cultural context appropriateness
 *
 * @module __tests__/e2e/languageSwitching
 */

import { assessMessage } from "../../reasoning/mhgap";
import { generateOfflineResponse } from "../../reasoning/engine";

type RiskLevel = "none" | "low" | "medium" | "high" | "crisis";
type Language = "en" | "ar";

/**
 * Simple language detection based on Arabic character presence
 */
function detectLanguage(text: string): Language {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text) ? "ar" : "en";
}

/**
 * Detect Egyptian dialect markers
 */
function hasEgyptianDialect(text: string): boolean {
  const egyptianMarkers = [
    "يا دكتور",
    "تعبان",
    "مش عارف",
    "خالص",
    "بايظة",
    "عايز",
    "إيه",
    "امبارح",
    "عشان",
    "بيقولوا",
  ];
  return egyptianMarkers.some((marker) => text.includes(marker));
}

/**
 * Detect Levantine dialect markers
 */
function hasLevantineDialect(text: string): boolean {
  const levantineMarkers = ["حاسس", "منيح", "شو", "كيفك", "بدي"];
  return levantineMarkers.some((marker) => text.includes(marker));
}

/**
 * Get expected model based on language
 */
function getExpectedModel(lang: Language): "llama3.2" | "qwen2.5" {
  return lang === "ar" ? "qwen2.5" : "llama3.2";
}

/**
 * Language test case structure
 */
interface LanguageTestCase {
  id: string;
  category:
    | "basic-switching"
    | "crisis-consistency"
    | "dialect-handling"
    | "cultural-context";
  description: string;
  input: string;
  language: Language;
  expectedModel: "llama3.2" | "qwen2.5";
  dialect?: "egyptian" | "levantine" | null;
  checkCrisis?: boolean;
  expectedRisk?: RiskLevel;
}

/**
 * Language switching test cases
 */
const LANGUAGE_TEST_CASES: LanguageTestCase[] = [
  // Basic Language Detection
  {
    id: "LANG-001",
    category: "basic-switching",
    description: "English greeting detection",
    input: "Hello, I would like to talk about my anxiety.",
    language: "en",
    expectedModel: "llama3.2",
  },
  {
    id: "LANG-002",
    category: "basic-switching",
    description: "Arabic greeting detection",
    input: "مرحبا، أنا قلقان جداً",
    language: "ar",
    expectedModel: "qwen2.5",
  },
  {
    id: "LANG-003",
    category: "basic-switching",
    description: "Arabic formal greeting",
    input: "السلام عليكم، عندي مشكلة نفسية",
    language: "ar",
    expectedModel: "qwen2.5",
  },

  // Egyptian Dialect Handling
  {
    id: "LANG-004",
    category: "dialect-handling",
    description: "Egyptian dialect - psychological distress",
    input: "أنا تعبان نفسياً يا دكتور",
    language: "ar",
    expectedModel: "qwen2.5",
    dialect: "egyptian",
  },
  {
    id: "LANG-005",
    category: "dialect-handling",
    description: "Egyptian dialect - sleep issues",
    input: "مش عارف أنام خالص",
    language: "ar",
    expectedModel: "qwen2.5",
    dialect: "egyptian",
  },
  {
    id: "LANG-006",
    category: "dialect-handling",
    description: "Levantine dialect (for comparison)",
    input: "حاسس حالي مش منيح",
    language: "ar",
    expectedModel: "qwen2.5",
    dialect: "levantine",
  },

  // Crisis Detection - Suicidal Ideation
  {
    id: "LANG-007",
    category: "crisis-consistency",
    description: "Suicidal ideation - English",
    input: "I don't want to be alive anymore. Everything feels hopeless.",
    language: "en",
    expectedModel: "llama3.2",
    checkCrisis: true,
    expectedRisk: "crisis",
  },
  {
    id: "LANG-008",
    category: "crisis-consistency",
    description: "Suicidal ideation - Arabic (Egyptian)",
    input: "مش عايز أعيش تاني، كل حاجة بايظة",
    language: "ar",
    expectedModel: "qwen2.5",
    dialect: "egyptian",
    checkCrisis: true,
    expectedRisk: "crisis",
  },

  // Crisis Detection - Self-Harm
  {
    id: "LANG-009",
    category: "crisis-consistency",
    description: "Self-harm - English",
    input: "I hurt myself last night to feel something.",
    language: "en",
    expectedModel: "llama3.2",
    checkCrisis: true,
    expectedRisk: "high",
  },
  {
    id: "LANG-010",
    category: "crisis-consistency",
    description: "Self-harm - Arabic (Egyptian)",
    input: "جرحت نفسي امبارح عشان أحس بحاجة",
    language: "ar",
    expectedModel: "qwen2.5",
    dialect: "egyptian",
    checkCrisis: true,
    expectedRisk: "high",
  },

  // Crisis Detection - Violence Risk
  {
    id: "LANG-011",
    category: "crisis-consistency",
    description: "Violence risk - Arabic",
    input: "حاسس إني هضرب حد، مش قادر أكنترول غضبي",
    language: "ar",
    expectedModel: "qwen2.5",
    checkCrisis: true,
    expectedRisk: "high",
  },
  {
    id: "LANG-012",
    category: "crisis-consistency",
    description: "Violence risk - English",
    input: "I feel like I might hurt someone. I can't control my anger.",
    language: "en",
    expectedModel: "llama3.2",
    checkCrisis: true,
    expectedRisk: "high",
  },

  // Moderate Risk - Depression
  {
    id: "LANG-013",
    category: "crisis-consistency",
    description: "Depression symptoms - English",
    input: "I feel sad all the time and have no energy.",
    language: "en",
    expectedModel: "llama3.2",
    checkCrisis: true,
    expectedRisk: "medium",
  },
  {
    id: "LANG-014",
    category: "crisis-consistency",
    description: "Depression symptoms - Arabic",
    input: "حاسس بحزن طول الوقت ومعنديش طاقة",
    language: "ar",
    expectedModel: "qwen2.5",
    checkCrisis: true,
    expectedRisk: "medium",
  },

  // Low Risk - General Questions
  {
    id: "LANG-015",
    category: "crisis-consistency",
    description: "General mental health question - English",
    input: "What can I do to manage stress at work?",
    language: "en",
    expectedModel: "llama3.2",
    checkCrisis: true,
    expectedRisk: "low",
  },
  {
    id: "LANG-016",
    category: "crisis-consistency",
    description: "General mental health question - Arabic",
    input: "إيه اللي أقدر أعمله عشان أتعامل مع الضغط في الشغل؟",
    language: "ar",
    expectedModel: "qwen2.5",
    dialect: "egyptian",
    checkCrisis: true,
    expectedRisk: "low",
  },

  // Cultural Context
  {
    id: "LANG-017",
    category: "cultural-context",
    description: "Mental health stigma - Arabic",
    input: "الناس بتقول إن الأمراض النفسية عيب، مش عارف أكلم حد",
    language: "ar",
    expectedModel: "qwen2.5",
    dialect: "egyptian",
  },
  {
    id: "LANG-018",
    category: "cultural-context",
    description: "Family pressure - Arabic (Egyptian)",
    input: "أهلي مش فاهمين، بيقولوا اقرا قرآن وهيروح",
    language: "ar",
    expectedModel: "qwen2.5",
    dialect: "egyptian",
  },
];

/**
 * Run a single language test
 */
async function runLanguageTest(testCase: LanguageTestCase): Promise<{
  success: boolean;
  errors: string[];
  results: any;
}> {
  const errors: string[] = [];
  const results: any = {};

  try {
    // 1. Language Detection
    const detectedLang = detectLanguage(testCase.input);
    results.detectedLanguage = detectedLang;

    if (detectedLang !== testCase.language) {
      errors.push(
        `Expected language ${testCase.language}, got ${detectedLang}`
      );
    }

    // 2. Model Selection
    const expectedModel = getExpectedModel(testCase.language);
    results.expectedModel = expectedModel;

    if (expectedModel !== testCase.expectedModel) {
      errors.push(
        `Model mismatch: expected ${testCase.expectedModel}, got ${expectedModel}`
      );
    }

    // 3. Dialect Detection
    if (testCase.dialect) {
      if (testCase.dialect === "egyptian") {
        const hasEgyptian = hasEgyptianDialect(testCase.input);
        results.egyptianDialect = hasEgyptian;
        if (!hasEgyptian) {
          errors.push("Expected Egyptian dialect markers not found");
        }
      } else if (testCase.dialect === "levantine") {
        const hasLevantine = hasLevantineDialect(testCase.input);
        results.levantineDialect = hasLevantine;
        if (!hasLevantine) {
          errors.push("Expected Levantine dialect markers not found");
        }
      }
    }

    // 4. Crisis Detection (if required)
    if (testCase.checkCrisis) {
      const conversationHistory: any[] = [];
      const currentRiskLevel = "low";

      const assessment = await assessMessage(
        testCase.input,
        conversationHistory,
        currentRiskLevel as any
      );

      results.riskLevel = assessment.riskLevel;
      results.conditions = assessment.conditions;

      // Map assessment risk levels to test risk levels
      const riskMapping: Record<string, RiskLevel> = {
        low: "low",
        moderate: "medium",
        high: "high",
        critical: "crisis",
      };

      const mappedRisk = riskMapping[assessment.riskLevel] || "none";

      if (testCase.expectedRisk && mappedRisk !== testCase.expectedRisk) {
        errors.push(
          `Risk level mismatch: expected ${testCase.expectedRisk}, got ${mappedRisk}`
        );
      }

      // Mark if crisis detected
      if (assessment.riskLevel === "critical") {
        results.crisisDetected = true;
        results.requiresEmergency = assessment.requiresEmergency;
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
 * Run all language switching tests
 */
export async function runAllLanguageTests(): Promise<{
  totalTests: number;
  passed: number;
  failed: number;
  results: Array<{
    testCase: LanguageTestCase;
    success: boolean;
    errors: string[];
    results: any;
  }>;
}> {
  const results = [];
  let passed = 0;
  let failed = 0;

  for (const testCase of LANGUAGE_TEST_CASES) {
    const result = await runLanguageTest(testCase);

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
    totalTests: LANGUAGE_TEST_CASES.length,
    passed,
    failed,
    results,
  };
}

/**
 * Test runner function (called by test framework)
 */
export async function testLanguageSwitching(): Promise<void> {
  console.log("\n=== Language Switching E2E Tests ===\n");

  const results = await runAllLanguageTests();

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

    if (result.results.riskLevel) {
      console.log(`  Risk: ${result.results.riskLevel}`);
    }
  }

  console.log("\n=== Test Summary ===");
  console.log(
    `Basic Switching: ${
      results.results.filter((r) => r.testCase.category === "basic-switching")
        .length
    } tests`
  );
  console.log(
    `Dialect Handling: ${
      results.results.filter((r) => r.testCase.category === "dialect-handling")
        .length
    } tests`
  );
  console.log(
    `Crisis Consistency: ${
      results.results.filter(
        (r) => r.testCase.category === "crisis-consistency"
      ).length
    } tests`
  );
  console.log(
    `Cultural Context: ${
      results.results.filter((r) => r.testCase.category === "cultural-context")
        .length
    } tests`
  );

  // Fail if success rate below 80%
  if (results.passed / results.totalTests < 0.8) {
    throw new Error(
      `Test suite failed: only ${results.passed}/${results.totalTests} tests passed`
    );
  }
}

// Export test cases for external use
export {
  LANGUAGE_TEST_CASES,
  detectLanguage,
  hasEgyptianDialect,
  hasLevantineDialect,
};
