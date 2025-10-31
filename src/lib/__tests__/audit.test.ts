/**
 * Audit Logging Tests
 *
 * Tests for HIPAA-compliant audit trail
 */

import type { AuditEvent } from "../audit/types";

/**
 * Run all audit tests
 */
export async function runAuditTests(): Promise<void> {
  console.log("🧪 Running Audit Layer Tests...\n");

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Audit module structure
  try {
    console.log("✓ Audit Module Structure");
    const auditModule = await import("../audit");
    if (
      !auditModule.logAudit ||
      !auditModule.queryAuditLogs ||
      !auditModule.exportAuditLogs
    ) {
      throw new Error("Missing required exports");
    }
    passedTests++;
  } catch (error) {
    console.error("✗ Audit Module Structure:", error);
    failedTests++;
  }

  // Test 2: Audit event creation
  try {
    console.log("✓ Audit Event Creation");
    const { logAudit } = await import("../audit");

    await logAudit("session", "test_create", {
      severity: "info",
      description: "Test audit event",
      sessionId: "test-session-1",
      metadata: { test: true },
    });

    passedTests++;
  } catch (error) {
    console.error("✗ Audit Event Creation:", error);
    failedTests++;
  }

  // Test 3: Clinical decision logging
  try {
    console.log("✓ Clinical Decision Logging");
    const { logClinicalDecision } = await import("../audit");

    await logClinicalDecision(
      {
        type: "assessment",
        reasoning: "Patient shows symptoms of moderate anxiety",
        confidence: 0.75,
        basedOn: ["GAD-7 score", "Conversation analysis"],
      },
      "test-session-2"
    );

    passedTests++;
  } catch (error) {
    console.error("✗ Clinical Decision Logging:", error);
    failedTests++;
  }

  // Test 4: Safety escalation logging
  try {
    console.log("✓ Safety Escalation Logging");
    const { logSafetyEscalation } = await import("../audit");

    await logSafetyEscalation("high", "suicide ideation keywords", "test-session-3");

    passedTests++;
  } catch (error) {
    console.error("✗ Safety Escalation Logging:", error);
    failedTests++;
  }

  // Test 5: Audit query filtering
  try {
    console.log("✓ Audit Query Filtering");
    const { queryAuditLogs, flushAuditLogs } = await import("../audit");

    // Flush pending events first
    await flushAuditLogs();

    // Wait a bit for persistence
    await new Promise((resolve) => setTimeout(resolve, 100));

    const results = await queryAuditLogs({
      category: ["session", "safety"],
      severity: ["info", "warning", "critical"],
    });

    if (!Array.isArray(results)) {
      throw new Error("Query should return array");
    }

    passedTests++;
  } catch (error) {
    console.error("✗ Audit Query Filtering:", error);
    failedTests++;
  }

  // Test 6: Audit export
  try {
    console.log("✓ Audit Export");
    const { exportAuditLogs } = await import("../audit");

    const exportData = await exportAuditLogs({
      category: ["session"],
    });

    if (!exportData.exportId || !exportData.events || !exportData.summary) {
      throw new Error("Export missing required fields");
    }

    if (typeof exportData.summary.totalEvents !== "number") {
      throw new Error("Summary should include total event count");
    }

    passedTests++;
  } catch (error) {
    console.error("✗ Audit Export:", error);
    failedTests++;
  }

  // Test 7: Compliance levels
  try {
    console.log("✓ Compliance Level Tagging");
    const { logAudit } = await import("../audit");

    await logAudit("assessment", "phq9_complete", {
      severity: "info",
      complianceLevel: "hipaa",
      description: "PHQ-9 assessment completed",
      sessionId: "test-session-4",
      piiPresent: false,
    });

    passedTests++;
  } catch (error) {
    console.error("✗ Compliance Level Tagging:", error);
    failedTests++;
  }

  // Test 8: Event correlation
  try {
    console.log("✓ Event Correlation");
    const { logAudit } = await import("../audit");

    const correlationId = `corr_${Date.now()}`;

    await logAudit("message", "user_input", {
      sessionId: "test-session-5",
      correlationId,
    });

    await logAudit("message", "ai_response", {
      sessionId: "test-session-5",
      correlationId,
    });

    passedTests++;
  } catch (error) {
    console.error("✗ Event Correlation:", error);
    failedTests++;
  }

  // Summary
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Audit Tests: ${passedTests} passed, ${failedTests} failed`);
  console.log(`${"=".repeat(50)}\n`);

  if (failedTests > 0) {
    throw new Error(`${failedTests} audit test(s) failed`);
  }
}
