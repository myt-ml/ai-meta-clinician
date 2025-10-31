/**
 * Disclaimer Enforcer
 *
 * Manages disclaimer application and context-aware messaging
 */

import type { Language, RiskLevel } from "../store/types";
import type { DisclaimerContext } from "./types";
import { DISCLAIMER_TEMPLATES } from "./types";

/**
 * Enforce disclaimer based on message context
 */
export function enforceDisclaimer(
  message: string,
  context: {
    riskLevel: RiskLevel;
    language: Language;
    isAssessment?: boolean;
    isCrisis?: boolean;
    containsMedication?: boolean;
    userAge?: number;
  }
): string {
  const disclaimerContext = selectDisclaimerContext(context);
  const disclaimer = getApplicableDisclaimer(
    disclaimerContext,
    context.language
  );

  if (!disclaimer) {
    // Fallback to general English disclaimer
    const fallback = DISCLAIMER_TEMPLATES.find(
      (t) => t.context === "general" && t.language === "en"
    );
    return applyDisclaimerByPosition(message, fallback!);
  }

  return applyDisclaimerByPosition(message, disclaimer);
}

/**
 * Select appropriate disclaimer context
 */
function selectDisclaimerContext(context: {
  riskLevel: RiskLevel;
  isAssessment?: boolean;
  isCrisis?: boolean;
  containsMedication?: boolean;
}): DisclaimerContext {
  // Priority order: crisis > assessment > medication > general
  if (context.isCrisis || context.riskLevel === "critical") {
    return "crisis";
  }

  if (context.isAssessment) {
    return "assessment";
  }

  if (context.containsMedication) {
    return "medication";
  }

  return "general";
}

/**
 * Get applicable disclaimer for context and language
 */
function getApplicableDisclaimer(
  context: DisclaimerContext,
  language: Language
): (typeof DISCLAIMER_TEMPLATES)[0] | null {
  // Try exact match
  const exactMatch = DISCLAIMER_TEMPLATES.find(
    (t) => t.context === context && t.language === language
  );
  if (exactMatch) return exactMatch;

  // Try same context in English
  const englishMatch = DISCLAIMER_TEMPLATES.find(
    (t) => t.context === context && t.language === "en"
  );
  if (englishMatch) return englishMatch;

  // Try general in same language
  const generalMatch = DISCLAIMER_TEMPLATES.find(
    (t) => t.context === "general" && t.language === language
  );
  if (generalMatch) return generalMatch;

  return null;
}

/**
 * Apply disclaimer according to specified position
 */
function applyDisclaimerByPosition(
  message: string,
  disclaimer: (typeof DISCLAIMER_TEMPLATES)[0]
): string {
  const { text, position } = disclaimer;

  switch (position) {
    case "prefix":
      return `${text}\n\n${message}`;
    case "suffix":
      return `${message}\n\n${text}`;
    case "both":
      return `${text}\n\n${message}\n\n${text}`;
    default:
      return message;
  }
}

/**
 * Check if message already has a disclaimer
 */
export function hasDisclaimer(message: string, language: Language): boolean {
  const disclaimerMarkers: Record<Language, string[]> = {
    en: [
      "important:",
      "note:",
      "disclaimer:",
      "i'm an ai",
      "i'm not a replacement",
      "cannot replace",
    ],
    ar: [
      "مهم:",
      "ملاحظة:",
      "أنا مساعد ذكاء",
      "لست بديلاً",
      "لا يمكنني أن أحل محل",
    ],
    es: [
      "importante:",
      "nota:",
      "soy una ia",
      "no soy un reemplazo",
      "no puedo reemplazar",
    ],
    fr: [
      "important :",
      "note :",
      "je suis une ia",
      "je ne remplace pas",
      "je ne peux pas remplacer",
    ],
    zh: ["重要：", "注意：", "我是人工智能", "不能替代", "无法替代"],
  };

  const markers = disclaimerMarkers[language] || disclaimerMarkers.en;
  const lowerMessage = message.toLowerCase();

  return markers.some((marker) => lowerMessage.includes(marker.toLowerCase()));
}

/**
 * Add emergency contact disclaimer for crisis situations
 */
