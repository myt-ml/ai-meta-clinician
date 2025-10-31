/**
 * Clinical State Store
 *
 * Global state management for the clinical support system using Zustand.
 * This is the single source of truth for all clinical session data.
 *
 * Design Principles:
 * - Immutable updates only
 * - Safety checks before state mutations
 * - Audit logging for all clinical actions
 * - Encryption-ready state
 * - Offline-first persistence
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  ClinicalStore,
  ClinicalState,
  Message,
  RiskFlag,
  RiskLevel,
  TriageCategory,
  Language,
  LLMProvider,
  LLMStatus,
  AuditEvent,
  SessionMetadata,
} from "./types";

/**
 * Initial state for new clinical sessions
 */
const initialState: ClinicalState = {
  // Session
  session: null,
  messages: [],

  // Language
  language: "en",

  // Safety & Risk
  riskFlags: [],
  currentRiskLevel: "low",
  triageCategory: "undetermined",

  // PHQ Assessment
  phq: {
    started: false,
    completed: false,
    currentQuestion: 0,
    responses: Array(9).fill(-1),
  },

  // ASR
  asr: {
    isListening: false,
    isProcessing: false,
    transcript: "",
    confidence: 0,
    language: "en",
  },

  // LLM
  llm: {
    provider: "webllm",
    status: "initializing",
    availableModels: [],
    isStreaming: false,
    fallbackActive: false,
  },

  // Audit
  auditLog: [],

  // Security
  encryptionEnabled: false,

  // Persistence
  persistenceEnabled: true,
};

/**
 * Generate unique IDs for entities
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate PHQ-9 severity based on total score
 */
const calculatePHQSeverity = (score: number) => {
  if (score <= 4) return "minimal";
  if (score <= 9) return "mild";
  if (score <= 14) return "moderate";
  if (score <= 19) return "moderately-severe";
  return "severe";
};

/**
 * Clinical State Store Implementation
 */
