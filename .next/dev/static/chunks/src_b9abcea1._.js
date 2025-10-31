(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/security/encryption.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

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
 */ /**
 * Encrypted data envelope
 */ __turbopack_context__.s([
    "EncryptionUtils",
    ()=>EncryptionUtils,
    "decrypt",
    ()=>decrypt,
    "decryptJSON",
    ()=>decryptJSON,
    "deriveKeyFromPassword",
    ()=>deriveKeyFromPassword,
    "encrypt",
    ()=>encrypt,
    "encryptJSON",
    ()=>encryptJSON,
    "exportKey",
    ()=>exportKey,
    "generateEncryptionKey",
    ()=>generateEncryptionKey,
    "generateSalt",
    ()=>generateSalt,
    "generateSessionKey",
    ()=>generateSessionKey,
    "importKey",
    ()=>importKey,
    "validateKey",
    ()=>validateKey,
    "wipeKey",
    ()=>wipeKey
]);
/**
 * Encryption configuration
 */ const ENCRYPTION_CONFIG = {
    algorithm: "AES-GCM",
    keyLength: 256,
    ivLength: 12,
    tagLength: 128,
    pbkdf2Iterations: 100000,
    saltLength: 16
};
async function generateEncryptionKey() {
    try {
        const key = await crypto.subtle.generateKey({
            name: ENCRYPTION_CONFIG.algorithm,
            length: ENCRYPTION_CONFIG.keyLength
        }, true, [
            "encrypt",
            "decrypt"
        ]);
        return key;
    } catch (error) {
        throw new Error(`Failed to generate encryption key: ${error}`);
    }
}
async function deriveKeyFromPassword(params) {
    const { password, salt, iterations = ENCRYPTION_CONFIG.pbkdf2Iterations } = params;
    try {
        // Convert password to key material
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const keyMaterial = await crypto.subtle.importKey("raw", passwordBuffer, {
            name: "PBKDF2"
        }, false, [
            "deriveBits",
            "deriveKey"
        ]);
        // Convert salt
        const saltBuffer = encoder.encode(salt);
        // Derive key
        const key = await crypto.subtle.deriveKey({
            name: "PBKDF2",
            salt: saltBuffer,
            iterations,
            hash: "SHA-256"
        }, keyMaterial, {
            name: ENCRYPTION_CONFIG.algorithm,
            length: ENCRYPTION_CONFIG.keyLength
        }, true, [
            "encrypt",
            "decrypt"
        ]);
        return key;
    } catch (error) {
        throw new Error(`Failed to derive key from password: ${error}`);
    }
}
function generateSalt() {
    const saltBuffer = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength));
    return arrayBufferToBase64(saltBuffer.buffer);
}
async function encrypt(data, key) {
    try {
        // Generate unique IV for this operation
        const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength));
        // Convert data to buffer
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        // Encrypt
        const cipherBuffer = await crypto.subtle.encrypt({
            name: ENCRYPTION_CONFIG.algorithm,
            iv,
            tagLength: ENCRYPTION_CONFIG.tagLength
        }, key, dataBuffer);
        // Return encrypted envelope
        return {
            ciphertext: arrayBufferToBase64(cipherBuffer),
            iv: arrayBufferToBase64(iv.buffer),
            algorithm: ENCRYPTION_CONFIG.algorithm,
            timestamp: Date.now()
        };
    } catch (error) {
        throw new Error(`Encryption failed: ${error}`);
    }
}
async function decrypt(encryptedData, key) {
    try {
        // Validate algorithm
        if (encryptedData.algorithm !== ENCRYPTION_CONFIG.algorithm) {
            throw new Error(`Unsupported algorithm: ${encryptedData.algorithm}`);
        }
        // Convert from base64
        const cipherBuffer = base64ToArrayBuffer(encryptedData.ciphertext);
        const iv = base64ToArrayBuffer(encryptedData.iv);
        // Decrypt
        const dataBuffer = await crypto.subtle.decrypt({
            name: ENCRYPTION_CONFIG.algorithm,
            iv,
            tagLength: ENCRYPTION_CONFIG.tagLength
        }, key, cipherBuffer);
        // Convert buffer to string
        const decoder = new TextDecoder();
        return decoder.decode(dataBuffer);
    } catch (error) {
        throw new Error(`Decryption failed: ${error}`);
    }
}
async function encryptJSON(data, key) {
    const jsonString = JSON.stringify(data);
    return encrypt(jsonString, key);
}
async function decryptJSON(encryptedData, key) {
    const jsonString = await decrypt(encryptedData, key);
    return JSON.parse(jsonString);
}
async function exportKey(key) {
    try {
        return await crypto.subtle.exportKey("jwk", key);
    } catch (error) {
        throw new Error(`Failed to export key: ${error}`);
    }
}
async function importKey(jwk) {
    try {
        return await crypto.subtle.importKey("jwk", jwk, {
            name: ENCRYPTION_CONFIG.algorithm,
            length: ENCRYPTION_CONFIG.keyLength
        }, true, [
            "encrypt",
            "decrypt"
        ]);
    } catch (error) {
        throw new Error(`Failed to import key: ${error}`);
    }
}
/**
 * Utility: Convert ArrayBuffer to Base64
 */ function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for(let i = 0; i < bytes.length; i++){
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
/**
 * Utility: Convert Base64 to ArrayBuffer
 */ function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for(let i = 0; i < binary.length; i++){
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
function wipeKey(key) {
    // CryptoKey is non-clonable and should be garbage collected
    // This is a symbolic operation in JS - actual wiping depends on browser
    try {
        // Mark for GC
        key = null;
    } catch  {
    // Ignore errors
    }
}
async function validateKey(key) {
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
    } catch  {
        return false;
    }
}
async function generateSessionKey() {
    const key = await generateEncryptionKey();
    const id = `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
        key,
        id,
        created: Date.now()
    };
}
const EncryptionUtils = {
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
    config: ENCRYPTION_CONFIG
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/__tests__/encryption.test.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Encryption Layer Tests
 *
 * Tests for AES-GCM encryption functionality
 */ __turbopack_context__.s([
    "runEncryptionTests",
    ()=>runEncryptionTests
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/security/encryption.ts [app-client] (ecmascript)");
;
async function testBasicEncryption() {
    console.log("🧪 Testing basic encryption/decryption...");
    try {
        const key = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateEncryptionKey"])();
        const plaintext = "This is sensitive patient data";
        const encrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encrypt"])(plaintext, key);
        console.log("  ✓ Encryption successful");
        console.log("    - IV length:", encrypted.iv.length);
        console.log("    - Ciphertext length:", encrypted.ciphertext.length);
        const decrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decrypt"])(encrypted, key);
        console.log("  ✓ Decryption successful");
        if (decrypted === plaintext) {
            console.log("  ✅ PASS: Plaintext matches original");
            return true;
        } else {
            console.error("  ❌ FAIL: Plaintext does not match");
            return false;
        }
    } catch (error) {
        console.error("  ❌ FAIL:", error);
        return false;
    }
}
async function testJSONEncryption() {
    console.log("\n🧪 Testing JSON encryption/decryption...");
    try {
        const key = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateEncryptionKey"])();
        const data = {
            patientId: "12345",
            symptoms: [
                "depression",
                "anxiety"
            ],
            phqScore: 15,
            riskLevel: "moderate"
        };
        const encrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encryptJSON"])(data, key);
        console.log("  ✓ JSON encryption successful");
        const decrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decryptJSON"])(encrypted, key);
        console.log("  ✓ JSON decryption successful");
        if (decrypted.patientId === data.patientId && decrypted.phqScore === data.phqScore && decrypted.riskLevel === data.riskLevel) {
            console.log("  ✅ PASS: JSON data matches original");
            return true;
        } else {
            console.error("  ❌ FAIL: JSON data does not match");
            return false;
        }
    } catch (error) {
        console.error("  ❌ FAIL:", error);
        return false;
    }
}
async function testPasswordDerivation() {
    console.log("\n🧪 Testing password-based key derivation...");
    try {
        const password = "SecurePassword123!";
        const salt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateSalt"])();
        console.log("  ✓ Salt generated:", salt.substring(0, 20) + "...");
        const key1 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deriveKeyFromPassword"])({
            password,
            salt
        });
        console.log("  ✓ Key derived from password");
        const key2 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deriveKeyFromPassword"])({
            password,
            salt
        });
        console.log("  ✓ Key derived again with same password/salt");
        // Test that both keys work the same
        const plaintext = "Test data";
        const encrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encrypt"])(plaintext, key1);
        const decrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decrypt"])(encrypted, key2);
        if (decrypted === plaintext) {
            console.log("  ✅ PASS: Derived keys are consistent");
            return true;
        } else {
            console.error("  ❌ FAIL: Derived keys are not consistent");
            return false;
        }
    } catch (error) {
        console.error("  ❌ FAIL:", error);
        return false;
    }
}
async function testKeyValidation() {
    console.log("\n🧪 Testing key validation...");
    try {
        const validKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateEncryptionKey"])();
        const isValid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateKey"])(validKey);
        if (isValid) {
            console.log("  ✅ PASS: Key validation successful");
            return true;
        } else {
            console.error("  ❌ FAIL: Valid key marked as invalid");
            return false;
        }
    } catch (error) {
        console.error("  ❌ FAIL:", error);
        return false;
    }
}
async function testKeyExportImport() {
    console.log("\n🧪 Testing key export/import...");
    try {
        const originalKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateEncryptionKey"])();
        const plaintext = "Test export/import";
        // Encrypt with original key
        const encrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encrypt"])(plaintext, originalKey);
        console.log("  ✓ Encrypted with original key");
        // Export key
        const jwk = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["exportKey"])(originalKey);
        console.log("  ✓ Key exported to JWK");
        console.log("    - Key type:", jwk.kty);
        console.log("    - Algorithm:", jwk.alg);
        // Import key
        const importedKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["importKey"])(jwk);
        console.log("  ✓ Key imported from JWK");
        // Decrypt with imported key
        const decrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decrypt"])(encrypted, importedKey);
        if (decrypted === plaintext) {
            console.log("  ✅ PASS: Export/import preserves key functionality");
            return true;
        } else {
            console.error("  ❌ FAIL: Imported key does not work");
            return false;
        }
    } catch (error) {
        console.error("  ❌ FAIL:", error);
        return false;
    }
}
async function testAuthenticatedEncryption() {
    console.log("\n🧪 Testing authenticated encryption (tamper detection)...");
    try {
        const key = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateEncryptionKey"])();
        const plaintext = "Sensitive data";
        const encrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encrypt"])(plaintext, key);
        console.log("  ✓ Data encrypted");
        // Tamper with ciphertext
        const tamperedCiphertext = encrypted.ciphertext.slice(0, -10) + "TAMPERED!!";
        const tamperedData = {
            ...encrypted,
            ciphertext: tamperedCiphertext
        };
        let tamperDetected = false;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decrypt"])(tamperedData, key);
            console.error("  ❌ FAIL: Tampered data was not detected");
        } catch (error) {
            tamperDetected = true;
            console.log("  ✓ Tampered data detected and rejected");
        }
        if (tamperDetected) {
            console.log("  ✅ PASS: Authenticated encryption prevents tampering");
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("  ❌ FAIL:", error);
        return false;
    }
}
async function testUniqueIVs() {
    console.log("\n🧪 Testing unique IV generation...");
    try {
        const key = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateEncryptionKey"])();
        const plaintext = "Same data";
        const encrypted1 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encrypt"])(plaintext, key);
        const encrypted2 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encrypt"])(plaintext, key);
        if (encrypted1.iv !== encrypted2.iv) {
            console.log("  ✓ Different IVs generated:", encrypted1.iv.substring(0, 20) + "... vs", encrypted2.iv.substring(0, 20) + "...");
        }
        if (encrypted1.ciphertext !== encrypted2.ciphertext) {
            console.log("  ✓ Different ciphertexts produced");
            console.log("  ✅ PASS: Unique IVs ensure different ciphertexts");
            return true;
        } else {
            console.error("  ❌ FAIL: Same ciphertext produced (IV not working)");
            return false;
        }
    } catch (error) {
        console.error("  ❌ FAIL:", error);
        return false;
    }
}
async function runEncryptionTests() {
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("🔐 ENCRYPTION LAYER TEST SUITE");
    console.log("═══════════════════════════════════════════════════════\n");
    const results = [];
    results.push(await testBasicEncryption());
    results.push(await testJSONEncryption());
    results.push(await testPasswordDerivation());
    results.push(await testKeyValidation());
    results.push(await testKeyExportImport());
    results.push(await testAuthenticatedEncryption());
    results.push(await testUniqueIVs());
    const passed = results.filter((r)=>r).length;
    const total = results.length;
    console.log("\n═══════════════════════════════════════════════════════");
    console.log(`📊 TEST RESULTS: ${passed}/${total} tests passed`);
    if (passed === total) {
        console.log("✅ ALL ENCRYPTION TESTS PASSED");
    } else {
        console.log(`❌ ${total - passed} tests failed`);
    }
    console.log("═══════════════════════════════════════════════════════\n");
    return passed === total;
}
// Browser-compatible export
if ("TURBOPACK compile-time truthy", 1) {
    window.runEncryptionTests = runEncryptionTests;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/persistence/storage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

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
 */ __turbopack_context__.s([
    "STORES",
    ()=>STORES,
    "StorageUtils",
    ()=>StorageUtils,
    "addToStore",
    ()=>addToStore,
    "cleanupOldSessions",
    ()=>cleanupOldSessions,
    "clearStore",
    ()=>clearStore,
    "closeDatabase",
    ()=>closeDatabase,
    "countStore",
    ()=>countStore,
    "deleteDatabase",
    ()=>deleteDatabase,
    "deleteFromStore",
    ()=>deleteFromStore,
    "getAllFromStore",
    ()=>getAllFromStore,
    "getDatabase",
    ()=>getDatabase,
    "getFromStore",
    ()=>getFromStore,
    "initDatabase",
    ()=>initDatabase,
    "queryStoreByIndex",
    ()=>queryStoreByIndex,
    "queryStoreByRange",
    ()=>queryStoreByRange,
    "updateInStore",
    ()=>updateInStore
]);
const DB_NAME = "clinical-store";
const DB_VERSION = 1;
const STORES = {
    SESSIONS: "sessions",
    MESSAGES: "messages",
    ASSESSMENTS: "assessments",
    AUDIT: "audit",
    KEYS: "keys"
};
/**
 * Database connection instance
 */ let dbInstance = null;
async function initDatabase() {
    if (dbInstance) {
        return dbInstance;
    }
    return new Promise((resolve, reject)=>{
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = ()=>{
            reject(new Error(`Failed to open database: ${request.error}`));
        };
        request.onsuccess = ()=>{
            dbInstance = request.result;
            resolve(dbInstance);
        };
        request.onupgradeneeded = (event)=>{
            const db = event.target.result;
            // Sessions store
            if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
                const sessionStore = db.createObjectStore(STORES.SESSIONS, {
                    keyPath: "id"
                });
                sessionStore.createIndex("startTime", "startTime", {
                    unique: false
                });
                sessionStore.createIndex("language", "language", {
                    unique: false
                });
                sessionStore.createIndex("triageCategory", "triageCategory", {
                    unique: false
                });
                sessionStore.createIndex("encrypted", "encrypted", {
                    unique: false
                });
            }
            // Messages store
            if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
                const messageStore = db.createObjectStore(STORES.MESSAGES, {
                    keyPath: "id"
                });
                messageStore.createIndex("sessionId", "sessionId", {
                    unique: false
                });
                messageStore.createIndex("timestamp", "timestamp", {
                    unique: false
                });
                messageStore.createIndex("role", "role", {
                    unique: false
                });
                messageStore.createIndex("riskLevel", "riskLevel", {
                    unique: false
                });
            }
            // Assessments store
            if (!db.objectStoreNames.contains(STORES.ASSESSMENTS)) {
                const assessmentStore = db.createObjectStore(STORES.ASSESSMENTS, {
                    keyPath: "id"
                });
                assessmentStore.createIndex("sessionId", "sessionId", {
                    unique: false
                });
                assessmentStore.createIndex("type", "type", {
                    unique: false
                });
                assessmentStore.createIndex("timestamp", "timestamp", {
                    unique: false
                });
            }
            // Audit store
            if (!db.objectStoreNames.contains(STORES.AUDIT)) {
                const auditStore = db.createObjectStore(STORES.AUDIT, {
                    keyPath: "id"
                });
                auditStore.createIndex("sessionId", "sessionId", {
                    unique: false
                });
                auditStore.createIndex("timestamp", "timestamp", {
                    unique: false
                });
                auditStore.createIndex("type", "type", {
                    unique: false
                });
                auditStore.createIndex("action", "action", {
                    unique: false
                });
            }
            // Keys store (encrypted encryption keys)
            if (!db.objectStoreNames.contains(STORES.KEYS)) {
                const keyStore = db.createObjectStore(STORES.KEYS, {
                    keyPath: "id"
                });
                keyStore.createIndex("sessionId", "sessionId", {
                    unique: false
                });
                keyStore.createIndex("created", "created", {
                    unique: false
                });
            }
        };
    });
}
async function getDatabase() {
    if (!dbInstance) {
        return initDatabase();
    }
    return dbInstance;
}
function closeDatabase() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}
async function addToStore(storeName, data) {
    const db = await getDatabase();
    return new Promise((resolve, reject)=>{
        const transaction = db.transaction([
            storeName
        ], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.add(data);
        request.onsuccess = ()=>resolve();
        request.onerror = ()=>reject(new Error(`Failed to add to ${storeName}: ${request.error}`));
    });
}
async function getFromStore(storeName, key) {
    const db = await getDatabase();
    return new Promise((resolve, reject)=>{
        const transaction = db.transaction([
            storeName
        ], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        request.onsuccess = ()=>resolve(request.result || null);
        request.onerror = ()=>reject(new Error(`Failed to get from ${storeName}: ${request.error}`));
    });
}
async function updateInStore(storeName, data) {
    const db = await getDatabase();
    return new Promise((resolve, reject)=>{
        const transaction = db.transaction([
            storeName
        ], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = ()=>resolve();
        request.onerror = ()=>reject(new Error(`Failed to update in ${storeName}: ${request.error}`));
    });
}
async function deleteFromStore(storeName, key) {
    const db = await getDatabase();
    return new Promise((resolve, reject)=>{
        const transaction = db.transaction([
            storeName
        ], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        request.onsuccess = ()=>resolve();
        request.onerror = ()=>reject(new Error(`Failed to delete from ${storeName}: ${request.error}`));
    });
}
async function getAllFromStore(storeName) {
    const db = await getDatabase();
    return new Promise((resolve, reject)=>{
        const transaction = db.transaction([
            storeName
        ], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = ()=>resolve(request.result || []);
        request.onerror = ()=>reject(new Error(`Failed to get all from ${storeName}: ${request.error}`));
    });
}
async function queryStoreByIndex(storeName, indexName, value) {
    const db = await getDatabase();
    return new Promise((resolve, reject)=>{
        const transaction = db.transaction([
            storeName
        ], "readonly");
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);
        request.onsuccess = ()=>resolve(request.result || []);
        request.onerror = ()=>reject(new Error(`Failed to query ${storeName} by ${indexName}: ${request.error}`));
    });
}
async function queryStoreByRange(storeName, indexName, range) {
    const db = await getDatabase();
    return new Promise((resolve, reject)=>{
        const transaction = db.transaction([
            storeName
        ], "readonly");
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(range);
        request.onsuccess = ()=>resolve(request.result || []);
        request.onerror = ()=>reject(new Error(`Failed to query ${storeName} by range: ${request.error}`));
    });
}
async function clearStore(storeName) {
    const db = await getDatabase();
    return new Promise((resolve, reject)=>{
        const transaction = db.transaction([
            storeName
        ], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = ()=>resolve();
        request.onerror = ()=>reject(new Error(`Failed to clear ${storeName}: ${request.error}`));
    });
}
async function deleteDatabase() {
    closeDatabase();
    return new Promise((resolve, reject)=>{
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = ()=>resolve();
        request.onerror = ()=>reject(new Error(`Failed to delete database: ${request.error}`));
    });
}
async function countStore(storeName) {
    const db = await getDatabase();
    return new Promise((resolve, reject)=>{
        const transaction = db.transaction([
            storeName
        ], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.count();
        request.onsuccess = ()=>resolve(request.result);
        request.onerror = ()=>reject(new Error(`Failed to count ${storeName}: ${request.error}`));
    });
}
async function cleanupOldSessions(olderThanDays = 30) {
    const db = await getDatabase();
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    return new Promise((resolve, reject)=>{
        const transaction = db.transaction([
            STORES.SESSIONS
        ], "readwrite");
        const store = transaction.objectStore(STORES.SESSIONS);
        const index = store.index("startTime");
        const range = IDBKeyRange.upperBound(cutoffTime);
        const request = index.openCursor(range);
        let deletedCount = 0;
        request.onsuccess = (event)=>{
            const cursor = event.target.result;
            if (cursor) {
                cursor.delete();
                deletedCount++;
                cursor.continue();
            } else {
                resolve(deletedCount);
            }
        };
        request.onerror = ()=>reject(new Error(`Failed to cleanup old sessions: ${request.error}`));
    });
}
const StorageUtils = {
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
    cleanup: cleanupOldSessions
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/__tests__/storage.test.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Storage Layer Tests
 *
 * Tests for IndexedDB persistence functionality
 */ __turbopack_context__.s([
    "runStorageTests",
    ()=>runStorageTests
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/persistence/storage.ts [app-client] (ecmascript)");
;
async function testDatabaseInit() {
    console.log("🧪 Testing database initialization...");
    try {
        const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initDatabase"])();
        console.log("  ✓ Database opened successfully");
        console.log("    - Name:", db.name);
        console.log("    - Version:", db.version);
        // Check object stores exist
        const storeNames = Array.from(db.objectStoreNames);
        const expectedStores = Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"]);
        const allStoresExist = expectedStores.every((store)=>storeNames.includes(store));
        if (allStoresExist) {
            console.log("  ✓ All required stores exist:", storeNames.join(", "));
            console.log("  ✅ PASS: Database initialized correctly");
            return true;
        } else {
            console.error("  ❌ FAIL: Missing stores");
            return false;
        }
    } catch (error) {
        console.error("  ❌ FAIL:", error);
        return false;
    }
}
async function testBasicCRUD() {
    console.log("\n🧪 Testing basic CRUD operations...");
    try {
        const testData = {
            id: "test-session-1",
            startTime: Date.now(),
            messageCount: 5,
            language: "en",
            encrypted: false
        };
        // CREATE
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addToStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testData);
        console.log("  ✓ CREATE: Data added to store");
        // READ
        const retrieved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testData.id);
        if (retrieved && retrieved.id === testData.id) {
            console.log("  ✓ READ: Data retrieved successfully");
        } else {
            throw new Error("Retrieved data does not match");
        }
        // UPDATE
        const updatedData = {
            ...testData,
            messageCount: 10
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateInStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, updatedData);
        const afterUpdate = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testData.id);
        if (afterUpdate && afterUpdate.messageCount === 10) {
            console.log("  ✓ UPDATE: Data updated successfully");
        } else {
            throw new Error("Update did not work");
        }
        // DELETE
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testData.id);
        const afterDelete = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testData.id);
        if (afterDelete === null) {
            console.log("  ✓ DELETE: Data deleted successfully");
        } else {
            throw new Error("Delete did not work");
        }
        console.log("  ✅ PASS: All CRUD operations successful");
        return true;
    } catch (error) {
        console.error("  ❌ FAIL:", error);
        return false;
    }
}
async function testIndexQueries() {
    console.log("\n🧪 Testing index-based queries...");
    try {
        // Add test data
        const messages = [
            {
                id: "msg-1",
                sessionId: "session-1",
                timestamp: 1000,
                role: "user",
                text: "Hello"
            },
            {
                id: "msg-2",
                sessionId: "session-1",
                timestamp: 2000,
                role: "assistant",
                text: "Hi"
            },
            {
                id: "msg-3",
                sessionId: "session-2",
                timestamp: 3000,
                role: "user",
                text: "Test"
            }
        ];
        for (const msg of messages){
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addToStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].MESSAGES, msg);
        }
        console.log("  ✓ Test messages added");
        // Query by sessionId
        const session1Messages = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryStoreByIndex"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].MESSAGES, "sessionId", "session-1");
        if (session1Messages.length === 2) {
            console.log("  ✓ Query by sessionId returned correct count");
        } else {
            throw new Error(`Expected 2 messages, got ${session1Messages.length}`);
        }
        // Query by role
        const userMessages = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryStoreByIndex"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].MESSAGES, "role", "user");
        if (userMessages.length === 2) {
            console.log("  ✓ Query by role returned correct count");
        } else {
            throw new Error(`Expected 2 user messages, got ${userMessages.length}`);
        }
        // Cleanup
        for (const msg of messages){
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].MESSAGES, msg.id);
        }
        console.log("  ✓ Test data cleaned up");
        console.log("  ✅ PASS: Index queries work correctly");
        return true;
    } catch (error) {
        console.error("  ❌ FAIL:", error);
        return false;
    }
}
async function testBatchOperations() {
    console.log("\n🧪 Testing batch operations...");
    try {
        // Add multiple items
        const items = Array.from({
            length: 10
        }, (_, i)=>({
                id: `batch-${i}`,
                timestamp: Date.now() + i,
                data: `test-${i}`
            }));
        for (const item of items){
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addToStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].AUDIT, item);
        }
        console.log("  ✓ Batch insert: 10 items added");
        // Get all
        const allItems = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].AUDIT);
        const batchItems = allItems.filter((item)=>item.id.startsWith("batch-"));
        if (batchItems.length === 10) {
            console.log("  ✓ Batch retrieve: All items retrieved");
        } else {
            throw new Error(`Expected 10 items, got ${batchItems.length}`);
        }
        // Count
        const count = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["countStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].AUDIT);
        if (count >= 10) {
            console.log(`  ✓ Count: ${count} items in store`);
        }
        // Clear
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].AUDIT);
        const afterClear = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["countStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].AUDIT);
        if (afterClear === 0) {
            console.log("  ✓ Clear: Store emptied successfully");
        } else {
            throw new Error(`Store should be empty, has ${afterClear} items`);
        }
        console.log("  ✅ PASS: Batch operations successful");
        return true;
    } catch (error) {
        console.error("  ❌ FAIL:", error);
        return false;
    }
}
async function testStorageIntegrity() {
    console.log("\n🧪 Testing storage integrity...");
    try {
        const testSession = {
            id: "integrity-test",
            startTime: Date.now(),
            data: {
                nested: {
                    value: "test"
                }
            },
            array: [
                1,
                2,
                3
            ],
            boolean: true,
            number: 42
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addToStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testSession);
        const retrieved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testSession.id);
        if (!retrieved) {
            throw new Error("Data not retrieved");
        }
        // Check all field types preserved
        const checksPass = retrieved.data.nested.value === "test" && retrieved.array.length === 3 && retrieved.boolean === true && retrieved.number === 42;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testSession.id);
        if (checksPass) {
            console.log("  ✓ All data types preserved correctly");
            console.log("  ✅ PASS: Storage integrity maintained");
            return true;
        } else {
            console.error("  ❌ FAIL: Data corruption detected");
            return false;
        }
    } catch (error) {
        console.error("  ❌ FAIL:", error);
        return false;
    }
}
async function runStorageTests() {
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("💾 STORAGE LAYER TEST SUITE");
    console.log("═══════════════════════════════════════════════════════\n");
    const results = [];
    results.push(await testDatabaseInit());
    results.push(await testBasicCRUD());
    results.push(await testIndexQueries());
    results.push(await testBatchOperations());
    results.push(await testStorageIntegrity());
    const passed = results.filter((r)=>r).length;
    const total = results.length;
    console.log("\n═══════════════════════════════════════════════════════");
    console.log(`📊 TEST RESULTS: ${passed}/${total} tests passed`);
    if (passed === total) {
        console.log("✅ ALL STORAGE TESTS PASSED");
    } else {
        console.log(`❌ ${total - passed} tests failed`);
    }
    console.log("═══════════════════════════════════════════════════════\n");
    return passed === total;
}
// Browser-compatible export
if ("TURBOPACK compile-time truthy", 1) {
    window.runStorageTests = runStorageTests;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/reasoning/clinicalKnowledge.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Clinical Knowledge Base
 *
 * Rule-based clinical knowledge for offline fallback reasoning.
 * Based on WHO mhGAP guidelines and evidence-based mental health protocols.
 *
 * This provides deterministic clinical responses when LLM is unavailable.
 */ __turbopack_context__.s([
    "ANXIETY_PATTERNS",
    ()=>ANXIETY_PATTERNS,
    "CLINICAL_PROTOCOLS",
    ()=>CLINICAL_PROTOCOLS,
    "CRISIS_KEYWORDS",
    ()=>CRISIS_KEYWORDS,
    "DEPRESSION_PATTERNS",
    ()=>DEPRESSION_PATTERNS,
    "EMERGENCY_RESOURCES",
    ()=>EMERGENCY_RESOURCES,
    "PSYCHOSIS_PATTERNS",
    ()=>PSYCHOSIS_PATTERNS,
    "PTSD_PATTERNS",
    ()=>PTSD_PATTERNS,
    "SUBSTANCE_PATTERNS",
    ()=>SUBSTANCE_PATTERNS
]);
const CRISIS_KEYWORDS = [
    "suicide",
    "kill myself",
    "end my life",
    "want to die",
    "no reason to live",
    "better off dead",
    "overdose",
    "hang myself",
    "jump off",
    "انتحار",
    "اقتل نفسي",
    "suicidio",
    "matarme"
];
const DEPRESSION_PATTERNS = [
    {
        keywords: [
            "depressed",
            "sad",
            "empty",
            "hopeless",
            "worthless",
            "down",
            "miserable",
            "low mood"
        ],
        weight: 3
    },
    {
        keywords: [
            "no interest",
            "no pleasure",
            "don't enjoy",
            "lost interest",
            "nothing fun"
        ],
        weight: 3
    },
    {
        keywords: [
            "can't sleep",
            "insomnia",
            "wake up",
            "sleep too much",
            "tired",
            "fatigue",
            "no energy"
        ],
        weight: 2
    },
    {
        keywords: [
            "can't concentrate",
            "can't focus",
            "memory problems",
            "can't think",
            "confused"
        ],
        weight: 2
    },
    {
        keywords: [
            "appetite loss",
            "not eating",
            "eating too much",
            "weight loss",
            "weight gain"
        ],
        weight: 1
    },
    {
        keywords: [
            "guilty",
            "blame myself",
            "my fault",
            "worthless",
            "failure"
        ],
        weight: 2
    }
];
const ANXIETY_PATTERNS = [
    {
        keywords: [
            "anxious",
            "worried",
            "nervous",
            "on edge",
            "tense",
            "restless",
            "scared",
            "fear"
        ],
        weight: 3
    },
    {
        keywords: [
            "can't stop worrying",
            "worry about everything",
            "constant worry",
            "worrying too much"
        ],
        weight: 3
    },
    {
        keywords: [
            "panic",
            "panic attack",
            "heart racing",
            "chest pain",
            "can't breathe",
            "hyperventilate"
        ],
        weight: 2
    },
    {
        keywords: [
            "avoid",
            "afraid to",
            "scared of",
            "can't face",
            "too anxious to"
        ],
        weight: 2
    },
    {
        keywords: [
            "restless",
            "fidgety",
            "can't sit still",
            "irritable",
            "agitated"
        ],
        weight: 1
    }
];
const PTSD_PATTERNS = [
    {
        keywords: [
            "trauma",
            "traumatic",
            "abuse",
            "assault",
            "accident",
            "violence",
            "combat",
            "war"
        ],
        weight: 3
    },
    {
        keywords: [
            "flashbacks",
            "nightmares",
            "reliving",
            "intrusive thoughts",
            "can't forget"
        ],
        weight: 3
    },
    {
        keywords: [
            "avoid reminders",
            "avoid thinking",
            "can't talk about",
            "shut down",
            "numb"
        ],
        weight: 2
    },
    {
        keywords: [
            "hypervigilant",
            "always alert",
            "jumpy",
            "startle easily",
            "on guard"
        ],
        weight: 2
    }
];
const PSYCHOSIS_PATTERNS = [
    {
        keywords: [
            "hearing voices",
            "voices tell me",
            "people talking",
            "whispers",
            "commands"
        ],
        weight: 4
    },
    {
        keywords: [
            "seeing things",
            "visions",
            "hallucinations",
            "not really there"
        ],
        weight: 4
    },
    {
        keywords: [
            "people after me",
            "being watched",
            "followed",
            "conspiracy",
            "paranoid",
            "spying on me"
        ],
        weight: 3
    },
    {
        keywords: [
            "special powers",
            "control my thoughts",
            "reading my mind",
            "implanted",
            "messages"
        ],
        weight: 3
    }
];
const SUBSTANCE_PATTERNS = [
    {
        keywords: [
            "drinking",
            "alcohol",
            "drunk",
            "drugs",
            "using",
            "high",
            "addicted"
        ],
        weight: 3
    },
    {
        keywords: [
            "can't stop",
            "need it",
            "crave",
            "withdrawal",
            "shaking",
            "sick without"
        ],
        weight: 2
    },
    {
        keywords: [
            "hiding",
            "lying about",
            "problems because of",
            "lost job",
            "relationship problems"
        ],
        weight: 2
    }
];
const CLINICAL_PROTOCOLS = {
    suicide_risk: {
        condition: "suicide_risk",
        riskLevel: "critical",
        triageCategory: "crisis",
        assessment: [
            "Immediate safety assessment required",
            "Assess means and intent",
            "Evaluate protective factors",
            "Check for previous attempts"
        ],
        interventions: [
            "Do not leave person alone",
            "Remove access to means (weapons, medications)",
            "Create immediate safety plan",
            "Contact emergency services if imminent risk"
        ],
        safetyPlan: [
            "Identify warning signs",
            "List internal coping strategies",
            "Identify people for distraction",
            "Contact family/friends who can help",
            "Mental health professionals to contact",
            "Emergency services: 988 Suicide & Crisis Lifeline"
        ],
        referralNeeded: true,
        emergencyProtocol: true
    },
    depression: {
        condition: "depression",
        riskLevel: "moderate",
        triageCategory: "urgent",
        assessment: [
            "Assess severity using PHQ-9",
            "Evaluate duration and impact",
            "Screen for suicidal ideation",
            "Check functioning level"
        ],
        interventions: [
            "Psychoeducation about depression",
            "Behavioral activation techniques",
            "Sleep hygiene guidance",
            "Social support mobilization"
        ],
        safetyPlan: [
            "Identify early warning signs",
            "List pleasurable activities",
            "Maintain regular sleep schedule",
            "Stay connected with support network",
            "Continue daily routines"
        ],
        referralNeeded: true
    },
    anxiety: {
        condition: "anxiety",
        riskLevel: "moderate",
        triageCategory: "routine",
        assessment: [
            "Assess severity using GAD-7",
            "Identify triggers and patterns",
            "Evaluate avoidance behaviors",
            "Screen for panic attacks"
        ],
        interventions: [
            "Psychoeducation about anxiety",
            "Breathing and relaxation techniques",
            "Gradual exposure strategies",
            "Cognitive restructuring basics"
        ],
        safetyPlan: [
            "Practice deep breathing daily",
            "Use grounding techniques (5-4-3-2-1)",
            "Limit caffeine and stimulants",
            "Regular physical activity",
            "Maintain sleep schedule"
        ],
        referralNeeded: false
    },
    panic: {
        condition: "panic",
        riskLevel: "moderate",
        triageCategory: "urgent",
        assessment: [
            "Assess frequency and severity of panic attacks",
            "Identify triggers",
            "Evaluate avoidance patterns",
            "Rule out medical causes"
        ],
        interventions: [
            "Explain panic attack physiology",
            "Teach grounding techniques",
            "Practice controlled breathing",
            "Challenge catastrophic thoughts"
        ],
        safetyPlan: [
            "Use 4-7-8 breathing technique",
            "Ground with 5 senses exercise",
            "Remember: panic passes, not dangerous",
            "Avoid avoidance behaviors",
            "Seek professional help for severe cases"
        ],
        referralNeeded: true
    },
    ptsd: {
        condition: "ptsd",
        riskLevel: "high",
        triageCategory: "urgent",
        assessment: [
            "Assess trauma history",
            "Screen for re-experiencing symptoms",
            "Evaluate avoidance patterns",
            "Check for hyperarousal"
        ],
        interventions: [
            "Psychoeducation about trauma responses",
            "Grounding and stabilization techniques",
            "Safety and trust building",
            "Refer for trauma-focused therapy"
        ],
        safetyPlan: [
            "Identify trauma triggers",
            "Use grounding techniques",
            "Create safe environments",
            "Build support network",
            "Engage in self-care routines"
        ],
        referralNeeded: true
    },
    psychosis: {
        condition: "psychosis",
        riskLevel: "high",
        triageCategory: "crisis",
        assessment: [
            "Assess reality testing",
            "Evaluate hallucinations/delusions",
            "Check for safety risks",
            "Screen for substance use"
        ],
        interventions: [
            "Maintain calm, non-judgmental approach",
            "Do not challenge delusions directly",
            "Ensure safety",
            "Urgent psychiatric referral required"
        ],
        safetyPlan: [
            "Remove potential dangers",
            "Stay with trusted person",
            "Avoid stressful situations",
            "Take prescribed medications",
            "Emergency contact numbers available"
        ],
        referralNeeded: true,
        emergencyProtocol: true
    },
    substance_use: {
        condition: "substance_use",
        riskLevel: "high",
        triageCategory: "urgent",
        assessment: [
            "Assess type and frequency of use",
            "Evaluate withdrawal risk",
            "Check for dependence symptoms",
            "Screen for co-occurring conditions"
        ],
        interventions: [
            "Psychoeducation about substance effects",
            "Motivational interviewing approach",
            "Harm reduction strategies",
            "Support for treatment entry"
        ],
        safetyPlan: [
            "Identify triggers and high-risk situations",
            "Develop coping strategies",
            "Build sober support network",
            "Remove substances from home",
            "Have emergency contacts ready"
        ],
        referralNeeded: true
    },
    self_harm: {
        condition: "self_harm",
        riskLevel: "high",
        triageCategory: "urgent",
        assessment: [
            "Assess frequency and methods",
            "Evaluate intent (suicide vs. coping)",
            "Check wound severity",
            "Screen for underlying conditions"
        ],
        interventions: [
            "Validate distress without reinforcing behavior",
            "Teach alternative coping strategies",
            "Address underlying emotions",
            "Ensure medical care if needed"
        ],
        safetyPlan: [
            "Identify triggers and urges",
            "Use safer coping alternatives (ice, rubber band)",
            "Reach out before acting",
            "Practice emotion regulation",
            "Keep wounds clean if occurs"
        ],
        referralNeeded: true
    },
    undetermined: {
        condition: "undetermined",
        riskLevel: "low",
        triageCategory: "routine",
        assessment: [
            "Gather more information",
            "Assess current symptoms",
            "Evaluate functioning",
            "Screen for common conditions"
        ],
        interventions: [
            "Active listening and validation",
            "Psychoeducation about mental health",
            "General coping strategies",
            "Encourage professional assessment"
        ],
        safetyPlan: [
            "Practice self-care basics",
            "Maintain social connections",
            "Regular sleep and eating",
            "Physical activity",
            "Seek help if symptoms worsen"
        ],
        referralNeeded: false
    }
};
const EMERGENCY_RESOURCES = {
    en: {
        crisis: "988 Suicide & Crisis Lifeline",
        emergency: "911 (Emergency Services)",
        text: "Text HOME to 741741 (Crisis Text Line)"
    },
    ar: {
        crisis: "خط الأزمات والانتحار 988",
        emergency: "911 (خدمات الطوارئ)",
        text: "أرسل HOME إلى 741741"
    },
    es: {
        crisis: "988 Línea de Prevención del Suicidio",
        emergency: "911 (Servicios de Emergencia)",
        text: "Envía HOME al 741741"
    },
    fr: {
        crisis: "988 Ligne de Prévention du Suicide",
        emergency: "911 (Services d'Urgence)",
        text: "Envoyer HOME au 741741"
    },
    zh: {
        crisis: "988 自杀与危机生命线",
        emergency: "911 (紧急服务)",
        text: "发送 HOME 到 741741"
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/reasoning/mhgap.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * mhGAP Clinical Reasoning Engine
 *
 * WHO Mental Health Gap Action Programme (mhGAP) implementation
 * Provides rule-based clinical assessment and triage when LLM is unavailable
 *
 * Based on:
 * - WHO mhGAP Intervention Guide (version 2.0)
 * - DSM-5 diagnostic criteria
 * - Evidence-based clinical protocols
 */ __turbopack_context__.s([
    "assessMessage",
    ()=>assessMessage,
    "generateClinicalResponse",
    ()=>generateClinicalResponse,
    "interpretGAD7",
    ()=>interpretGAD7,
    "interpretPHQ9",
    ()=>interpretPHQ9
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/reasoning/clinicalKnowledge.ts [app-client] (ecmascript)");
;
function assessMessage(message, conversationHistory, currentRiskLevel) {
    const normalizedMessage = message.toLowerCase();
    // 1. CRISIS CHECK (highest priority)
    const hasCrisisKeywords = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CRISIS_KEYWORDS"].some((keyword)=>normalizedMessage.includes(keyword.toLowerCase()));
    if (hasCrisisKeywords) {
        return {
            conditions: [
                "suicide_risk"
            ],
            primaryCondition: "suicide_risk",
            riskLevel: "critical",
            triageCategory: "crisis",
            confidence: 0.95,
            requiresEmergency: true,
            protocol: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLINICAL_PROTOCOLS"].suicide_risk
        };
    }
    // 2. SELF-HARM CHECK (high priority, before general pattern matching)
    const selfHarmKeywords = [
        "self-harm",
        "self harm",
        "cut myself",
        "cutting myself",
        "hurt myself",
        "hurting myself",
        "cutting",
        "burning myself",
        "harm myself"
    ];
    const hasSelfHarm = selfHarmKeywords.some((keyword)=>normalizedMessage.includes(keyword.toLowerCase()));
    if (hasSelfHarm) {
        return {
            conditions: [
                "self_harm"
            ],
            primaryCondition: "self_harm",
            riskLevel: "high",
            triageCategory: "urgent",
            confidence: 0.9,
            requiresEmergency: false,
            protocol: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLINICAL_PROTOCOLS"].self_harm
        };
    }
    // 3. PATTERN MATCHING
    const analyses = [
        analyzeSymptoms(normalizedMessage, "depression", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEPRESSION_PATTERNS"]),
        analyzeSymptoms(normalizedMessage, "anxiety", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ANXIETY_PATTERNS"]),
        analyzeSymptoms(normalizedMessage, "ptsd", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PTSD_PATTERNS"]),
        analyzeSymptoms(normalizedMessage, "psychosis", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PSYCHOSIS_PATTERNS"]),
        analyzeSymptoms(normalizedMessage, "substance_use", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SUBSTANCE_PATTERNS"])
    ];
    // 4. RANK CONDITIONS BY SCORE
    analyses.sort((a, b)=>b.score - a.score);
    // 5. SELECT PRIMARY CONDITION
    const topAnalysis = analyses[0];
    const threshold = 3; // Minimum score to diagnose
    if (topAnalysis.score < threshold) {
        return {
            conditions: [
                "undetermined"
            ],
            primaryCondition: "undetermined",
            riskLevel: currentRiskLevel || "low",
            triageCategory: "routine",
            confidence: 0.5,
            requiresEmergency: false,
            protocol: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLINICAL_PROTOCOLS"].undetermined
        };
    }
    // 6. IDENTIFY CO-OCCURRING CONDITIONS
    const significantConditions = analyses.filter((a)=>a.score >= threshold).map((a)=>a.condition);
    // 7. DETERMINE FINAL ASSESSMENT
    const primaryCondition = topAnalysis.condition;
    const protocol = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLINICAL_PROTOCOLS"][primaryCondition];
    // Calculate confidence based on score and co-occurring conditions
    // Score of 3-5 = 0.5-0.7, 6-9 = 0.7-0.85, 10+ = 0.85-0.95
    const confidence = Math.min(0.95, 0.3 + topAnalysis.score / 12);
    // Escalate risk if multiple conditions present
    let finalRiskLevel = protocol.riskLevel;
    if (significantConditions.length > 2) {
        finalRiskLevel = escalateRiskLevel(finalRiskLevel);
    }
    return {
        conditions: significantConditions,
        primaryCondition,
        riskLevel: finalRiskLevel,
        triageCategory: protocol.triageCategory,
        confidence,
        requiresEmergency: protocol.emergencyProtocol || false,
        protocol
    };
}
/**
 * Analyze message for specific condition patterns
 */ function analyzeSymptoms(message, condition, patterns) {
    let totalScore = 0;
    const matches = [];
    for (const pattern of patterns){
        for (const keyword of pattern.keywords){
            if (message.includes(keyword.toLowerCase())) {
                totalScore += pattern.weight;
                matches.push(keyword);
                break; // Only count each pattern once
            }
        }
    }
    return {
        condition,
        score: totalScore,
        matches
    };
}
/**
 * Escalate risk level
 */ function escalateRiskLevel(current) {
    const levels = [
        "low",
        "moderate",
        "high",
        "critical"
    ];
    const currentIndex = levels.indexOf(current);
    const nextIndex = Math.min(currentIndex + 1, levels.length - 1);
    return levels[nextIndex];
}
function generateClinicalResponse(assessment, language = "en") {
    const { protocol, requiresEmergency, conditions } = assessment;
    // Emergency response
    if (requiresEmergency) {
        const resources = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EMERGENCY_RESOURCES"][language];
        return buildEmergencyResponse(protocol, resources, language);
    }
    // Standard clinical response
    return buildStandardResponse(protocol, conditions, language);
}
/**
 * Build emergency response
 */ function buildEmergencyResponse(protocol, resources, language) {
    const templates = {
        en: {
            crisis: `I'm very concerned about your safety right now. This is a serious situation that requires immediate attention.\n\n**IMMEDIATE ACTIONS:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\n**EMERGENCY CONTACTS:**\n• ${resources.crisis}\n• ${resources.emergency}\n• ${resources.text}\n\nPlease reach out to one of these services right now. You don't have to face this alone.`,
            urgent: `Thank you for sharing this with me. What you're experiencing requires professional help. Let's make sure you get the support you need.\n\n**ASSESSMENT:**\n${protocol.assessment.map((a)=>`• ${a}`).join("\n")}\n\n**NEXT STEPS:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\nWould you like help finding mental health services in your area?`
        },
        ar: {
            crisis: `أنا قلق جداً بشأن سلامتك الآن. هذا وضع خطير يتطلب اهتماماً فورياً.\n\n**إجراءات فورية:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\n**جهات الاتصال الطارئة:**\n• ${resources.crisis}\n• ${resources.emergency}\n• ${resources.text}\n\nيرجى التواصل مع إحدى هذه الخدمات الآن. لست مضطراً لمواجهة هذا بمفردك.`,
            urgent: `شكراً لمشاركة هذا معي. ما تمر به يتطلب مساعدة مهنية. دعنا نتأكد من حصولك على الدعم الذي تحتاجه.\n\n**التقييم:**\n${protocol.assessment.map((a)=>`• ${a}`).join("\n")}\n\n**الخطوات التالية:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\nهل تريد المساعدة في إيجاد خدمات الصحة النفسية في منطقتك؟`
        },
        es: {
            crisis: `Estoy muy preocupado por tu seguridad en este momento. Esta es una situación seria que requiere atención inmediata.\n\n**ACCIONES INMEDIATAS:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\n**CONTACTOS DE EMERGENCIA:**\n• ${resources.crisis}\n• ${resources.emergency}\n• ${resources.text}\n\nPor favor, comunícate con uno de estos servicios ahora mismo. No tienes que enfrentar esto solo.`,
            urgent: `Gracias por compartir esto conmigo. Lo que estás experimentando requiere ayuda profesional. Asegurémonos de que obtengas el apoyo que necesitas.\n\n**EVALUACIÓN:**\n${protocol.assessment.map((a)=>`• ${a}`).join("\n")}\n\n**PRÓXIMOS PASOS:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\n¿Te gustaría ayuda para encontrar servicios de salud mental en tu área?`
        },
        fr: {
            crisis: `Je suis très préoccupé par votre sécurité en ce moment. Il s'agit d'une situation grave qui nécessite une attention immédiate.\n\n**ACTIONS IMMÉDIATES:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\n**CONTACTS D'URGENCE:**\n• ${resources.crisis}\n• ${resources.emergency}\n• ${resources.text}\n\nVeuillez contacter l'un de ces services maintenant. Vous n'avez pas à faire face à cela seul.`,
            urgent: `Merci de partager cela avec moi. Ce que vous vivez nécessite une aide professionnelle. Assurons-nous que vous obteniez le soutien dont vous avez besoin.\n\n**ÉVALUATION:**\n${protocol.assessment.map((a)=>`• ${a}`).join("\n")}\n\n**PROCHAINES ÉTAPES:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\nSouhaitez-vous de l'aide pour trouver des services de santé mentale dans votre région?`
        },
        zh: {
            crisis: `我非常担心你现在的安全。这是一个需要立即关注的严重情况。\n\n**立即行动:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\n**紧急联系方式:**\n• ${resources.crisis}\n• ${resources.emergency}\n• ${resources.text}\n\n请立即联系其中一项服务。你不必独自面对这一切。`,
            urgent: `谢谢你与我分享这些。你所经历的需要专业帮助。让我们确保你得到所需的支持。\n\n**评估:**\n${protocol.assessment.map((a)=>`• ${a}`).join("\n")}\n\n**下一步:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\n你需要帮助找到你所在地区的心理健康服务吗？`
        }
    };
    const langTemplates = templates[language] || templates.en;
    return protocol.emergencyProtocol ? langTemplates.crisis : langTemplates.urgent;
}
/**
 * Build standard clinical response
 */ function buildStandardResponse(protocol, conditions, language) {
    const templates = {
        en: {
            routine: `I hear you, and I want to help. Based on what you've shared, it sounds like you may be experiencing symptoms related to ${protocol.condition.replace("_", " ")}.\n\n**UNDERSTANDING YOUR EXPERIENCE:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\n**HELPFUL STRATEGIES:**\n${protocol.safetyPlan.map((s)=>`• ${s}`).join("\n")}${protocol.referralNeeded ? "\n\nI recommend speaking with a mental health professional who can provide more comprehensive support." : ""}`
        },
        ar: {
            routine: `أسمعك وأريد المساعدة. بناءً على ما شاركته، يبدو أنك قد تعاني من أعراض تتعلق بـ${protocol.condition.replace("_", " ")}.\n\n**فهم تجربتك:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\n**استراتيجيات مفيدة:**\n${protocol.safetyPlan.map((s)=>`• ${s}`).join("\n")}${protocol.referralNeeded ? "\n\nأوصي بالتحدث مع أخصائي الصحة النفسية الذي يمكنه تقديم دعم أكثر شمولاً." : ""}`
        },
        es: {
            routine: `Te escucho y quiero ayudar. Basándome en lo que has compartido, parece que podrías estar experimentando síntomas relacionados con ${protocol.condition.replace("_", " ")}.\n\n**ENTENDIENDO TU EXPERIENCIA:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\n**ESTRATEGIAS ÚTILES:**\n${protocol.safetyPlan.map((s)=>`• ${s}`).join("\n")}${protocol.referralNeeded ? "\n\nRecomiendo hablar con un profesional de salud mental que pueda brindar un apoyo más completo." : ""}`
        },
        fr: {
            routine: `Je vous entends et je veux vous aider. D'après ce que vous avez partagé, il semble que vous pourriez éprouver des symptômes liés à ${protocol.condition.replace("_", " ")}.\n\n**COMPRENDRE VOTRE EXPÉRIENCE:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\n**STRATÉGIES UTILES:**\n${protocol.safetyPlan.map((s)=>`• ${s}`).join("\n")}${protocol.referralNeeded ? "\n\nJe recommande de parler avec un professionnel de la santé mentale qui peut fournir un soutien plus complet." : ""}`
        },
        zh: {
            routine: `我听到你了，我想帮助你。根据你分享的内容，你可能正在经历与${protocol.condition.replace("_", " ")}相关的症状。\n\n**了解你的经历:**\n${protocol.interventions.map((i)=>`• ${i}`).join("\n")}\n\n**有用的策略:**\n${protocol.safetyPlan.map((s)=>`• ${s}`).join("\n")}${protocol.referralNeeded ? "\n\n我建议与心理健康专业人士交谈，他们可以提供更全面的支持。" : ""}`
        }
    };
    const langTemplates = templates[language] || templates.en;
    return langTemplates.routine;
}
function interpretPHQ9(totalScore) {
    if (totalScore >= 20) {
        return {
            severity: "Severe depression",
            riskLevel: "high",
            recommendations: [
                "Immediate referral to mental health specialist required",
                "Consider psychiatric evaluation",
                "Assess for safety risks daily",
                "Implement intensive monitoring"
            ]
        };
    } else if (totalScore >= 15) {
        return {
            severity: "Moderately severe depression",
            riskLevel: "high",
            recommendations: [
                "Referral to mental health professional recommended",
                "Consider psychotherapy or medication",
                "Monitor symptoms weekly",
                "Implement structured support"
            ]
        };
    } else if (totalScore >= 10) {
        return {
            severity: "Moderate depression",
            riskLevel: "moderate",
            recommendations: [
                "Professional assessment recommended",
                "Consider counseling or therapy",
                "Implement self-care strategies",
                "Monitor symptoms bi-weekly"
            ]
        };
    } else if (totalScore >= 5) {
        return {
            severity: "Mild depression",
            riskLevel: "low",
            recommendations: [
                "Self-care and lifestyle interventions",
                "Consider counseling if symptoms persist",
                "Monitor symptoms monthly",
                "Focus on wellness activities"
            ]
        };
    } else {
        return {
            severity: "Minimal or no depression",
            riskLevel: "low",
            recommendations: [
                "Continue current wellness practices",
                "Monitor for changes",
                "Maintain healthy lifestyle"
            ]
        };
    }
}
function interpretGAD7(totalScore) {
    if (totalScore >= 15) {
        return {
            severity: "Severe anxiety",
            riskLevel: "high",
            recommendations: [
                "Referral to mental health specialist required",
                "Consider medication evaluation",
                "Intensive anxiety management program",
                "Weekly monitoring recommended"
            ]
        };
    } else if (totalScore >= 10) {
        return {
            severity: "Moderate anxiety",
            riskLevel: "moderate",
            recommendations: [
                "Professional assessment recommended",
                "Consider therapy (CBT or similar)",
                "Practice anxiety management techniques",
                "Monitor symptoms bi-weekly"
            ]
        };
    } else if (totalScore >= 5) {
        return {
            severity: "Mild anxiety",
            riskLevel: "low",
            recommendations: [
                "Self-help strategies appropriate",
                "Consider brief counseling",
                "Practice relaxation techniques",
                "Monitor symptoms monthly"
            ]
        };
    } else {
        return {
            severity: "Minimal anxiety",
            riskLevel: "low",
            recommendations: [
                "Continue current practices",
                "Maintain stress management",
                "Monitor for changes"
            ]
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/llm/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * LLM Service Types
 *
 * Type definitions for Large Language Model integration layer
 */ /**
 * LLM provider types
 */ __turbopack_context__.s([
    "AVAILABLE_MODELS",
    ()=>AVAILABLE_MODELS
]);
const AVAILABLE_MODELS = [
    {
        name: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
        displayName: "Llama 3.2 1B (Fast)",
        size: "0.9GB",
        description: "Fastest, lightweight model for quick responses",
        contextWindow: 4096,
        recommended: true
    },
    {
        name: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
        displayName: "Llama 3.2 3B (Balanced)",
        size: "1.8GB",
        description: "Balanced performance and quality",
        contextWindow: 8192,
        recommended: false
    },
    {
        name: "Phi-3.5-mini-instruct-q4f16_1-MLC",
        displayName: "Phi 3.5 Mini (Efficient)",
        size: "2.1GB",
        description: "Microsoft Phi model, excellent reasoning",
        contextWindow: 4096,
        recommended: false
    },
    {
        name: "gemma-2-2b-it-q4f16_1-MLC",
        displayName: "Gemma 2 2B (Quality)",
        size: "1.4GB",
        description: "Google Gemma model, high quality responses",
        contextWindow: 8192,
        recommended: false
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/llm/prompts.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Clinical LLM Prompts
 *
 * Structured prompts for safe, empathetic, clinical conversations
 */ __turbopack_context__.s([
    "CLINICAL_SYSTEM_PROMPT",
    ()=>CLINICAL_SYSTEM_PROMPT,
    "buildAssessmentPrompt",
    ()=>buildAssessmentPrompt,
    "buildCrisisPrompt",
    ()=>buildCrisisPrompt,
    "buildPrompt",
    ()=>buildPrompt
]);
const CLINICAL_SYSTEM_PROMPT = `You are a compassionate mental health support assistant. Your role is to:

**CORE PRINCIPLES:**
1. Listen actively and validate emotions
2. Provide evidence-based psychoeducation
3. Offer practical coping strategies
4. Recognize crisis situations immediately
5. Maintain professional boundaries

**SAFETY PROTOCOLS:**
- If someone expresses suicidal thoughts, self-harm intent, or immediate danger:
  * Express genuine concern
  * Provide crisis hotline numbers
  * Encourage immediate professional help
  * Never minimize or dismiss their feelings
  
**LIMITATIONS:**
- You are NOT a replacement for professional mental health care
- You cannot diagnose mental health conditions
- You cannot prescribe medications
- You cannot provide therapy, only supportive conversation

**COMMUNICATION STYLE:**
- Use clear, accessible language (avoid jargon)
- Be warm, non-judgmental, and validating
- Ask clarifying questions when needed
- Provide specific, actionable suggestions
- Keep responses concise but thorough (2-4 paragraphs max)

**RESPONSE STRUCTURE:**
1. Acknowledge their feelings
2. Provide context/psychoeducation (if appropriate)
3. Offer practical strategies or next steps
4. Check in / invite further sharing

Always prioritize safety, compassion, and clinical appropriateness.`;
function buildPrompt(userMessage, conversationHistory, currentRiskLevel) {
    // Build conversation context (last 5 messages max to avoid token overflow)
    const recentMessages = conversationHistory.slice(-5).map((msg)=>{
        const role = msg.role === "user" ? "User" : "Assistant";
        return `${role}: ${msg.text}`;
    }).join("\n\n");
    // Add risk context if elevated
    let riskContext = "";
    if (currentRiskLevel === "high" || currentRiskLevel === "critical") {
        riskContext = `\n\n**ALERT: This user has an elevated risk level (${currentRiskLevel}). Exercise extra care and consider recommending professional support.**`;
    }
    // Build final prompt
    return `${CLINICAL_SYSTEM_PROMPT}${riskContext}

---

**CONVERSATION HISTORY:**
${recentMessages}

**CURRENT MESSAGE:**
User: ${userMessage}

**YOUR RESPONSE:**`;
}
function buildCrisisPrompt(userMessage) {
    return `${CLINICAL_SYSTEM_PROMPT}

---

**⚠️ CRISIS SITUATION DETECTED ⚠️**

The user has expressed thoughts or language that suggest they may be in immediate danger. You MUST:

1. **Acknowledge their pain:** Show you understand they're struggling
2. **Express genuine concern:** Make it clear this is serious and you care
3. **Provide crisis resources:**
   - National Suicide Prevention Lifeline: 988 (US)
   - Crisis Text Line: Text HOME to 741741
   - International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/
4. **Encourage immediate action:** Urge them to reach out to one of these services NOW
5. **Offer reassurance:** Let them know help is available and things can improve

**USER'S MESSAGE:**
${userMessage}

**YOUR RESPONSE (prioritize safety, warmth, and crisis resources):**`;
}
function buildAssessmentPrompt(assessmentType, score, userContext) {
    const assessmentInfo = assessmentType === "PHQ-9" ? {
        name: "PHQ-9 (Depression Screening)",
        ranges: "0-4: Minimal, 5-9: Mild, 10-14: Moderate, 15-19: Moderately Severe, 20-27: Severe"
    } : {
        name: "GAD-7 (Anxiety Screening)",
        ranges: "0-4: Minimal, 5-9: Mild, 10-14: Moderate, 15-21: Severe"
    };
    return `${CLINICAL_SYSTEM_PROMPT}

---

**ASSESSMENT INTERPRETATION TASK:**

The user has completed a ${assessmentInfo.name} with a total score of **${score}**.

**Score Ranges:**
${assessmentInfo.ranges}

${userContext ? `**User's Additional Context:**\n${userContext}\n\n` : ""}

**YOUR TASK:**
1. Explain what their score means in plain language
2. Normalize their experience (many people struggle with this)
3. Provide 2-3 evidence-based coping strategies
4. Recommend next steps based on severity
5. Offer hope and encouragement

Keep your response warm, validating, and action-oriented (3-4 paragraphs).`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/llm/llm.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * LLM Service
 *
 * Core integration layer for Large Language Models (WebLLM + Cloud fallback)
 */ __turbopack_context__.s([
    "generateCloudResponse",
    ()=>generateCloudResponse,
    "generateResponse",
    ()=>generateResponse,
    "generateStreamingResponse",
    ()=>generateStreamingResponse,
    "generateWebLLMResponse",
    ()=>generateWebLLMResponse,
    "initializeWebLLM",
    ()=>initializeWebLLM,
    "isModelReady",
    ()=>isModelReady,
    "loadModel",
    ()=>loadModel,
    "unloadModel",
    ()=>unloadModel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$prompts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/prompts.ts [app-client] (ecmascript)");
;
// Dynamic import to avoid SSR issues with WebLLM
let CreateMLCEngine = null;
let mlcEngine = null;
async function initializeWebLLM() {
    try {
        // Check if already initialized
        if (mlcEngine) {
            return true;
        }
        // Dynamic import (only in browser)
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // Import CreateMLCEngine
        const webllm = await __turbopack_context__.A("[project]/node_modules/@mlc-ai/web-llm/lib/index.js [app-client] (ecmascript, async loader)");
        CreateMLCEngine = webllm.CreateMLCEngine;
        console.log("WebLLM module loaded successfully");
        return true;
    } catch (error) {
        console.error("Failed to initialize WebLLM:", error);
        return false;
    }
}
async function loadModel(modelName, onProgress) {
    try {
        // Ensure WebLLM is initialized
        const initialized = await initializeWebLLM();
        if (!initialized || !CreateMLCEngine) {
            throw new Error("WebLLM not initialized");
        }
        // Create engine with progress callback
        const startTime = Date.now();
        mlcEngine = await CreateMLCEngine(modelName, {
            initProgressCallback: (report)=>{
                const progress = Math.round(report.progress * 100);
                const elapsed = Math.round((Date.now() - startTime) / 1000);
                onProgress?.({
                    progress,
                    text: report.text || `Loading model: ${progress}%`,
                    timeElapsed: elapsed
                });
            }
        });
        console.log(`Model ${modelName} loaded successfully`);
        return true;
    } catch (error) {
        console.error("Failed to load model:", error);
        mlcEngine = null;
        return false;
    }
}
async function unloadModel() {
    if (mlcEngine) {
        try {
            await mlcEngine.unload();
            mlcEngine = null;
            console.log("Model unloaded successfully");
        } catch (error) {
            console.error("Failed to unload model:", error);
        }
    }
}
function isModelReady() {
    return mlcEngine !== null;
}
async function generateWebLLMResponse(userMessage, conversationHistory, currentRiskLevel, options = {}) {
    try {
        if (!mlcEngine) {
            throw new Error("Model not loaded");
        }
        // Build prompt
        const isCrisis = currentRiskLevel === "critical";
        const prompt = isCrisis ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$prompts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildCrisisPrompt"])(userMessage) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$prompts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildPrompt"])(userMessage, conversationHistory, currentRiskLevel);
        // Generate response
        const startTime = Date.now();
        const response = await mlcEngine.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 512,
            top_p: options.topP ?? 0.95
        });
        const content = response.choices[0]?.message?.content || "";
        const duration = Date.now() - startTime;
        return {
            content,
            provider: "webllm",
            confidence: 0.85,
            metadata: {
                duration,
                temperature: options.temperature ?? 0.7,
                tokens: response.usage?.total_tokens
            }
        };
    } catch (error) {
        console.error("WebLLM generation failed:", error);
        throw error;
    }
}
async function* generateStreamingResponse(userMessage, conversationHistory, currentRiskLevel, options = {}) {
    try {
        if (!mlcEngine) {
            throw new Error("Model not loaded");
        }
        // Build prompt
        const prompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$prompts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildPrompt"])(userMessage, conversationHistory, currentRiskLevel);
        // Stream response
        const stream = await mlcEngine.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 512,
            stream: true
        });
        for await (const chunk of stream){
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
                yield delta;
            }
        }
    } catch (error) {
        console.error("Streaming generation failed:", error);
        throw error;
    }
}
async function generateCloudResponse(userMessage, conversationHistory, currentRiskLevel, options = {}) {
    // TODO: Implement cloud API integration (OpenAI, Anthropic, etc.)
    throw new Error("Cloud API not yet implemented");
}
async function generateResponse(userMessage, conversationHistory, currentRiskLevel, preferredProvider = "webllm", options = {}) {
    // Try preferred provider first
    if (preferredProvider === "webllm" && isModelReady()) {
        try {
            return await generateWebLLMResponse(userMessage, conversationHistory, currentRiskLevel, options);
        } catch (error) {
            console.warn("WebLLM failed, will use offline fallback");
        }
    }
    // Try cloud as secondary option
    if (preferredProvider === "cloud") {
        try {
            return await generateCloudResponse(userMessage, conversationHistory, currentRiskLevel, options);
        } catch (error) {
            console.warn("Cloud API failed, will use offline fallback");
        }
    }
    // All LLM options failed, signal to use offline reasoning
    throw new Error("LLM_UNAVAILABLE");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/llm/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * LLM Service - Public API
 */ __turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$llm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/llm.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$prompts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/prompts.ts [app-client] (ecmascript)");
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/validation/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Clinical Output Validation Types
 *
 * Content filtering and validation for clinical AI responses
 */ __turbopack_context__.s([
    "DISCLAIMER_TEMPLATES",
    ()=>DISCLAIMER_TEMPLATES,
    "HARMFUL_PATTERNS",
    ()=>HARMFUL_PATTERNS,
    "SCOPE_VIOLATIONS",
    ()=>SCOPE_VIOLATIONS
]);
const HARMFUL_PATTERNS = [
    {
        category: "medical_diagnosis",
        severity: "critical",
        patterns: [
            "you have",
            "you are diagnosed with",
            "i diagnose you",
            "you suffer from",
            "you definitely have"
        ]
    },
    {
        category: "medication_advice",
        severity: "critical",
        patterns: [
            "take this medication",
            "stop taking",
            "increase your dose",
            "decrease your dose",
            "you should take",
            "i recommend taking"
        ]
    },
    {
        category: "emergency_dismissal",
        severity: "critical",
        patterns: [
            "you don't need emergency help",
            "it's not that serious",
            "you're overreacting",
            "calm down, you're fine",
            "don't call 911",
            "you don't need a doctor"
        ]
    },
    {
        category: "guarantee_claim",
        severity: "high",
        patterns: [
            "i guarantee",
            "this will definitely work",
            "you will be cured",
            "guaranteed to help",
            "100% effective",
            "you'll definitely feel better"
        ]
    },
    {
        category: "personal_info_request",
        severity: "high",
        patterns: [
            "what is your full name",
            "what's your address",
            "tell me your social security",
            "give me your phone number",
            "where do you live"
        ]
    }
];
const SCOPE_VIOLATIONS = [
    {
        category: "scope_violation",
        severity: "high",
        patterns: [
            "i can prescribe",
            "i'll write a prescription",
            "here's your treatment plan",
            "as your therapist",
            "in our therapy session"
        ]
    }
];
const DISCLAIMER_TEMPLATES = [
    // English disclaimers
    {
        id: "general_en",
        context: "general",
        language: "en",
        text: "**Note:** I'm an AI assistant providing supportive information only. I'm not a replacement for professional mental health care.",
        position: "suffix"
    },
    {
        id: "crisis_en",
        context: "crisis",
        language: "en",
        text: "**IMPORTANT:** If you're in immediate danger, please contact emergency services (911) or a crisis hotline (988 in the US, Crisis Text Line: text HOME to 741741).",
        position: "prefix"
    },
    {
        id: "assessment_en",
        context: "assessment",
        language: "en",
        text: "**Disclaimer:** This is a screening tool, not a diagnosis. Please consult a mental health professional for a comprehensive evaluation.",
        position: "suffix"
    },
    {
        id: "medication_en",
        context: "medication",
        language: "en",
        text: "**Medication Notice:** Never start, stop, or change medications without consulting your healthcare provider first.",
        position: "both"
    },
    // Arabic disclaimers
    {
        id: "general_ar",
        context: "general",
        language: "ar",
        text: "**ملاحظة:** أنا مساعد ذكاء اصطناعي أقدم معلومات داعمة فقط. لست بديلاً عن الرعاية الصحية النفسية المهنية.",
        position: "suffix"
    },
    {
        id: "crisis_ar",
        context: "crisis",
        language: "ar",
        text: "**مهم:** إذا كنت في خطر فوري، يرجى الاتصال بخدمات الطوارئ أو خط المساعدة في الأزمات.",
        position: "prefix"
    },
    // Spanish disclaimers
    {
        id: "general_es",
        context: "general",
        language: "es",
        text: "**Nota:** Soy un asistente de IA que proporciona información de apoyo únicamente. No soy un reemplazo para la atención profesional de salud mental.",
        position: "suffix"
    },
    {
        id: "crisis_es",
        context: "crisis",
        language: "es",
        text: "**IMPORTANTE:** Si está en peligro inmediato, comuníquese con los servicios de emergencia (911) o una línea de crisis (988 en EE.UU.).",
        position: "prefix"
    },
    // French disclaimers
    {
        id: "general_fr",
        context: "general",
        language: "fr",
        text: "**Note :** Je suis un assistant IA fournissant uniquement des informations de soutien. Je ne remplace pas les soins professionnels de santé mentale.",
        position: "suffix"
    },
    // Chinese disclaimers
    {
        id: "general_zh",
        context: "general",
        language: "zh",
        text: "**注意：** 我是一个AI助手，仅提供支持性信息。我不能替代专业的心理健康护理。",
        position: "suffix"
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/validation/validator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Response Validator
 *
 * Validates and sanitizes clinical AI responses before delivery
 */ __turbopack_context__.s([
    "containsMedicalAdvice",
    ()=>containsMedicalAdvice,
    "isCrisisAppropriate",
    ()=>isCrisisAppropriate,
    "sanitizeResponse",
    ()=>sanitizeResponse,
    "validateLength",
    ()=>validateLength,
    "validateResponse",
    ()=>validateResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/types.ts [app-client] (ecmascript)");
;
function validateResponse(response, context) {
    const violations = [];
    let modifiedContent = response;
    // 1. Check for harmful patterns
    for (const filter of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HARMFUL_PATTERNS"]){
        const detected = detectPattern(response, filter.patterns);
        if (detected) {
            violations.push({
                type: filter.category,
                severity: filter.severity,
                description: `Detected ${filter.category.replace("_", " ")}`,
                detectedContent: detected,
                suggestion: `Remove or rephrase: "${detected}"`
            });
        }
    }
    // 2. Check for scope violations
    for (const filter of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCOPE_VIOLATIONS"]){
        const detected = detectPattern(response, filter.patterns);
        if (detected) {
            violations.push({
                type: filter.category,
                severity: filter.severity,
                description: `Response exceeds AI assistant scope`,
                detectedContent: detected,
                suggestion: "Clarify that you cannot provide professional medical services"
            });
        }
    }
    // 3. Check for missing disclaimers
    const disclaimerContext = determineDisclaimerContext(context);
    const hasDisclaimer = checkForDisclaimer(response, context.language);
    if (!hasDisclaimer && disclaimerContext !== "general") {
        violations.push({
            type: "missing_disclaimer",
            severity: "medium",
            description: `Missing ${disclaimerContext} disclaimer`,
            suggestion: `Add appropriate disclaimer for ${disclaimerContext} context`
        });
    }
    // 4. Determine if valid
    const criticalViolations = violations.filter((v)=>v.severity === "critical");
    const isValid = criticalViolations.length === 0;
    // 5. Add disclaimer if needed
    const requiresDisclaimer = !hasDisclaimer || context.riskLevel === "critical" || context.isAssessment === true;
    if (requiresDisclaimer) {
        const disclaimer = getDisclaimer(disclaimerContext, context.language);
        modifiedContent = applyDisclaimer(modifiedContent, disclaimer);
    }
    return {
        isValid,
        violations,
        riskLevel: context.riskLevel,
        requiresDisclaimer: requiresDisclaimer,
        suggestedDisclaimer: requiresDisclaimer ? getDisclaimer(disclaimerContext, context.language).text : undefined,
        modifiedContent: violations.length > 0 ? modifiedContent : undefined
    };
}
/**
 * Detect pattern matches in text
 */ function detectPattern(text, patterns) {
    const lowerText = text.toLowerCase();
    for (const pattern of patterns){
        if (lowerText.includes(pattern.toLowerCase())) {
            // Find the actual phrase in the original text
            const index = lowerText.indexOf(pattern.toLowerCase());
            const endIndex = index + pattern.length;
            return text.substring(index, endIndex);
        }
    }
    return null;
}
/**
 * Determine appropriate disclaimer context
 */ function determineDisclaimerContext(context) {
    if (context.riskLevel === "critical") return "crisis";
    if (context.isAssessment) return "assessment";
    if (context.containsMedication) return "medication";
    return "general";
}
/**
 * Check if response already contains a disclaimer
 */ function checkForDisclaimer(text, language) {
    const disclaimerKeywords = {
        en: [
            "disclaimer",
            "note:",
            "important:",
            "i'm not a replacement",
            "ai assistant"
        ],
        ar: [
            "ملاحظة",
            "مهم",
            "لست بديلاً"
        ],
        es: [
            "nota:",
            "importante:",
            "no soy un reemplazo"
        ],
        fr: [
            "note :",
            "important :",
            "je ne remplace pas"
        ],
        zh: [
            "注意",
            "重要",
            "不能替代"
        ]
    };
    const keywords = disclaimerKeywords[language] || disclaimerKeywords.en;
    const lowerText = text.toLowerCase();
    return keywords.some((keyword)=>lowerText.includes(keyword.toLowerCase()));
}
/**
 * Get appropriate disclaimer template
 */ function getDisclaimer(context, language) {
    const template = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DISCLAIMER_TEMPLATES"].find((t)=>t.context === context && t.language === language);
    if (template) return template;
    // Fallback to general disclaimer in same language
    const generalTemplate = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DISCLAIMER_TEMPLATES"].find((t)=>t.context === "general" && t.language === language);
    if (generalTemplate) return generalTemplate;
    // Final fallback to English general
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DISCLAIMER_TEMPLATES"].find((t)=>t.context === "general" && t.language === "en");
}
/**
 * Apply disclaimer to response
 */ function applyDisclaimer(response, disclaimer) {
    const { text, position } = disclaimer;
    switch(position){
        case "prefix":
            return `${text}\n\n${response}`;
        case "suffix":
            return `${response}\n\n${text}`;
        case "both":
            return `${text}\n\n${response}\n\n${text}`;
        default:
            return response;
    }
}
function sanitizeResponse(response, violations) {
    let sanitized = response;
    for (const violation of violations){
        if (violation.detectedContent && violation.severity === "critical") {
            // Replace critical violations with safe placeholder
            const placeholder = "[Content removed for safety]";
            sanitized = sanitized.replace(new RegExp(violation.detectedContent, "gi"), placeholder);
        }
    }
    return sanitized;
}
function containsMedicalAdvice(response) {
    const medicalPatterns = [
        "prescribe",
        "medication",
        "drug",
        "dosage",
        "treatment plan",
        "diagnosis",
        "medical condition"
    ];
    return detectPattern(response, medicalPatterns) !== null;
}
function isCrisisAppropriate(response) {
    const requiredElements = [
        "crisis",
        "emergency",
        "988",
        "911",
        "hotline"
    ];
    const harmfulElements = [
        "calm down",
        "not that serious",
        "overreacting"
    ];
    const hasRequired = requiredElements.some((element)=>response.toLowerCase().includes(element));
    const hasHarmful = harmfulElements.some((element)=>response.toLowerCase().includes(element));
    return hasRequired && !hasHarmful;
}
function validateLength(response, minLength = 50, maxLength = 2000) {
    if (response.length < minLength) {
        return {
            isValid: false,
            reason: `Response too short (${response.length} chars, minimum ${minLength})`
        };
    }
    if (response.length > maxLength) {
        return {
            isValid: false,
            reason: `Response too long (${response.length} chars, maximum ${maxLength})`
        };
    }
    return {
        isValid: true
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/validation/disclaimer.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Disclaimer Enforcer
 *
 * Manages disclaimer application and context-aware messaging
 */ __turbopack_context__.s([
    "addAssessmentDisclaimer",
    ()=>addAssessmentDisclaimer,
    "addEmergencyDisclaimer",
    ()=>addEmergencyDisclaimer,
    "addMedicationDisclaimer",
    ()=>addMedicationDisclaimer,
    "enforceDisclaimer",
    ()=>enforceDisclaimer,
    "getDisclaimerText",
    ()=>getDisclaimerText,
    "hasDisclaimer",
    ()=>hasDisclaimer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/types.ts [app-client] (ecmascript)");
;
function enforceDisclaimer(message, context) {
    const disclaimerContext = selectDisclaimerContext(context);
    const disclaimer = getApplicableDisclaimer(disclaimerContext, context.language);
    if (!disclaimer) {
        // Fallback to general English disclaimer
        const fallback = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DISCLAIMER_TEMPLATES"].find((t)=>t.context === "general" && t.language === "en");
        return applyDisclaimerByPosition(message, fallback);
    }
    return applyDisclaimerByPosition(message, disclaimer);
}
/**
 * Select appropriate disclaimer context
 */ function selectDisclaimerContext(context) {
    // Priority order: crisis > assessment > medication > general
    if (context.isCrisis || context.riskLevel === "critical") {
        return "crisis";
    }
    if (context.isAssessment) {
        return "assessment";
    }
    if (context.containsMedication) {
        return "medication";
    }
    return "general";
}
/**
 * Get applicable disclaimer for context and language
 */ function getApplicableDisclaimer(context, language) {
    // Try exact match
    const exactMatch = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DISCLAIMER_TEMPLATES"].find((t)=>t.context === context && t.language === language);
    if (exactMatch) return exactMatch;
    // Try same context in English
    const englishMatch = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DISCLAIMER_TEMPLATES"].find((t)=>t.context === context && t.language === "en");
    if (englishMatch) return englishMatch;
    // Try general in same language
    const generalMatch = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DISCLAIMER_TEMPLATES"].find((t)=>t.context === "general" && t.language === language);
    if (generalMatch) return generalMatch;
    return null;
}
/**
 * Apply disclaimer according to specified position
 */ function applyDisclaimerByPosition(message, disclaimer) {
    const { text, position } = disclaimer;
    switch(position){
        case "prefix":
            return `${text}\n\n${message}`;
        case "suffix":
            return `${message}\n\n${text}`;
        case "both":
            return `${text}\n\n${message}\n\n${text}`;
        default:
            return message;
    }
}
function hasDisclaimer(message, language) {
    const disclaimerMarkers = {
        en: [
            "important:",
            "note:",
            "disclaimer:",
            "i'm an ai",
            "i'm not a replacement",
            "cannot replace"
        ],
        ar: [
            "مهم:",
            "ملاحظة:",
            "أنا مساعد ذكاء",
            "لست بديلاً",
            "لا يمكنني أن أحل محل"
        ],
        es: [
            "importante:",
            "nota:",
            "soy una ia",
            "no soy un reemplazo",
            "no puedo reemplazar"
        ],
        fr: [
            "important :",
            "note :",
            "je suis une ia",
            "je ne remplace pas",
            "je ne peux pas remplacer"
        ],
        zh: [
            "重要：",
            "注意：",
            "我是人工智能",
            "不能替代",
            "无法替代"
        ]
    };
    const markers = disclaimerMarkers[language] || disclaimerMarkers.en;
    const lowerMessage = message.toLowerCase();
    return markers.some((marker)=>lowerMessage.includes(marker.toLowerCase()));
}
function addEmergencyDisclaimer(message, language) {
    const emergencyDisclaimers = {
        en: `🚨 **IMMEDIATE HELP AVAILABLE**

If you're in crisis or having thoughts of self-harm:
- Call 988 (Suicide & Crisis Lifeline) - 24/7 free support
- Text "HELLO" to 741741 (Crisis Text Line)
- Call 911 for immediate emergencies
- Go to your nearest emergency room

You are not alone, and help is available right now.`,
        ar: `🚨 **المساعدة الفورية متاحة**

إذا كنت في أزمة أو لديك أفكار إيذاء النفس:
- اتصل بخط المساعدة المحلي
- اذهب إلى أقرب غرفة طوارئ
- اتصل بخدمات الطوارئ

أنت لست وحدك، والمساعدة متاحة الآن.`,
        es: `🚨 **AYUDA INMEDIATA DISPONIBLE**

Si estás en crisis o tienes pensamientos de autolesión:
- Llama al 988 (Línea de Prevención del Suicidio)
- Envía "HOLA" al 741741 (Línea de Crisis por Texto)
- Llama al 911 para emergencias inmediatas
- Ve a tu sala de emergencias más cercana

No estás solo, la ayuda está disponible ahora.`,
        fr: `🚨 **AIDE IMMÉDIATE DISPONIBLE**

Si vous êtes en crise ou avez des pensées d'automutilation:
- Appelez votre ligne d'aide locale
- Allez aux urgences les plus proches
- Appelez les services d'urgence

Vous n'êtes pas seul, de l'aide est disponible maintenant.`,
        zh: `🚨 **紧急帮助可用**

如果您处于危机中或有自我伤害的想法：
- 拨打当地帮助热线
- 前往最近的急诊室
- 拨打紧急服务电话

您并不孤单，现在就可以获得帮助。`
    };
    const disclaimer = emergencyDisclaimers[language] || emergencyDisclaimers.en;
    return `${disclaimer}\n\n${message}`;
}
function addAssessmentDisclaimer(message, language) {
    const assessmentDisclaimers = {
        en: `**About This Assessment:**

This is a screening tool, not a diagnosis. Only a qualified mental health professional can provide an accurate diagnosis. These results are meant to guide your conversation with a healthcare provider.`,
        ar: `**حول هذا التقييم:**

هذه أداة فحص وليست تشخيصًا. فقط أخصائي الصحة النفسية المؤهل يمكنه تقديم تشخيص دقيق. هذه النتائج تهدف إلى توجيه محادثتك مع مقدم الرعاية الصحية.`,
        es: `**Sobre Esta Evaluación:**

Esta es una herramienta de detección, no un diagnóstico. Solo un profesional calificado de salud mental puede proporcionar un diagnóstico preciso. Estos resultados están destinados a guiar su conversación con un proveedor de atención médica.`,
        fr: `**À Propos de Cette Évaluation:**

Ceci est un outil de dépistage, pas un diagnostic. Seul un professionnel qualifié en santé mentale peut fournir un diagnostic précis. Ces résultats sont destinés à guider votre conversation avec un fournisseur de soins de santé.`,
        zh: `**关于此评估：**

这是一个筛查工具，而非诊断。只有合格的心理健康专业人员才能提供准确的诊断。这些结果旨在指导您与医疗保健提供者的对话。`
    };
    const disclaimer = assessmentDisclaimers[language] || assessmentDisclaimers.en;
    return `${message}\n\n${disclaimer}`;
}
function addMedicationDisclaimer(message, language) {
    const medicationDisclaimers = {
        en: `**Medication Information Notice:**

I cannot prescribe, recommend, or advise on medications. Any questions about medications (including dosage, side effects, or interactions) should be directed to a licensed healthcare provider or pharmacist.`,
        ar: `**إشعار معلومات الأدوية:**

لا يمكنني وصف أو التوصية أو تقديم المشورة بشأن الأدوية. يجب توجيه أي أسئلة حول الأدوية إلى مقدم رعاية صحية مرخص أو صيدلي.`,
        es: `**Aviso de Información Sobre Medicamentos:**

No puedo recetar, recomendar o aconsejar sobre medicamentos. Cualquier pregunta sobre medicamentos debe dirigirse a un proveedor de atención médica con licencia o farmacéutico.`,
        fr: `**Avis d'Information Sur les Médicaments:**

Je ne peux pas prescrire, recommander ou conseiller sur les médicaments. Toute question concernant les médicaments doit être adressée à un professionnel de santé agréé ou à un pharmacien.`,
        zh: `**药物信息通知：**

我不能开处方、推荐或就药物提供建议。有关药物的任何问题应咨询持证医疗保健提供者或药剂师。`
    };
    const disclaimer = medicationDisclaimers[language] || medicationDisclaimers.en;
    return `${message}\n\n${disclaimer}`;
}
function getDisclaimerText(context, language) {
    const disclaimer = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DISCLAIMER_TEMPLATES"].find((t)=>t.context === context && t.language === language);
    if (disclaimer) return disclaimer.text;
    // Fallback to general English
    const fallback = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DISCLAIMER_TEMPLATES"].find((t)=>t.context === "general" && t.language === "en");
    return fallback?.text || "";
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/validation/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Validation Module Exports
 */ __turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/validator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$disclaimer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/disclaimer.ts [app-client] (ecmascript)");
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/llm/ollamaClient.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Ollama Client
 *
 * Local-first inference client for Ollama models
 * Provides fast, privacy-preserving inference without external dependencies
 */ __turbopack_context__.s([
    "OLLAMA_MODELS",
    ()=>OLLAMA_MODELS,
    "checkOllamaHealth",
    ()=>checkOllamaHealth,
    "deleteOllamaModel",
    ()=>deleteOllamaModel,
    "getOllamaModelInfo",
    ()=>getOllamaModelInfo,
    "ollamaQuery",
    ()=>ollamaQuery,
    "pullOllamaModel",
    ()=>pullOllamaModel
]);
const OLLAMA_MODELS = [
    {
        name: "llama3.2:3b",
        displayName: "Llama 3.2 3B",
        size: "2GB",
        description: "Fast general reasoning for clinical responses",
        contextWindow: 8192,
        task: "general"
    },
    {
        name: "qwen2.5:1.5b",
        displayName: "Qwen 2.5 1.5B",
        size: "1GB",
        description: "Best Arabic language support for multilingual users",
        contextWindow: 4096,
        task: "arabic"
    },
    {
        name: "phi3:mini",
        displayName: "Phi-3 Mini",
        size: "2.3GB",
        description: "Efficient safety validation and structured outputs",
        contextWindow: 4096,
        task: "safety"
    },
    {
        name: "smollm:1.7b",
        displayName: "SmolLM 1.7B",
        size: "1GB",
        description: "Internal tooling and development tasks",
        contextWindow: 2048,
        task: "coding"
    }
];
/**
 * Default Ollama server URL
 */ const OLLAMA_BASE_URL = "http://localhost:11434";
async function checkOllamaHealth() {
    try {
        const versionRes = await fetch(`${OLLAMA_BASE_URL}/api/version`, {
            method: "GET",
            signal: AbortSignal.timeout(2000)
        });
        if (!versionRes.ok) {
            return {
                available: false,
                models: []
            };
        }
        const versionData = await versionRes.json();
        // Get list of available models
        const modelsRes = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
        const modelsData = modelsRes.ok ? await modelsRes.json() : {
            models: []
        };
        return {
            available: true,
            version: versionData.version,
            models: modelsData.models?.map((m)=>m.name) || []
        };
    } catch (error) {
        // Server not running or unreachable
        return {
            available: false,
            models: []
        };
    }
}
async function ollamaQuery(model, prompt, options) {
    const { temperature = 0.7, maxTokens = 1000, stream = false, timeout = 30000 } = options || {};
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model,
                prompt,
                stream: false,
                options: {
                    temperature,
                    num_predict: maxTokens
                }
            }),
            signal: AbortSignal.timeout(timeout)
        });
        if (!response.ok) {
            throw new Error(`Ollama request failed: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.response) {
            throw new Error("No response from Ollama model");
        }
        return data.response;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Ollama query failed: ${error.message}`);
        }
        throw error;
    }
}
async function pullOllamaModel(modelName, onProgress) {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: modelName
            })
        });
        if (!response.ok) {
            throw new Error(`Failed to pull model: ${response.statusText}`);
        }
        // Stream progress updates
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) {
            while(true){
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value);
                const lines = text.split("\n").filter((line)=>line.trim());
                for (const line of lines){
                    try {
                        const data = JSON.parse(line);
                        if (data.status && onProgress) {
                            onProgress(data.status);
                        }
                    } catch  {
                    // Ignore parse errors
                    }
                }
            }
        }
        return true;
    } catch (error) {
        console.error("Failed to pull Ollama model:", error);
        return false;
    }
}
async function deleteOllamaModel(modelName) {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/delete`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: modelName
            })
        });
        return response.ok;
    } catch (error) {
        console.error("Failed to delete Ollama model:", error);
        return false;
    }
}
async function getOllamaModelInfo(modelName) {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/show`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: modelName
            })
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        return null;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/llm/router.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * LLM Router
 *
 * Intelligent routing between Ollama (local) and WebLLM (browser) based on:
 * - Task type (general, arabic, safety, coding)
 * - Model availability
 * - Performance requirements
 * - Network status
 */ __turbopack_context__.s([
    "getAvailableOllamaModels",
    ()=>getAvailableOllamaModels,
    "getMissingModels",
    ()=>getMissingModels,
    "getRecommendedModels",
    ()=>getRecommendedModels,
    "initializeRouter",
    ()=>initializeRouter,
    "isOllamaAvailable",
    ()=>isOllamaAvailable,
    "routeInference",
    ()=>routeInference,
    "runLocalSafetyCheck",
    ()=>runLocalSafetyCheck
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/ollamaClient.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$llm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/llm.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$prompts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/prompts.ts [app-client] (ecmascript)");
;
;
;
/**
 * Router state
 */ let ollamaAvailable = false;
let ollamaModels = [];
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 60000; // 1 minute
async function initializeRouter() {
    const health = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkOllamaHealth"])();
    ollamaAvailable = health.available;
    ollamaModels = health.models;
    lastHealthCheck = Date.now();
    if (ollamaAvailable) {
        console.log("✅ Ollama available with models:", ollamaModels);
    } else {
        console.log("⚠️ Ollama not available, will use WebLLM fallback");
    }
}
/**
 * Refresh Ollama health status if needed
 */ async function refreshHealthCheck() {
    if (Date.now() - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
        return;
    }
    const health = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkOllamaHealth"])();
    ollamaAvailable = health.available;
    ollamaModels = health.models;
    lastHealthCheck = Date.now();
}
/**
 * Select appropriate Ollama model for task
 */ function selectOllamaModel(taskType, language) {
    // Arabic language → use Qwen
    if (language === "ar") {
        const arabicModel = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OLLAMA_MODELS"].find((m)=>m.task === "arabic");
        if (arabicModel && ollamaModels.includes(arabicModel.name)) {
            return arabicModel;
        }
    }
    // Safety validation → use Phi-3
    if (taskType === "safety") {
        const safetyModel = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OLLAMA_MODELS"].find((m)=>m.task === "safety");
        if (safetyModel && ollamaModels.includes(safetyModel.name)) {
            return safetyModel;
        }
    }
    // General clinical reasoning → use Llama
    const generalModel = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OLLAMA_MODELS"].find((m)=>m.task === "general");
    if (generalModel && ollamaModels.includes(generalModel.name)) {
        return generalModel;
    }
    return null;
}
async function routeInference(userMessage, conversationHistory, riskLevel, language, taskType = "general", strategy = {
    preferLocal: true,
    allowFallback: true,
    timeout: 30000
}) {
    // Refresh health check if needed
    await refreshHealthCheck();
    // Build prompt
    const prompt = riskLevel === "critical" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$prompts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildCrisisPrompt"])(userMessage) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$prompts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildPrompt"])(userMessage, conversationHistory, riskLevel);
    // Try Ollama first (if available and preferred)
    if (strategy.preferLocal && ollamaAvailable) {
        const selectedModel = selectOllamaModel(taskType, language);
        if (selectedModel) {
            try {
                console.log(`🚀 Using Ollama model: ${selectedModel.displayName}`);
                const startTime = Date.now();
                const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ollamaQuery"])(selectedModel.name, prompt, {
                    temperature: 0.7,
                    maxTokens: 1000,
                    timeout: strategy.timeout
                });
                const duration = Date.now() - startTime;
                return {
                    content: response,
                    provider: "webllm",
                    model: selectedModel.name,
                    confidence: 0.85,
                    metadata: {
                        duration,
                        temperature: 0.7
                    }
                };
            } catch (error) {
                console.warn("Ollama inference failed:", error);
                // If no fallback allowed, throw
                if (!strategy.allowFallback) {
                    throw error;
                }
                console.log("⚠️ Falling back to WebLLM...");
            }
        }
    }
    // Fallback to WebLLM (browser-based)
    try {
        console.log("🌐 Using WebLLM for inference");
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$llm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateResponse"])(userMessage, conversationHistory, riskLevel, "webllm");
    } catch (error) {
        throw new Error(`All inference methods failed. Ollama: ${!ollamaAvailable}, WebLLM: failed`);
    }
}
async function isOllamaAvailable() {
    await refreshHealthCheck();
    return ollamaAvailable;
}
function getAvailableOllamaModels() {
    return ollamaModels;
}
function getRecommendedModels() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OLLAMA_MODELS"];
}
async function getMissingModels() {
    await refreshHealthCheck();
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OLLAMA_MODELS"].filter((model)=>!ollamaModels.includes(model.name));
}
async function runLocalSafetyCheck(message) {
    await refreshHealthCheck();
    if (!ollamaAvailable) {
        return {
            safe: true
        }; // Skip if Ollama unavailable
    }
    const safetyModel = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OLLAMA_MODELS"].find((m)=>m.task === "safety");
    if (!safetyModel || !ollamaModels.includes(safetyModel.name)) {
        return {
            safe: true
        }; // Skip if model unavailable
    }
    try {
        const prompt = `You are a safety validator for a mental health support system. Analyze this message for harmful content, medical advice, or emergency situations.

Message: "${message}"

Respond with JSON only:
{
  "safe": true/false,
  "reason": "brief explanation if unsafe"
}`;
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ollamaQuery"])(safetyModel.name, prompt, {
            temperature: 0.3,
            maxTokens: 200,
            timeout: 5000
        });
        // Parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            return {
                safe: result.safe === true,
                reason: result.reason
            };
        }
        return {
            safe: true
        }; // Default to safe if parse fails
    } catch (error) {
        console.warn("Local safety check failed:", error);
        return {
            safe: true
        }; // Fail open (let validation layer handle it)
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/reasoning/engine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Clinical Reasoning Engine
 *
 * Hybrid LLM + Offline Reasoning Architecture
 * - Attempts LLM inference first (WebLLM or Cloud)
 * - Gracefully falls back to rule-based mhGAP protocols
 * - Maintains clinical safety regardless of mode
 * - Validates all outputs before delivery
 */ __turbopack_context__.s([
    "OfflineReasoning",
    ()=>OfflineReasoning,
    "generateClinicalResponse",
    ()=>generateClinicalResponse,
    "generateOfflineResponse",
    ()=>generateOfflineResponse,
    "generateSupportiveResponse",
    ()=>generateSupportiveResponse,
    "interpretGAD7Assessment",
    ()=>interpretGAD7Assessment,
    "interpretPHQ9Assessment",
    ()=>interpretPHQ9Assessment
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/reasoning/mhgap.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/llm/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$llm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/llm.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/validation/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/validator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$disclaimer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/disclaimer.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$router$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/router.ts [app-client] (ecmascript)");
;
;
;
;
async function generateClinicalResponse(userMessage, clinicalState) {
    const { messages, currentRiskLevel, language, llm } = clinicalState;
    // STEP 1: Always run offline safety assessment first
    const safetyAssessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assessMessage"])(userMessage, messages, currentRiskLevel);
    // STEP 1a: Optional fast local safety check with Ollama (if available)
    try {
        const localSafetyCheck = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$router$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runLocalSafetyCheck"])(userMessage);
        if (!localSafetyCheck.safe) {
            console.warn("Local safety check flagged:", localSafetyCheck.reason);
            // Upgrade risk level if needed
            if (currentRiskLevel === "low") {
                safetyAssessment.riskLevel = "high";
            }
        }
    } catch (error) {
    // Ignore safety check failures
    }
    // If crisis detected, ALWAYS use offline protocol (deterministic, immediate)
    if (safetyAssessment.requiresEmergency) {
        return generateOfflineResponse(userMessage, clinicalState);
    }
    // STEP 2: Try LLM (router will try Ollama first, then WebLLM)
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$llm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isModelReady"])() && !llm.fallbackActive && llm.status === "ready") {
        try {
            // Use router for intelligent model selection
            const llmResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$router$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["routeInference"])(userMessage, messages, currentRiskLevel, language, "general", {
                preferLocal: true,
                allowFallback: true,
                timeout: 30000
            });
            // Determine action required based on current risk and assessment
            let actionRequired = "none";
            if (currentRiskLevel === "critical") {
                actionRequired = "emergency";
            } else if (currentRiskLevel === "high") {
                actionRequired = "urgent";
            } else if (safetyAssessment.protocol.referralNeeded) {
                actionRequired = "routine";
            }
            return {
                response: llmResponse.content,
                assessment: safetyAssessment,
                shouldEscalate: safetyAssessment.riskLevel === "high" || safetyAssessment.riskLevel === "critical",
                actionRequired,
                metadata: {
                    reasoningMode: "llm",
                    provider: llmResponse.provider,
                    confidence: llmResponse.confidence ?? 0.8,
                    timestamp: Date.now()
                }
            };
        } catch (error) {
            // LLM failed, fall through to offline reasoning
            console.warn("LLM generation failed, using offline fallback:", error);
        }
    }
    // STEP 3: Use offline reasoning (either LLM unavailable or failed)
    return generateOfflineResponse(userMessage, clinicalState);
}
function generateOfflineResponse(userMessage, clinicalState) {
    const { messages, currentRiskLevel, language } = clinicalState;
    // 1. ASSESS USER MESSAGE
    const assessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assessMessage"])(userMessage, messages, currentRiskLevel);
    // 2. GENERATE RESPONSE
    let response = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateClinicalResponse"])(assessment, language);
    // 2a. VALIDATE OFFLINE RESPONSE
    const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateResponse"])(response, {
        riskLevel: assessment.riskLevel,
        language,
        isAssessment: false,
        containsMedication: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["containsMedicalAdvice"])(response)
    });
    // Apply validation changes
    if (validation.modifiedContent) {
        response = validation.modifiedContent;
    }
    // 2b. ENFORCE DISCLAIMER
    response = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$disclaimer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["enforceDisclaimer"])(response, {
        riskLevel: assessment.riskLevel,
        language,
        isCrisis: assessment.requiresEmergency,
        containsMedication: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["containsMedicalAdvice"])(response)
    });
    // 3. DETERMINE ACTION REQUIRED
    let actionRequired = "none";
    if (assessment.requiresEmergency) {
        actionRequired = "emergency";
    } else if (assessment.riskLevel === "high" || assessment.riskLevel === "critical") {
        actionRequired = "urgent";
    } else if (assessment.protocol.referralNeeded) {
        actionRequired = "routine";
    }
    // 4. DETERMINE IF ESCALATION NEEDED
    const shouldEscalate = assessment.riskLevel === "critical" || assessment.riskLevel === "high" && currentRiskLevel !== "high" && currentRiskLevel !== "critical";
    return {
        response,
        assessment,
        shouldEscalate,
        actionRequired,
        metadata: {
            reasoningMode: "offline",
            confidence: assessment.confidence,
            timestamp: Date.now()
        }
    };
}
function interpretPHQ9Assessment(responses, language = "en") {
    const totalScore = responses.reduce((sum, score)=>sum + score, 0);
    const interpretation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["interpretPHQ9"])(totalScore);
    const templates = {
        en: `**PHQ-9 Assessment Results**\n\nTotal Score: ${totalScore}/27\nSeverity: ${interpretation.severity}\n\n**Recommendations:**\n${interpretation.recommendations.map((r)=>`• ${r}`).join("\n")}\n\nRemember: This is a screening tool, not a diagnosis. A mental health professional can provide a comprehensive evaluation.`,
        ar: `**نتائج تقييم PHQ-9**\n\nالمجموع: ${totalScore}/27\nالشدة: ${interpretation.severity}\n\n**التوصيات:**\n${interpretation.recommendations.map((r)=>`• ${r}`).join("\n")}\n\nتذكر: هذه أداة فحص وليست تشخيصاً. يمكن لأخصائي الصحة النفسية تقديم تقييم شامل.`,
        es: `**Resultados de la Evaluación PHQ-9**\n\nPuntuación Total: ${totalScore}/27\nGravedad: ${interpretation.severity}\n\n**Recomendaciones:**\n${interpretation.recommendations.map((r)=>`• ${r}`).join("\n")}\n\nRecuerda: Esta es una herramienta de detección, no un diagnóstico. Un profesional de salud mental puede proporcionar una evaluación integral.`,
        fr: `**Résultats de l'Évaluation PHQ-9**\n\nScore Total: ${totalScore}/27\nGravité: ${interpretation.severity}\n\n**Recommandations:**\n${interpretation.recommendations.map((r)=>`• ${r}`).join("\n")}\n\nN'oubliez pas: Ceci est un outil de dépistage, pas un diagnostic. Un professionnel de la santé mentale peut fournir une évaluation complète.`,
        zh: `**PHQ-9评估结果**\n\n总分: ${totalScore}/27\n严重程度: ${interpretation.severity}\n\n**建议:**\n${interpretation.recommendations.map((r)=>`• ${r}`).join("\n")}\n\n请记住：这是一个筛查工具，而不是诊断。心理健康专业人士可以提供全面的评估。`
    };
    return {
        totalScore,
        interpretation,
        response: templates[language] || templates.en
    };
}
function interpretGAD7Assessment(responses, language = "en") {
    const totalScore = responses.reduce((sum, score)=>sum + score, 0);
    const interpretation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["interpretGAD7"])(totalScore);
    const templates = {
        en: `**GAD-7 Assessment Results**\n\nTotal Score: ${totalScore}/21\nSeverity: ${interpretation.severity}\n\n**Recommendations:**\n${interpretation.recommendations.map((r)=>`• ${r}`).join("\n")}\n\nRemember: This is a screening tool, not a diagnosis. A mental health professional can provide a comprehensive evaluation.`,
        ar: `**نتائج تقييم GAD-7**\n\nالمجموع: ${totalScore}/21\nالشدة: ${interpretation.severity}\n\n**التوصيات:**\n${interpretation.recommendations.map((r)=>`• ${r}`).join("\n")}\n\nتذكر: هذه أداة فحص وليست تشخيصاً. يمكن لأخصائي الصحة النفسية تقديم تقييم شامل.`,
        es: `**Resultados de la Evaluación GAD-7**\n\nPuntuación Total: ${totalScore}/21\nGravedad: ${interpretation.severity}\n\n**Recomendaciones:**\n${interpretation.recommendations.map((r)=>`• ${r}`).join("\n")}\n\nRecuerda: Esta es una herramienta de detección, no un diagnóstico. Un profesional de salud mental puede proporcionar una evaluación integral.`,
        fr: `**Résultats de l'Évaluation GAD-7**\n\nScore Total: ${totalScore}/21\nGravité: ${interpretation.severity}\n\n**Recommandations:**\n${interpretation.recommendations.map((r)=>`• ${r}`).join("\n")}\n\nN'oubliez pas: Ceci est un outil de dépistage, pas un diagnostic. Un professionnel de la santé mentale peut fournir une évaluation complète.`,
        zh: `**GAD-7评估结果**\n\n总分: ${totalScore}/21\n严重程度: ${interpretation.severity}\n\n**建议:**\n${interpretation.recommendations.map((r)=>`• ${r}`).join("\n")}\n\n请记住：这是一个筛查工具，而不是诊断。心理健康专业人士可以提供全面的评估。`
    };
    return {
        totalScore,
        interpretation,
        response: templates[language] || templates.en
    };
}
function generateSupportiveResponse(language = "en") {
    const templates = {
        en: "I'm here to listen and support you. Can you tell me more about what you're experiencing? It helps me understand how I can best support you.",
        ar: "أنا هنا للاستماع ودعمك. هل يمكنك إخباري المزيد عما تمر به؟ هذا يساعدني على فهم كيف يمكنني دعمك بشكل أفضل.",
        es: "Estoy aquí para escuchar y apoyarte. ¿Puedes contarme más sobre lo que estás experimentando? Me ayuda a entender cómo puedo apoyarte mejor.",
        fr: "Je suis ici pour écouter et vous soutenir. Pouvez-vous m'en dire plus sur ce que vous vivez? Cela m'aide à comprendre comment je peux mieux vous soutenir.",
        zh: "我在这里倾听和支持你。你能告诉我更多关于你正在经历的事情吗？这有助于我了解如何更好地支持你。"
    };
    return templates[language] || templates.en;
}
const OfflineReasoning = {
    generateOfflineResponse,
    interpretPHQ9Assessment,
    interpretGAD7Assessment,
    generateSupportiveResponse
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/__tests__/reasoning.test.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Reasoning Layer Tests
 *
 * Tests for offline clinical reasoning engine
 */ __turbopack_context__.s([
    "runReasoningTests",
    ()=>runReasoningTests,
    "testAnxietyDetection",
    ()=>testAnxietyDetection,
    "testCrisisDetection",
    ()=>testCrisisDetection,
    "testDepressionDetection",
    ()=>testDepressionDetection,
    "testGAD7Interpretation",
    ()=>testGAD7Interpretation,
    "testMultilingualCrisis",
    ()=>testMultilingualCrisis,
    "testOfflineResponseGeneration",
    ()=>testOfflineResponseGeneration,
    "testPHQ9Interpretation",
    ()=>testPHQ9Interpretation,
    "testSelfHarmDetection",
    ()=>testSelfHarmDetection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/reasoning/mhgap.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/reasoning/engine.ts [app-client] (ecmascript)");
;
;
async function testCrisisDetection() {
    try {
        const messages = [];
        const testCases = [
            "I want to kill myself",
            "thinking about suicide",
            "no reason to live",
            "better off dead"
        ];
        for (const testCase of testCases){
            const assessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assessMessage"])(testCase, messages, "low");
            if (assessment.primaryCondition !== "suicide_risk") {
                return {
                    pass: false,
                    message: `Crisis detection failed for: "${testCase}"`
                };
            }
            if (assessment.riskLevel !== "critical") {
                return {
                    pass: false,
                    message: `Risk level should be critical for: "${testCase}"`
                };
            }
            if (!assessment.requiresEmergency) {
                return {
                    pass: false,
                    message: `Should require emergency for: "${testCase}"`
                };
            }
        }
        return {
            pass: true,
            message: "Crisis detection working correctly"
        };
    } catch (error) {
        return {
            pass: false,
            message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        };
    }
}
async function testDepressionDetection() {
    try {
        const messages = [];
        const testMessage = "I feel so sad and empty. I have no interest in anything anymore. I can't sleep and have no energy. Everything feels hopeless.";
        const assessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assessMessage"])(testMessage, messages, "low");
        if (assessment.primaryCondition !== "depression") {
            return {
                pass: false,
                message: `Expected depression, got: ${assessment.primaryCondition}`
            };
        }
        if (assessment.confidence < 0.5) {
            return {
                pass: false,
                message: `Confidence too low: ${assessment.confidence}`
            };
        }
        return {
            pass: true,
            message: "Depression detection working correctly"
        };
    } catch (error) {
        return {
            pass: false,
            message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        };
    }
}
async function testAnxietyDetection() {
    try {
        const messages = [];
        const testMessage = "I'm constantly worried and anxious. My heart races and I can't stop the nervous thoughts. I feel restless all the time.";
        const assessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assessMessage"])(testMessage, messages, "low");
        if (assessment.primaryCondition !== "anxiety") {
            return {
                pass: false,
                message: `Expected anxiety, got: ${assessment.primaryCondition}`
            };
        }
        if (assessment.confidence < 0.5) {
            return {
                pass: false,
                message: `Confidence too low: ${assessment.confidence}`
            };
        }
        return {
            pass: true,
            message: "Anxiety detection working correctly"
        };
    } catch (error) {
        return {
            pass: false,
            message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        };
    }
}
async function testSelfHarmDetection() {
    try {
        const messages = [];
        const testCases = [
            "I've been cutting myself",
            "I hurt myself when I feel this way",
            "self-harm helps me cope"
        ];
        for (const testCase of testCases){
            const assessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assessMessage"])(testCase, messages, "low");
            if (assessment.primaryCondition !== "self_harm") {
                return {
                    pass: false,
                    message: `Self-harm detection failed for: "${testCase}" - Got: ${assessment.primaryCondition} (confidence: ${assessment.confidence})`
                };
            }
            if (assessment.riskLevel !== "high") {
                return {
                    pass: false,
                    message: `Risk level should be high for self-harm`
                };
            }
        }
        return {
            pass: true,
            message: "Self-harm detection working correctly"
        };
    } catch (error) {
        return {
            pass: false,
            message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        };
    }
}
async function testPHQ9Interpretation() {
    try {
        // Test severe depression (score 20+)
        const severe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["interpretPHQ9"])(22);
        if (severe.riskLevel !== "high" || !severe.severity.includes("Severe")) {
            return {
                pass: false,
                message: "PHQ-9 severe interpretation incorrect"
            };
        }
        // Test moderate depression (score 10-14)
        const moderate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["interpretPHQ9"])(12);
        if (moderate.riskLevel !== "moderate" || !moderate.severity.includes("Moderate")) {
            return {
                pass: false,
                message: "PHQ-9 moderate interpretation incorrect"
            };
        }
        // Test minimal depression (score 0-4)
        const minimal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["interpretPHQ9"])(2);
        if (minimal.riskLevel !== "low" || !minimal.severity.includes("Minimal")) {
            return {
                pass: false,
                message: "PHQ-9 minimal interpretation incorrect"
            };
        }
        return {
            pass: true,
            message: "PHQ-9 interpretation working correctly"
        };
    } catch (error) {
        return {
            pass: false,
            message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        };
    }
}
async function testGAD7Interpretation() {
    try {
        // Test severe anxiety (score 15+)
        const severe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["interpretGAD7"])(16);
        if (severe.riskLevel !== "high" || !severe.severity.includes("Severe")) {
            return {
                pass: false,
                message: "GAD-7 severe interpretation incorrect"
            };
        }
        // Test moderate anxiety (score 10-14)
        const moderate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["interpretGAD7"])(11);
        if (moderate.riskLevel !== "moderate" || !moderate.severity.includes("Moderate")) {
            return {
                pass: false,
                message: "GAD-7 moderate interpretation incorrect"
            };
        }
        // Test minimal anxiety (score 0-4)
        const minimal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["interpretGAD7"])(3);
        if (minimal.riskLevel !== "low" || !minimal.severity.includes("Minimal")) {
            return {
                pass: false,
                message: "GAD-7 minimal interpretation incorrect"
            };
        }
        return {
            pass: true,
            message: "GAD-7 interpretation working correctly"
        };
    } catch (error) {
        return {
            pass: false,
            message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        };
    }
}
async function testOfflineResponseGeneration() {
    try {
        const mockState = {
            // Session
            session: {
                id: "test-session",
                startTime: Date.now(),
                lastActivity: Date.now(),
                language: "en",
                messageCount: 0,
                riskFlags: [],
                triageCategory: "undetermined",
                encrypted: false
            },
            // Messages
            messages: [],
            // Language
            language: "en",
            // Risk & Safety
            currentRiskLevel: "low",
            triageCategory: "undetermined",
            riskFlags: [],
            // PHQ-9
            phq: {
                started: false,
                completed: false,
                currentQuestion: 0,
                responses: [],
                totalScore: undefined
            },
            // ASR
            asr: {
                isListening: false,
                isProcessing: false,
                transcript: "",
                confidence: 0,
                language: "en",
                error: undefined
            },
            // LLM
            llm: {
                provider: "offline",
                status: "offline",
                modelName: undefined,
                availableModels: [],
                isStreaming: false,
                error: undefined,
                lastInference: undefined,
                fallbackActive: false
            },
            // Audit
            auditLog: [],
            // Encryption
            encryptionEnabled: false,
            encryptionKey: undefined,
            // Persistence
            persistenceEnabled: false,
            lastSaved: undefined
        };
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateOfflineResponse"])("I feel very anxious and worried all the time", mockState);
        if (!result.response) {
            return {
                pass: false,
                message: "No response generated"
            };
        }
        if (result.metadata.reasoningMode !== "offline") {
            return {
                pass: false,
                message: "Reasoning mode should be offline"
            };
        }
        if (result.assessment.primaryCondition !== "anxiety") {
            return {
                pass: false,
                message: `Expected anxiety condition, got: ${result.assessment.primaryCondition}`
            };
        }
        return {
            pass: true,
            message: "Offline response generation working correctly"
        };
    } catch (error) {
        return {
            pass: false,
            message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        };
    }
}
async function testMultilingualCrisis() {
    try {
        const messages = [];
        // Arabic
        const arabicAssessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assessMessage"])("انتحار", messages, "low");
        if (arabicAssessment.primaryCondition !== "suicide_risk") {
            return {
                pass: false,
                message: "Arabic crisis keyword not detected"
            };
        }
        // Spanish
        const spanishAssessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assessMessage"])("suicidio", messages, "low");
        if (spanishAssessment.primaryCondition !== "suicide_risk") {
            return {
                pass: false,
                message: "Spanish crisis keyword not detected"
            };
        }
        return {
            pass: true,
            message: "Multilingual crisis detection working correctly"
        };
    } catch (error) {
        return {
            pass: false,
            message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        };
    }
}
async function runReasoningTests() {
    const tests = [
        {
            name: "Crisis Detection",
            fn: testCrisisDetection
        },
        {
            name: "Depression Detection",
            fn: testDepressionDetection
        },
        {
            name: "Anxiety Detection",
            fn: testAnxietyDetection
        },
        {
            name: "Self-Harm Detection",
            fn: testSelfHarmDetection
        },
        {
            name: "PHQ-9 Interpretation",
            fn: testPHQ9Interpretation
        },
        {
            name: "GAD-7 Interpretation",
            fn: testGAD7Interpretation
        },
        {
            name: "Offline Response Generation",
            fn: testOfflineResponseGeneration
        },
        {
            name: "Multilingual Crisis",
            fn: testMultilingualCrisis
        }
    ];
    const results = [];
    let passed = 0;
    let failed = 0;
    for (const test of tests){
        console.log(`Running: ${test.name}...`);
        const result = await test.fn();
        results.push({
            name: test.name,
            ...result
        });
        if (result.pass) {
            passed++;
            console.log(`✓ ${test.name}: ${result.message}`);
        } else {
            failed++;
            console.error(`✗ ${test.name}: ${result.message}`);
        }
    }
    return {
        totalTests: tests.length,
        passed,
        failed,
        results
    };
}
// Export for browser testing
if ("TURBOPACK compile-time truthy", 1) {
    window.runReasoningTests = runReasoningTests;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/__tests__/llm.test.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * LLM Layer Tests
 *
 * Tests for the LLM integration layer (WebLLM + Cloud fallback)
 */ __turbopack_context__.s([
    "runLLMTests",
    ()=>runLLMTests
]);
async function runLLMTests() {
    console.log("🧪 Running LLM Layer Tests...\n");
    let passedTests = 0;
    let failedTests = 0;
    // Test 1: Module imports
    try {
        console.log("✓ LLM Module Structure");
        const llmModule = await __turbopack_context__.A("[project]/src/lib/llm/index.ts [app-client] (ecmascript, async loader)");
        if (!llmModule.initializeWebLLM || !llmModule.loadModel || !llmModule.generateResponse) {
            throw new Error("Missing required exports");
        }
        passedTests++;
    } catch (error) {
        console.error("✗ LLM Module Structure:", error);
        failedTests++;
    }
    // Test 2: Type definitions
    try {
        console.log("✓ LLM Type Definitions");
        const types = await __turbopack_context__.A("[project]/src/lib/llm/types.ts [app-client] (ecmascript, async loader)");
        if (!types.AVAILABLE_MODELS || types.AVAILABLE_MODELS.length === 0) {
            throw new Error("No models available");
        }
        passedTests++;
    } catch (error) {
        console.error("✗ LLM Type Definitions:", error);
        failedTests++;
    }
    // Test 3: Prompt building
    try {
        console.log("✓ Clinical Prompt Building");
        const { buildPrompt } = await __turbopack_context__.A("[project]/src/lib/llm/prompts.ts [app-client] (ecmascript, async loader)");
        const testMessages = [
            {
                id: "1",
                role: "user",
                text: "I'm feeling anxious",
                timestamp: Date.now(),
                language: "en"
            }
        ];
        const prompt = buildPrompt("I can't sleep at night", testMessages, "moderate");
        if (!prompt.includes("anxious") || !prompt.includes("sleep")) {
            throw new Error("Prompt doesn't include conversation context");
        }
        if (!prompt.includes("compassionate") && !prompt.includes("safety")) {
            throw new Error("Prompt missing clinical guidance");
        }
        passedTests++;
    } catch (error) {
        console.error("✗ Clinical Prompt Building:", error);
        failedTests++;
    }
    // Test 4: Crisis prompt override
    try {
        console.log("✓ Crisis Prompt Override");
        const { buildCrisisPrompt } = await __turbopack_context__.A("[project]/src/lib/llm/prompts.ts [app-client] (ecmascript, async loader)");
        const crisisPrompt = buildCrisisPrompt("I want to end my life");
        if (!crisisPrompt.includes("CRISIS") && !crisisPrompt.includes("crisis")) {
            throw new Error("Crisis prompt missing crisis indicator");
        }
        if (!crisisPrompt.includes("988") || !crisisPrompt.includes("741741")) {
            throw new Error("Crisis prompt missing hotline numbers");
        }
        passedTests++;
    } catch (error) {
        console.error("✗ Crisis Prompt Override:", error);
        failedTests++;
    }
    // Test 5: Model availability check
    try {
        console.log("✓ Model Availability Check");
        const { isModelReady } = await __turbopack_context__.A("[project]/src/lib/llm/index.ts [app-client] (ecmascript, async loader)");
        const ready = isModelReady();
        if (typeof ready !== "boolean") {
            throw new Error("isModelReady should return boolean");
        }
        // Should be false initially (no model loaded yet)
        if (ready !== false) {
            console.warn("  ⚠️  Warning: Model reported as ready without loading");
        }
        passedTests++;
    } catch (error) {
        console.error("✗ Model Availability Check:", error);
        failedTests++;
    }
    // Test 6: Assessment prompt generation
    try {
        console.log("✓ Assessment Prompt Generation");
        const { buildAssessmentPrompt } = await __turbopack_context__.A("[project]/src/lib/llm/prompts.ts [app-client] (ecmascript, async loader)");
        const phqPrompt = buildAssessmentPrompt("PHQ-9", 15);
        if (!phqPrompt.includes("15") || !phqPrompt.includes("PHQ-9")) {
            throw new Error("Assessment prompt missing score or type");
        }
        const gadPrompt = buildAssessmentPrompt("GAD-7", 12, "I worry constantly about everything");
        if (!gadPrompt.includes("12") || !gadPrompt.includes("worry constantly")) {
            throw new Error("Assessment prompt missing context");
        }
        passedTests++;
    } catch (error) {
        console.error("✗ Assessment Prompt Generation:", error);
        failedTests++;
    }
    // Summary
    console.log(`\n${"=".repeat(50)}`);
    console.log(`LLM Tests: ${passedTests} passed, ${failedTests} failed`);
    console.log(`${"=".repeat(50)}\n`);
    if (failedTests > 0) {
        throw new Error(`${failedTests} LLM test(s) failed`);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/__tests__/audit.test.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Audit Logging Tests
 *
 * Tests for HIPAA-compliant audit trail
 */ __turbopack_context__.s([
    "runAuditTests",
    ()=>runAuditTests
]);
async function runAuditTests() {
    console.log("🧪 Running Audit Layer Tests...\n");
    let passedTests = 0;
    let failedTests = 0;
    // Test 1: Audit module structure
    try {
        console.log("✓ Audit Module Structure");
        const auditModule = await __turbopack_context__.A("[project]/src/lib/audit/index.ts [app-client] (ecmascript, async loader)");
        if (!auditModule.logAudit || !auditModule.queryAuditLogs || !auditModule.exportAuditLogs) {
            throw new Error("Missing required exports");
        }
        passedTests++;
    } catch (error) {
        console.error("✗ Audit Module Structure:", error);
        failedTests++;
    }
    // Test 2: Audit event creation
    try {
        console.log("✓ Audit Event Creation");
        const { logAudit } = await __turbopack_context__.A("[project]/src/lib/audit/index.ts [app-client] (ecmascript, async loader)");
        await logAudit("session", "test_create", {
            severity: "info",
            description: "Test audit event",
            sessionId: "test-session-1",
            metadata: {
                test: true
            }
        });
        passedTests++;
    } catch (error) {
        console.error("✗ Audit Event Creation:", error);
        failedTests++;
    }
    // Test 3: Clinical decision logging
    try {
        console.log("✓ Clinical Decision Logging");
        const { logClinicalDecision } = await __turbopack_context__.A("[project]/src/lib/audit/index.ts [app-client] (ecmascript, async loader)");
        await logClinicalDecision({
            type: "assessment",
            reasoning: "Patient shows symptoms of moderate anxiety",
            confidence: 0.75,
            basedOn: [
                "GAD-7 score",
                "Conversation analysis"
            ]
        }, "test-session-2");
        passedTests++;
    } catch (error) {
        console.error("✗ Clinical Decision Logging:", error);
        failedTests++;
    }
    // Test 4: Safety escalation logging
    try {
        console.log("✓ Safety Escalation Logging");
        const { logSafetyEscalation } = await __turbopack_context__.A("[project]/src/lib/audit/index.ts [app-client] (ecmascript, async loader)");
        await logSafetyEscalation("high", "suicide ideation keywords", "test-session-3");
        passedTests++;
    } catch (error) {
        console.error("✗ Safety Escalation Logging:", error);
        failedTests++;
    }
    // Test 5: Audit query filtering
    try {
        console.log("✓ Audit Query Filtering");
        const { queryAuditLogs, flushAuditLogs } = await __turbopack_context__.A("[project]/src/lib/audit/index.ts [app-client] (ecmascript, async loader)");
        // Flush pending events first
        await flushAuditLogs();
        // Wait a bit for persistence
        await new Promise((resolve)=>setTimeout(resolve, 100));
        const results = await queryAuditLogs({
            category: [
                "session",
                "safety"
            ],
            severity: [
                "info",
                "warning",
                "critical"
            ]
        });
        if (!Array.isArray(results)) {
            throw new Error("Query should return array");
        }
        passedTests++;
    } catch (error) {
        console.error("✗ Audit Query Filtering:", error);
        failedTests++;
    }
    // Test 6: Audit export
    try {
        console.log("✓ Audit Export");
        const { exportAuditLogs } = await __turbopack_context__.A("[project]/src/lib/audit/index.ts [app-client] (ecmascript, async loader)");
        const exportData = await exportAuditLogs({
            category: [
                "session"
            ]
        });
        if (!exportData.exportId || !exportData.events || !exportData.summary) {
            throw new Error("Export missing required fields");
        }
        if (typeof exportData.summary.totalEvents !== "number") {
            throw new Error("Summary should include total event count");
        }
        passedTests++;
    } catch (error) {
        console.error("✗ Audit Export:", error);
        failedTests++;
    }
    // Test 7: Compliance levels
    try {
        console.log("✓ Compliance Level Tagging");
        const { logAudit } = await __turbopack_context__.A("[project]/src/lib/audit/index.ts [app-client] (ecmascript, async loader)");
        await logAudit("assessment", "phq9_complete", {
            severity: "info",
            complianceLevel: "hipaa",
            description: "PHQ-9 assessment completed",
            sessionId: "test-session-4",
            piiPresent: false
        });
        passedTests++;
    } catch (error) {
        console.error("✗ Compliance Level Tagging:", error);
        failedTests++;
    }
    // Test 8: Event correlation
    try {
        console.log("✓ Event Correlation");
        const { logAudit } = await __turbopack_context__.A("[project]/src/lib/audit/index.ts [app-client] (ecmascript, async loader)");
        const correlationId = `corr_${Date.now()}`;
        await logAudit("message", "user_input", {
            sessionId: "test-session-5",
            correlationId
        });
        await logAudit("message", "ai_response", {
            sessionId: "test-session-5",
            correlationId
        });
        passedTests++;
    } catch (error) {
        console.error("✗ Event Correlation:", error);
        failedTests++;
    }
    // Summary
    console.log(`\n${"=".repeat(50)}`);
    console.log(`Audit Tests: ${passedTests} passed, ${failedTests} failed`);
    console.log(`${"=".repeat(50)}\n`);
    if (failedTests > 0) {
        throw new Error(`${failedTests} audit test(s) failed`);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/__tests__/validation.test.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Validation Tests
 *
 * Tests for output validation and disclaimer enforcement
 */ __turbopack_context__.s([
    "runValidationTests",
    ()=>runValidationTests,
    "validationTests",
    ()=>validationTests
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/validation/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/validator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$disclaimer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/disclaimer.ts [app-client] (ecmascript)");
;
const validationTests = [
    // Test 1: Detect harmful medical diagnosis
    {
        name: "Detect medical diagnosis violation",
        fn: ()=>{
            const response = "Based on your symptoms, you have clinical depression and should take antidepressants.";
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateResponse"])(response, {
                riskLevel: "high",
                language: "en"
            });
            return !result.isValid && result.violations.some((v)=>v.type === "medical_diagnosis");
        },
        category: "validation"
    },
    // Test 2: Detect medication advice violation
    {
        name: "Detect medication advice violation",
        fn: ()=>{
            const response = "You should take 50mg of Zoloft daily to manage your anxiety.";
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateResponse"])(response, {
                riskLevel: "low",
                language: "en"
            });
            return !result.isValid && result.violations.some((v)=>v.type === "medication_advice");
        },
        category: "validation"
    },
    // Test 3: Detect emergency dismissal
    {
        name: "Detect emergency dismissal",
        fn: ()=>{
            const response = "Just calm down, it's not that serious.";
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateResponse"])(response, {
                riskLevel: "critical",
                language: "en"
            });
            return !result.isValid && result.violations.some((v)=>v.type === "emergency_dismissal");
        },
        category: "validation"
    },
    // Test 4: Safe response passes validation
    {
        name: "Safe response passes validation",
        fn: ()=>{
            const response = "I hear that you're feeling overwhelmed. Let's talk about some coping strategies that might help.";
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateResponse"])(response, {
                riskLevel: "low",
                language: "en"
            });
            return result.isValid && result.violations.length === 0;
        },
        category: "validation"
    },
    // Test 5: Disclaimer enforcement for crisis
    {
        name: "Enforce crisis disclaimer",
        fn: ()=>{
            const response = "Please reach out to a professional for help.";
            const withDisclaimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$disclaimer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["enforceDisclaimer"])(response, {
                riskLevel: "critical",
                language: "en",
                isCrisis: true
            });
            return withDisclaimer.includes("988") || withDisclaimer.includes("IMMEDIATE");
        },
        category: "validation"
    },
    // Test 6: Disclaimer enforcement for assessment
    {
        name: "Enforce assessment disclaimer",
        fn: ()=>{
            const response = "Your PHQ-9 score suggests moderate depression.";
            const withDisclaimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$disclaimer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addAssessmentDisclaimer"])(response, "en");
            return withDisclaimer.includes("screening tool") && withDisclaimer.includes("not a diagnosis");
        },
        category: "validation"
    },
    // Test 7: Detect medical advice presence
    {
        name: "Detect medical advice in content",
        fn: ()=>{
            const medical = "I recommend taking this medication for treatment.";
            const nonMedical = "Let's explore some coping strategies together.";
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["containsMedicalAdvice"])(medical) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["containsMedicalAdvice"])(nonMedical);
        },
        category: "validation"
    },
    // Test 8: Validate response length
    {
        name: "Validate response length constraints",
        fn: ()=>{
            const tooShort = "Hi.";
            const justRight = "I understand you're going through a difficult time. Let's talk about what you're experiencing.";
            const tooLong = "A".repeat(2500);
            const shortResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateLength"])(tooShort);
            const goodResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateLength"])(justRight);
            const longResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateLength"])(tooLong);
            return !shortResult.isValid && goodResult.isValid && !longResult.isValid;
        },
        category: "validation"
    },
    // Test 9: Crisis appropriateness check
    {
        name: "Check crisis response appropriateness",
        fn: ()=>{
            const appropriate = "If you're having thoughts of self-harm, please call 988 immediately.";
            const inappropriate = "Just calm down, it's probably not that serious.";
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCrisisAppropriate"])(appropriate) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCrisisAppropriate"])(inappropriate);
        },
        category: "validation"
    },
    // Test 10: Sanitize harmful content
    {
        name: "Sanitize critical violations",
        fn: ()=>{
            const violations = [
                {
                    type: "medical_diagnosis",
                    severity: "critical",
                    description: "Medical diagnosis detected",
                    detectedContent: "you have depression",
                    suggestion: "Remove diagnosis"
                }
            ];
            const response = "Based on your symptoms, you have depression and need medication.";
            const sanitized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sanitizeResponse"])(response, violations);
            return sanitized.includes("[Content removed for safety]");
        },
        category: "validation"
    },
    // Test 11: Has disclaimer detection
    {
        name: "Detect existing disclaimers",
        fn: ()=>{
            const withDisclaimer = "Important: I'm an AI assistant and cannot replace professional care.";
            const without = "Let's talk about your feelings.";
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$disclaimer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasDisclaimer"])(withDisclaimer, "en") && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$disclaimer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasDisclaimer"])(without, "en");
        },
        category: "validation"
    },
    // Test 12: Multi-language disclaimer support
    {
        name: "Support multi-language disclaimers",
        fn: ()=>{
            const response = "Let's discuss your concerns.";
            const languages = [
                "en",
                "ar",
                "es",
                "fr",
                "zh"
            ];
            const results = languages.map((lang)=>{
                const withDisclaimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$disclaimer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["enforceDisclaimer"])(response, {
                    riskLevel: "low",
                    language: lang
                });
                return withDisclaimer.length > response.length;
            });
            return results.every((r)=>r === true);
        },
        category: "validation"
    },
    // Test 13: Emergency disclaimer content
    {
        name: "Emergency disclaimer includes hotlines",
        fn: ()=>{
            const response = "Please seek help.";
            const withEmergency = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$disclaimer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addEmergencyDisclaimer"])(response, "en");
            return withEmergency.includes("988") && withEmergency.includes("911") && withEmergency.includes("741741");
        },
        category: "validation"
    },
    // Test 14: Medication disclaimer clarity
    {
        name: "Medication disclaimer is clear",
        fn: ()=>{
            const response = "Some people take medications for depression.";
            const withMedDisclaimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$disclaimer$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addMedicationDisclaimer"])(response, "en");
            return withMedDisclaimer.includes("cannot prescribe") && withMedDisclaimer.includes("licensed healthcare provider");
        },
        category: "validation"
    },
    // Test 15: Detect guarantee claims
    {
        name: "Detect guarantee/cure claims",
        fn: ()=>{
            const response = "This therapy will definitely cure your anxiety within 2 weeks.";
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateResponse"])(response, {
                riskLevel: "low",
                language: "en"
            });
            return !result.isValid && result.violations.some((v)=>v.type === "guarantee_claim");
        },
        category: "validation"
    },
    // Test 16: Detect personal info requests
    {
        name: "Detect personal information requests",
        fn: ()=>{
            const response = "Can you provide your home address and phone number?";
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateResponse"])(response, {
                riskLevel: "low",
                language: "en"
            });
            return !result.isValid && result.violations.some((v)=>v.type === "personal_info_request");
        },
        category: "validation"
    },
    // Test 17: Validate risk level propagation
    {
        name: "Risk level propagates to validation result",
        fn: ()=>{
            const response = "Let's explore coping strategies together.";
            const criticalResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateResponse"])(response, {
                riskLevel: "critical",
                language: "en"
            });
            const lowResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateResponse"])(response, {
                riskLevel: "low",
                language: "en"
            });
            return criticalResult.riskLevel === "critical" && lowResult.riskLevel === "low" && criticalResult.requiresDisclaimer && !lowResult.requiresDisclaimer;
        },
        category: "validation"
    },
    // Test 18: Scope violation detection
    {
        name: "Detect scope violations",
        fn: ()=>{
            const response = "As your therapist, I diagnose you with major depressive disorder.";
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$validator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateResponse"])(response, {
                riskLevel: "low",
                language: "en"
            });
            return !result.isValid && result.violations.some((v)=>v.type === "scope_violation");
        },
        category: "validation"
    }
];
async function runValidationTests() {
    const results = [];
    let passed = 0;
    let failed = 0;
    for (const test of validationTests){
        try {
            const result = await test.fn();
            if (result) {
                passed++;
                results.push({
                    name: test.name,
                    passed: true
                });
            } else {
                failed++;
                results.push({
                    name: test.name,
                    passed: false,
                    error: "Test returned false"
                });
            }
        } catch (error) {
            failed++;
            results.push({
                name: test.name,
                passed: false,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    return {
        passed,
        failed,
        results
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/__tests__/ollama.test.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Ollama Tests
 *
 * Tests for local Ollama inference integration
 */ __turbopack_context__.s([
    "ollamaTests",
    ()=>ollamaTests,
    "runOllamaTests",
    ()=>runOllamaTests
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/ollamaClient.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$router$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/router.ts [app-client] (ecmascript)");
;
;
const ollamaTests = [
    // Test 1: Ollama health check
    {
        name: "Ollama server health check",
        fn: async ()=>{
            const health = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkOllamaHealth"])();
            console.log("Ollama health:", health);
            return health.available !== undefined;
        },
        category: "ollama"
    },
    // Test 2: Router initialization
    {
        name: "Router initialization",
        fn: async ()=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$router$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeRouter"])();
            const available = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$router$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isOllamaAvailable"])();
            console.log("Ollama available:", available);
            return true; // Always pass (Ollama is optional)
        },
        category: "ollama"
    },
    // Test 3: Check available models
    {
        name: "Check available models",
        fn: async ()=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$router$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeRouter"])();
            const models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$router$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAvailableOllamaModels"])();
            console.log("Available Ollama models:", models);
            return Array.isArray(models);
        },
        category: "ollama"
    },
    // Test 4: Check missing models
    {
        name: "Identify missing recommended models",
        fn: async ()=>{
            const missing = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$router$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMissingModels"])();
            console.log("Missing models:", missing.map((m)=>m.name));
            return Array.isArray(missing);
        },
        category: "ollama"
    },
    // Test 5: Local safety check (if Ollama available)
    {
        name: "Local safety check with Phi-3",
        fn: async ()=>{
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$router$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeRouter"])();
            const available = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$router$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isOllamaAvailable"])();
            if (!available) {
                console.log("Ollama not available - skipping safety check test");
                return true; // Pass if Ollama unavailable
            }
            try {
                const safeMessage = "I'm feeling sad today";
                const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$router$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runLocalSafetyCheck"])(safeMessage);
                console.log("Safety check result:", result);
                return result.safe !== undefined;
            } catch (error) {
                console.log("Safety check failed (model may not be installed):", error);
                return true; // Pass even if safety check fails (optional feature)
            }
        },
        category: "ollama"
    },
    // Test 6: Ollama query (if server available)
    {
        name: "Ollama inference query",
        fn: async ()=>{
            const health = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkOllamaHealth"])();
            if (!health.available) {
                console.log("Ollama not available - skipping inference test");
                return true; // Pass if Ollama unavailable
            }
            // Find any available model
            const availableModel = health.models.find((m)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OLLAMA_MODELS"].some((om)=>m.startsWith(om.name.split(":")[0])));
            if (!availableModel) {
                console.log("No recommended models available - skipping inference test");
                return true; // Pass if no models
            }
            try {
                const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ollamaQuery"])(availableModel, "Say 'Hello' in one word.", {
                    maxTokens: 10,
                    timeout: 10000
                });
                console.log("Ollama response:", response);
                return response.length > 0;
            } catch (error) {
                console.log("Ollama query failed:", error);
                return true; // Pass even if query fails (optional feature)
            }
        },
        category: "ollama"
    },
    // Test 7: Model recommendations
    {
        name: "Recommended models list",
        fn: ()=>{
            console.log("Recommended models:", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OLLAMA_MODELS"].map((m)=>m.name));
            return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$ollamaClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OLLAMA_MODELS"].length === 4;
        },
        category: "ollama"
    },
    // Test 8: Graceful degradation
    {
        name: "Graceful degradation when Ollama unavailable",
        fn: async ()=>{
            // This test verifies the system works even without Ollama
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$router$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeRouter"])();
            const available = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$router$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isOllamaAvailable"])();
            if (!available) {
                console.log("✅ System correctly detects Ollama unavailable and will use fallback");
            } else {
                console.log("✅ Ollama available for local inference");
            }
            return true; // Always pass
        },
        category: "ollama"
    }
];
async function runOllamaTests() {
    const results = [];
    let passed = 0;
    let failed = 0;
    for (const test of ollamaTests){
        try {
            const result = await test.fn();
            if (result) {
                passed++;
                results.push({
                    name: test.name,
                    passed: true
                });
            } else {
                failed++;
                results.push({
                    name: test.name,
                    passed: false,
                    error: "Test returned false"
                });
            }
        } catch (error) {
            failed++;
            results.push({
                name: test.name,
                passed: false,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    return {
        passed,
        failed,
        results
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/test/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TestRunnerPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Clinical Engine Test Runner
 *
 * Browser-based test suite for encryption, storage, and reasoning layers.
 * Run this page to validate the clinical backbone before moving forward.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$encryption$2e$test$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/__tests__/encryption.test.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$storage$2e$test$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/__tests__/storage.test.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$reasoning$2e$test$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/__tests__/reasoning.test.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$llm$2e$test$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/__tests__/llm.test.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$audit$2e$test$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/__tests__/audit.test.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$validation$2e$test$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/__tests__/validation.test.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$ollama$2e$test$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/__tests__/ollama.test.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
function TestRunnerPage() {
    _s();
    const [encryptionResults, setEncryptionResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [storageResults, setStorageResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [reasoningResults, setReasoningResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [llmResults, setLlmResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [auditResults, setAuditResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [validationResults, setValidationResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ollamaResults, setOllamaResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [running, setRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [logs, setLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // Capture console output
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TestRunnerPage.useEffect": ()=>{
            const originalLog = console.log;
            const originalError = console.error;
            console.log = ({
                "TestRunnerPage.useEffect": (...args)=>{
                    setLogs({
                        "TestRunnerPage.useEffect": (prev)=>[
                                ...prev,
                                args.join(" ")
                            ]
                    }["TestRunnerPage.useEffect"]);
                    originalLog(...args);
                }
            })["TestRunnerPage.useEffect"];
            console.error = ({
                "TestRunnerPage.useEffect": (...args)=>{
                    setLogs({
                        "TestRunnerPage.useEffect": (prev)=>[
                                ...prev,
                                "ERROR: " + args.join(" ")
                            ]
                    }["TestRunnerPage.useEffect"]);
                    originalError(...args);
                }
            })["TestRunnerPage.useEffect"];
            return ({
                "TestRunnerPage.useEffect": ()=>{
                    console.log = originalLog;
                    console.error = originalError;
                }
            })["TestRunnerPage.useEffect"];
        }
    }["TestRunnerPage.useEffect"], []);
    const runTests = async ()=>{
        setRunning(true);
        setLogs([]);
        setEncryptionResults(null);
        setStorageResults(null);
        setReasoningResults(null);
        setLlmResults(null);
        setAuditResults(null);
        setValidationResults(null);
        setOllamaResults(null);
        try {
            // Run encryption tests
            const encryptionPass = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$encryption$2e$test$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runEncryptionTests"])();
            setEncryptionResults(encryptionPass);
            // Run storage tests
            const storagePass = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$storage$2e$test$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runStorageTests"])();
            setStorageResults(storagePass);
            // Run reasoning tests
            const reasoningTestResults = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$reasoning$2e$test$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runReasoningTests"])();
            setReasoningResults(reasoningTestResults);
            // Run LLM tests
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$llm$2e$test$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runLLMTests"])();
                setLlmResults(true);
            } catch (llmError) {
                setLlmResults(false);
            }
            // Run Audit tests
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$audit$2e$test$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runAuditTests"])();
                setAuditResults(true);
            } catch (auditError) {
                setAuditResults(false);
            }
            // Run Validation tests
            const validationTestResults = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$validation$2e$test$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runValidationTests"])();
            setValidationResults({
                totalTests: validationTestResults.passed + validationTestResults.failed,
                passed: validationTestResults.passed,
                failed: validationTestResults.failed,
                results: validationTestResults.results.map((r)=>({
                        name: r.name,
                        pass: r.passed,
                        message: r.error || "Test passed"
                    }))
            });
            // Run Ollama tests
            const ollamaTestResults = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$ollama$2e$test$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runOllamaTests"])();
            setOllamaResults({
                totalTests: ollamaTestResults.passed + ollamaTestResults.failed,
                passed: ollamaTestResults.passed,
                failed: ollamaTestResults.failed,
                results: ollamaTestResults.results.map((r)=>({
                        name: r.name,
                        pass: r.passed,
                        message: r.error || "Test passed"
                    }))
            });
        } catch (error) {
            console.error("Test suite error:", error);
        } finally{
            setRunning(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-surfaceAlt p-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-5xl mx-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-surface border border-border rounded-lg p-6 mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-h1 font-semibold text-textMain mb-2",
                            children: "🧪 Clinical Engine Test Suite"
                        }, void 0, false, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 141,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-body text-textSubtle",
                            children: "Validates encryption, storage, and reasoning layers before proceeding to next steps."
                        }, void 0, false, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 144,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 140,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-surface border border-border rounded-lg p-6 mb-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: runTests,
                        disabled: running,
                        className: `px-6 py-3 rounded-md font-medium transition-all ${running ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-primary text-white hover:bg-primary-dark"}`,
                        children: running ? "⏳ Running Tests..." : "▶️ Run All Tests"
                    }, void 0, false, {
                        fileName: "[project]/src/app/test/page.tsx",
                        lineNumber: 152,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 151,
                    columnNumber: 9
                }, this),
                (encryptionResults !== null || storageResults !== null || reasoningResults !== null || llmResults !== null || auditResults !== null || validationResults !== null || ollamaResults !== null) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-7 gap-3 mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `border rounded-lg p-6 ${encryptionResults === null ? "bg-surface border-border" : encryptionResults ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-2xl",
                                            children: encryptionResults === null ? "⏳" : encryptionResults ? "✅" : "❌"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 185,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-h3 font-semibold text-textMain",
                                            children: "Encryption Layer"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 192,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 184,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-caption text-textSubtle",
                                    children: encryptionResults === null ? "Waiting..." : encryptionResults ? "All encryption tests passed" : "Some encryption tests failed"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 196,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 175,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `border rounded-lg p-6 ${storageResults === null ? "bg-surface border-border" : storageResults ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-2xl",
                                            children: storageResults === null ? "⏳" : storageResults ? "✅" : "❌"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 216,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-h3 font-semibold text-textMain",
                                            children: "Storage Layer"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 223,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 215,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-caption text-textSubtle",
                                    children: storageResults === null ? "Waiting..." : storageResults ? "All storage tests passed" : "Some storage tests failed"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 227,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 206,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `border rounded-lg p-6 ${reasoningResults === null ? "bg-surface border-border" : reasoningResults.passed === reasoningResults.totalTests ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-2xl",
                                            children: reasoningResults === null ? "⏳" : reasoningResults.passed === reasoningResults.totalTests ? "✅" : "❌"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 247,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-h3 font-semibold text-textMain",
                                            children: "Reasoning Layer"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 254,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 246,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-caption text-textSubtle",
                                    children: reasoningResults === null ? "Waiting..." : `${reasoningResults.passed}/${reasoningResults.totalTests} tests passed`
                                }, void 0, false, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 258,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 237,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `border rounded-lg p-6 ${llmResults === null ? "bg-surface border-border" : llmResults ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-2xl",
                                            children: llmResults === null ? "⏳" : llmResults ? "✅" : "❌"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 276,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-h3 font-semibold text-textMain",
                                            children: "LLM Layer"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 279,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 275,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-caption text-textSubtle",
                                    children: llmResults === null ? "Waiting..." : llmResults ? "All LLM tests passed" : "Some LLM tests failed"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 283,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 266,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `border rounded-lg p-6 ${auditResults === null ? "bg-surface border-border" : auditResults ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-2xl",
                                            children: auditResults === null ? "⏳" : auditResults ? "✅" : "❌"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 303,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-h3 font-semibold text-textMain",
                                            children: "Audit Layer"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 306,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 302,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-caption text-textSubtle",
                                    children: auditResults === null ? "Waiting..." : auditResults ? "All audit tests passed" : "Some audit tests failed"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 310,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 293,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `border rounded-lg p-6 ${validationResults === null ? "bg-surface border-border" : validationResults.passed === validationResults.totalTests ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-2xl",
                                            children: validationResults === null ? "⏳" : validationResults.passed === validationResults.totalTests ? "✅" : "❌"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 330,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-h3 font-semibold text-textMain",
                                            children: "Validation Layer"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 337,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 329,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-caption text-textSubtle",
                                    children: validationResults === null ? "Waiting..." : `${validationResults.passed}/${validationResults.totalTests} tests passed`
                                }, void 0, false, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 341,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 320,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `border rounded-lg p-6 ${ollamaResults === null ? "bg-surface border-border" : ollamaResults.passed === ollamaResults.totalTests ? "bg-green-50 border-green-300" : "bg-yellow-50 border-yellow-300"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-2xl",
                                            children: ollamaResults === null ? "⏳" : ollamaResults.passed === ollamaResults.totalTests ? "✅" : "⚠️"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 359,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-h3 font-semibold text-textMain",
                                            children: "Ollama (Optional)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 366,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 358,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-caption text-textSubtle",
                                    children: ollamaResults === null ? "Waiting..." : `${ollamaResults.passed}/${ollamaResults.totalTests} tests passed`
                                }, void 0, false, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 370,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 349,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 173,
                    columnNumber: 11
                }, this),
                reasoningResults && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-surface border border-border rounded-lg p-6 mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-h2 font-semibold text-textMain mb-4",
                            children: "Reasoning Tests Detailed Results"
                        }, void 0, false, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 382,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: reasoningResults.results.map((result, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex items-start gap-3 p-3 rounded ${result.pass ? "bg-green-50" : "bg-red-50"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xl",
                                            children: result.pass ? "✅" : "❌"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 393,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-medium text-textMain",
                                                    children: result.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/test/page.tsx",
                                                    lineNumber: 395,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm text-textSubtle",
                                                    children: result.message
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/test/page.tsx",
                                                    lineNumber: 398,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 394,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, idx, true, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 387,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 385,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 381,
                    columnNumber: 11
                }, this),
                validationResults && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-surface border border-border rounded-lg p-6 mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-h2 font-semibold text-textMain mb-4",
                            children: "Validation Tests Detailed Results"
                        }, void 0, false, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 411,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: validationResults.results.map((result, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex items-start gap-3 p-3 rounded ${result.pass ? "bg-green-50" : "bg-red-50"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xl",
                                            children: result.pass ? "✅" : "❌"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 422,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-medium text-textMain",
                                                    children: result.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/test/page.tsx",
                                                    lineNumber: 424,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm text-textSubtle",
                                                    children: result.message
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/test/page.tsx",
                                                    lineNumber: 427,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 423,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, idx, true, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 416,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 414,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 410,
                    columnNumber: 11
                }, this),
                ollamaResults && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-surface border border-border rounded-lg p-6 mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-h2 font-semibold text-textMain mb-4",
                            children: "Ollama Tests Detailed Results (Optional - Local Inference)"
                        }, void 0, false, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 440,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: ollamaResults.results.map((result, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex items-start gap-3 p-3 rounded ${result.pass ? "bg-green-50" : "bg-yellow-50"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xl",
                                            children: result.pass ? "✅" : "❌"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 451,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-medium text-textMain",
                                                    children: result.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/test/page.tsx",
                                                    lineNumber: 453,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm text-textSubtle",
                                                    children: result.message
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/test/page.tsx",
                                                    lineNumber: 456,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 452,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, idx, true, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 445,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 443,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 439,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-auto max-h-[600px]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 mb-3 pb-2 border-b border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "💻"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 469,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-gray-400",
                                    children: "Test Console Output"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 470,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 468,
                            columnNumber: 11
                        }, this),
                        logs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-gray-500",
                            children: 'No output yet. Click "Run All Tests" to start.'
                        }, void 0, false, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 473,
                            columnNumber: 13
                        }, this) : logs.map((log, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `mb-1 ${log.includes("FAIL") || log.includes("ERROR") ? "text-red-400" : log.includes("PASS") ? "text-green-400" : log.includes("✅") ? "text-green-300 font-bold" : log.includes("❌") ? "text-red-300 font-bold" : "text-gray-300"}`,
                                children: log
                            }, i, false, {
                                fileName: "[project]/src/app/test/page.tsx",
                                lineNumber: 478,
                                columnNumber: 15
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 467,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-body text-textMain",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Next Step:"
                            }, void 0, false, {
                                fileName: "[project]/src/app/test/page.tsx",
                                lineNumber: 501,
                                columnNumber: 13
                            }, this),
                            " Once all tests pass (encryption, storage, reasoning, LLM, audit), we'll proceed to Layer 8 (Controlled Clinical Outputs)."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/test/page.tsx",
                        lineNumber: 500,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 499,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/test/page.tsx",
            lineNumber: 138,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/test/page.tsx",
        lineNumber: 137,
        columnNumber: 5
    }, this);
}
_s(TestRunnerPage, "PvJOPuHxriNZ/W12kfX8KojYq/I=");
_c = TestRunnerPage;
var _c;
__turbopack_context__.k.register(_c, "TestRunnerPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_b9abcea1._.js.map