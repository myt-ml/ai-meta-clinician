/**
 * Persistence Module
 *
 * IndexedDB storage with automatic encryption/decryption.
 * Offline-first persistence for clinical sessions.
 */

// Storage
export {
  StorageUtils,
  STORES,
  initDatabase,
  getDatabase,
  closeDatabase,
  addToStore,
  getFromStore,
  updateInStore,
  deleteFromStore,
  getAllFromStore,
  queryStoreByIndex,
  queryStoreByRange,
  clearStore,
  deleteDatabase,
  countStore,
  cleanupOldSessions,
} from "./storage";

// Clinical persistence
export {
  ClinicalPersistence,
  saveSession,
  loadSession,
  getAllSessionSummaries,
  getSessionMessages,
  deleteSession,
  saveAuditEvent,
  getSessionAuditTrail,
  storeEncryptionKey,
  retrieveEncryptionKey,
} from "./clinicalPersistence";

export type { StoredSession } from "./clinicalPersistence";
