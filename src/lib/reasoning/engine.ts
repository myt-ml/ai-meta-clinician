/**
 * Offline Fallback Reasoning Engine
 *
 * Provides clinical decision support when LLM is unavailable.
 * Integrates mhGAP protocols with clinical state store.
 */

import type { Message, ClinicalState, Language } from "../store/types";
import {
  assessMessage,
  generateClinicalResponse,
  interpretPHQ9,
  interpretGAD7,
  ClinicalAssessment,
} from "./mhgap";

/**
 * Reasoning result
 */
export interface ReasoningResult {
  response: string;
  assessment: ClinicalAssessment;
  shouldEscalate: boolean;
  actionRequired: "emergency" | "urgent" | "routine" | "none";
  metadata: {
    reasoningMode: "offline" | "llm";
    confidence: number;
    timestamp: number;
  };
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
  const response = generateClinicalResponse(assessment, language);

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
