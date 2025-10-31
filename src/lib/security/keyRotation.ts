/**
 * Encryption Key Rotation Manager
 * 
 * Manages automatic key rotation for encrypted storage.
 * Ensures old data can still be decrypted while new data uses fresh keys.
 * 
 * Features:
 * - Automatic 90-day key rotation
 * - Multi-key storage (old keys kept for decryption)
 * - Key metadata tracking
 * - Rotation scheduling
 * - Emergency rotation support
 * 
 * @module security/keyRotation
 */

import { EncryptionUtils, type EncryptedData } from './encryption';
import type { CryptoKey } from 'crypto';

const KEY_ROTATION_DAYS = 90;
const KEY_STORE_NAME = 'clinician-key-store';

export interface KeyMetadata {
  id: string;
  created: number;
  rotateAfter: number;
  active: boolean;
  version: number;
}

export interface KeyStore {
  keys: KeyMetadata[];
  currentVersion: number;
  lastRotation: number;
  updated: number;
}

export interface EncryptedDataWithKeyId extends EncryptedData {
  keyId: string;
  keyVersion: number;
}

class KeyRotationManager {
  private keys: Map<string, CryptoKey> = new Map();
  private metadata: Map<string, KeyMetadata> = new Map();
  private activeKeyId: string | null = null;
  private initialized = false;
  private dbName = 'encryption-keys';
  private storeName = 'keys';

  /**
   * Initialize the key rotation manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadKeysFromIndexedDB();

      // If no active key exists, create one
      if (!this.activeKeyId) {
        await this.createNewKey();
      }

      // Check if rotation is needed
      await this.checkRotation();

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize key rotation manager:', error);
      throw new Error('Key rotation manager initialization failed');
    }
  }

  /**
   * Load keys from IndexedDB
   */
  private async loadKeysFromIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = async () => {
        const db = request.result;

        try {
          const transaction = db.transaction(this.storeName, 'readonly');
          const store = transaction.objectStore(this.storeName);
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = async () => {
            const records = getAllRequest.result as Array<{
              id: string;
              metadata: KeyMetadata;
              jwk: JsonWebKey;
            }>;

            for (const record of records) {
              this.metadata.set(record.id, record.metadata);
              const key = await EncryptionUtils.importKey(record.jwk);
              this.keys.set(record.id, key);

              if (record.metadata.active) {
                this.activeKeyId = record.id;
              }
            }

            db.close();
            resolve();
          };

          getAllRequest.onerror = () => {
            db.close();
            reject(getAllRequest.error);
          };
        } catch (error) {
          db.close();
          reject(error);
        }
      };
    });
  }

  /**
   * Save key to IndexedDB
   */
  private async saveKeyToIndexedDB(
    keyId: string,
    key: CryptoKey,
    metadata: KeyMetadata
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = async () => {
        const db = request.result;

        try {
          const jwk = await EncryptionUtils.exportKey(key);
          const transaction = db.transaction(this.storeName, 'readwrite');
          const store = transaction.objectStore(this.storeName);

          const putRequest = store.put({
            id: keyId,
            metadata,
            jwk,
          });

          putRequest.onsuccess = () => {
            db.close();
            resolve();
          };

          putRequest.onerror = () => {
            db.close();
            reject(putRequest.error);
          };
        } catch (error) {
          db.close();
          reject(error);
        }
      };
    });
  }

  /**
   * Create a new encryption key
   */
  async createNewKey(): Promise<string> {
    const key = await EncryptionUtils.generateKey();
    const keyId = `key-${Date.now()}-${crypto.randomUUID()}`;
    const currentVersion = this.metadata.size + 1;

    const metadata: KeyMetadata = {
      id: keyId,
      created: Date.now(),
      rotateAfter: Date.now() + KEY_ROTATION_DAYS * 24 * 60 * 60 * 1000,
      active: true,
      version: currentVersion,
    };

    // Deactivate all existing keys
    for (const [id, meta] of this.metadata.entries()) {
      meta.active = false;
      const existingKey = this.keys.get(id);
      if (existingKey) {
        await this.saveKeyToIndexedDB(id, existingKey, meta);
      }
    }

    // Store new key
    this.keys.set(keyId, key);
    this.metadata.set(keyId, metadata);
    this.activeKeyId = keyId;

    await this.saveKeyToIndexedDB(keyId, key, metadata);

    console.log(`[KeyRotation] Created new key: ${keyId} (version ${currentVersion})`);

    return keyId;
  }

  /**
   * Get the active encryption key
   */
  getActiveKey(): { keyId: string; key: CryptoKey; version: number } {
    if (!this.activeKeyId) {
      throw new Error('No active encryption key');
    }

    const key = this.keys.get(this.activeKeyId);
    const metadata = this.metadata.get(this.activeKeyId);

    if (!key || !metadata) {
      throw new Error('Active key not found');
    }

    return {
      keyId: this.activeKeyId,
      key,
      version: metadata.version,
    };
  }

  /**
   * Get a specific key by ID (for decryption)
   */
  getKey(keyId: string): CryptoKey | undefined {
    return this.keys.get(keyId);
  }

  /**
   * Check if key rotation is needed
   */
  async checkRotation(): Promise<boolean> {
    if (!this.activeKeyId) return false;

    const metadata = this.metadata.get(this.activeKeyId);
    if (!metadata) return false;

    if (Date.now() >= metadata.rotateAfter) {
      console.log('[KeyRotation] Automatic rotation triggered');
      await this.createNewKey();
      return true;
    }

    return false;
  }

  /**
   * Force immediate key rotation
   */
  async rotateNow(reason: string = 'Manual rotation'): Promise<void> {
    console.log(`[KeyRotation] Force rotation: ${reason}`);
    await this.createNewKey();
  }

  /**
   * Get all key metadata (for auditing)
   */
  getAllKeyMetadata(): KeyMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * Get days until next rotation
   */
  getDaysUntilRotation(): number | null {
    if (!this.activeKeyId) return null;

    const metadata = this.metadata.get(this.activeKeyId);
    if (!metadata) return null;

    const msUntilRotation = metadata.rotateAfter - Date.now();
    return Math.max(0, Math.ceil(msUntilRotation / (24 * 60 * 60 * 1000)));
  }
}

