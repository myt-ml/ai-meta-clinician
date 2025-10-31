/**
 * Clinical Knowledge Base
 *
 * Rule-based clinical knowledge for offline fallback reasoning.
 * Based on WHO mhGAP guidelines and evidence-based mental health protocols.
 *
 * This provides deterministic clinical responses when LLM is unavailable.
 */

import type { RiskLevel, TriageCategory } from "../store/types";

/**
 * Clinical condition categories
 */
export type ClinicalCondition =
  | "depression"
  | "anxiety"
  | "panic"
  | "ptsd"
  | "psychosis"
  | "substance_use"
  | "suicide_risk"
  | "self_harm"
  | "undetermined";

/**
 * Clinical protocol
 */
export interface ClinicalProtocol {
  condition: ClinicalCondition;
  riskLevel: RiskLevel;
  triageCategory: TriageCategory;
  assessment: string[];
  interventions: string[];
  safetyPlan: string[];
  referralNeeded: boolean;
  emergencyProtocol?: boolean;
}

/**
 * Symptom pattern for condition detection
 */
export interface SymptomPattern {
  keywords: string[];
  weight: number;
  requiredCount?: number;
}

/**
 * Crisis keywords (immediate escalation)
 */
export const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "end my life",
  "want to die",
  "no reason to live",
  "better off dead",
  "overdose",
  "hang myself",
  "jump off",
  "انتحار", // Arabic: suicide
  "اقتل نفسي", // Arabic: kill myself
  "suicidio", // Spanish: suicide
  "matarme", // Spanish: kill myself
];

/**
 * Depression symptom patterns (DSM-5 aligned)
 */
export const DEPRESSION_PATTERNS: SymptomPattern[] = [
  {
    keywords: [
      "depressed",
      "sad",
      "empty",
      "hopeless",
      "worthless",
      "down",
      "miserable",
      "low mood",
    ],
    weight: 3,
  },
  {
    keywords: [
      "no interest",
      "no pleasure",
      "don't enjoy",
      "lost interest",
      "nothing fun",
    ],
    weight: 3,
  },
  {
    keywords: [
      "can't sleep",
      "insomnia",
      "wake up",
      "sleep too much",
      "tired",
      "fatigue",
      "no energy",
    ],
    weight: 2,
  },
  {
    keywords: [
      "can't concentrate",
      "can't focus",
      "memory problems",
      "can't think",
      "confused",
    ],
    weight: 2,
  },
  {
    keywords: [
      "appetite loss",
      "not eating",
      "eating too much",
      "weight loss",
      "weight gain",
    ],
    weight: 1,
  },
  {
    keywords: ["guilty", "blame myself", "my fault", "worthless", "failure"],
    weight: 2,
  },
];

/**
 * Anxiety symptom patterns (GAD-7 aligned)
 */
export const ANXIETY_PATTERNS: SymptomPattern[] = [
  {
    keywords: [
      "anxious",
      "worried",
      "nervous",
      "on edge",
      "tense",
      "restless",
      "scared",
      "fear",
    ],
    weight: 3,
  },
  {
    keywords: [
      "can't stop worrying",
      "worry about everything",
      "constant worry",
      "worrying too much",
    ],
    weight: 3,
  },
  {
    keywords: [
      "panic",
      "panic attack",
      "heart racing",
      "chest pain",
      "can't breathe",
      "hyperventilate",
    ],
    weight: 2,
  },
  {
    keywords: [
      "avoid",
      "afraid to",
      "scared of",
      "can't face",
      "too anxious to",
    ],
    weight: 2,
  },
  {
    keywords: [
      "restless",
      "fidgety",
      "can't sit still",
      "irritable",
      "agitated",
    ],
    weight: 1,
  },
];

/**
 * PTSD symptom patterns
 */
export const PTSD_PATTERNS: SymptomPattern[] = [
  {
    keywords: [
      "trauma",
      "traumatic",
      "abuse",
      "assault",
      "accident",
      "violence",
      "combat",
      "war",
    ],
    weight: 3,
  },
  {
    keywords: [
      "flashbacks",
      "nightmares",
      "reliving",
      "intrusive thoughts",
      "can't forget",
    ],
    weight: 3,
  },
  {
    keywords: [
      "avoid reminders",
      "avoid thinking",
      "can't talk about",
      "shut down",
      "numb",
    ],
    weight: 2,
  },
  {
    keywords: [
      "hypervigilant",
      "always alert",
      "jumpy",
      "startle easily",
      "on guard",
    ],
    weight: 2,
  },
];

