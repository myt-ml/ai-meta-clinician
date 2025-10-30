import rules from "./rules.json";

export type Language = "en" | "ar_egy" | "ar_msa";

export interface TriageResult {
  text: string;
  category: string[];
  riskLevel: "low" | "moderate" | "high" | "critical";
  flagForReview: boolean;
  score: {
    depression: number;
    anxiety: number;
    psychosis: number;
    trauma: number;
    suicideRisk: number;
  };
  recommendations: string[];
}

/**
 * Core mhGAP-based triage engine
 * Analyzes patient input for mental health symptoms and risk factors
 * Following WHO Mental Health Gap Action Programme guidelines
 */
export async function triage(
  input: string,
  lang: Language
): Promise<TriageResult> {
  const text = input.toLowerCase();

  // Initialize scores
  const scores = {
    depression: 0,
    anxiety: 0,
    psychosis: 0,
    trauma: 0,
    suicideRisk: 0,
  };

  const categories: string[] = [];
  let riskLevel: "low" | "moderate" | "high" | "critical" = "low";
  let flagForReview = false;

  // Check for suicide risk (HIGHEST PRIORITY)
  const suicideCheck = checkSuicideRisk(text, lang);
  scores.suicideRisk = suicideCheck.score;
  if (suicideCheck.level === "critical") {
    categories.push("suicide_risk");
    riskLevel = "critical";
    flagForReview = true;
  } else if (suicideCheck.level === "high") {
    categories.push("suicide_risk");
    riskLevel = "high";
    flagForReview = true;
  } else if (suicideCheck.level === "moderate") {
    categories.push("suicide_risk");
    riskLevel = "moderate";
    flagForReview = true;
  }

  // Check for psychosis symptoms
  scores.psychosis = countKeywordMatches(text, rules.psychosis.keywords[lang]);
  if (scores.psychosis >= 2) {
    categories.push("psychosis");
    if (riskLevel === "low") riskLevel = "high";
    flagForReview = true;
  }

  // Check for depression (lowered threshold from 3 to 2)
  scores.depression = countKeywordMatches(
    text,
    rules.depression.keywords[lang]
  );
  const depressionSeverity = countKeywordMatches(
    text,
    rules.depression.severity_markers[lang]
  );
  if (
    scores.depression >= 2 ||
    (scores.depression >= 1 && depressionSeverity >= 1)
  ) {
    categories.push("depression");
    if (riskLevel === "low") riskLevel = "moderate";
    // Escalate to high if severe markers present
    if (depressionSeverity >= 2) riskLevel = "high";
  }

  // Check for anxiety (lowered threshold from 3 to 2)
  scores.anxiety = countKeywordMatches(text, rules.anxiety.keywords[lang]);
  const panicSymptoms = countKeywordMatches(
    text,
    rules.anxiety.panic_symptoms[lang]
  );
  if (scores.anxiety >= 2 || panicSymptoms >= 2) {
    categories.push("anxiety");
    if (riskLevel === "low") riskLevel = "moderate";
    // Escalate to high if panic attack present
    if (panicSymptoms >= 3) riskLevel = "high";
  }

  // Check for trauma
  scores.trauma = countKeywordMatches(text, rules.trauma.keywords[lang]);
  if (scores.trauma >= 2) {
    categories.push("trauma");
    if (riskLevel === "low") riskLevel = "moderate";
  }

  // Generate response text
  const responseText = generateResponse(categories, riskLevel, lang);

  // Generate recommendations
  const recommendations = generateRecommendations(categories, riskLevel, lang);

  return {
    text: responseText,
    category: categories.length > 0 ? categories : ["general_inquiry"],
    riskLevel,
    flagForReview,
    score: scores,
    recommendations,
  };
}

/**
 * Check for suicide risk indicators
 */
function checkSuicideRisk(
  text: string,
  lang: Language
): { level: "none" | "moderate" | "high" | "critical"; score: number } {
  let score = 0;
  let level: "none" | "moderate" | "high" | "critical" = "none";

  // Critical risk indicators
  const criticalMatches = countKeywordMatches(
    text,
    rules.suicide_risk.high_risk[lang]
  );
  if (criticalMatches >= 1) {
    score += criticalMatches * 5;
    level = "critical";
  }

  // Self-harm indicators
  const selfHarmMatches = countKeywordMatches(
    text,
    rules.suicide_risk.self_harm[lang]
  );
  if (selfHarmMatches >= 1) {
    score += selfHarmMatches * 3;
    if (level === "none") level = "high";
  }

  // Moderate risk indicators
  const moderateMatches = countKeywordMatches(
    text,
    rules.suicide_risk.moderate_risk[lang]
  );
  if (moderateMatches >= 1) {
    score += moderateMatches * 2;
    if (level === "none") level = "moderate";
  }

  return { level, score };
}

/**
 * Count keyword matches in text
 */
function countKeywordMatches(text: string, keywords: string[]): number {
  let count = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      count++;
    }
  }
  return count;
}

/**
 * Generate appropriate clinical response
 */
