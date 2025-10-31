/**
 * Clinical Reasoning Engine
 *
 * Hybrid LLM + Offline Reasoning Architecture
 * - Attempts LLM inference first (WebLLM or Cloud)
 * - Gracefully falls back to rule-based mhGAP protocols
 * - Maintains clinical safety regardless of mode
 * - Validates all outputs before delivery
 */

import type { Message, ClinicalState, Language } from "../store/types";
import {
  assessMessage,
  generateClinicalResponse as generateMhgapResponse,
  interpretPHQ9,
  interpretGAD7,
  ClinicalAssessment,
} from "./mhgap";
import {
  generateResponse as generateLLMResponse,
  isModelReady,
  type LLMResponse,
} from "../llm";
import {
  validateResponse,
  enforceDisclaimer,
  sanitizeResponse,
  containsMedicalAdvice,
} from "../validation";
import {
  routeInference,
  initializeRouter,
  isOllamaAvailable,
  runLocalSafetyCheck,
} from "../llm/router";

/**
 * Reasoning result
 */
export interface ReasoningResult {
  response: string;
  assessment?: ClinicalAssessment; // Optional for LLM responses
  shouldEscalate: boolean;
  actionRequired: "emergency" | "urgent" | "routine" | "none";
  metadata: {
    reasoningMode: "offline" | "llm" | "hybrid";
    provider?: string;
    confidence: number;
    timestamp: number;
    fallbackReason?: string;
  };
}

/**
 * Generate clinical response using hybrid LLM + offline architecture
 *
 * Flow:
 * 1. Safety check (always runs offline for crisis detection)
 * 2. Try LLM if available
 * 3. Fall back to offline reasoning if LLM fails
 */
