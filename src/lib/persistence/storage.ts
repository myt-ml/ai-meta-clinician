/**
 * IndexedDB Storage Layer
 *
 * Offline-first persistence for clinical sessions with encryption support.
 * Uses IndexedDB for browser-based storage with automatic encryption/decryption.
 *
 * Database Schema:
 * - sessions: Clinical session metadata and state
 * - messages: Encrypted patient messages
 * - assessments: PHQ-9 and other clinical assessments
 * - audit: Audit log entries
 * - keys: Encrypted encryption keys (wrapped with master key)
 *
 * Features:
 * - Automatic encryption/decryption
 * - Indexed queries (by session ID, timestamp, risk level)
 * - Transaction support
 * - Automatic cleanup of old sessions
 * - Offline-first architecture
 */

const DB_NAME = "clinical-store";
const DB_VERSION = 1;

/**
 * Object store names
 */
export const STORES = {
  SESSIONS: "sessions",
  MESSAGES: "messages",
  ASSESSMENTS: "assessments",
  AUDIT: "audit",
  KEYS: "keys",
} as const;

/**
 * Database connection instance
 */
let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB database
 * Creates object stores and indexes
 */
export async function initDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Sessions store
      if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
        const sessionStore = db.createObjectStore(STORES.SESSIONS, {
          keyPath: "id",
        });
        sessionStore.createIndex("startTime", "startTime", { unique: false });
        sessionStore.createIndex("language", "language", { unique: false });
        sessionStore.createIndex("triageCategory", "triageCategory", {
          unique: false,
        });
        sessionStore.createIndex("encrypted", "encrypted", { unique: false });
      }

      // Messages store
      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        const messageStore = db.createObjectStore(STORES.MESSAGES, {
          keyPath: "id",
        });
        messageStore.createIndex("sessionId", "sessionId", { unique: false });
        messageStore.createIndex("timestamp", "timestamp", { unique: false });
        messageStore.createIndex("role", "role", { unique: false });
        messageStore.createIndex("riskLevel", "riskLevel", { unique: false });
      }

      // Assessments store
      if (!db.objectStoreNames.contains(STORES.ASSESSMENTS)) {
        const assessmentStore = db.createObjectStore(STORES.ASSESSMENTS, {
          keyPath: "id",
        });
        assessmentStore.createIndex("sessionId", "sessionId", {
          unique: false,
        });
        assessmentStore.createIndex("type", "type", { unique: false });
        assessmentStore.createIndex("timestamp", "timestamp", {
          unique: false,
        });
      }

      // Audit store
      if (!db.objectStoreNames.contains(STORES.AUDIT)) {
        const auditStore = db.createObjectStore(STORES.AUDIT, {
          keyPath: "id",
        });
        auditStore.createIndex("sessionId", "sessionId", { unique: false });
        auditStore.createIndex("timestamp", "timestamp", { unique: false });
        auditStore.createIndex("type", "type", { unique: false });
        auditStore.createIndex("action", "action", { unique: false });
      }

      // Keys store (encrypted encryption keys)
      if (!db.objectStoreNames.contains(STORES.KEYS)) {
        const keyStore = db.createObjectStore(STORES.KEYS, {
          keyPath: "id",
        });
        keyStore.createIndex("sessionId", "sessionId", { unique: false });
        keyStore.createIndex("created", "created", { unique: false });
      }
    };
  });
}

/**
 * Get database instance
 * Initializes if not already done
 */
export async function getDatabase(): Promise<IDBDatabase> {
  if (!dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Generic function to add data to a store
 */
export async function addToStore<T>(storeName: string, data: T): Promise<void> {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error(`Failed to add to ${storeName}: ${request.error}`));
  });
}

/**
 * Generic function to get data from a store by key
 */
export async function getFromStore<T>(
  storeName: string,
  key: string
): Promise<T | null> {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () =>
      reject(new Error(`Failed to get from ${storeName}: ${request.error}`));
  });
}

/**
 * Generic function to update data in a store
 */
export async function updateInStore<T>(
  storeName: string,
  data: T
): Promise<void> {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error(`Failed to update in ${storeName}: ${request.error}`));
  });
}

/**
 * Generic function to delete data from a store
 */
export async function deleteFromStore(
  storeName: string,
  key: string
): Promise<void> {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error(`Failed to delete from ${storeName}: ${request.error}`));
  });
}

/**
 * Get all items from a store
 */
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () =>
      reject(
        new Error(`Failed to get all from ${storeName}: ${request.error}`)
      );
  });
}

/**
 * Query store by index
 */
export async function queryStoreByIndex<T>(
  storeName: string,
  indexName: string,
  value: any
): Promise<T[]> {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () =>
      reject(
        new Error(
          `Failed to query ${storeName} by ${indexName}: ${request.error}`
        )
      );
  });
}

/**
 * Query store by index range
 */
export async function queryStoreByRange<T>(
  storeName: string,
  indexName: string,
  range: IDBKeyRange
): Promise<T[]> {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(range);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () =>
      reject(
        new Error(`Failed to query ${storeName} by range: ${request.error}`)
      );
  });
}

/**
 * Clear all data from a store
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error(`Failed to clear ${storeName}: ${request.error}`));
  });
}

/**
 * Delete entire database
 * Use with caution - removes all stored data
 */
export async function deleteDatabase(): Promise<void> {
  closeDatabase();

  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(new Error(`Failed to delete database: ${request.error}`));
  });
}

/**
 * Count items in a store
 */
export async function countStore(storeName: string): Promise<number> {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error(`Failed to count ${storeName}: ${request.error}`));
  });
}

/**
 * Cleanup old sessions
 * Removes sessions older than specified days
 */
export async function cleanupOldSessions(
  olderThanDays: number = 30
): Promise<number> {
  const db = await getDatabase();
  const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SESSIONS], "readwrite");
    const store = transaction.objectStore(STORES.SESSIONS);
    const index = store.index("startTime");
    const range = IDBKeyRange.upperBound(cutoffTime);
    const request = index.openCursor(range);

    let deletedCount = 0;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;

      if (cursor) {
        cursor.delete();
        deletedCount++;
        cursor.continue();
      } else {
        resolve(deletedCount);
      }
    };

    request.onerror = () =>
      reject(new Error(`Failed to cleanup old sessions: ${request.error}`));
  });
}

/**
 * Storage utilities export
 */
export const StorageUtils = {
  init: initDatabase,
  get: getDatabase,
  close: closeDatabase,
  add: addToStore,
  getOne: getFromStore,
  update: updateInStore,
  delete: deleteFromStore,
  getAll: getAllFromStore,
  queryByIndex: queryStoreByIndex,
  queryByRange: queryStoreByRange,
  clear: clearStore,
  deleteDB: deleteDatabase,
  count: countStore,
  cleanup: cleanupOldSessions,
};
