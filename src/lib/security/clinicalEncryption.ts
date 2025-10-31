/**
 * Clinical Data Encryption Wrapper
 *
 * High-level encryption functions for clinical data types.
 * Integrates encryption layer with clinical state store.
 *
 * Encrypted Data Types:
 * - Messages (patient inputs, AI responses)
 * - PHQ-9 responses and scores
 * - Session metadata
 * - Risk flags with trigger phrases
 * - Audit events with sensitive metadata
 */

import type {
  Message,
  PHQState,
  RiskFlag,
  SessionMetadata,
  AuditEvent,
} from "../store/types";
import { EncryptionUtils, type EncryptedData } from "./encryption";

/**
 * Encrypted message envelope
 */
export interface EncryptedMessage {
  id: string;
  role: "user" | "assistant" | "system";
  encryptedText: EncryptedData;
  timestamp: number;
  language: string;
  riskLevel?: string;
  encrypted: true;
}

/**
 * Encrypted PHQ state envelope
 */
export interface EncryptedPHQState {
  started: boolean;
  completed: boolean;
  currentQuestion: number;
  encryptedResponses: EncryptedData;
  totalScore?: number;
  severity?: string;
  timestamp?: number;
  encrypted: true;
}

/**
 * Encrypted session metadata
 */
export interface EncryptedSessionMetadata {
  id: string;
  startTime: number;
  lastActivity: number;
  language: string;
  messageCount: number;
  encryptedRiskFlags: EncryptedData;
  triageCategory: string;
  phqScore?: number;
  encrypted: true;
}

/**
 * Encrypt a single message
 */
export async function encryptMessage(
  message: Message,
  key: CryptoKey
): Promise<EncryptedMessage> {
  const encryptedText = await EncryptionUtils.encrypt(message.text, key);

  return {
    id: message.id,
    role: message.role,
    encryptedText,
    timestamp: message.timestamp,
    language: message.language,
    riskLevel: message.riskLevel,
    encrypted: true,
  };
}

/**
 * Decrypt a single message
 */
export async function decryptMessage(
  encryptedMessage: EncryptedMessage,
  key: CryptoKey
): Promise<Message> {
  const text = await EncryptionUtils.decrypt(
    encryptedMessage.encryptedText,
    key
  );

  return {
    id: encryptedMessage.id,
    role: encryptedMessage.role,
    text,
    timestamp: encryptedMessage.timestamp,
    language: encryptedMessage.language as any,
    riskLevel: encryptedMessage.riskLevel as any,
    encrypted: true,
  };
}

/**
 * Encrypt multiple messages in batch
 */
export async function encryptMessages(
  messages: Message[],
  key: CryptoKey
): Promise<EncryptedMessage[]> {
  return Promise.all(messages.map((msg) => encryptMessage(msg, key)));
}

/**
 * Decrypt multiple messages in batch
 */
export async function decryptMessages(
  encryptedMessages: EncryptedMessage[],
  key: CryptoKey
): Promise<Message[]> {
  return Promise.all(encryptedMessages.map((msg) => decryptMessage(msg, key)));
}

/**
 * Encrypt PHQ-9 state (responses are sensitive)
 */
export async function encryptPHQState(
  phq: PHQState,
  key: CryptoKey
): Promise<EncryptedPHQState> {
  const encryptedResponses = await EncryptionUtils.encryptJSON(
    phq.responses,
    key
  );

  return {
    started: phq.started,
    completed: phq.completed,
    currentQuestion: phq.currentQuestion,
    encryptedResponses,
    totalScore: phq.totalScore,
    severity: phq.severity,
    timestamp: phq.timestamp,
    encrypted: true,
  };
}

/**
 * Decrypt PHQ-9 state
 */
export async function decryptPHQState(
  encryptedPHQ: EncryptedPHQState,
  key: CryptoKey
): Promise<PHQState> {
  const responses = await EncryptionUtils.decryptJSON<number[]>(
    encryptedPHQ.encryptedResponses,
    key
  );

  return {
    started: encryptedPHQ.started,
    completed: encryptedPHQ.completed,
    currentQuestion: encryptedPHQ.currentQuestion,
    responses,
    totalScore: encryptedPHQ.totalScore,
    severity: encryptedPHQ.severity as any,
    timestamp: encryptedPHQ.timestamp,
  };
}

/**
 * Encrypt risk flags (trigger phrases are sensitive)
 */
export async function encryptRiskFlags(
  flags: RiskFlag[],
  key: CryptoKey
): Promise<EncryptedData> {
  return EncryptionUtils.encryptJSON(flags, key);
}

/**
 * Decrypt risk flags
 */
