/**
 * Clinical Data Encryption Layer
 *
 * AES-GCM encryption for sensitive patient data using Web Crypto API.
 * HIPAA-compliant encryption for clinical sessions, messages, and PHQ responses.
 *
 * Standards:
 * - Algorithm: AES-GCM (Galois/Counter Mode)
 * - Key size: 256 bits
 * - IV size: 96 bits (12 bytes) - recommended for GCM
 * - Tag size: 128 bits (authentication)
 *
 * Security Features:
 * - Authenticated encryption (prevents tampering)
 * - Unique IV per encryption operation
 * - No key storage in plaintext
 * - Constant-time operations where possible
 */

/**
 * Encrypted data envelope
 */
export interface EncryptedData {
  ciphertext: string; // Base64-encoded encrypted data
  iv: string; // Base64-encoded initialization vector
  tag?: string; // Base64-encoded authentication tag (for some implementations)
  algorithm: string; // "AES-GCM"
  timestamp: number; // Encryption timestamp
}

/**
 * Key derivation parameters
 */
export interface KeyDerivationParams {
  password: string;
  salt: string;
  iterations?: number; // PBKDF2 iterations (default: 100,000)
}

/**
 * Encryption configuration
 */
const ENCRYPTION_CONFIG = {
  algorithm: "AES-GCM" as const,
  keyLength: 256, // bits
  ivLength: 12, // bytes (96 bits - recommended for GCM)
  tagLength: 128, // bits
  pbkdf2Iterations: 100000, // OWASP recommended minimum
  saltLength: 16, // bytes
} as const;

/**
 * Generate a cryptographically secure random encryption key
 * Returns a CryptoKey that can be used for encryption/decryption
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  try {
    const key = await crypto.subtle.generateKey(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        length: ENCRYPTION_CONFIG.keyLength,
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );

    return key;
  } catch (error) {
    throw new Error(`Failed to generate encryption key: ${error}`);
  }
}

/**
 * Derive an encryption key from a password using PBKDF2
 * Used for user-provided passwords or session keys
 */
export async function deriveKeyFromPassword(
  params: KeyDerivationParams
): Promise<CryptoKey> {
  const {
    password,
    salt,
    iterations = ENCRYPTION_CONFIG.pbkdf2Iterations,
  } = params;

  try {
    // Convert password to key material
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    // Convert salt
    const saltBuffer = encoder.encode(salt);

    // Derive key
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBuffer,
        iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      {
        name: ENCRYPTION_CONFIG.algorithm,
        length: ENCRYPTION_CONFIG.keyLength,
      },
      true,
      ["encrypt", "decrypt"]
    );

    return key;
  } catch (error) {
    throw new Error(`Failed to derive key from password: ${error}`);
  }
}

/**
 * Generate a cryptographically secure random salt
 */
export function generateSalt(): string {
  const saltBuffer = crypto.getRandomValues(
    new Uint8Array(ENCRYPTION_CONFIG.saltLength)
  );
  return arrayBufferToBase64(saltBuffer.buffer);
}

/**
 * Encrypt data using AES-GCM
 * Returns encrypted envelope with IV and ciphertext
 */
