/**
 * Automated Triage Engine Test Runner
 *
 * Tests the mhGAP triage engine against the full synthetic dataset (60 cases)
 * Validates accuracy, safety flags, and multilingual support
 *
 * Usage: npx tsx scripts/testTriage.ts
 */

import { triage, type Language } from "../src/lib/mhgap/triageEngine";
import syntheticCases from "../src/data/syntheticCases.json";

interface TestCase {
  id: string;
  language: "en" | "ar_egy" | "ar_msa";
  input: string;
  expectedCategory: string[];
  expectedRiskLevel: "low" | "moderate" | "high" | "critical";
  expectedFlags: string[];
  metadata?: {
    phq9Score?: number;
    gad7Score?: number;
    age?: number;
    gender?: string;
  };
}

interface TestResult {
  testId: string;
  passed: boolean;
  categoryMatch: boolean;
  riskMatch: boolean;
  flagMatch: boolean;
  actualCategory: string[];
  actualRiskLevel: string;
  actualFlags: string[];
  expectedCategory: string[];
  expectedRiskLevel: string;
  expectedFlags: string[];
  responseTime: number;
}

interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  categoryAccuracy: number;
  riskAccuracy: number;
  flagAccuracy: number;
  avgResponseTime: number;
  results: TestResult[];
}

/**
 * Run a single test case
 */
async function runTestCase(testCase: TestCase): Promise<TestResult> {
  const startTime = performance.now();

  // Run triage
  const result = await triage(testCase.input, testCase.language as Language);

  const endTime = performance.now();
  const responseTime = endTime - startTime;

  // Extract actual values
  const actualCategory = result.category;
  const actualRiskLevel = result.riskLevel;
  const actualFlags: string[] = [];

  if (result.flagForReview) {
    actualFlags.push("flagged_for_review");
  }
  if (result.riskLevel === "critical") {
    actualFlags.push("critical_risk");
  }

  // Check matches
  const categoryMatch = testCase.expectedCategory.every((cat) =>
    actualCategory.includes(cat)
  );

  const riskMatch = actualRiskLevel === testCase.expectedRiskLevel;

  const flagMatch =
    testCase.expectedFlags.length === 0 ||
    testCase.expectedFlags.every((flag) => actualFlags.includes(flag));

  const passed = categoryMatch && riskMatch && flagMatch;

  return {
    testId: testCase.id,
    passed,
    categoryMatch,
    riskMatch,
    flagMatch,
    actualCategory,
    actualRiskLevel,
    actualFlags,
    expectedCategory: testCase.expectedCategory,
    expectedRiskLevel: testCase.expectedRiskLevel,
    expectedFlags: testCase.expectedFlags,
    responseTime,
  };
}

/**
 * Run all test cases
 */
async function runAllTests(): Promise<TestSummary> {
  console.log("🧪 Starting Triage Engine Test Suite\n");

  // Extract samples from JSON structure
  const testCases = (syntheticCases as any).samples.map((sample: any) => ({
    id: sample.id,
    language: sample.language,
    input: sample.input,
    expectedCategory: sample.expected_category,
    expectedRiskLevel: sample.expected_risk_level,
    expectedFlags: sample.expected_flag ? ["flagged_for_review"] : [],
    metadata: {
      phq9Score: sample.phq9_equivalent,
      gad7Score: sample.gad7_equivalent,
    },
  })) as TestCase[];

  console.log(`Total test cases: ${testCases.length}\n`);

  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;
  let totalResponseTime = 0;
  let categoryCorrect = 0;
  let riskCorrect = 0;
  let flagCorrect = 0;

  // Run tests
  for (const testCase of testCases) {
    const result = await runTestCase(testCase);
    results.push(result);

    if (result.passed) {
      passed++;
      console.log(
        `✅ ${result.testId}: PASS (${result.responseTime.toFixed(1)}ms)`
      );
    } else {
      failed++;
      console.log(`❌ ${result.testId}: FAIL`);

      if (!result.categoryMatch) {
        console.log(
          `   Category mismatch: expected ${result.expectedCategory.join(
            ", "
          )} but got ${result.actualCategory.join(", ")}`
        );
      }
      if (!result.riskMatch) {
        console.log(
          `   Risk level mismatch: expected ${result.expectedRiskLevel} but got ${result.actualRiskLevel}`
        );
      }
      if (!result.flagMatch) {
        console.log(
          `   Flag mismatch: expected ${result.expectedFlags.join(
            ", "
          )} but got ${result.actualFlags.join(", ")}`
        );
      }
    }

    if (result.categoryMatch) categoryCorrect++;
    if (result.riskMatch) riskCorrect++;
    if (result.flagMatch) flagCorrect++;
    totalResponseTime += result.responseTime;
  }

  // Calculate summary
  const totalTests = testCases.length;
  const categoryAccuracy = (categoryCorrect / totalTests) * 100;
  const riskAccuracy = (riskCorrect / totalTests) * 100;
  const flagAccuracy = (flagCorrect / totalTests) * 100;
  const avgResponseTime = totalResponseTime / totalTests;

  return {
    totalTests,
    passed,
    failed,
    categoryAccuracy,
    riskAccuracy,
    flagAccuracy,
    avgResponseTime,
    results,
  };
}

