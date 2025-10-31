/**
 * Clinical Tone Enforcement
 *
 * Post-processing layer to ensure all LLM responses maintain strict clinical tone.
 * Removes casual phrasing, ensures formal medical language, and validates output.
 *
 * Standards enforced:
 * - Formal medical terminology
 * - No casual greetings or colloquialisms
 * - Appropriate clinical distance
 * - Evidence-based language
 * - No AI self-reference
 *
 * @module validation/clinicalTone
 */

/**
 * Casual phrases that should be removed or replaced
 */
const CASUAL_PHRASES: Record<string, string> = {
  // Greetings
  "hey there": "Hello",
  "hi there": "Hello",
  "what's up": "How are you",
  "how's it going": "How are you",

  // Casual language
  gonna: "going to",
  wanna: "want to",
  kinda: "somewhat",
  sorta: "somewhat",
  yeah: "yes",
  nah: "no",
  yep: "yes",
  nope: "no",

  // Overconfident language
  definitely: "likely",
  absolutely: "certainly",
  totally: "completely",
  obviously: "clearly",

  // AI self-reference
  "as an AI": "",
  "as a language model": "",
  "I'm just an AI": "",
  "I don't have feelings": "",
  "I'm not a real doctor": "",

  // Filler words
  basically: "",
  actually: "",
  literally: "",
  honestly: "",
  "to be honest": "",

  // Informal closings
  "take care": "Please contact your healthcare provider if symptoms persist",
  "good luck": "I recommend following up with your healthcare provider",
  "hang in there": "Please seek support from your healthcare team",
};

/**
 * Prohibited phrases that indicate non-clinical tone
 */
const PROHIBITED_PHRASES = [
  "i'm here to help",
  "feel free to",
  "don't worry",
  "no worries",
  "it's okay",
  "you got this",
  "stay strong",
  "keep your chin up",
  "silver lining",
  "every cloud has",
  "look on the bright side",
  "it could be worse",
];

/**
 * Clinical prefix templates
 */
const CLINICAL_PREFIXES = [
  "Based on mhGAP guidelines",
  "Clinical assessment suggests",
  "According to WHO protocols",
  "Evidence-based recommendations include",
];

/**
 * Required clinical disclaimers
 */
const CLINICAL_DISCLAIMERS = {
  crisis:
    "This is a mental health emergency. Please contact emergency services immediately (dial 911 or local emergency number).",
  highRisk:
    "Based on your responses, it's important to seek immediate professional evaluation. Please contact a mental health professional or visit your nearest emergency department.",
  general:
    "This information is based on clinical guidelines and does not replace professional medical assessment. Please consult with a qualified healthcare provider.",
};

/**
 * Validation result
 */
export interface ToneValidationResult {
  valid: boolean;
  originalText: string;
  correctedText: string;
  violations: string[];
  confidence: number; // 0-1
}

/**
 * Validate and enforce clinical tone
 */
export function enforceClinicAlTone(
  text: string,
  context: {
    riskLevel?: "none" | "low" | "medium" | "high" | "crisis";
    language?: "en" | "ar";
  }
): ToneValidationResult {
  const violations: string[] = [];
  let correctedText = text;

  // Step 1: Remove AI self-references
  correctedText = removeAISelfReferences(correctedText);

  // Step 2: Replace casual phrases
  for (const [casual, formal] of Object.entries(CASUAL_PHRASES)) {
    const regex = new RegExp(casual, "gi");
    if (regex.test(correctedText)) {
      violations.push(`Casual phrase detected: "${casual}"`);
      correctedText = correctedText.replace(regex, formal);
    }
  }

  // Step 3: Check for prohibited phrases
  for (const prohibited of PROHIBITED_PHRASES) {
    const regex = new RegExp(prohibited, "gi");
    if (regex.test(correctedText)) {
      violations.push(`Prohibited phrase detected: "${prohibited}"`);
      // Remove entirely
      correctedText = correctedText.replace(regex, "");
    }
  }

  // Step 4: Remove excessive exclamation marks
  if (/!{2,}/.test(correctedText)) {
    violations.push("Excessive exclamation marks");
    correctedText = correctedText.replace(/!+/g, ".");
  }

  // Step 5: Remove emojis
  if (
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/u.test(
      correctedText
    )
  ) {
    violations.push("Emoji detected");
    correctedText = correctedText.replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/gu,
      ""
    );
  }

  // Step 6: Ensure appropriate clinical prefix
  if (!hasClinicAlPrefix(correctedText)) {
    correctedText = addClinicalPrefix(correctedText, context);
  }

  // Step 7: Add appropriate disclaimer based on risk level
  correctedText = addClinicalDisclaimer(correctedText, context.riskLevel);

  // Step 8: Clean up formatting
  correctedText = cleanFormatting(correctedText);

  // Calculate confidence (lower = more violations)
  const confidence = Math.max(0, 1 - violations.length * 0.15);

  return {
    valid: violations.length === 0,
    originalText: text,
    correctedText,
    violations,
    confidence,
  };
}

