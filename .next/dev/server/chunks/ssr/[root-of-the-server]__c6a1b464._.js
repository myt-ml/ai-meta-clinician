module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/security/encryption.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/lib/__tests__/encryption.test.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Encryption Layer Tests
 *
 * Tests for AES-GCM encryption functionality
 */ __turbopack_context__.s([
    "runEncryptionTests",
    ()=>runEncryptionTests
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/security/encryption.ts [app-ssr] (ecmascript)");
;
async function testBasicEncryption() {
    console.log("🧪 Testing basic encryption/decryption...");
    try {
        const key = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateEncryptionKey"])();
        const plaintext = "This is sensitive patient data";
        const encrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encrypt"])(plaintext, key);
        console.log("  ✓ Encryption successful");
        console.log("    - IV length:", encrypted.iv.length);
        console.log("    - Ciphertext length:", encrypted.ciphertext.length);
        const decrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decrypt"])(encrypted, key);
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
        const key = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateEncryptionKey"])();
        const data = {
            patientId: "12345",
            symptoms: [
                "depression",
                "anxiety"
            ],
            phqScore: 15,
            riskLevel: "moderate"
        };
        const encrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encryptJSON"])(data, key);
        console.log("  ✓ JSON encryption successful");
        const decrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decryptJSON"])(encrypted, key);
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
        const salt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateSalt"])();
        console.log("  ✓ Salt generated:", salt.substring(0, 20) + "...");
        const key1 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deriveKeyFromPassword"])({
            password,
            salt
        });
        console.log("  ✓ Key derived from password");
        const key2 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deriveKeyFromPassword"])({
            password,
            salt
        });
        console.log("  ✓ Key derived again with same password/salt");
        // Test that both keys work the same
        const plaintext = "Test data";
        const encrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encrypt"])(plaintext, key1);
        const decrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decrypt"])(encrypted, key2);
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
        const validKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateEncryptionKey"])();
        const isValid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateKey"])(validKey);
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
        const originalKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateEncryptionKey"])();
        const plaintext = "Test export/import";
        // Encrypt with original key
        const encrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encrypt"])(plaintext, originalKey);
        console.log("  ✓ Encrypted with original key");
        // Export key
        const jwk = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["exportKey"])(originalKey);
        console.log("  ✓ Key exported to JWK");
        console.log("    - Key type:", jwk.kty);
        console.log("    - Algorithm:", jwk.alg);
        // Import key
        const importedKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["importKey"])(jwk);
        console.log("  ✓ Key imported from JWK");
        // Decrypt with imported key
        const decrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decrypt"])(encrypted, importedKey);
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
        const key = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateEncryptionKey"])();
        const plaintext = "Sensitive data";
        const encrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encrypt"])(plaintext, key);
        console.log("  ✓ Data encrypted");
        // Tamper with ciphertext
        const tamperedCiphertext = encrypted.ciphertext.slice(0, -10) + "TAMPERED!!";
        const tamperedData = {
            ...encrypted,
            ciphertext: tamperedCiphertext
        };
        let tamperDetected = false;
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decrypt"])(tamperedData, key);
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
        const key = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateEncryptionKey"])();
        const plaintext = "Same data";
        const encrypted1 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encrypt"])(plaintext, key);
        const encrypted2 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encrypt"])(plaintext, key);
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
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
}),
"[project]/src/lib/persistence/storage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/lib/__tests__/storage.test.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Storage Layer Tests
 *
 * Tests for IndexedDB persistence functionality
 */ __turbopack_context__.s([
    "runStorageTests",
    ()=>runStorageTests
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/persistence/storage.ts [app-ssr] (ecmascript)");
;
async function testDatabaseInit() {
    console.log("🧪 Testing database initialization...");
    try {
        const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initDatabase"])();
        console.log("  ✓ Database opened successfully");
        console.log("    - Name:", db.name);
        console.log("    - Version:", db.version);
        // Check object stores exist
        const storeNames = Array.from(db.objectStoreNames);
        const expectedStores = Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"]);
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
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addToStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testData);
        console.log("  ✓ CREATE: Data added to store");
        // READ
        const retrieved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testData.id);
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
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateInStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, updatedData);
        const afterUpdate = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testData.id);
        if (afterUpdate && afterUpdate.messageCount === 10) {
            console.log("  ✓ UPDATE: Data updated successfully");
        } else {
            throw new Error("Update did not work");
        }
        // DELETE
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testData.id);
        const afterDelete = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testData.id);
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
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addToStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].MESSAGES, msg);
        }
        console.log("  ✓ Test messages added");
        // Query by sessionId
        const session1Messages = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryStoreByIndex"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].MESSAGES, "sessionId", "session-1");
        if (session1Messages.length === 2) {
            console.log("  ✓ Query by sessionId returned correct count");
        } else {
            throw new Error(`Expected 2 messages, got ${session1Messages.length}`);
        }
        // Query by role
        const userMessages = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryStoreByIndex"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].MESSAGES, "role", "user");
        if (userMessages.length === 2) {
            console.log("  ✓ Query by role returned correct count");
        } else {
            throw new Error(`Expected 2 user messages, got ${userMessages.length}`);
        }
        // Cleanup
        for (const msg of messages){
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].MESSAGES, msg.id);
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
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addToStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].AUDIT, item);
        }
        console.log("  ✓ Batch insert: 10 items added");
        // Get all
        const allItems = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAllFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].AUDIT);
        const batchItems = allItems.filter((item)=>item.id.startsWith("batch-"));
        if (batchItems.length === 10) {
            console.log("  ✓ Batch retrieve: All items retrieved");
        } else {
            throw new Error(`Expected 10 items, got ${batchItems.length}`);
        }
        // Count
        const count = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["countStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].AUDIT);
        if (count >= 10) {
            console.log(`  ✓ Count: ${count} items in store`);
        }
        // Clear
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].AUDIT);
        const afterClear = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["countStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].AUDIT);
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
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addToStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testSession);
        const retrieved = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testSession.id);
        if (!retrieved) {
            throw new Error("Data not retrieved");
        }
        // Check all field types preserved
        const checksPass = retrieved.data.nested.value === "test" && retrieved.array.length === 3 && retrieved.boolean === true && retrieved.number === 42;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["STORES"].SESSIONS, testSession.id);
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
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
}),
"[project]/src/lib/reasoning/clinicalKnowledge.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/lib/reasoning/mhgap.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/reasoning/clinicalKnowledge.ts [app-ssr] (ecmascript)");
;
function assessMessage(message, conversationHistory, currentRiskLevel) {
    const normalizedMessage = message.toLowerCase();
    // 1. CRISIS CHECK (highest priority)
    const hasCrisisKeywords = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CRISIS_KEYWORDS"].some((keyword)=>normalizedMessage.includes(keyword.toLowerCase()));
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
            protocol: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CLINICAL_PROTOCOLS"].suicide_risk
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
            protocol: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CLINICAL_PROTOCOLS"].self_harm
        };
    }
    // 3. PATTERN MATCHING
    const analyses = [
        analyzeSymptoms(normalizedMessage, "depression", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEPRESSION_PATTERNS"]),
        analyzeSymptoms(normalizedMessage, "anxiety", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ANXIETY_PATTERNS"]),
        analyzeSymptoms(normalizedMessage, "ptsd", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PTSD_PATTERNS"]),
        analyzeSymptoms(normalizedMessage, "psychosis", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PSYCHOSIS_PATTERNS"]),
        analyzeSymptoms(normalizedMessage, "substance_use", __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SUBSTANCE_PATTERNS"])
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
            protocol: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CLINICAL_PROTOCOLS"].undetermined
        };
    }
    // 6. IDENTIFY CO-OCCURRING CONDITIONS
    const significantConditions = analyses.filter((a)=>a.score >= threshold).map((a)=>a.condition);
    // 7. DETERMINE FINAL ASSESSMENT
    const primaryCondition = topAnalysis.condition;
    const protocol = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CLINICAL_PROTOCOLS"][primaryCondition];
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
        const resources = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$clinicalKnowledge$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EMERGENCY_RESOURCES"][language];
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
}),
"[project]/src/lib/reasoning/engine.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Offline Fallback Reasoning Engine
 *
 * Provides clinical decision support when LLM is unavailable.
 * Integrates mhGAP protocols with clinical state store.
 */ __turbopack_context__.s([
    "OfflineReasoning",
    ()=>OfflineReasoning,
    "generateOfflineResponse",
    ()=>generateOfflineResponse,
    "generateSupportiveResponse",
    ()=>generateSupportiveResponse,
    "interpretGAD7Assessment",
    ()=>interpretGAD7Assessment,
    "interpretPHQ9Assessment",
    ()=>interpretPHQ9Assessment
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/reasoning/mhgap.ts [app-ssr] (ecmascript)");
;
function generateOfflineResponse(userMessage, clinicalState) {
    const { messages, currentRiskLevel, language } = clinicalState;
    // 1. ASSESS USER MESSAGE
    const assessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assessMessage"])(userMessage, messages, currentRiskLevel);
    // 2. GENERATE RESPONSE
    const response = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateClinicalResponse"])(assessment, language);
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
    const interpretation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpretPHQ9"])(totalScore);
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
    const interpretation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpretGAD7"])(totalScore);
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
}),
"[project]/src/lib/__tests__/reasoning.test.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/reasoning/mhgap.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$engine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/reasoning/engine.ts [app-ssr] (ecmascript)");
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
            const assessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assessMessage"])(testCase, messages, "low");
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
        const assessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assessMessage"])(testMessage, messages, "low");
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
        const assessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assessMessage"])(testMessage, messages, "low");
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
            const assessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assessMessage"])(testCase, messages, "low");
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
        const severe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpretPHQ9"])(22);
        if (severe.riskLevel !== "high" || !severe.severity.includes("Severe")) {
            return {
                pass: false,
                message: "PHQ-9 severe interpretation incorrect"
            };
        }
        // Test moderate depression (score 10-14)
        const moderate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpretPHQ9"])(12);
        if (moderate.riskLevel !== "moderate" || !moderate.severity.includes("Moderate")) {
            return {
                pass: false,
                message: "PHQ-9 moderate interpretation incorrect"
            };
        }
        // Test minimal depression (score 0-4)
        const minimal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpretPHQ9"])(2);
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
        const severe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpretGAD7"])(16);
        if (severe.riskLevel !== "high" || !severe.severity.includes("Severe")) {
            return {
                pass: false,
                message: "GAD-7 severe interpretation incorrect"
            };
        }
        // Test moderate anxiety (score 10-14)
        const moderate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpretGAD7"])(11);
        if (moderate.riskLevel !== "moderate" || !moderate.severity.includes("Moderate")) {
            return {
                pass: false,
                message: "GAD-7 moderate interpretation incorrect"
            };
        }
        // Test minimal anxiety (score 0-4)
        const minimal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpretGAD7"])(3);
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
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$engine$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOfflineResponse"])("I feel very anxious and worried all the time", mockState);
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
        const arabicAssessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assessMessage"])("انتحار", messages, "low");
        if (arabicAssessment.primaryCondition !== "suicide_risk") {
            return {
                pass: false,
                message: "Arabic crisis keyword not detected"
            };
        }
        // Spanish
        const spanishAssessment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$reasoning$2f$mhgap$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["assessMessage"])("suicidio", messages, "low");
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
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
}),
"[project]/src/app/test/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TestRunnerPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * Clinical Engine Test Runner
 *
 * Browser-based test suite for encryption, storage, and reasoning layers.
 * Run this page to validate the clinical backbone before moving forward.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$encryption$2e$test$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/__tests__/encryption.test.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$storage$2e$test$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/__tests__/storage.test.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$reasoning$2e$test$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/__tests__/reasoning.test.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function TestRunnerPage() {
    const [encryptionResults, setEncryptionResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [storageResults, setStorageResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [reasoningResults, setReasoningResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [running, setRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [logs, setLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // Capture console output
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const originalLog = console.log;
        const originalError = console.error;
        console.log = (...args)=>{
            setLogs((prev)=>[
                    ...prev,
                    args.join(" ")
                ]);
            originalLog(...args);
        };
        console.error = (...args)=>{
            setLogs((prev)=>[
                    ...prev,
                    "ERROR: " + args.join(" ")
                ]);
            originalError(...args);
        };
        return ()=>{
            console.log = originalLog;
            console.error = originalError;
        };
    }, []);
    const runTests = async ()=>{
        setRunning(true);
        setLogs([]);
        setEncryptionResults(null);
        setStorageResults(null);
        setReasoningResults(null);
        try {
            // Run encryption tests
            const encryptionPass = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$encryption$2e$test$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["runEncryptionTests"])();
            setEncryptionResults(encryptionPass);
            // Run storage tests
            const storagePass = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$storage$2e$test$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["runStorageTests"])();
            setStorageResults(storagePass);
            // Run reasoning tests
            const reasoningTestResults = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$_$5f$tests_$5f2f$reasoning$2e$test$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["runReasoningTests"])();
            setReasoningResults(reasoningTestResults);
        } catch (error) {
            console.error("Test suite error:", error);
        } finally{
            setRunning(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-surfaceAlt p-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-5xl mx-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-surface border border-border rounded-lg p-6 mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-h1 font-semibold text-textMain mb-2",
                            children: "🧪 Clinical Engine Test Suite"
                        }, void 0, false, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 85,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-body text-textSubtle",
                            children: "Validates encryption, storage, and reasoning layers before proceeding to next steps."
                        }, void 0, false, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 88,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-surface border border-border rounded-lg p-6 mb-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: runTests,
                        disabled: running,
                        className: `px-6 py-3 rounded-md font-medium transition-all ${running ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-primary text-white hover:bg-primary-dark"}`,
                        children: running ? "⏳ Running Tests..." : "▶️ Run All Tests"
                    }, void 0, false, {
                        fileName: "[project]/src/app/test/page.tsx",
                        lineNumber: 96,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 95,
                    columnNumber: 9
                }, this),
                (encryptionResults !== null || storageResults !== null || reasoningResults !== null) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-3 gap-4 mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `border rounded-lg p-6 ${encryptionResults === null ? "bg-surface border-border" : encryptionResults ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-2xl",
                                            children: encryptionResults === null ? "⏳" : encryptionResults ? "✅" : "❌"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 125,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-h3 font-semibold text-textMain",
                                            children: "Encryption Layer"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 132,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 124,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-caption text-textSubtle",
                                    children: encryptionResults === null ? "Waiting..." : encryptionResults ? "All encryption tests passed" : "Some encryption tests failed"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 136,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 115,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `border rounded-lg p-6 ${storageResults === null ? "bg-surface border-border" : storageResults ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-2xl",
                                            children: storageResults === null ? "⏳" : storageResults ? "✅" : "❌"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 156,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-h3 font-semibold text-textMain",
                                            children: "Storage Layer"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 163,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 155,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-caption text-textSubtle",
                                    children: storageResults === null ? "Waiting..." : storageResults ? "All storage tests passed" : "Some storage tests failed"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 167,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 146,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `border rounded-lg p-6 ${reasoningResults === null ? "bg-surface border-border" : reasoningResults.passed === reasoningResults.totalTests ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-2xl",
                                            children: reasoningResults === null ? "⏳" : reasoningResults.passed === reasoningResults.totalTests ? "✅" : "❌"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 187,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-h3 font-semibold text-textMain",
                                            children: "Reasoning Layer"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 194,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 186,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-caption text-textSubtle",
                                    children: reasoningResults === null ? "Waiting..." : `${reasoningResults.passed}/${reasoningResults.totalTests} tests passed`
                                }, void 0, false, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 198,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 177,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 113,
                    columnNumber: 11
                }, this),
                reasoningResults && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-surface border border-border rounded-lg p-6 mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-h2 font-semibold text-textMain mb-4",
                            children: "Reasoning Tests Detailed Results"
                        }, void 0, false, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 210,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: reasoningResults.results.map((result, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex items-start gap-3 p-3 rounded ${result.pass ? "bg-green-50" : "bg-red-50"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xl",
                                            children: result.pass ? "✅" : "❌"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 221,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-medium text-textMain",
                                                    children: result.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/test/page.tsx",
                                                    lineNumber: 223,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm text-textSubtle",
                                                    children: result.message
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/test/page.tsx",
                                                    lineNumber: 226,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/test/page.tsx",
                                            lineNumber: 222,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, idx, true, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 215,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 213,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 209,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-auto max-h-[600px]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 mb-3 pb-2 border-b border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "💻"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 239,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-gray-400",
                                    children: "Test Console Output"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/test/page.tsx",
                                    lineNumber: 240,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 238,
                            columnNumber: 11
                        }, this),
                        logs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-gray-500",
                            children: 'No output yet. Click "Run All Tests" to start.'
                        }, void 0, false, {
                            fileName: "[project]/src/app/test/page.tsx",
                            lineNumber: 243,
                            columnNumber: 13
                        }, this) : logs.map((log, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `mb-1 ${log.includes("FAIL") || log.includes("ERROR") ? "text-red-400" : log.includes("PASS") ? "text-green-400" : log.includes("✅") ? "text-green-300 font-bold" : log.includes("❌") ? "text-red-300 font-bold" : "text-gray-300"}`,
                                children: log
                            }, i, false, {
                                fileName: "[project]/src/app/test/page.tsx",
                                lineNumber: 248,
                                columnNumber: 15
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 237,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-body text-textMain",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Next Step:"
                            }, void 0, false, {
                                fileName: "[project]/src/app/test/page.tsx",
                                lineNumber: 271,
                                columnNumber: 13
                            }, this),
                            " Once all tests pass (encryption, storage, reasoning), we'll proceed to Layer 6 (LLM Plug-in Layer)."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/test/page.tsx",
                        lineNumber: 270,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/test/page.tsx",
                    lineNumber: 269,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/test/page.tsx",
            lineNumber: 82,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/test/page.tsx",
        lineNumber: 81,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c6a1b464._.js.map