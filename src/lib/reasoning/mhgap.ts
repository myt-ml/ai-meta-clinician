/**
 * mhGAP Clinical Reasoning Engine
 *
 * WHO Mental Health Gap Action Programme (mhGAP) implementation
 * Provides rule-based clinical assessment and triage when LLM is unavailable
 *
 * Based on:
 * - WHO mhGAP Intervention Guide (version 2.0)
 * - DSM-5 diagnostic criteria
 * - Evidence-based clinical protocols
 */

import type {
  Message,
  RiskLevel,
  TriageCategory,
  Language,
} from "../store/types";
import {
  ClinicalCondition,
  ClinicalProtocol,
  SymptomPattern,
  CRISIS_KEYWORDS,
  DEPRESSION_PATTERNS,
  ANXIETY_PATTERNS,
  PTSD_PATTERNS,
  PSYCHOSIS_PATTERNS,
  SUBSTANCE_PATTERNS,
  CLINICAL_PROTOCOLS,
  EMERGENCY_RESOURCES,
} from "./clinicalKnowledge";

/**
 * Clinical assessment result
 */
export interface ClinicalAssessment {
  conditions: ClinicalCondition[];
  primaryCondition: ClinicalCondition;
  riskLevel: RiskLevel;
  triageCategory: TriageCategory;
  confidence: number;
  requiresEmergency: boolean;
  protocol: ClinicalProtocol;
}

/**
 * Symptom analysis result
 */
interface SymptomAnalysis {
  condition: ClinicalCondition;
  score: number;
  matches: string[];
}

/**
 * Assess message for clinical patterns
 */
export function assessMessage(
  message: string,
  conversationHistory: Message[],
  currentRiskLevel: RiskLevel
): ClinicalAssessment {
  const normalizedMessage = message.toLowerCase();

  // 1. CRISIS CHECK (highest priority)
  const hasCrisisKeywords = CRISIS_KEYWORDS.some((keyword) =>
    normalizedMessage.includes(keyword.toLowerCase())
  );

  if (hasCrisisKeywords) {
    return {
      conditions: ["suicide_risk"],
      primaryCondition: "suicide_risk",
      riskLevel: "critical",
      triageCategory: "crisis",
      confidence: 0.95,
      requiresEmergency: true,
      protocol: CLINICAL_PROTOCOLS.suicide_risk,
    };
  }

  // 2. SELF-HARM CHECK (high priority, before general pattern matching)
  const selfHarmKeywords = [
    "self-harm",
    "self harm",
    "cut myself",
    "cutting myself",
    "hurt myself",
    "hurting myself",
    "cutting",
    "burning myself",
    "harm myself",
  ];
  const hasSelfHarm = selfHarmKeywords.some((keyword) =>
    normalizedMessage.includes(keyword.toLowerCase())
  );

  if (hasSelfHarm) {
    return {
      conditions: ["self_harm"],
      primaryCondition: "self_harm",
      riskLevel: "high",
      triageCategory: "urgent",
      confidence: 0.9,
      requiresEmergency: false,
      protocol: CLINICAL_PROTOCOLS.self_harm,
    };
  }

  // 3. PATTERN MATCHING
  const analyses: SymptomAnalysis[] = [
    analyzeSymptoms(normalizedMessage, "depression", DEPRESSION_PATTERNS),
    analyzeSymptoms(normalizedMessage, "anxiety", ANXIETY_PATTERNS),
    analyzeSymptoms(normalizedMessage, "ptsd", PTSD_PATTERNS),
    analyzeSymptoms(normalizedMessage, "psychosis", PSYCHOSIS_PATTERNS),
    analyzeSymptoms(normalizedMessage, "substance_use", SUBSTANCE_PATTERNS),
  ];

  // 4. RANK CONDITIONS BY SCORE
  analyses.sort((a, b) => b.score - a.score);

  // 5. SELECT PRIMARY CONDITION
  const topAnalysis = analyses[0];
  const threshold = 3; // Minimum score to diagnose

  if (topAnalysis.score < threshold) {
    return {
      conditions: ["undetermined"],
      primaryCondition: "undetermined",
      riskLevel: currentRiskLevel || "low",
      triageCategory: "routine",
      confidence: 0.5,
      requiresEmergency: false,
      protocol: CLINICAL_PROTOCOLS.undetermined,
    };
  }

  // 6. IDENTIFY CO-OCCURRING CONDITIONS
  const significantConditions = analyses
    .filter((a) => a.score >= threshold)
    .map((a) => a.condition);

  // 7. DETERMINE FINAL ASSESSMENT
  const primaryCondition = topAnalysis.condition;
  const protocol = CLINICAL_PROTOCOLS[primaryCondition];

  // Calculate confidence based on score and co-occurring conditions
  // Score of 3-5 = 0.5-0.7, 6-9 = 0.7-0.85, 10+ = 0.85-0.95
  const confidence = Math.min(0.95, 0.3 + topAnalysis.score / 12);

  // Escalate risk if multiple conditions present
  let finalRiskLevel = protocol.riskLevel;
  if (significantConditions.length > 2) {
    finalRiskLevel = escalateRiskLevel(finalRiskLevel);
  }

  return {
    conditions: significantConditions,
    primaryCondition,
    riskLevel: finalRiskLevel,
    triageCategory: protocol.triageCategory,
    confidence,
    requiresEmergency: protocol.emergencyProtocol || false,
    protocol,
  };
}

