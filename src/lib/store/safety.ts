/**
 * Safety Middleware
 *
 * Validates all state mutations before they are applied.
 * Enforces clinical safety rules and escalation protocols.
 *
 * Safety Checks:
 * - Risk level consistency
 * - Triage category validation
 * - Message content screening
 * - PHQ score validation
 * - Session integrity
 */

import type {
  Message,
  RiskLevel,
  RiskFlag,
  TriageCategory,
  PHQState,
} from "./types";

/**
 * Crisis keywords for automatic escalation
 * These trigger immediate risk assessment
 */
const CRISIS_KEYWORDS = [
  // English
  "suicide",
  "kill myself",
  "end my life",
  "want to die",
  "no reason to live",
  "overdose",
  "self-harm",
  "hurt myself",
  "cut myself",
  "hang myself",
  // Arabic (transliterated)
  "انتحار",
  "اقتل نفسي",
  "اريد ان اموت",
  "لا سبب للعيش",
  // Spanish
  "suicidio",
  "matarme",
  "quiero morir",
  "sin razón para vivir",
  // French
  "suicide",
  "me tuer",
  "veux mourir",
  "aucune raison de vivre",
];

/**
 * High-risk keywords for elevated monitoring
 */
const HIGH_RISK_KEYWORDS = [
  "depressed",
  "hopeless",
  "worthless",
  "can't go on",
  "given up",
  "abuse",
  "violence",
  "hurt",
  "scared",
  "danger",
];

/**
 * Validate message content for crisis indicators
 */
export function validateMessageSafety(message: Message): {
  safe: boolean;
  riskLevel: RiskLevel;
  flags: string[];
} {
  const text = message.text.toLowerCase();
  const flags: string[] = [];

  // Check for crisis keywords
  const hasCrisisKeyword = CRISIS_KEYWORDS.some((keyword) =>
    text.includes(keyword.toLowerCase())
  );

  if (hasCrisisKeyword) {
    flags.push("crisis_keyword_detected");
    return {
      safe: false,
      riskLevel: "critical",
      flags,
    };
  }

  // Check for high-risk keywords
  const hasHighRiskKeyword = HIGH_RISK_KEYWORDS.some((keyword) =>
    text.includes(keyword.toLowerCase())
  );

  if (hasHighRiskKeyword) {
    flags.push("high_risk_keyword_detected");
    return {
      safe: true, // Can proceed but with monitoring
      riskLevel: "high",
      flags,
    };
  }

  return {
    safe: true,
    riskLevel: "low",
    flags,
  };
}

/**
 * Validate risk level consistency
 * Ensures risk levels only escalate, never de-escalate without review
 */
export function validateRiskLevelChange(
  currentLevel: RiskLevel,
  newLevel: RiskLevel
): {
  valid: boolean;
  reason?: string;
} {
  const riskHierarchy: Record<RiskLevel, number> = {
    low: 0,
    moderate: 1,
    high: 2,
    critical: 3,
  };

  // Risk can always escalate
  if (riskHierarchy[newLevel] >= riskHierarchy[currentLevel]) {
    return { valid: true };
  }

  // De-escalation requires explicit resolution
  // This prevents accidental risk level reduction
  return {
    valid: false,
    reason: "Risk de-escalation requires explicit flag resolution",
  };
}

/**
 * Validate triage category based on risk level
 */
export function validateTriageCategory(
  riskLevel: RiskLevel,
  category: TriageCategory
): {
  valid: boolean;
  suggestedCategory?: TriageCategory;
} {
  // Critical risk must be triaged as crisis
  if (riskLevel === "critical" && category !== "crisis") {
    return {
      valid: false,
      suggestedCategory: "crisis",
    };
  }

  // High risk should be urgent
  if (riskLevel === "high" && category === "routine") {
    return {
      valid: false,
      suggestedCategory: "urgent",
    };
  }

  return { valid: true };
}

/**
 * Validate PHQ-9 responses
 */