function generateResponse(
  categories: string[],
  riskLevel: string,
  lang: Language
): string {
  const responses = {
    en: {
      critical:
        "I'm very concerned about what you've shared. You've mentioned thoughts of ending your life, and I want you to know that you're not alone and help is available. This is a medical emergency. Please contact emergency services immediately (911 or your local emergency number) or go to the nearest emergency room. Would you like me to help you find immediate support resources?",
      high: "I'm hearing that you're going through a very difficult time, and I'm concerned about your safety. The thoughts and feelings you're experiencing are serious, and it's important that you speak with a professional as soon as possible. Are you currently safe? Do you have someone you trust nearby?",
      moderate:
        "Thank you for sharing what you're going through. It takes courage to open up about these feelings. What you're describing suggests you might be experiencing symptoms that would benefit from professional support. Let's explore this together and discuss some helpful resources.",
      low: "I'm here to listen and support you. Can you tell me more about what's been happening and how you've been feeling lately?",
      general:
        "Hello, I'm here to help you with your mental health concerns. Feel free to share what's on your mind, and we'll work through this together.",
    },
    ar_egy: {
      critical:
        "أنا قلقان جداً على اللى قولته. انت ذكرت أفكار عن إنهاء حياتك، وعايزك تعرف إنك مش لوحدك والمساعدة متاحة. دى حالة طوارئ طبية. من فضلك اتصل بالطوارئ فوراً أو روح أقرب مستشفى. تحب أساعدك تلاقى موارد دعم فوري؟",
      high: "أنا سامع إنك بتمر بوقت صعب جداً، وأنا قلقان على سلامتك. الأفكار والمشاعر دى خطيرة، ومهم تتكلم مع متخصص في أسرع وقت. انت آمن دلوقتى؟ فيه حد تثق فيه قريب منك؟",
      moderate:
        "شكراً إنك شاركتنى اللى بتمر بيه. محتاج شجاعة عشان تتكلم عن المشاعر دى. اللى بتوصفه بيقترح إنك ممكن تكون محتاج دعم مهني. يلا نستكشف الموضوع سوا ونتكلم عن موارد مفيدة.",
      low: "أنا هنا عشان أسمعك وأساعدك. ممكن تقولى أكتر عن اللى بيحصل معاك وإزاى كنت حاسس الفترة اللى فاتت؟",
      general:
        "أهلاً، أنا هنا عشان أساعدك في صحتك النفسية. قول اللى في بالك براحتك، وهنشتغل على ده سوا.",
    },
    ar_msa: {
      critical:
        "أنا قلق جداً مما شاركتني إياه. لقد ذكرت أفكاراً عن إنهاء حياتك، وأريدك أن تعلم أنك لست وحدك وأن المساعدة متاحة. هذه حالة طوارئ طبية. يرجى الاتصال بخدمات الطوارئ فوراً أو التوجه إلى أقرب مستشفى. هل تريد أن أساعدك في إيجاد موارد دعم فوري؟",
      high: "أسمع أنك تمر بوقت صعب جداً، وأنا قلق على سلامتك. الأفكار والمشاعر التي تمر بها خطيرة، ومن المهم أن تتحدث مع متخصص في أسرع وقت ممكن. هل أنت آمن حالياً؟ هل لديك شخص تثق به بالقرب منك؟",
      moderate:
        "شكراً لمشاركتي ما تمر به. يتطلب الأمر شجاعة للانفتاح حول هذه المشاعر. ما تصفه يشير إلى أنك قد تستفيد من الدعم المهني. دعنا نستكشف هذا معاً ونناقش بعض الموارد المفيدة.",
      low: "أنا هنا للاستماع ودعمك. هل يمكنك إخباري المزيد عما يحدث وكيف كنت تشعر مؤخراً؟",
      general:
        "مرحباً، أنا هنا لمساعدتك بشأن مخاوفك المتعلقة بالصحة النفسية. لا تتردد في مشاركة ما يدور في ذهنك، وسنعمل على هذا معاً.",
    },
  };

  if (riskLevel === "critical") return responses[lang].critical;
  if (riskLevel === "high") return responses[lang].high;
  if (riskLevel === "moderate") return responses[lang].moderate;
  if (categories.length === 0) return responses[lang].general;
  return responses[lang].low;
}

/**
 * Generate clinical recommendations based on assessment
 */
function generateRecommendations(
  categories: string[],
  riskLevel: string,
  lang: Language
): string[] {
  const recommendations: string[] = [];

  if (riskLevel === "critical" || riskLevel === "high") {
    recommendations.push("immediate_crisis_intervention");
    recommendations.push("emergency_contact");
    return recommendations;
  }

  if (categories.includes("depression")) {
    recommendations.push("phq9_assessment");
    recommendations.push("behavioral_activation");
    recommendations.push("sleep_hygiene");
  }

  if (categories.includes("anxiety")) {
    recommendations.push("breathing_exercises");
    recommendations.push("gad7_assessment");
    recommendations.push("relaxation_techniques");
  }

  if (categories.includes("psychosis")) {
    recommendations.push("psychiatric_evaluation");
    recommendations.push("medication_assessment");
  }

  if (categories.includes("trauma")) {
    recommendations.push("trauma_informed_care");
    recommendations.push("grounding_techniques");
  }

  return recommendations;
}
