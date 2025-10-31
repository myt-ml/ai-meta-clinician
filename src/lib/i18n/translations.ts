/**
 * Translation System for AI Meta-Clinician
 * Supports: English, Modern Standard Arabic, Egyptian Arabic
 */

export type Language = "en" | "ar_msa" | "ar_egy";

export interface Translations {
  app: {
    title: string;
    subtitle: string;
  };
  header: {
    changeLanguage: string;
    sessionHistory: string;
    hideHistory: string;
    showHistory: string;
    newSession: string;
  };
  input: {
    placeholder: string;
    send: string;
    enhancedAI: string;
    initializing: string;
    unavailable: string;
  };
  risk: {
    critical: string;
    high: string;
    moderate: string;
    emergencyResources: string;
    previousSessionRisk: string;
  };
  emergency: {
    usa: string;
    egypt: string;
    global: string;
  };
  footer: {
    disclaimer: string;
    crisisPrompt: string;
  };
  errors: {
    general: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    app: {
      title: "AI Meta-Clinician",
      subtitle: "Mental Health Support Platform - English",
    },
    header: {
      changeLanguage: "Change Language",
      sessionHistory: "Session History",
      hideHistory: "Hide History",
      showHistory: "Session History",
      newSession: "New Session",
    },
    input: {
      placeholder: "Type your message...",
      send: "Send",
      enhancedAI: "Enhanced AI Response",
      initializing: " (Initializing...)",
      unavailable: " (Unavailable)",
    },
    risk: {
      critical:
        "⚠️ URGENT: Crisis detected. Please contact emergency services immediately.",
      high: "⚠️ High risk detected. Professional support recommended soon.",
      moderate:
        "Notice: Some concerning patterns detected. Consider professional consultation.",
      emergencyResources: "Emergency Resources:",
      previousSessionRisk: "Previous session risk level: ",
    },
    emergency: {
      usa: "🇺🇸 USA: 988 (Suicide & Crisis Lifeline)",
      egypt: "🇪🇬 Egypt: 08008880700 (Lifeline)",
      global: "🌍 International: findahelpline.com",
    },
    footer: {
      disclaimer:
        "⚠️ This is not a replacement for professional mental health care",
      crisisPrompt:
        "If you're in crisis, call 988 (USA) or visit findahelpline.com",
    },
    errors: {
      general:
        "I apologize, but I encountered an error. Please try again or contact support if the problem persists.",
    },
  },
  ar_msa: {
    app: {
      title: "الطبيب الذكي للصحة النفسية",
      subtitle: "منصة الدعم النفسي - العربية الفصحى",
    },
    header: {
      changeLanguage: "تغيير اللغة",
      sessionHistory: "السجل",
      hideHistory: "إخفاء السجل",
      showHistory: "عرض السجل",
      newSession: "جلسة جديدة",
    },
    input: {
      placeholder: "اكتب رسالتك...",
      send: "إرسال",
      enhancedAI: "استجابة ذكاء اصطناعي محسّنة",
      initializing: " (جاري التهيئة...)",
      unavailable: " (غير متوفر)",
    },
    risk: {
      critical: "⚠️ عاجل: تم اكتشاف أزمة. يرجى الاتصال بخدمات الطوارئ فوراً.",
      high: "⚠️ تم اكتشاف خطر عالٍ. يُنصح بالحصول على دعم مهني قريباً.",
      moderate:
        "ملاحظة: تم اكتشاف بعض الأنماط المقلقة. يُفضل استشارة متخصص.",
      emergencyResources: "موارد الطوارئ:",
      previousSessionRisk: "مستوى خطر الجلسة السابقة: ",
    },
    emergency: {
      usa: "🇺🇸 أمريكا: 988 (خط الأزمات)",
      egypt: "🇪🇬 مصر: 08008880700 (خط الحياة)",
      global: "🌍 دولي: findahelpline.com",
    },
    footer: {
      disclaimer: "⚠️ هذا ليس بديلاً عن الرعاية النفسية المهنية",
      crisisPrompt:
        "إذا كنت في أزمة، اتصل بـ 08008880700 (مصر) أو قم بزيارة findahelpline.com",
    },
    errors: {
      general:
        "أعتذر، لقد واجهت خطأ. يرجى المحاولة مرة أخرى أو الاتصال بالدعم إذا استمرت المشكلة.",
    },
  },
  ar_egy: {
    app: {
      title: "الدكتور الذكي للصحة النفسية",
      subtitle: "منصة الدعم النفسي - العامية المصرية",
    },
    header: {
      changeLanguage: "غيّر اللغة",
      sessionHistory: "السجل",
      hideHistory: "خبّي السجل",
      showHistory: "اعرض السجل",
      newSession: "جلسة جديدة",
    },
    input: {
      placeholder: "اكتب رسالتك هنا...",
      send: "إرسال",
      enhancedAI: "رد محسّن بالذكاء الاصطناعي",
      initializing: " (بيجهز...)",
      unavailable: " (مش متاح)",
    },
    risk: {
      critical: "⚠️ عاجل: في أزمة! اتصل بالطوارئ حالاً.",
      high: "⚠️ في خطر كبير. لازم تروح لدكتور قريب.",
      moderate: "ملاحظة: في حاجات مش مطمئنة. يفضل تستشير حد متخصص.",
      emergencyResources: "أرقام الطوارئ:",
      previousSessionRisk: "مستوى خطر الجلسة اللي فاتت: ",
    },
    emergency: {
      usa: "🇺🇸 أمريكا: 988 (خط الأزمات)",
      egypt: "🇪🇬 مصر: 08008880700 (خط الحياة)",
      global: "🌍 دولي: findahelpline.com",
    },
    footer: {
      disclaimer: "⚠️ ده مش بديل للعلاج النفسي الحقيقي",
      crisisPrompt:
        "لو في أزمة، اتصل بـ 08008880700 (مصر) أو زور findahelpline.com",
    },
    errors: {
      general: "آسف، حصل خطأ. جرب تاني أو كلم الدعم لو المشكلة فضلت.",
    },
  },
};

/**
 * Get translations for a specific language
 */
export function getTranslations(language: Language): Translations {
  return translations[language];
}

/**
 * Get language direction (LTR or RTL)
 */
export function getLanguageDir(language: Language): "ltr" | "rtl" {
  return language === "en" ? "ltr" : "rtl";
}

/**
 * Get ISO language code for HTML lang attribute
 */
export function getLanguageCode(language: Language): string {
  const codes: Record<Language, string> = {
    en: "en-US",
    ar_msa: "ar-SA",
    ar_egy: "ar-EG",
  };
  return codes[language];
}

/**
 * Hook for using translations in components
 */
export function useTranslations(language: Language) {
  return getTranslations(language);
}
