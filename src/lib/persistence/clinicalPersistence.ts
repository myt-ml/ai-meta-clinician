/**
 * Clinical Session Persistence
 *
 * High-level persistence layer for clinical sessions.
 * Automatically encrypts data before storage and decrypts on retrieval.
 * Integrates IndexedDB storage with encryption layer.
 */

import type {
  Message,
  SessionMetadata,
  PHQState,
  RiskFlag,
  AuditEvent,
} from "../store/types";
import { ClinicalEncryption, type EncryptedMessage } from "../security";
import { StorageUtils, STORES } from "./storage";

/**
 * Stored session envelope
 */
export interface StoredSession {
  id: string;
  metadata: SessionMetadata;
  messages: Message[];
  phq: PHQState;
  riskFlags: RiskFlag[];
  encrypted: boolean;
  lastSaved: number;
}

/**
 * Save current session to IndexedDB
 * Automatically encrypts if encryption key is provided
 */
export async function saveSession(
  session: StoredSession,
  encryptionKey?: CryptoKey
): Promise<void> {
  try {
    if (encryptionKey && session.encrypted) {
      // Encrypt session before storage
      const encrypted = await ClinicalEncryption.encryptClinicalSession(
        {
          metadata: session.metadata,
          messages: session.messages,
          phq: session.phq,
          riskFlags: session.riskFlags,
        },
        encryptionKey
      );

      // Store encrypted session
      await StorageUtils.update(STORES.SESSIONS, {
        id: session.id,
        ...encrypted,
        encrypted: true,
        lastSaved: Date.now(),
      });

      // Store encrypted messages separately for indexing
      for (const encryptedMsg of encrypted.messages) {
        await StorageUtils.update(STORES.MESSAGES, {
          ...encryptedMsg,
          sessionId: session.id,
        });
      }

      // Store encrypted assessment
      await StorageUtils.update(STORES.ASSESSMENTS, {
        id: `phq-${session.id}`,
        sessionId: session.id,
        type: "phq-9",
        data: encrypted.phq,
        timestamp: session.phq.timestamp || Date.now(),
        encrypted: true,
      });
    } else {
      // Store unencrypted (not recommended for production)
      await StorageUtils.update(STORES.SESSIONS, {
        ...session,
        lastSaved: Date.now(),
      });

      // Store messages
      for (const msg of session.messages) {
        await StorageUtils.update(STORES.MESSAGES, {
          ...msg,
          sessionId: session.id,
        });
      }

      // Store assessment
      await StorageUtils.update(STORES.ASSESSMENTS, {
        id: `phq-${session.id}`,
        sessionId: session.id,
        type: "phq-9",
        data: session.phq,
        timestamp: session.phq.timestamp || Date.now(),
        encrypted: false,
      });
    }
  } catch (error) {
    throw new Error(`Failed to save session: ${error}`);
  }
}

/**
 * Load session from IndexedDB
 * Automatically decrypts if encryption key is provided
 */
export async function loadSession(
  sessionId: string,
  encryptionKey?: CryptoKey
): Promise<StoredSession | null> {
  try {
    const storedSession = await StorageUtils.getOne<any>(
      STORES.SESSIONS,
      sessionId
    );

    if (!storedSession) {
      return null;
    }

    if (storedSession.encrypted && encryptionKey) {
      // Decrypt session
      const decrypted = await ClinicalEncryption.decryptClinicalSession(
        {
          metadata: storedSession.metadata,
          messages: storedSession.messages,
          phq: storedSession.phq,
          riskFlags: storedSession.riskFlags,
        },
        encryptionKey
      );

      return {
        id: storedSession.id,
        ...decrypted,
        encrypted: true,
        lastSaved: storedSession.lastSaved,
      };
    } else if (!storedSession.encrypted) {
      // Return unencrypted session
      return storedSession as StoredSession;
    } else {
      throw new Error("Session is encrypted but no encryption key provided");
    }
  } catch (error) {
    throw new Error(`Failed to load session: ${error}`);
  }
}

/**
 * Get all session summaries (metadata only, no messages)
 */
export async function getAllSessionSummaries(): Promise<
  Array<{
    id: string;
    startTime: number;
    lastActivity: number;
    messageCount: number;
    triageCategory: string;
    language: string;
    encrypted: boolean;
  }>
> {
  try {
    const sessions = await StorageUtils.getAll<any>(STORES.SESSIONS);

    return sessions.map((session) => ({
      id: session.id,
      startTime: session.metadata?.startTime || session.startTime,
      lastActivity: session.metadata?.lastActivity || session.lastActivity,
      messageCount: session.metadata?.messageCount || session.messageCount,
      triageCategory:
        session.metadata?.triageCategory || session.triageCategory,
      language: session.metadata?.language || session.language,
      encrypted: session.encrypted,
    }));
  } catch (error) {
    throw new Error(`Failed to get session summaries: ${error}`);
  }
}

/**
 * Get messages for a session
 * Automatically decrypts if key is provided
 */
