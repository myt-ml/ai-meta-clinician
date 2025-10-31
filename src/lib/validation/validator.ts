/**
 * Response Validator
 *
 * Validates and sanitizes clinical AI responses before delivery
 */

import type {
  ValidationResult,
  ValidationViolation,
  ViolationType,
  DisclaimerContext,
} from "./types";
import {
  HARMFUL_PATTERNS,
  SCOPE_VIOLATIONS,
  DISCLAIMER_TEMPLATES,
} from "./types";
import type { Language, RiskLevel } from "../store/types";

/**
 * Validate AI response for clinical appropriateness
 */
export function validateResponse(
  response: string,
  context: {
    riskLevel: RiskLevel;
    language: Language;
    isAssessment?: boolean;
    containsMedication?: boolean;
  }
): ValidationResult {
  const violations: ValidationViolation[] = [];
  let modifiedContent = response;

  // 1. Check for harmful patterns
  for (const filter of HARMFUL_PATTERNS) {
    const detected = detectPattern(response, filter.patterns);
    if (detected) {
      violations.push({
        type: filter.category,
        severity: filter.severity,
        description: `Detected ${filter.category.replace("_", " ")}`,
        detectedContent: detected,
        suggestion: `Remove or rephrase: "${detected}"`,
      });
    }
  }

  // 2. Check for scope violations
  for (const filter of SCOPE_VIOLATIONS) {
    const detected = detectPattern(response, filter.patterns);
    if (detected) {
      violations.push({
        type: filter.category,
        severity: filter.severity,
        description: `Response exceeds AI assistant scope`,
        detectedContent: detected,
        suggestion:
          "Clarify that you cannot provide professional medical services",
      });
    }
  }

  // 3. Check for missing disclaimers
  const disclaimerContext = determineDisclaimerContext(context);
  const hasDisclaimer = checkForDisclaimer(response, context.language);

  if (!hasDisclaimer && disclaimerContext !== "general") {
    violations.push({
      type: "missing_disclaimer",
      severity: "medium",
      description: `Missing ${disclaimerContext} disclaimer`,
      suggestion: `Add appropriate disclaimer for ${disclaimerContext} context`,
    });
  }

  // 4. Determine if valid
  const criticalViolations = violations.filter(
    (v) => v.severity === "critical"
  );
  const isValid = criticalViolations.length === 0;

  // 5. Add disclaimer if needed
  const requiresDisclaimer =
    !hasDisclaimer ||
    context.riskLevel === "critical" ||
    context.isAssessment === true;

  if (requiresDisclaimer) {
    const disclaimer = getDisclaimer(disclaimerContext, context.language);
    modifiedContent = applyDisclaimer(modifiedContent, disclaimer);
  }

  return {
    isValid,
    violations,
    riskLevel: context.riskLevel,
    requiresDisclaimer: requiresDisclaimer,
    suggestedDisclaimer: requiresDisclaimer
      ? getDisclaimer(disclaimerContext, context.language).text
      : undefined,
    modifiedContent: violations.length > 0 ? modifiedContent : undefined,
  };
}

/**
 * Detect pattern matches in text
 */
function detectPattern(text: string, patterns: string[]): string | null {
  const lowerText = text.toLowerCase();

  for (const pattern of patterns) {
    if (lowerText.includes(pattern.toLowerCase())) {
      // Find the actual phrase in the original text
      const index = lowerText.indexOf(pattern.toLowerCase());
      const endIndex = index + pattern.length;
      return text.substring(index, endIndex);
    }
  }

  return null;
}

/**
 * Determine appropriate disclaimer context
 */
function determineDisclaimerContext(context: {
  riskLevel: RiskLevel;
  isAssessment?: boolean;
  containsMedication?: boolean;
}): DisclaimerContext {
  if (context.riskLevel === "critical") return "crisis";
  if (context.isAssessment) return "assessment";
  if (context.containsMedication) return "medication";
  return "general";
}

/**
 * Check if response already contains a disclaimer
 */
function checkForDisclaimer(text: string, language: Language): boolean {
  const disclaimerKeywords: Record<Language, string[]> = {
    en: [
      "disclaimer",
      "note:",
      "important:",
      "i'm not a replacement",
      "ai assistant",
    ],
    ar: ["ملاحظة", "مهم", "لست بديلاً"],
    es: ["nota:", "importante:", "no soy un reemplazo"],
    fr: ["note :", "important :", "je ne remplace pas"],
    zh: ["注意", "重要", "不能替代"],
  };

  const keywords = disclaimerKeywords[language] || disclaimerKeywords.en;
  const lowerText = text.toLowerCase();

  return keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Get appropriate disclaimer template
 */
function getDisclaimer(
  context: DisclaimerContext,
  language: Language
): (typeof DISCLAIMER_TEMPLATES)[0] {
  const template = DISCLAIMER_TEMPLATES.find(
    (t) => t.context === context && t.language === language
  );

  if (template) return template;

  // Fallback to general disclaimer in same language
  const generalTemplate = DISCLAIMER_TEMPLATES.find(
    (t) => t.context === "general" && t.language === language
  );

  if (generalTemplate) return generalTemplate;

  // Final fallback to English general
  return DISCLAIMER_TEMPLATES.find(
    (t) => t.context === "general" && t.language === "en"
  )!;
}

/**
 * Apply disclaimer to response
 */
function applyDisclaimer(
  response: string,
  disclaimer: (typeof DISCLAIMER_TEMPLATES)[0]
): string {
  const { text, position } = disclaimer;

  switch (position) {
    case "prefix":
      return `${text}\n\n${response}`;
    case "suffix":
      return `${response}\n\n${text}`;
    case "both":
      return `${text}\n\n${response}\n\n${text}`;
    default:
      return response;
  }
}

/**
 * Sanitize response by removing/replacing harmful content
 */
export function sanitizeResponse(
  response: string,
  violations: ValidationViolation[]
): string {
  let sanitized = response;

  for (const violation of violations) {
    if (violation.detectedContent && violation.severity === "critical") {
      // Replace critical violations with safe placeholder
      const placeholder = "[Content removed for safety]";
      sanitized = sanitized.replace(
        new RegExp(violation.detectedContent, "gi"),
        placeholder
      );
    }
  }

  return sanitized;
}

/**
 * Check if response contains medical advice
 */
export function containsMedicalAdvice(response: string): boolean {
  const medicalPatterns = [
    "prescribe",
    "medication",
    "drug",
    "dosage",
    "treatment plan",
    "diagnosis",
    "medical condition",
  ];

  return detectPattern(response, medicalPatterns) !== null;
}

/**
 * Check if response is appropriate for crisis situation
 */
export function isCrisisAppropriate(response: string): boolean {
  const requiredElements = ["crisis", "emergency", "988", "911", "hotline"];
  const harmfulElements = ["calm down", "not that serious", "overreacting"];

  const hasRequired = requiredElements.some((element) =>
    response.toLowerCase().includes(element)
  );
  const hasHarmful = harmfulElements.some((element) =>
    response.toLowerCase().includes(element)
  );

  return hasRequired && !hasHarmful;
}

/**
 * Validate response length
 */
export function validateLength(
  response: string,
  minLength: number = 50,
  maxLength: number = 2000
): { isValid: boolean; reason?: string } {
  if (response.length < minLength) {
    return {
      isValid: false,
      reason: `Response too short (${response.length} chars, minimum ${minLength})`,
    };
  }

  if (response.length > maxLength) {
    return {
      isValid: false,
      reason: `Response too long (${response.length} chars, maximum ${maxLength})`,
    };
  }

  return { isValid: true };
}