/**
 * Psychosis warning signs
 */
export const PSYCHOSIS_PATTERNS: SymptomPattern[] = [
  {
    keywords: [
      "hearing voices",
      "voices tell me",
      "people talking",
      "whispers",
      "commands",
    ],
    weight: 4,
  },
  {
    keywords: [
      "seeing things",
      "visions",
      "hallucinations",
      "not really there",
    ],
    weight: 4,
  },
  {
    keywords: [
      "people after me",
      "being watched",
      "followed",
      "conspiracy",
      "paranoid",
      "spying on me",
    ],
    weight: 3,
  },
  {
    keywords: [
      "special powers",
      "control my thoughts",
      "reading my mind",
      "implanted",
      "messages",
    ],
    weight: 3,
  },
];

/**
 * Substance use patterns
 */
export const SUBSTANCE_PATTERNS: SymptomPattern[] = [
  {
    keywords: [
      "drinking",
      "alcohol",
      "drunk",
      "drugs",
      "using",
      "high",
      "addicted",
    ],
    weight: 3,
  },
  {
    keywords: [
      "can't stop",
      "need it",
      "crave",
      "withdrawal",
      "shaking",
      "sick without",
    ],
    weight: 2,
  },
  {
    keywords: [
      "hiding",
      "lying about",
      "problems because of",
      "lost job",
      "relationship problems",
    ],
    weight: 2,
  },
];

/**
 * Clinical protocols by condition
 */
