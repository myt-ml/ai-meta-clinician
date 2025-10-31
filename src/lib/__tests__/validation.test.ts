/**
 * Validation Tests
 *
 * Tests for output validation and disclaimer enforcement
 */

import {
  validateResponse,
  enforceDisclaimer,
  sanitizeResponse,
  containsMedicalAdvice,
  isCrisisAppropriate,
  validateLength,
  hasDisclaimer,
  addEmergencyDisclaimer,
  addAssessmentDisclaimer,
  addMedicationDisclaimer,
} from "../validation";
import type { Language } from "../store/types";

export interface ValidationTest {
  name: string;
  fn: () => boolean | Promise<boolean>;
  category: "validation";
}

/**
 * Validation test suite
 */
export const validationTests: ValidationTest[] = [
  // Test 1: Detect harmful medical diagnosis
  {
    name: "Detect medical diagnosis violation",
    fn: () => {
      const response =
        "Based on your symptoms, you have clinical depression and should take antidepressants.";
      const result = validateResponse(response, {
        riskLevel: "high",
        language: "en",
      });

      return (
        !result.isValid &&
        result.violations.some((v) => v.type === "medical_diagnosis")
      );
    },
    category: "validation",
  },

  // Test 2: Detect medication advice violation
  {
    name: "Detect medication advice violation",
    fn: () => {
      const response =
        "You should take 50mg of Zoloft daily to manage your anxiety.";
      const result = validateResponse(response, {
        riskLevel: "low",
        language: "en",
      });

      return (
        !result.isValid &&
        result.violations.some((v) => v.type === "medication_advice")
      );
    },
    category: "validation",
  },

  // Test 3: Detect emergency dismissal
  {
    name: "Detect emergency dismissal",
    fn: () => {
      const response = "Just calm down, it's not that serious.";
      const result = validateResponse(response, {
        riskLevel: "critical",
        language: "en",
      });

      return (
        !result.isValid &&
        result.violations.some((v) => v.type === "emergency_dismissal")
      );
    },
    category: "validation",
  },

  // Test 4: Safe response passes validation
  {
    name: "Safe response passes validation",
    fn: () => {
      const response =
        "I hear that you're feeling overwhelmed. Let's talk about some coping strategies that might help.";
      const result = validateResponse(response, {
        riskLevel: "low",
        language: "en",
      });

      return result.isValid && result.violations.length === 0;
    },
    category: "validation",
  },

  // Test 5: Disclaimer enforcement for crisis
  {
    name: "Enforce crisis disclaimer",
    fn: () => {
      const response = "Please reach out to a professional for help.";
      const withDisclaimer = enforceDisclaimer(response, {
        riskLevel: "critical",
        language: "en",
        isCrisis: true,
      });

      return (
        withDisclaimer.includes("988") || withDisclaimer.includes("IMMEDIATE")
      );
    },
    category: "validation",
  },

  // Test 6: Disclaimer enforcement for assessment
  {
    name: "Enforce assessment disclaimer",
    fn: () => {
      const response = "Your PHQ-9 score suggests moderate depression.";
      const withDisclaimer = addAssessmentDisclaimer(response, "en");

      return (
        withDisclaimer.includes("screening tool") &&
        withDisclaimer.includes("not a diagnosis")
      );
    },
    category: "validation",
  },

  // Test 7: Detect medical advice presence
  {
    name: "Detect medical advice in content",
    fn: () => {
      const medical = "I recommend taking this medication for treatment.";
      const nonMedical = "Let's explore some coping strategies together.";

      return containsMedicalAdvice(medical) && !containsMedicalAdvice(nonMedical);
    },
    category: "validation",
  },

  // Test 8: Validate response length
  {
    name: "Validate response length constraints",
    fn: () => {
      const tooShort = "Hi.";
      const justRight =
        "I understand you're going through a difficult time. Let's talk about what you're experiencing.";
      const tooLong = "A".repeat(2500);

      const shortResult = validateLength(tooShort);
      const goodResult = validateLength(justRight);
      const longResult = validateLength(tooLong);

      return !shortResult.isValid && goodResult.isValid && !longResult.isValid;
    },
    category: "validation",
  },

  // Test 9: Crisis appropriateness check
  {
    name: "Check crisis response appropriateness",
    fn: () => {
      const appropriate =
        "If you're having thoughts of self-harm, please call 988 immediately.";
      const inappropriate =
        "Just calm down, it's probably not that serious.";

      return (
        isCrisisAppropriate(appropriate) && !isCrisisAppropriate(inappropriate)
      );
    },
    category: "validation",
  },

  // Test 10: Sanitize harmful content
  {
    name: "Sanitize critical violations",
    fn: () => {
      const violations = [
        {
          type: "medical_diagnosis" as const,
          severity: "critical" as const,
          description: "Medical diagnosis detected",
          detectedContent: "you have depression",
          suggestion: "Remove diagnosis",
        },
      ];

      const response =
        "Based on your symptoms, you have depression and need medication.";
      const sanitized = sanitizeResponse(response, violations);

      return sanitized.includes("[Content removed for safety]");
    },
    category: "validation",
  },

  // Test 11: Has disclaimer detection
  {
    name: "Detect existing disclaimers",
    fn: () => {
      const withDisclaimer =
        "Important: I'm an AI assistant and cannot replace professional care.";
      const without = "Let's talk about your feelings.";

      return hasDisclaimer(withDisclaimer, "en") && !hasDisclaimer(without, "en");
    },
    category: "validation",
  },

  // Test 12: Multi-language disclaimer support
  {
    name: "Support multi-language disclaimers",
    fn: () => {
      const response = "Let's discuss your concerns.";

      const languages: Language[] = ["en", "ar", "es", "fr", "zh"];
      const results = languages.map((lang) => {
        const withDisclaimer = enforceDisclaimer(response, {
          riskLevel: "low",
          language: lang,
        });
        return withDisclaimer.length > response.length;
      });

      return results.every((r) => r === true);
    },
    category: "validation",
  },

  // Test 13: Emergency disclaimer content
  {
    name: "Emergency disclaimer includes hotlines",
    fn: () => {
      const response = "Please seek help.";
      const withEmergency = addEmergencyDisclaimer(response, "en");

      return (
        withEmergency.includes("988") &&
        withEmergency.includes("911") &&
        withEmergency.includes("741741")
      );
    },
    category: "validation",
  },

  // Test 14: Medication disclaimer clarity
  {
    name: "Medication disclaimer is clear",
    fn: () => {
      const response = "Some people take medications for depression.";
      const withMedDisclaimer = addMedicationDisclaimer(response, "en");

      return (
        withMedDisclaimer.includes("cannot prescribe") &&
        withMedDisclaimer.includes("licensed healthcare provider")
      );
    },
    category: "validation",
  },

  // Test 15: Detect guarantee claims
  {
    name: "Detect guarantee/cure claims",
    fn: () => {
      const response =
        "This therapy will definitely cure your anxiety within 2 weeks.";
      const result = validateResponse(response, {
        riskLevel: "low",
        language: "en",
      });

      return (
        !result.isValid &&
        result.violations.some((v) => v.type === "guarantee_claim")
      );
    },
    category: "validation",
  },

  // Test 16: Detect personal info requests
  {
    name: "Detect personal information requests",
    fn: () => {
      const response =
        "Can you provide your home address and phone number?";
      const result = validateResponse(response, {
        riskLevel: "low",
        language: "en",
      });

      return (
        !result.isValid &&
        result.violations.some((v) => v.type === "personal_info_request")
      );
    },
    category: "validation",
  },

  // Test 17: Validate risk level propagation
  {
    name: "Risk level propagates to validation result",
    fn: () => {
      const response = "Let's explore coping strategies together.";
      const criticalResult = validateResponse(response, {
        riskLevel: "critical",
        language: "en",
      });
      const lowResult = validateResponse(response, {
        riskLevel: "low",
        language: "en",
      });

      return (
        criticalResult.riskLevel === "critical" &&
        lowResult.riskLevel === "low" &&
        criticalResult.requiresDisclaimer &&
        !lowResult.requiresDisclaimer
      );
    },
    category: "validation",
  },

  // Test 18: Scope violation detection
  {
    name: "Detect scope violations",
    fn: () => {
      const response =
        "As your therapist, I diagnose you with major depressive disorder.";
      const result = validateResponse(response, {
        riskLevel: "low",
        language: "en",
      });

      return (
        !result.isValid &&
        result.violations.some((v) => v.type === "scope_violation")
      );
    },
    category: "validation",
  },
];

/**
 * Run all validation tests
 */
export async function runValidationTests(): Promise<{
  passed: number;
  failed: number;
  results: Array<{ name: string; passed: boolean; error?: string }>;
}> {
  const results: Array<{ name: string; passed: boolean; error?: string }> = [];
  let passed = 0;
  let failed = 0;

  for (const test of validationTests) {
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
