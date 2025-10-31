/**
 * Security Module
 *
 * Clinical-grade encryption and security utilities.
 * HIPAA-compliant data protection for patient information.
 */

// Core encryption
export {
  EncryptionUtils,
  generateEncryptionKey,
  deriveKeyFromPassword,
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
} from "./encryption";

export type { EncryptedData, KeyDerivationParams } from "./encryption";

// Clinical data encryption
export {
  ClinicalEncryption,
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
} from "./clinicalEncryption";

export type {
  EncryptedMessage,
  EncryptedPHQState,
  EncryptedSessionMetadata,
} from "./clinicalEncryption";