/**
 * Analyze message for specific condition patterns
 */
function analyzeSymptoms(
  message: string,
  condition: ClinicalCondition,
  patterns: SymptomPattern[]
): SymptomAnalysis {
  let totalScore = 0;
  const matches: string[] = [];

  for (const pattern of patterns) {
    for (const keyword of pattern.keywords) {
      if (message.includes(keyword.toLowerCase())) {
        totalScore += pattern.weight;
        matches.push(keyword);
        break; // Only count each pattern once
      }
    }
  }

  return {
    condition,
    score: totalScore,
    matches,
  };
}

/**
 * Escalate risk level
 */
function escalateRiskLevel(current: RiskLevel): RiskLevel {
  const levels: RiskLevel[] = ["low", "moderate", "high", "critical"];
  const currentIndex = levels.indexOf(current);
  const nextIndex = Math.min(currentIndex + 1, levels.length - 1);
  return levels[nextIndex];
}

/**
 * Generate clinical response based on assessment
 */
export function generateClinicalResponse(
  assessment: ClinicalAssessment,
  language: Language = "en"
): string {
  const { protocol, requiresEmergency, conditions } = assessment;

  // Emergency response
  if (requiresEmergency) {
    const resources = EMERGENCY_RESOURCES[language];
    return buildEmergencyResponse(protocol, resources, language);
  }

  // Standard clinical response
  return buildStandardResponse(protocol, conditions, language);
}

/**
 * Build emergency response
 */