export async function encrypt(
  data: string,
  key: CryptoKey
): Promise<EncryptedData> {
  try {
    // Generate unique IV for this operation
    const iv = crypto.getRandomValues(
      new Uint8Array(ENCRYPTION_CONFIG.ivLength)
    );

    // Convert data to buffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Encrypt
    const cipherBuffer = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv,
        tagLength: ENCRYPTION_CONFIG.tagLength,
      },
      key,
      dataBuffer
    );

    // Return encrypted envelope
    return {
      ciphertext: arrayBufferToBase64(cipherBuffer),
      iv: arrayBufferToBase64(iv.buffer),
      algorithm: ENCRYPTION_CONFIG.algorithm,
      timestamp: Date.now(),
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error}`);
  }
}

/**
 * Decrypt data using AES-GCM
 * Verifies authentication tag to prevent tampering
 */
export async function decrypt(
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<string> {
  try {
    // Validate algorithm
    if (encryptedData.algorithm !== ENCRYPTION_CONFIG.algorithm) {
      throw new Error(`Unsupported algorithm: ${encryptedData.algorithm}`);
    }

    // Convert from base64
    const cipherBuffer = base64ToArrayBuffer(encryptedData.ciphertext);
    const iv = base64ToArrayBuffer(encryptedData.iv);

    // Decrypt
    const dataBuffer = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv,
        tagLength: ENCRYPTION_CONFIG.tagLength,
      },
      key,
      cipherBuffer
    );

    // Convert buffer to string
    const decoder = new TextDecoder();
    return decoder.decode(dataBuffer);
  } catch (error) {
    throw new Error(`Decryption failed: ${error}`);
  }
}

/**
 * Encrypt JSON data (objects, arrays)
 * Convenience wrapper for structured data
 */
export async function encryptJSON<T>(
  data: T,
  key: CryptoKey
): Promise<EncryptedData> {
  const jsonString = JSON.stringify(data);
  return encrypt(jsonString, key);
}

/**
 * Decrypt JSON data
 * Returns typed object
 */
export async function decryptJSON<T>(
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<T> {
  const jsonString = await decrypt(encryptedData, key);
  return JSON.parse(jsonString) as T;
}

/**
 * Export key to JWK format for storage
 * WARNING: Store securely - never expose to network without additional encryption
 */
export async function exportKey(key: CryptoKey): Promise<JsonWebKey> {
  try {
    return await crypto.subtle.exportKey("jwk", key);
  } catch (error) {
    throw new Error(`Failed to export key: ${error}`);
  }
}

/**
 * Import key from JWK format
 */
export async function importKey(jwk: JsonWebKey): Promise<CryptoKey> {
  try {
    return await crypto.subtle.importKey(
      "jwk",
      jwk,
      {
        name: ENCRYPTION_CONFIG.algorithm,
        length: ENCRYPTION_CONFIG.keyLength,
      },
      true,
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    throw new Error(`Failed to import key: ${error}`);
  }
}

/**
 * Utility: Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Utility: Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Securely wipe key from memory (best effort)
 * Note: JavaScript doesn't provide guaranteed memory wiping
 */
export function wipeKey(key: CryptoKey): void {
  // CryptoKey is non-clonable and should be garbage collected
  // This is a symbolic operation in JS - actual wiping depends on browser
  try {
    // Mark for GC
    (key as any) = null;
  } catch {
    // Ignore errors
  }
}

/**
 * Validate encryption key
 * Checks if key is valid and has correct algorithm/usage
 */
export async function validateKey(key: CryptoKey): Promise<boolean> {
  try {
    // Check algorithm
    if (key.algorithm.name !== ENCRYPTION_CONFIG.algorithm) {
      return false;
    }

    // Check usages
    const hasEncrypt = key.usages.includes("encrypt");
    const hasDecrypt = key.usages.includes("decrypt");

    if (!hasEncrypt || !hasDecrypt) {
      return false;
    }

    // Try a test encryption/decryption cycle
    const testData = "test";
    const encrypted = await encrypt(testData, key);
    const decrypted = await decrypt(encrypted, key);

    return decrypted === testData;
  } catch {
    return false;
  }
}

/**
 * Generate session encryption key with metadata
 * Returns both the key and metadata for storage
 */
export async function generateSessionKey(): Promise<{
  key: CryptoKey;
  id: string;
  created: number;
}> {
  const key = await generateEncryptionKey();
  const id = `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    key,
    id,
    created: Date.now(),
  };
}

/**
 * Encryption utilities export
 */
export const EncryptionUtils = {
  generateKey: generateEncryptionKey,
  deriveKey: deriveKeyFromPassword,
  generateSalt,
  generateSessionKey,
  encrypt,
  decrypt,
  encryptJSON,
  decryptJSON,
  exportKey,
  importKey,
  validateKey,
  wipeKey,
  config: ENCRYPTION_CONFIG,
};
