/**
 * Clinical State Store Types
 * 
 * Type definitions for the global clinical state management system.
 * These types ensure type safety across the entire clinical session lifecycle.
 */

export type Language = "en" | "ar" | "es" | "fr" | "zh";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type MessageRole = "user" | "assistant" | "system";

export type TriageCategory = 
  | "crisis"
  | "urgent"
  | "routine"
  | "preventive"
  | "undetermined";

export type LLMProvider = "webllm" | "cloud" | "offline";

export type LLMStatus = 
  | "initializing"
  | "ready"
  | "loading"
  | "error"
  | "offline";

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  language: Language;
  riskLevel?: RiskLevel;
  encrypted?: boolean;
  metadata?: Record<string, unknown>;
}

export interface SessionMetadata {
  id: string;
  startTime: number;
  lastActivity: number;
  language: Language;
  messageCount: number;
  riskFlags: RiskFlag[];
  triageCategory: TriageCategory;
  phqScore?: number;
  encrypted: boolean;
}

export interface RiskFlag {
  id: string;
  level: RiskLevel;
  category: string;
  timestamp: number;
  triggerPhrase?: string;
  resolved: boolean;
  notes?: string;
}

export interface PHQState {
  started: boolean;
  completed: boolean;
  currentQuestion: number;
  responses: number[];
  totalScore?: number;
  severity?: "minimal" | "mild" | "moderate" | "moderately-severe" | "severe";
  timestamp?: number;
}

export interface ASRState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  confidence: number;
  language: Language;
  error?: string;
}

export interface LLMState {
  provider: LLMProvider;
  status: LLMStatus;
  modelName?: string;
  availableModels: string[];
  isStreaming: boolean;
  error?: string;
  lastInference?: number;
  fallbackActive: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: number;
  type: string;
  action: string;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  encrypted: boolean;
}

/**
 * Main Clinical Store State Interface
 * Single source of truth for the entire clinical session
 */
export interface ClinicalState {
  // Session Management
  session: SessionMetadata | null;
  messages: Message[];
  
  // Language & Localization
  language: Language;
  
  // Safety & Risk
  riskFlags: RiskFlag[];
  currentRiskLevel: RiskLevel;
  triageCategory: TriageCategory;
  
  // Clinical Assessments
  phq: PHQState;
  
  // Voice/ASR
  asr: ASRState;
  
  // LLM Management
  llm: LLMState;
  
  // Audit & Compliance
  auditLog: AuditEvent[];
  
  // Encryption & Security
  encryptionEnabled: boolean;
  encryptionKey?: CryptoKey;
  
  // Persistence
  persistenceEnabled: boolean;
  lastSaved?: number;
}

/**
 * Store Actions Interface
 * All mutations to clinical state must go through these actions
 */
export interface ClinicalActions {
  // Session Actions
  createSession: (language: Language) => void;
  endSession: () => void;
  updateSessionMetadata: (metadata: Partial<SessionMetadata>) => void;
  
  // Message Actions
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  clearMessages: () => void;
  
  // Language Actions
  setLanguage: (language: Language) => void;
  
  // Risk & Safety Actions
  addRiskFlag: (flag: Omit<RiskFlag, "id" | "timestamp">) => void;
  resolveRiskFlag: (flagId: string) => void;
  updateRiskLevel: (level: RiskLevel) => void;
  setTriageCategory: (category: TriageCategory) => void;
  
  // PHQ Actions
  startPHQ: () => void;
  updatePHQResponse: (questionIndex: number, response: number) => void;
  completePHQ: () => void;
  resetPHQ: () => void;
  
  // ASR Actions
  setASRListening: (isListening: boolean) => void;
  setASRTranscript: (transcript: string, confidence: number) => void;
  setASRError: (error: string) => void;
  
  // LLM Actions
  setLLMProvider: (provider: LLMProvider) => void;
  setLLMStatus: (status: LLMStatus) => void;
  setLLMModel: (modelName: string) => void;
  setLLMStreaming: (isStreaming: boolean) => void;
  setLLMError: (error: string) => void;
  activateFallback: () => void;
  
  // Audit Actions
  logEvent: (event: Omit<AuditEvent, "id" | "timestamp" | "sessionId">) => void;
  
  // Encryption Actions
  enableEncryption: (key: CryptoKey) => void;
  disableEncryption: () => void;
  
  // Persistence Actions
  enablePersistence: () => void;
  disablePersistence: () => void;
  saveState: () => Promise<void>;
  loadState: () => Promise<void>;
  
  // Reset Actions
  resetStore: () => void;
}

export type ClinicalStore = ClinicalState & ClinicalActions;