/**
 * Print test summary
 */
function printSummary(summary: TestSummary): void {
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Tests:     ${summary.totalTests}`);
  console.log(
    `Passed:          ${summary.passed} (${(
      (summary.passed / summary.totalTests) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `Failed:          ${summary.failed} (${(
      (summary.failed / summary.totalTests) *
      100
    ).toFixed(1)}%)`
  );
  console.log("\nAccuracy Metrics:");
  console.log(`  Category:      ${summary.categoryAccuracy.toFixed(1)}%`);
  console.log(`  Risk Level:    ${summary.riskAccuracy.toFixed(1)}%`);
  console.log(`  Safety Flags:  ${summary.flagAccuracy.toFixed(1)}%`);
  console.log(`\nPerformance:`);
  console.log(`  Avg Response:  ${summary.avgResponseTime.toFixed(1)}ms`);
  console.log("=".repeat(60));

  // Print failed tests details
  const failedTests = summary.results.filter((r) => !r.passed);
  if (failedTests.length > 0) {
    console.log("\n❌ FAILED TESTS DETAILS:\n");
    failedTests.forEach((test) => {
      console.log(`Test ID: ${test.testId}`);
      console.log(
        `  Expected: ${test.expectedCategory.join(", ")} | ${
          test.expectedRiskLevel
        }`
      );
      console.log(
        `  Actual:   ${test.actualCategory.join(", ")} | ${
          test.actualRiskLevel
        }`
      );
      console.log("");
    });
  }

  // Overall verdict
  console.log("\n" + "=".repeat(60));
  if (summary.passed === summary.totalTests) {
    console.log("🎉 ALL TESTS PASSED! Triage engine is working perfectly.");
  } else if (summary.categoryAccuracy >= 85 && summary.riskAccuracy >= 90) {
    console.log(
      "✅ ACCEPTABLE PERFORMANCE (≥85% category, ≥90% risk accuracy)"
    );
  } else {
    console.log(
      "⚠️  NEEDS IMPROVEMENT (target: ≥85% category, ≥90% risk accuracy)"
    );
  }
  console.log("=".repeat(60) + "\n");
}

/**
 * Export results to JSON
 */
function exportResults(summary: TestSummary): void {
  const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
  const filename = `test-results-${timestamp}.json`;

  try {
    const fs = require("fs");
    const path = require("path");
    const outputPath = path.join(__dirname, "../docs", filename);

    fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
    console.log(`📄 Results exported to: docs/${filename}\n`);
  } catch (error) {
    console.error("Failed to export results:", error);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const summary = await runAllTests();
    printSummary(summary);
    exportResults(summary);

    // Exit with appropriate code
    process.exit(summary.passed === summary.totalTests ? 0 : 1);
  } catch (error) {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  }
}

// Run tests
main();