export function validatePHQResponse(
  questionIndex: number,
  response: number
): {
  valid: boolean;
  reason?: string;
} {
  // Check question index range
  if (questionIndex < 0 || questionIndex > 8) {
    return {
      valid: false,
      reason: "Invalid question index (must be 0-8)",
    };
  }

  // Check response range
  if (response < 0 || response > 3) {
    return {
      valid: false,
      reason: "Invalid response value (must be 0-3)",
    };
  }

  return { valid: true };
}

/**
 * Validate PHQ-9 completion
 */
export function validatePHQCompletion(phq: PHQState): {
  valid: boolean;
  reason?: string;
} {
  // Check all questions answered
  const unanswered = phq.responses.filter((r) => r === -1).length;

  if (unanswered > 0) {
    return {
      valid: false,
      reason: `${unanswered} questions remain unanswered`,
    };
  }

  return { valid: true };
}

/**
 * Calculate required escalation based on active risk flags
 */
export function calculateRequiredEscalation(riskFlags: RiskFlag[]): {
  riskLevel: RiskLevel;
  triageCategory: TriageCategory;
  requiresImmediate: boolean;
} {
  // Find highest active risk flag
  const activeFlags = riskFlags.filter((flag) => !flag.resolved);

  if (activeFlags.length === 0) {
    return {
      riskLevel: "low",
      triageCategory: "routine",
      requiresImmediate: false,
    };
  }

  const hasCritical = activeFlags.some((flag) => flag.level === "critical");
  const hasHigh = activeFlags.some((flag) => flag.level === "high");
  const hasModerate = activeFlags.some((flag) => flag.level === "moderate");

  if (hasCritical) {
    return {
      riskLevel: "critical",
      triageCategory: "crisis",
      requiresImmediate: true,
    };
  }

  if (hasHigh) {
    return {
      riskLevel: "high",
      triageCategory: "urgent",
      requiresImmediate: true,
    };
  }

  if (hasModerate) {
    return {
      riskLevel: "moderate",
      triageCategory: "urgent",
      requiresImmediate: false,
    };
  }

  return {
    riskLevel: "low",
    triageCategory: "routine",
    requiresImmediate: false,
  };
}

/**
 * Validate session state consistency
 */
export function validateSessionState(state: {
  messageCount: number;
  actualMessages: number;
  riskFlags: RiskFlag[];
  currentRiskLevel: RiskLevel;
  triageCategory: TriageCategory;
}): {
  valid: boolean;
  inconsistencies: string[];
} {
  const inconsistencies: string[] = [];

  // Check message count consistency
  if (state.messageCount !== state.actualMessages) {
    inconsistencies.push(
      `Message count mismatch: reported ${state.messageCount}, actual ${state.actualMessages}`
    );
  }

  // Check risk level matches flags
  const required = calculateRequiredEscalation(state.riskFlags);

  if (required.riskLevel !== state.currentRiskLevel) {
    inconsistencies.push(
      `Risk level inconsistency: should be ${required.riskLevel}, is ${state.currentRiskLevel}`
    );
  }

  if (required.triageCategory !== state.triageCategory) {
    inconsistencies.push(
      `Triage category inconsistency: should be ${required.triageCategory}, is ${state.triageCategory}`
    );
  }

  return {
    valid: inconsistencies.length === 0,
    inconsistencies,
  };
}

/**
 * Safety middleware wrapper for store actions
 *
 * Usage:
 * const safeAction = withSafetyCheck(action, validationFn);
 */
export function withSafetyCheck<T extends (...args: any[]) => any>(
  action: T,
  validate: (...args: Parameters<T>) => { valid: boolean; reason?: string }
): T {
  return ((...args: Parameters<T>) => {
    const validation = validate(...args);

    if (!validation.valid) {
      console.error("Safety check failed:", validation.reason);
      throw new Error(`Safety check failed: ${validation.reason}`);
    }

    return action(...args);
  }) as T;
}

/**
 * Export safety check functions
 */
export const SafetyChecks = {
  validateMessage: validateMessageSafety,
  validateRiskLevel: validateRiskLevelChange,
  validateTriage: validateTriageCategory,
  validatePHQResponse,
  validatePHQCompletion,
  calculateEscalation: calculateRequiredEscalation,
  validateSession: validateSessionState,
};