export const CLINICAL_PROTOCOLS: Record<ClinicalCondition, ClinicalProtocol> = {
  suicide_risk: {
    condition: "suicide_risk",
    riskLevel: "critical",
    triageCategory: "crisis",
    assessment: [
      "Immediate safety assessment required",
      "Assess means and intent",
      "Evaluate protective factors",
      "Check for previous attempts",
    ],
    interventions: [
      "Do not leave person alone",
      "Remove access to means (weapons, medications)",
      "Create immediate safety plan",
      "Contact emergency services if imminent risk",
    ],
    safetyPlan: [
      "Identify warning signs",
      "List internal coping strategies",
      "Identify people for distraction",
      "Contact family/friends who can help",
      "Mental health professionals to contact",
      "Emergency services: 988 Suicide & Crisis Lifeline",
    ],
    referralNeeded: true,
    emergencyProtocol: true,
  },

  depression: {
    condition: "depression",
    riskLevel: "moderate",
    triageCategory: "urgent",
    assessment: [
      "Assess severity using PHQ-9",
      "Evaluate duration and impact",
      "Screen for suicidal ideation",
      "Check functioning level",
    ],
    interventions: [
      "Psychoeducation about depression",
      "Behavioral activation techniques",
      "Sleep hygiene guidance",
      "Social support mobilization",
    ],
    safetyPlan: [
      "Identify early warning signs",
      "List pleasurable activities",
      "Maintain regular sleep schedule",
      "Stay connected with support network",
      "Continue daily routines",
    ],
    referralNeeded: true,
  },

  anxiety: {
    condition: "anxiety",
    riskLevel: "moderate",
    triageCategory: "routine",
    assessment: [
      "Assess severity using GAD-7",
      "Identify triggers and patterns",
      "Evaluate avoidance behaviors",
      "Screen for panic attacks",
    ],
    interventions: [
      "Psychoeducation about anxiety",
      "Breathing and relaxation techniques",
      "Gradual exposure strategies",
      "Cognitive restructuring basics",
    ],
    safetyPlan: [
      "Practice deep breathing daily",
      "Use grounding techniques (5-4-3-2-1)",
      "Limit caffeine and stimulants",
      "Regular physical activity",
      "Maintain sleep schedule",
    ],
    referralNeeded: false,
  },

  panic: {
    condition: "panic",
    riskLevel: "moderate",
    triageCategory: "urgent",
    assessment: [
      "Assess frequency and severity of panic attacks",
      "Identify triggers",
      "Evaluate avoidance patterns",
      "Rule out medical causes",
    ],
    interventions: [
      "Explain panic attack physiology",
      "Teach grounding techniques",
      "Practice controlled breathing",
      "Challenge catastrophic thoughts",
    ],
    safetyPlan: [
      "Use 4-7-8 breathing technique",
      "Ground with 5 senses exercise",
      "Remember: panic passes, not dangerous",
      "Avoid avoidance behaviors",
      "Seek professional help for severe cases",
    ],
    referralNeeded: true,
  },

  ptsd: {
    condition: "ptsd",
    riskLevel: "high",
    triageCategory: "urgent",
    assessment: [
      "Assess trauma history",
      "Screen for re-experiencing symptoms",
      "Evaluate avoidance patterns",
      "Check for hyperarousal",
    ],
    interventions: [
      "Psychoeducation about trauma responses",
      "Grounding and stabilization techniques",
      "Safety and trust building",
      "Refer for trauma-focused therapy",
    ],
    safetyPlan: [
      "Identify trauma triggers",
      "Use grounding techniques",
      "Create safe environments",
      "Build support network",
      "Engage in self-care routines",
    ],
    referralNeeded: true,
  },

  psychosis: {
    condition: "psychosis",
    riskLevel: "high",
    triageCategory: "crisis",
    assessment: [
      "Assess reality testing",
      "Evaluate hallucinations/delusions",
      "Check for safety risks",
      "Screen for substance use",
    ],
    interventions: [
      "Maintain calm, non-judgmental approach",
      "Do not challenge delusions directly",
      "Ensure safety",
      "Urgent psychiatric referral required",
    ],
    safetyPlan: [
      "Remove potential dangers",
      "Stay with trusted person",
      "Avoid stressful situations",
      "Take prescribed medications",
      "Emergency contact numbers available",
    ],
    referralNeeded: true,
    emergencyProtocol: true,
  },

  substance_use: {
    condition: "substance_use",
    riskLevel: "high",
    triageCategory: "urgent",
    assessment: [
      "Assess type and frequency of use",
      "Evaluate withdrawal risk",
      "Check for dependence symptoms",
      "Screen for co-occurring conditions",
    ],
    interventions: [
      "Psychoeducation about substance effects",
      "Motivational interviewing approach",
      "Harm reduction strategies",
      "Support for treatment entry",
    ],
    safetyPlan: [
      "Identify triggers and high-risk situations",
      "Develop coping strategies",
      "Build sober support network",
      "Remove substances from home",
      "Have emergency contacts ready",
    ],
    referralNeeded: true,
  },

  self_harm: {
    condition: "self_harm",
    riskLevel: "high",
    triageCategory: "urgent",
    assessment: [
      "Assess frequency and methods",
      "Evaluate intent (suicide vs. coping)",
      "Check wound severity",
      "Screen for underlying conditions",
    ],
    interventions: [
      "Validate distress without reinforcing behavior",
      "Teach alternative coping strategies",
      "Address underlying emotions",
      "Ensure medical care if needed",
    ],
    safetyPlan: [
      "Identify triggers and urges",
      "Use safer coping alternatives (ice, rubber band)",
      "Reach out before acting",
      "Practice emotion regulation",
      "Keep wounds clean if occurs",
    ],
    referralNeeded: true,
  },

  undetermined: {
    condition: "undetermined",
    riskLevel: "low",
    triageCategory: "routine",
    assessment: [
      "Gather more information",
      "Assess current symptoms",
      "Evaluate functioning",
      "Screen for common conditions",
    ],
    interventions: [
      "Active listening and validation",
      "Psychoeducation about mental health",
      "General coping strategies",
      "Encourage professional assessment",
    ],
    safetyPlan: [
      "Practice self-care basics",
      "Maintain social connections",
      "Regular sleep and eating",
      "Physical activity",
      "Seek help if symptoms worsen",
    ],
    referralNeeded: false,
  },
};

/**
 * Emergency resources by language
 */
export const EMERGENCY_RESOURCES = {
  en: {
    crisis: "988 Suicide & Crisis Lifeline",
    emergency: "911 (Emergency Services)",
    text: "Text HOME to 741741 (Crisis Text Line)",
  },
  ar: {
    crisis: "خط الأزمات والانتحار 988",
    emergency: "911 (خدمات الطوارئ)",
    text: "أرسل HOME إلى 741741",
  },
  es: {
    crisis: "988 Línea de Prevención del Suicidio",
    emergency: "911 (Servicios de Emergencia)",
    text: "Envía HOME al 741741",
  },
  fr: {
    crisis: "988 Ligne de Prévention du Suicide",
    emergency: "911 (Services d'Urgence)",
    text: "Envoyer HOME au 741741",
  },
  zh: {
    crisis: "988 自杀与危机生命线",
    emergency: "911 (紧急服务)",
    text: "发送 HOME 到 741741",
  },
};