export const useClinicalStore = create<ClinicalStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ==================== Session Actions ====================

        createSession: (language: Language) => {
          const sessionId = generateId();
          const timestamp = Date.now();

          set((state) => ({
            session: {
              id: sessionId,
              startTime: timestamp,
              lastActivity: timestamp,
              language,
              messageCount: 0,
              riskFlags: [],
              triageCategory: "undetermined",
              encrypted: state.encryptionEnabled,
            },
            language,
            messages: [],
            riskFlags: [],
            currentRiskLevel: "low",
            triageCategory: "undetermined",
          }));

          // Log session creation
          get().logEvent({
            type: "session",
            action: "create",
            metadata: { language },
            encrypted: get().encryptionEnabled,
          });
        },

        endSession: () => {
          const state = get();

          // Log session end
          if (state.session) {
            get().logEvent({
              type: "session",
              action: "end",
              metadata: {
                duration: Date.now() - state.session.startTime,
                messageCount: state.session.messageCount,
                finalRiskLevel: state.currentRiskLevel,
              },
              encrypted: state.encryptionEnabled,
            });
          }

          set({ session: null });
        },

        updateSessionMetadata: (metadata: Partial<SessionMetadata>) => {
          set((state) => {
            if (!state.session) return state;

            return {
              session: {
                ...state.session,
                ...metadata,
                lastActivity: Date.now(),
              },
            };
          });
        },

        // ==================== Message Actions ====================

        addMessage: (message) => {
          const newMessage: Message = {
            ...message,
            id: generateId(),
            timestamp: Date.now(),
            language: get().language,
            encrypted: get().encryptionEnabled,
          };

          set((state) => ({
            messages: [...state.messages, newMessage],
            session: state.session
              ? {
                  ...state.session,
                  messageCount: state.session.messageCount + 1,
                  lastActivity: Date.now(),
                }
              : null,
          }));

          // Log message
          get().logEvent({
            type: "message",
            action: "add",
            metadata: {
              role: message.role,
              hasRisk: !!message.riskLevel,
            },
            encrypted: get().encryptionEnabled,
          });
        },

        clearMessages: () => {
          set({ messages: [] });

          get().logEvent({
            type: "message",
            action: "clear",
            encrypted: get().encryptionEnabled,
          });
        },

        // ==================== Language Actions ====================

        setLanguage: (language: Language) => {
          set({
            language,
            asr: { ...get().asr, language },
          });

          get().logEvent({
            type: "language",
            action: "change",
            metadata: { language },
            encrypted: false,
          });
        },

        // ==================== Risk & Safety Actions ====================

        addRiskFlag: (flag) => {
          const newFlag: RiskFlag = {
            ...flag,
            id: generateId(),
            timestamp: Date.now(),
          };

          set((state) => ({
            riskFlags: [...state.riskFlags, newFlag],
            session: state.session
              ? {
                  ...state.session,
                  riskFlags: [...state.session.riskFlags, newFlag],
                }
              : null,
          }));

          // Auto-escalate risk level if needed
          if (flag.level === "critical" || flag.level === "high") {
            get().updateRiskLevel(flag.level);
          }

          // Auto-triage to crisis if critical
          if (flag.level === "critical") {
            get().setTriageCategory("crisis");
          }

          get().logEvent({
            type: "risk",
            action: "flag",
            metadata: {
              level: flag.level,
              category: flag.category,
            },
            encrypted: get().encryptionEnabled,
          });
        },

        resolveRiskFlag: (flagId: string) => {
          set((state) => ({
            riskFlags: state.riskFlags.map((flag) =>
              flag.id === flagId ? { ...flag, resolved: true } : flag
            ),
          }));

          get().logEvent({
            type: "risk",
            action: "resolve",
            metadata: { flagId },
            encrypted: get().encryptionEnabled,
          });
        },

        updateRiskLevel: (level: RiskLevel) => {
          set({ currentRiskLevel: level });

          get().logEvent({
            type: "risk",
            action: "update_level",
            metadata: { level },
            encrypted: get().encryptionEnabled,
          });
        },

        setTriageCategory: (category: TriageCategory) => {
          set((state) => ({
            triageCategory: category,
            session: state.session
              ? { ...state.session, triageCategory: category }
              : null,
          }));

          get().logEvent({
            type: "triage",
            action: "categorize",
            metadata: { category },
            encrypted: get().encryptionEnabled,
          });
        },

        // ==================== PHQ Actions ====================

        startPHQ: () => {
          set({
            phq: {
              started: true,
              completed: false,
              currentQuestion: 0,
              responses: Array(9).fill(-1),
            },
          });

          get().logEvent({
            type: "assessment",
            action: "phq_start",
            encrypted: get().encryptionEnabled,
          });
        },

        updatePHQResponse: (questionIndex: number, response: number) => {
          set((state) => {
            const newResponses = [...state.phq.responses];
            newResponses[questionIndex] = response;

            return {
              phq: {
                ...state.phq,
                responses: newResponses,
                currentQuestion: questionIndex + 1,
              },
            };
          });
        },

        completePHQ: () => {
          const state = get();
          const totalScore = state.phq.responses.reduce(
            (sum, val) => sum + val,
            0
          );
          const severity = calculatePHQSeverity(totalScore);

          set({
            phq: {
              ...state.phq,
              completed: true,
              totalScore,
              severity,
              timestamp: Date.now(),
            },
            session: state.session
              ? { ...state.session, phqScore: totalScore }
              : null,
          });

          // Add risk flag if severe depression detected
          if (totalScore >= 15) {
            get().addRiskFlag({
              level: totalScore >= 20 ? "high" : "moderate",
              category: "depression",
              resolved: false,
              notes: `PHQ-9 score: ${totalScore} (${severity})`,
            });
          }

          get().logEvent({
            type: "assessment",
            action: "phq_complete",
            metadata: {
              score: totalScore,
              severity,
            },
            encrypted: get().encryptionEnabled,
          });
        },

        resetPHQ: () => {
          set({
            phq: {
              started: false,
              completed: false,
              currentQuestion: 0,
              responses: Array(9).fill(-1),
            },
          });
        },

        // ==================== ASR Actions ====================

        setASRListening: (isListening: boolean) => {
          set((state) => ({
            asr: {
              ...state.asr,
              isListening,
              transcript: isListening ? "" : state.asr.transcript,
            },
          }));
        },

        setASRTranscript: (transcript: string, confidence: number) => {
          set((state) => ({
            asr: { ...state.asr, transcript, confidence, isProcessing: false },
          }));
        },

        setASRError: (error: string) => {
          set((state) => ({
            asr: {
              ...state.asr,
              error,
              isListening: false,
              isProcessing: false,
            },
          }));
        },

        // ==================== LLM Actions ====================

        setLLMProvider: (provider: LLMProvider) => {
          set((state) => ({
            llm: { ...state.llm, provider },
          }));

          get().logEvent({
            type: "llm",
            action: "provider_change",
            metadata: { provider },
            encrypted: false,
          });
        },

        setLLMStatus: (status: LLMStatus) => {
          set((state) => ({
            llm: { ...state.llm, status },
          }));
        },

        setLLMModel: (modelName: string) => {
          set((state) => ({
            llm: { ...state.llm, modelName },
          }));
        },

        setLLMStreaming: (isStreaming: boolean) => {
          set((state) => ({
            llm: {
              ...state.llm,
              isStreaming,
              lastInference: isStreaming ? undefined : Date.now(),
            },
          }));
        },

        setLLMError: (error: string) => {
          set((state) => ({
            llm: { ...state.llm, error, status: "error" },
          }));
        },

        activateFallback: () => {
          set((state) => ({
            llm: {
              ...state.llm,
              provider: "offline",
              fallbackActive: true,
              status: "ready",
            },
          }));

          get().logEvent({
            type: "llm",
            action: "fallback_activated",
            metadata: { reason: "primary_failure" },
            encrypted: false,
          });
        },

        // ==================== Audit Actions ====================

        logEvent: (event) => {
          const state = get();

          const auditEvent: AuditEvent = {
            ...event,
            id: generateId(),
            timestamp: Date.now(),
            sessionId: state.session?.id || "no-session",
          };

          set((state) => ({
            auditLog: [...state.auditLog, auditEvent],
          }));
        },

        // ==================== Encryption Actions ====================

        enableEncryption: (key: CryptoKey) => {
          set({
            encryptionEnabled: true,
            encryptionKey: key,
          });

          get().logEvent({
            type: "security",
            action: "encryption_enabled",
            encrypted: false,
          });
        },

        disableEncryption: () => {
          set({
            encryptionEnabled: false,
            encryptionKey: undefined,
          });
        },

        // ==================== Persistence Actions ====================

        enablePersistence: () => {
          set({ persistenceEnabled: true });
        },

        disablePersistence: () => {
          set({ persistenceEnabled: false });
        },

        saveState: async () => {
          const state = get();
          if (!state.persistenceEnabled) return;

          // TODO: Implement IndexedDB persistence with encryption
          set({ lastSaved: Date.now() });

          get().logEvent({
            type: "persistence",
            action: "save",
            encrypted: state.encryptionEnabled,
          });
        },

        loadState: async () => {
          const state = get();
          if (!state.persistenceEnabled) return;

          // TODO: Implement IndexedDB loading with decryption

          get().logEvent({
            type: "persistence",
            action: "load",
            encrypted: state.encryptionEnabled,
          });
        },

        // ==================== Reset Actions ====================

        resetStore: () => {
          get().logEvent({
            type: "system",
            action: "reset",
            encrypted: false,
          });

          set(initialState);
        },
      }),
      {
        name: "clinical-store",
        partialize: (state) =>
          state.persistenceEnabled
            ? {
                session: state.session,
                messages: state.messages,
                language: state.language,
                riskFlags: state.riskFlags,
                currentRiskLevel: state.currentRiskLevel,
                triageCategory: state.triageCategory,
                phq: state.phq,
              }
            : {},
      }
    )
  )
);

/**
 * Selector hooks for optimized component subscriptions
 */
export const useSession = () => useClinicalStore((state) => state.session);
export const useMessages = () => useClinicalStore((state) => state.messages);
export const useLanguage = () => useClinicalStore((state) => state.language);
export const useRiskLevel = () =>
  useClinicalStore((state) => state.currentRiskLevel);
export const usePHQState = () => useClinicalStore((state) => state.phq);
export const useASRState = () => useClinicalStore((state) => state.asr);
export const useLLMState = () => useClinicalStore((state) => state.llm);
export const useTriageCategory = () =>
  useClinicalStore((state) => state.triageCategory);