// Singleton instance
const keyRotationManager = new KeyRotationManager();

/**
 * Encrypt data with automatic key rotation
 */
export async function encryptWithRotation(
  plaintext: string
): Promise<EncryptedDataWithKeyId> {
  await keyRotationManager.initialize();
  await keyRotationManager.checkRotation();

  const { keyId, key, version } = keyRotationManager.getActiveKey();
  const encrypted = await EncryptionUtils.encrypt(plaintext, key);

  return {
    ...encrypted,
    keyId,
    keyVersion: version,
  };
}

/**
 * Decrypt data (supports multiple key versions)
 */
export async function decryptWithRotation(
  encryptedData: EncryptedDataWithKeyId
): Promise<string> {
  await keyRotationManager.initialize();

  const key = keyRotationManager.getKey(encryptedData.keyId);
  if (!key) {
    throw new Error(`Encryption key not found: ${encryptedData.keyId}`);
  }

  return await EncryptionUtils.decrypt(encryptedData, key);
}

/**
 * Encrypt JSON with rotation
 */
export async function encryptJSONWithRotation<T>(
  data: T
): Promise<EncryptedDataWithKeyId> {
  const plaintext = JSON.stringify(data);
  return encryptWithRotation(plaintext);
}

/**
 * Decrypt JSON with rotation support
 */
export async function decryptJSONWithRotation<T>(
  encryptedData: EncryptedDataWithKeyId
): Promise<T> {
  const plaintext = await decryptWithRotation(encryptedData);
  return JSON.parse(plaintext);
}

/**
 * Force key rotation
 */
export async function forceKeyRotation(reason?: string): Promise<void> {
  await keyRotationManager.initialize();
  await keyRotationManager.rotateNow(reason);
}

/**
 * Get rotation status
 */
export async function getRotationStatus(): Promise<{
  daysUntilRotation: number | null;
  currentVersion: number | null;
  totalKeys: number;
  allKeys: KeyMetadata[];
}> {
  await keyRotationManager.initialize();

  return {
    daysUntilRotation: keyRotationManager.getDaysUntilRotation(),
    currentVersion: keyRotationManager.getActiveKey().version,
    totalKeys: keyRotationManager.getAllKeyMetadata().length,
    allKeys: keyRotationManager.getAllKeyMetadata(),
  };
}

/**
 * Initialize key rotation system
 */
export async function initializeKeyRotation(): Promise<void> {
  await keyRotationManager.initialize();
}