export async function generateClinicalResponse(
  userMessage: string,
  clinicalState: ClinicalState
): Promise<ReasoningResult> {
  const { messages, currentRiskLevel, language, llm } = clinicalState;

  // STEP 1: Always run offline safety assessment first
  const safetyAssessment = assessMessage(
    userMessage,
    messages,
    currentRiskLevel
  );

  // STEP 1a: Optional fast local safety check with Ollama (if available)
  try {
    const localSafetyCheck = await runLocalSafetyCheck(userMessage);
    if (!localSafetyCheck.safe) {
      console.warn("Local safety check flagged:", localSafetyCheck.reason);
      // Upgrade risk level if needed
      if (currentRiskLevel === "low") {
        safetyAssessment.riskLevel = "high";
      }
    }
  } catch (error) {
    // Ignore safety check failures
  }

  // If crisis detected, ALWAYS use offline protocol (deterministic, immediate)
  if (safetyAssessment.requiresEmergency) {
    return generateOfflineResponse(userMessage, clinicalState);
  }

  // STEP 2: Try LLM (router will try Ollama first, then WebLLM)
  if (isModelReady() && !llm.fallbackActive && llm.status === "ready") {
    try {
      // Use router for intelligent model selection
      const llmResponse = await routeInference(
        userMessage,
        messages,
        currentRiskLevel,
        language,
        "general", // task type
        {
          preferLocal: true, // Prefer Ollama over WebLLM
          allowFallback: true, // Allow WebLLM fallback
          timeout: 30000,
        }
      );

      // Determine action required based on current risk and assessment
      let actionRequired: ReasoningResult["actionRequired"] = "none";
      if (currentRiskLevel === "critical") {
        actionRequired = "emergency";
      } else if (currentRiskLevel === "high") {
        actionRequired = "urgent";
      } else if (safetyAssessment.protocol.referralNeeded) {
        actionRequired = "routine";
      }

      return {
        response: llmResponse.content,
        assessment: safetyAssessment, // Still include safety assessment
        shouldEscalate:
          safetyAssessment.riskLevel === "high" ||
          safetyAssessment.riskLevel === "critical",
        actionRequired,
        metadata: {
          reasoningMode: "llm",
          provider: llmResponse.provider,
          confidence: llmResponse.confidence ?? 0.8,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      // LLM failed, fall through to offline reasoning
      console.warn("LLM generation failed, using offline fallback:", error);
    }
  }

  // STEP 3: Use offline reasoning (either LLM unavailable or failed)
  return generateOfflineResponse(userMessage, clinicalState);
}

/**
 * Generate clinical response using offline reasoning
 */
export function generateOfflineResponse(
  userMessage: string,
  clinicalState: ClinicalState
): ReasoningResult {
  const { messages, currentRiskLevel, language } = clinicalState;

  // 1. ASSESS USER MESSAGE
  const assessment = assessMessage(userMessage, messages, currentRiskLevel);

  // 2. GENERATE RESPONSE
  let response = generateMhgapResponse(assessment, language);

  // 2a. VALIDATE OFFLINE RESPONSE
  const validation = validateResponse(response, {
    riskLevel: assessment.riskLevel,
    language,
    isAssessment: false,
    containsMedication: containsMedicalAdvice(response),
  });

  // Apply validation changes
  if (validation.modifiedContent) {
    response = validation.modifiedContent;
  }

  // 2b. ENFORCE DISCLAIMER
  response = enforceDisclaimer(response, {
    riskLevel: assessment.riskLevel,
    language,
    isCrisis: assessment.requiresEmergency,
    containsMedication: containsMedicalAdvice(response),
  });

  // 3. DETERMINE ACTION REQUIRED
  let actionRequired: ReasoningResult["actionRequired"] = "none";
  if (assessment.requiresEmergency) {
    actionRequired = "emergency";
  } else if (
    assessment.riskLevel === "high" ||
    assessment.riskLevel === "critical"
  ) {
    actionRequired = "urgent";
  } else if (assessment.protocol.referralNeeded) {
    actionRequired = "routine";
  }

  // 4. DETERMINE IF ESCALATION NEEDED
  const shouldEscalate =
    assessment.riskLevel === "critical" ||
    (assessment.riskLevel === "high" &&
      currentRiskLevel !== "high" &&
      currentRiskLevel !== "critical");

  return {
    response,
    assessment,
    shouldEscalate,
    actionRequired,
    metadata: {
      reasoningMode: "offline",
      confidence: assessment.confidence,
      timestamp: Date.now(),
    },
  };
}

/**
 * Interpret PHQ-9 assessment
 */
export function interpretPHQ9Assessment(
  responses: number[],
  language: Language = "en"
): {
  totalScore: number;
  interpretation: ReturnType<typeof interpretPHQ9>;
  response: string;
} {
  const totalScore = responses.reduce((sum, score) => sum + score, 0);
  const interpretation = interpretPHQ9(totalScore);

  const templates = {
    en: `**PHQ-9 Assessment Results**\n\nTotal Score: ${totalScore}/27\nSeverity: ${
      interpretation.severity
    }\n\n**Recommendations:**\n${interpretation.recommendations
      .map((r) => `• ${r}`)
      .join(
        "\n"
      )}\n\nRemember: This is a screening tool, not a diagnosis. A mental health professional can provide a comprehensive evaluation.`,
    ar: `**نتائج تقييم PHQ-9**\n\nالمجموع: ${totalScore}/27\nالشدة: ${
      interpretation.severity
    }\n\n**التوصيات:**\n${interpretation.recommendations
      .map((r) => `• ${r}`)
      .join(
        "\n"
      )}\n\nتذكر: هذه أداة فحص وليست تشخيصاً. يمكن لأخصائي الصحة النفسية تقديم تقييم شامل.`,
    es: `**Resultados de la Evaluación PHQ-9**\n\nPuntuación Total: ${totalScore}/27\nGravedad: ${
      interpretation.severity
    }\n\n**Recomendaciones:**\n${interpretation.recommendations
      .map((r) => `• ${r}`)
      .join(
        "\n"
      )}\n\nRecuerda: Esta es una herramienta de detección, no un diagnóstico. Un profesional de salud mental puede proporcionar una evaluación integral.`,
    fr: `**Résultats de l'Évaluation PHQ-9**\n\nScore Total: ${totalScore}/27\nGravité: ${
      interpretation.severity
    }\n\n**Recommandations:**\n${interpretation.recommendations
      .map((r) => `• ${r}`)
      .join(
        "\n"
      )}\n\nN'oubliez pas: Ceci est un outil de dépistage, pas un diagnostic. Un professionnel de la santé mentale peut fournir une évaluation complète.`,
    zh: `**PHQ-9评估结果**\n\n总分: ${totalScore}/27\n严重程度: ${
      interpretation.severity
    }\n\n**建议:**\n${interpretation.recommendations
      .map((r) => `• ${r}`)
      .join(
        "\n"
      )}\n\n请记住：这是一个筛查工具，而不是诊断。心理健康专业人士可以提供全面的评估。`,
  };

  return {
    totalScore,
    interpretation,
    response: templates[language] || templates.en,
  };
}

/**
 * Interpret GAD-7 assessment
 */
export function interpretGAD7Assessment(
  responses: number[],
  language: Language = "en"
): {
  totalScore: number;
  interpretation: ReturnType<typeof interpretGAD7>;
  response: string;
} {
  const totalScore = responses.reduce((sum, score) => sum + score, 0);
  const interpretation = interpretGAD7(totalScore);

  const templates = {
    en: `**GAD-7 Assessment Results**\n\nTotal Score: ${totalScore}/21\nSeverity: ${
      interpretation.severity
    }\n\n**Recommendations:**\n${interpretation.recommendations
      .map((r) => `• ${r}`)
      .join(
        "\n"
      )}\n\nRemember: This is a screening tool, not a diagnosis. A mental health professional can provide a comprehensive evaluation.`,
    ar: `**نتائج تقييم GAD-7**\n\nالمجموع: ${totalScore}/21\nالشدة: ${
      interpretation.severity
    }\n\n**التوصيات:**\n${interpretation.recommendations
      .map((r) => `• ${r}`)
      .join(
        "\n"
      )}\n\nتذكر: هذه أداة فحص وليست تشخيصاً. يمكن لأخصائي الصحة النفسية تقديم تقييم شامل.`,
    es: `**Resultados de la Evaluación GAD-7**\n\nPuntuación Total: ${totalScore}/21\nGravedad: ${
      interpretation.severity
    }\n\n**Recomendaciones:**\n${interpretation.recommendations
      .map((r) => `• ${r}`)
      .join(
        "\n"
      )}\n\nRecuerda: Esta es una herramienta de detección, no un diagnóstico. Un profesional de salud mental puede proporcionar una evaluación integral.`,
    fr: `**Résultats de l'Évaluation GAD-7**\n\nScore Total: ${totalScore}/21\nGravité: ${
      interpretation.severity
    }\n\n**Recommandations:**\n${interpretation.recommendations
      .map((r) => `• ${r}`)
      .join(
        "\n"
      )}\n\nN'oubliez pas: Ceci est un outil de dépistage, pas un diagnostic. Un professionnel de la santé mentale peut fournir une évaluation complète.`,
    zh: `**GAD-7评估结果**\n\n总分: ${totalScore}/21\n严重程度: ${
      interpretation.severity
    }\n\n**建议:**\n${interpretation.recommendations
      .map((r) => `• ${r}`)
      .join(
        "\n"
      )}\n\n请记住：这是一个筛查工具，而不是诊断。心理健康专业人士可以提供全面的评估。`,
  };

  return {
    totalScore,
    interpretation,
    response: templates[language] || templates.en,
  };
}

/**
 * Generate generic supportive response (when no patterns match)
 */
export function generateSupportiveResponse(language: Language = "en"): string {
  const templates = {
    en: "I'm here to listen and support you. Can you tell me more about what you're experiencing? It helps me understand how I can best support you.",
    ar: "أنا هنا للاستماع ودعمك. هل يمكنك إخباري المزيد عما تمر به؟ هذا يساعدني على فهم كيف يمكنني دعمك بشكل أفضل.",
    es: "Estoy aquí para escuchar y apoyarte. ¿Puedes contarme más sobre lo que estás experimentando? Me ayuda a entender cómo puedo apoyarte mejor.",
    fr: "Je suis ici pour écouter et vous soutenir. Pouvez-vous m'en dire plus sur ce que vous vivez? Cela m'aide à comprendre comment je peux mieux vous soutenir.",
    zh: "我在这里倾听和支持你。你能告诉我更多关于你正在经历的事情吗？这有助于我了解如何更好地支持你。",
  };

  return templates[language] || templates.en;
}

/**
 * Export all reasoning functions
 */
export const OfflineReasoning = {
  generateOfflineResponse,
  interpretPHQ9Assessment,
  interpretGAD7Assessment,
  generateSupportiveResponse,
};