/**
 * Remove AI self-references
 */
function removeAISelfReferences(text: string): string {
  const patterns = [
    /as an ai[^.!?]*/gi,
    /as a language model[^.!?]*/gi,
    /i'm (just |not )?an? ai[^.!?]*/gi,
    /i (don't|do not) have (feelings|emotions|personal experience)[^.!?]*/gi,
    /i('m| am) not (a real |an actual )?(doctor|therapist|psychologist|psychiatrist)[^.!?]*/gi,
    /i (can't|cannot) (diagnose|prescribe|provide medical advice)[^.!?]*/gi,
  ];

  let cleaned = text;
  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  return cleaned;
}

/**
 * Check if text has clinical prefix
 */
function hasClinicAlPrefix(text: string): boolean {
  const firstSentence = text.split(/[.!?]/)[0].toLowerCase();

  const clinicalIndicators = [
    "guideline",
    "protocol",
    "assessment",
    "evaluation",
    "clinical",
    "evidence",
    "mhgap",
    "who",
    "recommendation",
  ];

  return clinicalIndicators.some((indicator) =>
    firstSentence.includes(indicator)
  );
}

/**
 * Add clinical prefix
 */
function addClinicalPrefix(
  text: string,
  context: { riskLevel?: string }
): string {
  // Don't add prefix if it's a crisis response (already has urgent language)
  if (context.riskLevel === "crisis") {
    return text;
  }

  // Select appropriate prefix
  const prefix = CLINICAL_PREFIXES[0]; // Default to mhGAP

  return `${prefix}: ${text}`;
}

/**
 * Add clinical disclaimer
 */
function addClinicalDisclaimer(text: string, riskLevel?: string): string {
  // Skip if disclaimer already present
  if (
    text.toLowerCase().includes("disclaimer") ||
    text.toLowerCase().includes("does not replace") ||
    text.toLowerCase().includes("consult")
  ) {
    return text;
  }

  let disclaimer: string;

  switch (riskLevel) {
    case "crisis":
      disclaimer = CLINICAL_DISCLAIMERS.crisis;
      break;
    case "high":
      disclaimer = CLINICAL_DISCLAIMERS.highRisk;
      break;
    default:
      disclaimer = CLINICAL_DISCLAIMERS.general;
  }

  return `${text}\n\n**Important:** ${disclaimer}`;
}

/**
 * Clean formatting
 */
function cleanFormatting(text: string): string {
  return (
    text
      // Remove multiple spaces
      .replace(/  +/g, " ")
      // Remove multiple newlines (max 2)
      .replace(/\n{3,}/g, "\n\n")
      // Trim whitespace
      .trim()
  );
}

/**
 * Validate Arabic clinical tone (basic check)
 */
export function validateArabicClinicalTone(text: string): ToneValidationResult {
  const violations: string[] = [];

  // Check for emojis
  if (
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/u.test(
      text
    )
  ) {
    violations.push("Emoji detected in Arabic text");
  }

  // Check for excessive punctuation
  if (/[!?]{2,}/.test(text)) {
    violations.push("Excessive punctuation in Arabic text");
  }

  let correctedText = text
    .replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/gu,
      ""
    )
    .replace(/[!?]+/g, ".")
    .trim();

  return {
    valid: violations.length === 0,
    originalText: text,
    correctedText,
    violations,
    confidence: violations.length === 0 ? 1 : 0.7,
  };
}

/**
 * Check if response contains medical advice (should be avoided)
 */
export function containsMedicalAdvice(text: string): boolean {
  const medicalAdvicePatterns = [
    /you should (take|stop|start|increase|decrease) (medication|medicine|pills|drug)/i,
    /i (recommend|suggest|prescribe) (taking|stopping)/i,
    /dosage|prescription|pharmaceutical/i,
    /(increase|decrease|adjust) (your|the) (dose|dosage)/i,
  ];

  return medicalAdvicePatterns.some((pattern) => pattern.test(text));
}

/**
 * Enforce clinical boundaries
 */
export function enforceClinicalBoundaries(text: string): string {
  if (containsMedicalAdvice(text)) {
    return "I cannot provide specific medical advice or medication recommendations. Please consult with your prescribing healthcare provider for questions about your medications. I can help you prepare questions to ask your doctor or discuss general coping strategies based on mhGAP guidelines.";
  }

  return text;
}