function buildEmergencyResponse(
  protocol: ClinicalProtocol,
  resources: typeof EMERGENCY_RESOURCES.en,
  language: Language
): string {
  const templates = {
    en: {
      crisis: `I'm very concerned about your safety right now. This is a serious situation that requires immediate attention.\n\n**IMMEDIATE ACTIONS:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join("\n")}\n\n**EMERGENCY CONTACTS:**\n• ${resources.crisis}\n• ${
        resources.emergency
      }\n• ${
        resources.text
      }\n\nPlease reach out to one of these services right now. You don't have to face this alone.`,
      urgent: `Thank you for sharing this with me. What you're experiencing requires professional help. Let's make sure you get the support you need.\n\n**ASSESSMENT:**\n${protocol.assessment
        .map((a) => `• ${a}`)
        .join("\n")}\n\n**NEXT STEPS:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join(
          "\n"
        )}\n\nWould you like help finding mental health services in your area?`,
    },
    ar: {
      crisis: `أنا قلق جداً بشأن سلامتك الآن. هذا وضع خطير يتطلب اهتماماً فورياً.\n\n**إجراءات فورية:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join("\n")}\n\n**جهات الاتصال الطارئة:**\n• ${resources.crisis}\n• ${
        resources.emergency
      }\n• ${
        resources.text
      }\n\nيرجى التواصل مع إحدى هذه الخدمات الآن. لست مضطراً لمواجهة هذا بمفردك.`,
      urgent: `شكراً لمشاركة هذا معي. ما تمر به يتطلب مساعدة مهنية. دعنا نتأكد من حصولك على الدعم الذي تحتاجه.\n\n**التقييم:**\n${protocol.assessment
        .map((a) => `• ${a}`)
        .join("\n")}\n\n**الخطوات التالية:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join(
          "\n"
        )}\n\nهل تريد المساعدة في إيجاد خدمات الصحة النفسية في منطقتك؟`,
    },
    es: {
      crisis: `Estoy muy preocupado por tu seguridad en este momento. Esta es una situación seria que requiere atención inmediata.\n\n**ACCIONES INMEDIATAS:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join("\n")}\n\n**CONTACTOS DE EMERGENCIA:**\n• ${
        resources.crisis
      }\n• ${resources.emergency}\n• ${
        resources.text
      }\n\nPor favor, comunícate con uno de estos servicios ahora mismo. No tienes que enfrentar esto solo.`,
      urgent: `Gracias por compartir esto conmigo. Lo que estás experimentando requiere ayuda profesional. Asegurémonos de que obtengas el apoyo que necesitas.\n\n**EVALUACIÓN:**\n${protocol.assessment
        .map((a) => `• ${a}`)
        .join("\n")}\n\n**PRÓXIMOS PASOS:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join(
          "\n"
        )}\n\n¿Te gustaría ayuda para encontrar servicios de salud mental en tu área?`,
    },
    fr: {
      crisis: `Je suis très préoccupé par votre sécurité en ce moment. Il s'agit d'une situation grave qui nécessite une attention immédiate.\n\n**ACTIONS IMMÉDIATES:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join("\n")}\n\n**CONTACTS D'URGENCE:**\n• ${resources.crisis}\n• ${
        resources.emergency
      }\n• ${
        resources.text
      }\n\nVeuillez contacter l'un de ces services maintenant. Vous n'avez pas à faire face à cela seul.`,
      urgent: `Merci de partager cela avec moi. Ce que vous vivez nécessite une aide professionnelle. Assurons-nous que vous obteniez le soutien dont vous avez besoin.\n\n**ÉVALUATION:**\n${protocol.assessment
        .map((a) => `• ${a}`)
        .join("\n")}\n\n**PROCHAINES ÉTAPES:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join(
          "\n"
        )}\n\nSouhaitez-vous de l'aide pour trouver des services de santé mentale dans votre région?`,
    },
    zh: {
      crisis: `我非常担心你现在的安全。这是一个需要立即关注的严重情况。\n\n**立即行动:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join("\n")}\n\n**紧急联系方式:**\n• ${resources.crisis}\n• ${
        resources.emergency
      }\n• ${resources.text}\n\n请立即联系其中一项服务。你不必独自面对这一切。`,
      urgent: `谢谢你与我分享这些。你所经历的需要专业帮助。让我们确保你得到所需的支持。\n\n**评估:**\n${protocol.assessment
        .map((a) => `• ${a}`)
        .join("\n")}\n\n**下一步:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join("\n")}\n\n你需要帮助找到你所在地区的心理健康服务吗？`,
    },
  };

  const langTemplates = templates[language] || templates.en;
  return protocol.emergencyProtocol
    ? langTemplates.crisis
    : langTemplates.urgent;
}

/**
 * Build standard clinical response
 */
function buildStandardResponse(
  protocol: ClinicalProtocol,
  conditions: ClinicalCondition[],
  language: Language
): string {
  const templates = {
    en: {
      routine: `I hear you, and I want to help. Based on what you've shared, it sounds like you may be experiencing symptoms related to ${protocol.condition.replace(
        "_",
        " "
      )}.\n\n**UNDERSTANDING YOUR EXPERIENCE:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join("\n")}\n\n**HELPFUL STRATEGIES:**\n${protocol.safetyPlan
        .map((s) => `• ${s}`)
        .join("\n")}${
        protocol.referralNeeded
          ? "\n\nI recommend speaking with a mental health professional who can provide more comprehensive support."
          : ""
      }`,
    },
    ar: {
      routine: `أسمعك وأريد المساعدة. بناءً على ما شاركته، يبدو أنك قد تعاني من أعراض تتعلق بـ${protocol.condition.replace(
        "_",
        " "
      )}.\n\n**فهم تجربتك:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join("\n")}\n\n**استراتيجيات مفيدة:**\n${protocol.safetyPlan
        .map((s) => `• ${s}`)
        .join("\n")}${
        protocol.referralNeeded
          ? "\n\nأوصي بالتحدث مع أخصائي الصحة النفسية الذي يمكنه تقديم دعم أكثر شمولاً."
          : ""
      }`,
    },
    es: {
      routine: `Te escucho y quiero ayudar. Basándome en lo que has compartido, parece que podrías estar experimentando síntomas relacionados con ${protocol.condition.replace(
        "_",
        " "
      )}.\n\n**ENTENDIENDO TU EXPERIENCIA:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join("\n")}\n\n**ESTRATEGIAS ÚTILES:**\n${protocol.safetyPlan
        .map((s) => `• ${s}`)
        .join("\n")}${
        protocol.referralNeeded
          ? "\n\nRecomiendo hablar con un profesional de salud mental que pueda brindar un apoyo más completo."
          : ""
      }`,
    },
    fr: {
      routine: `Je vous entends et je veux vous aider. D'après ce que vous avez partagé, il semble que vous pourriez éprouver des symptômes liés à ${protocol.condition.replace(
        "_",
        " "
      )}.\n\n**COMPRENDRE VOTRE EXPÉRIENCE:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join("\n")}\n\n**STRATÉGIES UTILES:**\n${protocol.safetyPlan
        .map((s) => `• ${s}`)
        .join("\n")}${
        protocol.referralNeeded
          ? "\n\nJe recommande de parler avec un professionnel de la santé mentale qui peut fournir un soutien plus complet."
          : ""
      }`,
    },
    zh: {
      routine: `我听到你了，我想帮助你。根据你分享的内容，你可能正在经历与${protocol.condition.replace(
        "_",
        " "
      )}相关的症状。\n\n**了解你的经历:**\n${protocol.interventions
        .map((i) => `• ${i}`)
        .join("\n")}\n\n**有用的策略:**\n${protocol.safetyPlan
        .map((s) => `• ${s}`)
        .join("\n")}${
        protocol.referralNeeded
          ? "\n\n我建议与心理健康专业人士交谈，他们可以提供更全面的支持。"
          : ""
      }`,
    },
  };

  const langTemplates = templates[language] || templates.en;
  return langTemplates.routine;
}