export function addEmergencyDisclaimer(
  message: string,
  language: Language
): string {
  const emergencyDisclaimers: Record<Language, string> = {
    en: `🚨 **IMMEDIATE HELP AVAILABLE**

If you're in crisis or having thoughts of self-harm:
- Call 988 (Suicide & Crisis Lifeline) - 24/7 free support
- Text "HELLO" to 741741 (Crisis Text Line)
- Call 911 for immediate emergencies
- Go to your nearest emergency room

You are not alone, and help is available right now.`,
    ar: `🚨 **المساعدة الفورية متاحة**

إذا كنت في أزمة أو لديك أفكار إيذاء النفس:
- اتصل بخط المساعدة المحلي
- اذهب إلى أقرب غرفة طوارئ
- اتصل بخدمات الطوارئ

أنت لست وحدك، والمساعدة متاحة الآن.`,
    es: `🚨 **AYUDA INMEDIATA DISPONIBLE**

Si estás en crisis o tienes pensamientos de autolesión:
- Llama al 988 (Línea de Prevención del Suicidio)
- Envía "HOLA" al 741741 (Línea de Crisis por Texto)
- Llama al 911 para emergencias inmediatas
- Ve a tu sala de emergencias más cercana

No estás solo, la ayuda está disponible ahora.`,
    fr: `🚨 **AIDE IMMÉDIATE DISPONIBLE**

Si vous êtes en crise ou avez des pensées d'automutilation:
- Appelez votre ligne d'aide locale
- Allez aux urgences les plus proches
- Appelez les services d'urgence

Vous n'êtes pas seul, de l'aide est disponible maintenant.`,
    zh: `🚨 **紧急帮助可用**

如果您处于危机中或有自我伤害的想法：
- 拨打当地帮助热线
- 前往最近的急诊室
- 拨打紧急服务电话

您并不孤单，现在就可以获得帮助。`,
  };

  const disclaimer = emergencyDisclaimers[language] || emergencyDisclaimers.en;
  return `${disclaimer}\n\n${message}`;
}

/**
 * Add assessment disclaimer
 */
export function addAssessmentDisclaimer(
  message: string,
  language: Language
): string {
  const assessmentDisclaimers: Record<Language, string> = {
    en: `**About This Assessment:**

This is a screening tool, not a diagnosis. Only a qualified mental health professional can provide an accurate diagnosis. These results are meant to guide your conversation with a healthcare provider.`,
    ar: `**حول هذا التقييم:**

هذه أداة فحص وليست تشخيصًا. فقط أخصائي الصحة النفسية المؤهل يمكنه تقديم تشخيص دقيق. هذه النتائج تهدف إلى توجيه محادثتك مع مقدم الرعاية الصحية.`,
    es: `**Sobre Esta Evaluación:**

Esta es una herramienta de detección, no un diagnóstico. Solo un profesional calificado de salud mental puede proporcionar un diagnóstico preciso. Estos resultados están destinados a guiar su conversación con un proveedor de atención médica.`,
    fr: `**À Propos de Cette Évaluation:**

Ceci est un outil de dépistage, pas un diagnostic. Seul un professionnel qualifié en santé mentale peut fournir un diagnostic précis. Ces résultats sont destinés à guider votre conversation avec un fournisseur de soins de santé.`,
    zh: `**关于此评估：**

这是一个筛查工具，而非诊断。只有合格的心理健康专业人员才能提供准确的诊断。这些结果旨在指导您与医疗保健提供者的对话。`,
  };

  const disclaimer =
    assessmentDisclaimers[language] || assessmentDisclaimers.en;
  return `${message}\n\n${disclaimer}`;
}

/**
 * Add medication disclaimer
 */
export function addMedicationDisclaimer(
  message: string,
  language: Language
): string {
  const medicationDisclaimers: Record<Language, string> = {
    en: `**Medication Information Notice:**

I cannot prescribe, recommend, or advise on medications. Any questions about medications (including dosage, side effects, or interactions) should be directed to a licensed healthcare provider or pharmacist.`,
    ar: `**إشعار معلومات الأدوية:**

لا يمكنني وصف أو التوصية أو تقديم المشورة بشأن الأدوية. يجب توجيه أي أسئلة حول الأدوية إلى مقدم رعاية صحية مرخص أو صيدلي.`,
    es: `**Aviso de Información Sobre Medicamentos:**

No puedo recetar, recomendar o aconsejar sobre medicamentos. Cualquier pregunta sobre medicamentos debe dirigirse a un proveedor de atención médica con licencia o farmacéutico.`,
    fr: `**Avis d'Information Sur les Médicaments:**

Je ne peux pas prescrire, recommander ou conseiller sur les médicaments. Toute question concernant les médicaments doit être adressée à un professionnel de santé agréé ou à un pharmacien.`,
    zh: `**药物信息通知：**

我不能开处方、推荐或就药物提供建议。有关药物的任何问题应咨询持证医疗保健提供者或药剂师。`,
  };

  const disclaimer =
    medicationDisclaimers[language] || medicationDisclaimers.en;
  return `${message}\n\n${disclaimer}`;
}

/**
 * Get context-appropriate disclaimer text
 */
export function getDisclaimerText(
  context: DisclaimerContext,
  language: Language
): string {
  const disclaimer = DISCLAIMER_TEMPLATES.find(
    (t) => t.context === context && t.language === language
  );

  if (disclaimer) return disclaimer.text;

  // Fallback to general English
  const fallback = DISCLAIMER_TEMPLATES.find(
    (t) => t.context === "general" && t.language === "en"
  );

  return fallback?.text || "";
}
