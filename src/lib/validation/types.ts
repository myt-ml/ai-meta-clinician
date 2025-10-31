/**
 * Clinical Output Validation Types
 *
 * Content filtering and validation for clinical AI responses
 */

import type { Language, RiskLevel } from "../store/types";

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  violations: ValidationViolation[];
  riskLevel?: RiskLevel;
  requiresDisclaimer: boolean;
  suggestedDisclaimer?: string;
  modifiedContent?: string; // Content after sanitization
}

/**
 * Validation violation
 */
export interface ValidationViolation {
  type: ViolationType;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  detectedContent?: string;
  suggestion?: string;
}

/**
 * Types of validation violations
 */
export type ViolationType =
  | "harmful_content"
  | "medical_diagnosis"
  | "medication_advice"
  | "emergency_dismissal"
  | "guarantee_claim"
  | "personal_info_request"
  | "scope_violation"
  | "inappropriate_tone"
  | "missing_disclaimer"
  | "unsafe_recommendation";

/**
 * Content filter patterns
 */
export interface ContentFilter {
  category: ViolationType;
  patterns: string[];
  severity: ValidationViolation["severity"];
  replacement?: string;
}

/**
 * Disclaimer template
 */
export interface DisclaimerTemplate {
  id: string;
  context: DisclaimerContext;
  language: Language;
  text: string;
  position: "prefix" | "suffix" | "both";
}

/**
 * Disclaimer context
 */
export type DisclaimerContext =
  | "general"
  | "crisis"
  | "assessment"
  | "medication"
  | "diagnosis"
  | "emergency";

/**
 * Harmful content patterns (things AI should never say)
 */
export const HARMFUL_PATTERNS: ContentFilter[] = [
  {
    category: "medical_diagnosis",
    severity: "critical",
    patterns: [
      "you have",
      "you are diagnosed with",
      "i diagnose you",
      "you suffer from",
      "you definitely have",
    ],
  },
  {
    category: "medication_advice",
    severity: "critical",
    patterns: [
      "take this medication",
      "stop taking",
      "increase your dose",
      "decrease your dose",
      "you should take",
      "i recommend taking",
    ],
  },
  {
    category: "emergency_dismissal",
    severity: "critical",
    patterns: [
      "you don't need emergency help",
      "it's not that serious",
      "you're overreacting",
      "calm down, you're fine",
      "don't call 911",
      "you don't need a doctor",
    ],
  },
  {
    category: "guarantee_claim",
    severity: "high",
    patterns: [
      "i guarantee",
      "this will definitely work",
      "you will be cured",
      "guaranteed to help",
      "100% effective",
      "you'll definitely feel better",
    ],
  },
  {
    category: "personal_info_request",
    severity: "high",
    patterns: [
      "what is your full name",
      "what's your address",
      "tell me your social security",
      "give me your phone number",
      "where do you live",
    ],
  },
];

/**
 * Scope violation patterns (out of bounds for mental health support)
 */
export const SCOPE_VIOLATIONS: ContentFilter[] = [
  {
    category: "scope_violation",
    severity: "high",
    patterns: [
      "i can prescribe",
      "i'll write a prescription",
      "here's your treatment plan",
      "as your therapist",
      "in our therapy session",
    ],
  },
];

/**
 * Disclaimer templates by language and context
 */
export const DISCLAIMER_TEMPLATES: DisclaimerTemplate[] = [
  // English disclaimers
  {
    id: "general_en",
    context: "general",
    language: "en",
    text: "**Note:** I'm an AI assistant providing supportive information only. I'm not a replacement for professional mental health care.",
    position: "suffix",
  },
  {
    id: "crisis_en",
    context: "crisis",
    language: "en",
    text: "**IMPORTANT:** If you're in immediate danger, please contact emergency services (911) or a crisis hotline (988 in the US, Crisis Text Line: text HOME to 741741).",
    position: "prefix",
  },
  {
    id: "assessment_en",
    context: "assessment",
    language: "en",
    text: "**Disclaimer:** This is a screening tool, not a diagnosis. Please consult a mental health professional for a comprehensive evaluation.",
    position: "suffix",
  },
  {
    id: "medication_en",
    context: "medication",
    language: "en",
    text: "**Medication Notice:** Never start, stop, or change medications without consulting your healthcare provider first.",
    position: "both",
  },

  // Arabic disclaimers
  {
    id: "general_ar",
    context: "general",
    language: "ar",
    text: "**ملاحظة:** أنا مساعد ذكاء اصطناعي أقدم معلومات داعمة فقط. لست بديلاً عن الرعاية الصحية النفسية المهنية.",
    position: "suffix",
  },
  {
    id: "crisis_ar",
    context: "crisis",
    language: "ar",
    text: "**مهم:** إذا كنت في خطر فوري، يرجى الاتصال بخدمات الطوارئ أو خط المساعدة في الأزمات.",
    position: "prefix",
  },

  // Spanish disclaimers
  {
    id: "general_es",
    context: "general",
    language: "es",
    text: "**Nota:** Soy un asistente de IA que proporciona información de apoyo únicamente. No soy un reemplazo para la atención profesional de salud mental.",
    position: "suffix",
  },
  {
    id: "crisis_es",
    context: "crisis",
    language: "es",
    text: "**IMPORTANTE:** Si está en peligro inmediato, comuníquese con los servicios de emergencia (911) o una línea de crisis (988 en EE.UU.).",
    position: "prefix",
  },

  // French disclaimers
  {
    id: "general_fr",
    context: "general",
    language: "fr",
    text: "**Note :** Je suis un assistant IA fournissant uniquement des informations de soutien. Je ne remplace pas les soins professionnels de santé mentale.",
    position: "suffix",
  },

  // Chinese disclaimers
  {
    id: "general_zh",
    context: "general",
    language: "zh",
    text: "**注意：** 我是一个AI助手，仅提供支持性信息。我不能替代专业的心理健康护理。",
    position: "suffix",
  },
];