export async function decryptRiskFlags(
  encryptedFlags: EncryptedData,
  key: CryptoKey
): Promise<RiskFlag[]> {
  return EncryptionUtils.decryptJSON<RiskFlag[]>(encryptedFlags, key);
}

/**
 * Encrypt session metadata
 */
export async function encryptSessionMetadata(
  session: SessionMetadata,
  key: CryptoKey
): Promise<EncryptedSessionMetadata> {
  const encryptedRiskFlags = await encryptRiskFlags(session.riskFlags, key);

  return {
    id: session.id,
    startTime: session.startTime,
    lastActivity: session.lastActivity,
    language: session.language,
    messageCount: session.messageCount,
    encryptedRiskFlags,
    triageCategory: session.triageCategory,
    phqScore: session.phqScore,
    encrypted: true,
  };
}

/**
 * Decrypt session metadata
 */
export async function decryptSessionMetadata(
  encryptedSession: EncryptedSessionMetadata,
  key: CryptoKey
): Promise<SessionMetadata> {
  const riskFlags = await decryptRiskFlags(
    encryptedSession.encryptedRiskFlags,
    key
  );

  return {
    id: encryptedSession.id,
    startTime: encryptedSession.startTime,
    lastActivity: encryptedSession.lastActivity,
    language: encryptedSession.language as any,
    messageCount: encryptedSession.messageCount,
    riskFlags,
    triageCategory: encryptedSession.triageCategory as any,
    phqScore: encryptedSession.phqScore,
    encrypted: true,
  };
}

/**
 * Encrypt audit event (may contain sensitive metadata)
 */
export async function encryptAuditEvent(
  event: AuditEvent,
  key: CryptoKey
): Promise<AuditEvent> {
  if (!event.metadata) {
    return event;
  }

  const encryptedMetadata = await EncryptionUtils.encryptJSON(
    event.metadata,
    key
  );

  return {
    ...event,
    metadata: { encrypted: encryptedMetadata } as any,
    encrypted: true,
  };
}

/**
 * Decrypt audit event
 */
export async function decryptAuditEvent(
  encryptedEvent: AuditEvent,
  key: CryptoKey
): Promise<AuditEvent> {
  if (!encryptedEvent.metadata || !(encryptedEvent.metadata as any).encrypted) {
    return encryptedEvent;
  }

  const metadata = await EncryptionUtils.decryptJSON<Record<string, unknown>>(
    (encryptedEvent.metadata as any).encrypted,
    key
  );

  return {
    ...encryptedEvent,
    metadata,
    encrypted: true,
  };
}

/**
 * Encrypt entire clinical session for storage
 */
export async function encryptClinicalSession(
  session: {
    metadata: SessionMetadata;
    messages: Message[];
    phq: PHQState;
    riskFlags: RiskFlag[];
  },
  key: CryptoKey
): Promise<{
  metadata: EncryptedSessionMetadata;
  messages: EncryptedMessage[];
  phq: EncryptedPHQState;
  riskFlags: EncryptedData;
}> {
  const [metadata, messages, phq, riskFlags] = await Promise.all([
    encryptSessionMetadata(session.metadata, key),
    encryptMessages(session.messages, key),
    encryptPHQState(session.phq, key),
    encryptRiskFlags(session.riskFlags, key),
  ]);

  return { metadata, messages, phq, riskFlags };
}

/**
 * Decrypt entire clinical session from storage
 */
export async function decryptClinicalSession(
  encryptedSession: {
    metadata: EncryptedSessionMetadata;
    messages: EncryptedMessage[];
    phq: EncryptedPHQState;
    riskFlags: EncryptedData;
  },
  key: CryptoKey
): Promise<{
  metadata: SessionMetadata;
  messages: Message[];
  phq: PHQState;
  riskFlags: RiskFlag[];
}> {
  const [metadata, messages, phq, riskFlags] = await Promise.all([
    decryptSessionMetadata(encryptedSession.metadata, key),
    decryptMessages(encryptedSession.messages, key),
    decryptPHQState(encryptedSession.phq, key),
    decryptRiskFlags(encryptedSession.riskFlags, key),
  ]);

  return { metadata, messages, phq, riskFlags };
}

/**
 * Clinical encryption utilities export
 */
export const ClinicalEncryption = {
  encryptMessage,
  decryptMessage,
  encryptMessages,
  decryptMessages,
  encryptPHQState,
  decryptPHQState,
  encryptRiskFlags,
  decryptRiskFlags,
  encryptSessionMetadata,
  decryptSessionMetadata,
  encryptAuditEvent,
  decryptAuditEvent,
  encryptClinicalSession,
  decryptClinicalSession,
};