export async function getSessionMessages(
  sessionId: string,
  encryptionKey?: CryptoKey
): Promise<Message[]> {
  try {
    const messages = await StorageUtils.queryByIndex<any>(
      STORES.MESSAGES,
      "sessionId",
      sessionId
    );

    if (messages.length === 0) {
      return [];
    }

    if (messages[0].encrypted && encryptionKey) {
      return ClinicalEncryption.decryptMessages(
        messages as EncryptedMessage[],
        encryptionKey
      );
    } else if (!messages[0].encrypted) {
      return messages as Message[];
    } else {
      throw new Error("Messages are encrypted but no encryption key provided");
    }
  } catch (error) {
    throw new Error(`Failed to get session messages: ${error}`);
  }
}

/**
 * Delete a session and all its data
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    // Delete session
    await StorageUtils.delete(STORES.SESSIONS, sessionId);

    // Delete messages
    const messages = await StorageUtils.queryByIndex<any>(
      STORES.MESSAGES,
      "sessionId",
      sessionId
    );
    for (const msg of messages) {
      await StorageUtils.delete(STORES.MESSAGES, msg.id);
    }

    // Delete assessments
    const assessments = await StorageUtils.queryByIndex<any>(
      STORES.ASSESSMENTS,
      "sessionId",
      sessionId
    );
    for (const assessment of assessments) {
      await StorageUtils.delete(STORES.ASSESSMENTS, assessment.id);
    }

    // Delete audit logs
    const auditLogs = await StorageUtils.queryByIndex<any>(
      STORES.AUDIT,
      "sessionId",
      sessionId
    );
    for (const log of auditLogs) {
      await StorageUtils.delete(STORES.AUDIT, log.id);
    }
  } catch (error) {
    throw new Error(`Failed to delete session: ${error}`);
  }
}

/**
 * Save audit event
 */
export async function saveAuditEvent(
  event: AuditEvent,
  encryptionKey?: CryptoKey
): Promise<void> {
  try {
    if (encryptionKey && event.encrypted) {
      const encrypted = await ClinicalEncryption.encryptAuditEvent(
        event,
        encryptionKey
      );
      await StorageUtils.add(STORES.AUDIT, encrypted);
    } else {
      await StorageUtils.add(STORES.AUDIT, event);
    }
  } catch (error) {
    throw new Error(`Failed to save audit event: ${error}`);
  }
}

/**
 * Get audit trail for a session
 */
export async function getSessionAuditTrail(
  sessionId: string,
  encryptionKey?: CryptoKey
): Promise<AuditEvent[]> {
  try {
    const events = await StorageUtils.queryByIndex<AuditEvent>(
      STORES.AUDIT,
      "sessionId",
      sessionId
    );

    if (events.length === 0) {
      return [];
    }

    if (events[0].encrypted && encryptionKey) {
      return Promise.all(
        events.map((event) =>
          ClinicalEncryption.decryptAuditEvent(event, encryptionKey)
        )
      );
    } else if (!events[0].encrypted) {
      return events;
    } else {
      throw new Error(
        "Audit events are encrypted but no encryption key provided"
      );
    }
  } catch (error) {
    throw new Error(`Failed to get audit trail: ${error}`);
  }
}

/**
 * Store encryption key (wrapped with master key)
 * WARNING: This requires a master key derivation strategy
 */
export async function storeEncryptionKey(
  sessionId: string,
  key: CryptoKey,
  masterKey: CryptoKey
): Promise<void> {
  try {
    // Export key
    const jwk = await crypto.subtle.exportKey("jwk", key);

    // Encrypt key with master key
    const encryptedKey = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: crypto.getRandomValues(new Uint8Array(12)),
        tagLength: 128,
      },
      masterKey,
      new TextEncoder().encode(JSON.stringify(jwk))
    );

    // Store wrapped key
    await StorageUtils.add(STORES.KEYS, {
      id: `key-${sessionId}`,
      sessionId,
      encryptedKey: Array.from(new Uint8Array(encryptedKey)),
      created: Date.now(),
    });
  } catch (error) {
    throw new Error(`Failed to store encryption key: ${error}`);
  }
}

/**
 * Retrieve encryption key (unwrapped with master key)
 */
export async function retrieveEncryptionKey(
  sessionId: string,
  masterKey: CryptoKey
): Promise<CryptoKey | null> {
  try {
    const storedKey = await StorageUtils.getOne<any>(
      STORES.KEYS,
      `key-${sessionId}`
    );

    if (!storedKey) {
      return null;
    }

    // Decrypt key with master key
    const decryptedJwk = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: storedKey.iv,
        tagLength: 128,
      },
      masterKey,
      new Uint8Array(storedKey.encryptedKey)
    );

    const jwk = JSON.parse(new TextDecoder().decode(decryptedJwk));

    // Import key
    return crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    throw new Error(`Failed to retrieve encryption key: ${error}`);
  }
}

/**
 * Clinical persistence utilities export
 */
export const ClinicalPersistence = {
  saveSession,
  loadSession,
  getAllSessionSummaries,
  getSessionMessages,
  deleteSession,
  saveAuditEvent,
  getSessionAuditTrail,
  storeEncryptionKey,
  retrieveEncryptionKey,
};