/**
 * PHQ-9 interpretation
 */
export function interpretPHQ9(totalScore: number): {
  severity: string;
  riskLevel: RiskLevel;
  recommendations: string[];
} {
  if (totalScore >= 20) {
    return {
      severity: "Severe depression",
      riskLevel: "high",
      recommendations: [
        "Immediate referral to mental health specialist required",
        "Consider psychiatric evaluation",
        "Assess for safety risks daily",
        "Implement intensive monitoring",
      ],
    };
  } else if (totalScore >= 15) {
    return {
      severity: "Moderately severe depression",
      riskLevel: "high",
      recommendations: [
        "Referral to mental health professional recommended",
        "Consider psychotherapy or medication",
        "Monitor symptoms weekly",
        "Implement structured support",
      ],
    };
  } else if (totalScore >= 10) {
    return {
      severity: "Moderate depression",
      riskLevel: "moderate",
      recommendations: [
        "Professional assessment recommended",
        "Consider counseling or therapy",
        "Implement self-care strategies",
        "Monitor symptoms bi-weekly",
      ],
    };
  } else if (totalScore >= 5) {
    return {
      severity: "Mild depression",
      riskLevel: "low",
      recommendations: [
        "Self-care and lifestyle interventions",
        "Consider counseling if symptoms persist",
        "Monitor symptoms monthly",
        "Focus on wellness activities",
      ],
    };
  } else {
    return {
      severity: "Minimal or no depression",
      riskLevel: "low",
      recommendations: [
        "Continue current wellness practices",
        "Monitor for changes",
        "Maintain healthy lifestyle",
      ],
    };
  }
}

/**
 * GAD-7 interpretation
 */
export function interpretGAD7(totalScore: number): {
  severity: string;
  riskLevel: RiskLevel;
  recommendations: string[];
} {
  if (totalScore >= 15) {
    return {
      severity: "Severe anxiety",
      riskLevel: "high",
      recommendations: [
        "Referral to mental health specialist required",
        "Consider medication evaluation",
        "Intensive anxiety management program",
        "Weekly monitoring recommended",
      ],
    };
  } else if (totalScore >= 10) {
    return {
      severity: "Moderate anxiety",
      riskLevel: "moderate",
      recommendations: [
        "Professional assessment recommended",
        "Consider therapy (CBT or similar)",
        "Practice anxiety management techniques",
        "Monitor symptoms bi-weekly",
      ],
    };
  } else if (totalScore >= 5) {
    return {
      severity: "Mild anxiety",
      riskLevel: "low",
      recommendations: [
        "Self-help strategies appropriate",
        "Consider brief counseling",
        "Practice relaxation techniques",
        "Monitor symptoms monthly",
      ],
    };
  } else {
    return {
      severity: "Minimal anxiety",
      riskLevel: "low",
      recommendations: [
        "Continue current practices",
        "Maintain stress management",
        "Monitor for changes",
      ],
    };
  }
}
