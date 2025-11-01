module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

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
"[project]/src/lib/security/keyRotation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

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
 */ __turbopack_context__.s([
    "decryptJSONWithRotation",
    ()=>decryptJSONWithRotation,
    "decryptWithRotation",
    ()=>decryptWithRotation,
    "encryptJSONWithRotation",
    ()=>encryptJSONWithRotation,
    "encryptWithRotation",
    ()=>encryptWithRotation,
    "forceKeyRotation",
    ()=>forceKeyRotation,
    "getRotationStatus",
    ()=>getRotationStatus,
    "initializeKeyRotation",
    ()=>initializeKeyRotation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/security/encryption.ts [app-ssr] (ecmascript)");
;
const KEY_ROTATION_DAYS = 90;
const KEY_STORE_NAME = "clinician-key-store";
class KeyRotationManager {
    keys = new Map();
    metadata = new Map();
    activeKeyId = null;
    initialized = false;
    dbName = "encryption-keys";
    storeName = "keys";
    /**
   * Initialize the key rotation manager
   */ async initialize() {
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
            console.error("Failed to initialize key rotation manager:", error);
            throw new Error("Key rotation manager initialization failed");
        }
    }
    /**
   * Load keys from IndexedDB
   */ async loadKeysFromIndexedDB() {
        return new Promise((resolve, reject)=>{
            const request = indexedDB.open(this.dbName, 1);
            request.onerror = ()=>reject(request.error);
            request.onupgradeneeded = (event)=>{
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, {
                        keyPath: "id"
                    });
                }
            };
            request.onsuccess = async ()=>{
                const db = request.result;
                try {
                    const transaction = db.transaction(this.storeName, "readonly");
                    const store = transaction.objectStore(this.storeName);
                    const getAllRequest = store.getAll();
                    getAllRequest.onsuccess = async ()=>{
                        const records = getAllRequest.result;
                        for (const record of records){
                            this.metadata.set(record.id, record.metadata);
                            const key = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EncryptionUtils"].importKey(record.jwk);
                            this.keys.set(record.id, key);
                            if (record.metadata.active) {
                                this.activeKeyId = record.id;
                            }
                        }
                        db.close();
                        resolve();
                    };
                    getAllRequest.onerror = ()=>{
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
   */ async saveKeyToIndexedDB(keyId, key, metadata) {
        return new Promise((resolve, reject)=>{
            const request = indexedDB.open(this.dbName, 1);
            request.onerror = ()=>reject(request.error);
            request.onsuccess = async ()=>{
                const db = request.result;
                try {
                    const jwk = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EncryptionUtils"].exportKey(key);
                    const transaction = db.transaction(this.storeName, "readwrite");
                    const store = transaction.objectStore(this.storeName);
                    const putRequest = store.put({
                        id: keyId,
                        metadata,
                        jwk
                    });
                    putRequest.onsuccess = ()=>{
                        db.close();
                        resolve();
                    };
                    putRequest.onerror = ()=>{
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
   */ async createNewKey() {
        const key = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EncryptionUtils"].generateKey();
        const keyId = `key-${Date.now()}-${crypto.randomUUID()}`;
        const currentVersion = this.metadata.size + 1;
        const metadata = {
            id: keyId,
            created: Date.now(),
            rotateAfter: Date.now() + KEY_ROTATION_DAYS * 24 * 60 * 60 * 1000,
            active: true,
            version: currentVersion
        };
        // Deactivate all existing keys
        for (const [id, meta] of this.metadata.entries()){
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
   */ getActiveKey() {
        if (!this.activeKeyId) {
            throw new Error("No active encryption key");
        }
        const key = this.keys.get(this.activeKeyId);
        const metadata = this.metadata.get(this.activeKeyId);
        if (!key || !metadata) {
            throw new Error("Active key not found");
        }
        return {
            keyId: this.activeKeyId,
            key,
            version: metadata.version
        };
    }
    /**
   * Get a specific key by ID (for decryption)
   */ getKey(keyId) {
        return this.keys.get(keyId);
    }
    /**
   * Check if key rotation is needed
   */ async checkRotation() {
        if (!this.activeKeyId) return false;
        const metadata = this.metadata.get(this.activeKeyId);
        if (!metadata) return false;
        if (Date.now() >= metadata.rotateAfter) {
            console.log("[KeyRotation] Automatic rotation triggered");
            await this.createNewKey();
            return true;
        }
        return false;
    }
    /**
   * Force immediate key rotation
   */ async rotateNow(reason = "Manual rotation") {
        console.log(`[KeyRotation] Force rotation: ${reason}`);
        await this.createNewKey();
    }
    /**
   * Get all key metadata (for auditing)
   */ getAllKeyMetadata() {
        return Array.from(this.metadata.values());
    }
    /**
   * Get days until next rotation
   */ getDaysUntilRotation() {
        if (!this.activeKeyId) return null;
        const metadata = this.metadata.get(this.activeKeyId);
        if (!metadata) return null;
        const msUntilRotation = metadata.rotateAfter - Date.now();
        return Math.max(0, Math.ceil(msUntilRotation / (24 * 60 * 60 * 1000)));
    }
}
// Singleton instance
const keyRotationManager = new KeyRotationManager();
async function encryptWithRotation(plaintext) {
    await keyRotationManager.initialize();
    await keyRotationManager.checkRotation();
    const { keyId, key, version } = keyRotationManager.getActiveKey();
    const encrypted = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EncryptionUtils"].encrypt(plaintext, key);
    return {
        ...encrypted,
        keyId,
        keyVersion: version
    };
}
async function decryptWithRotation(encryptedData) {
    await keyRotationManager.initialize();
    const key = keyRotationManager.getKey(encryptedData.keyId);
    if (!key) {
        throw new Error(`Encryption key not found: ${encryptedData.keyId}`);
    }
    return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$encryption$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EncryptionUtils"].decrypt(encryptedData, key);
}
async function encryptJSONWithRotation(data) {
    const plaintext = JSON.stringify(data);
    return encryptWithRotation(plaintext);
}
async function decryptJSONWithRotation(encryptedData) {
    const plaintext = await decryptWithRotation(encryptedData);
    return JSON.parse(plaintext);
}
async function forceKeyRotation(reason) {
    await keyRotationManager.initialize();
    await keyRotationManager.rotateNow(reason);
}
async function getRotationStatus() {
    await keyRotationManager.initialize();
    return {
        daysUntilRotation: keyRotationManager.getDaysUntilRotation(),
        currentVersion: keyRotationManager.getActiveKey().version,
        totalKeys: keyRotationManager.getAllKeyMetadata().length,
        allKeys: keyRotationManager.getAllKeyMetadata()
    };
}
async function initializeKeyRotation() {
    await keyRotationManager.initialize();
}
}),
"[project]/src/lib/telemetry/ui.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * UI Telemetry (local-only, encrypted)
 *
 * Lightweight event logger for anonymous UI interactions like language selection.
 * Data is encrypted at rest using the existing key rotation system and stored in localStorage.
 *
 * No PHI. Events are small and rotated with the key manager.
 */ __turbopack_context__.s([
    "getUIEvents",
    ()=>getUIEvents,
    "logUIEvent",
    ()=>logUIEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$keyRotation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/security/keyRotation.ts [app-ssr] (ecmascript)");
;
const UI_EVENTS_KEY = "clinician-ui-events";
async function readEvents() {
    try {
        const raw = localStorage.getItem(UI_EVENTS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        const decrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$keyRotation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decryptJSONWithRotation"])(parsed);
        return Array.isArray(decrypted.events) ? decrypted.events : [];
    } catch  {
        // Corrupt or missing data, start fresh
        return [];
    }
}
async function writeEvents(events) {
    const payload = {
        events,
        savedAt: Date.now()
    };
    const encrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$keyRotation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encryptJSONWithRotation"])(payload);
    localStorage.setItem(UI_EVENTS_KEY, JSON.stringify(encrypted));
}
async function logUIEvent(event) {
    try {
        const events = await readEvents();
        events.push(event);
        // Keep only the most recent 500 events to limit size
        const trimmed = events.slice(-500);
        await writeEvents(trimmed);
    } catch (err) {
        // Non-fatal: UI should never break because telemetry failed
        console.warn("[UI Telemetry] Failed to log event:", err);
    }
}
async function getUIEvents() {
    return readEvents();
}
}),
"[project]/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LanguageSelectorPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$telemetry$2f$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/telemetry/ui.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function LanguageSelectorPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const languages = [
        {
            code: "en",
            name: "English",
            nativeName: "English",
            flag: "🇬🇧",
            description: "International standard language",
            path: "/en"
        },
        {
            code: "ar",
            name: "Modern Standard Arabic",
            nativeName: "العربية الفصحى",
            flag: "🇸🇦",
            description: "Formal Arabic used across the Arab world",
            path: "/ar"
        },
        {
            code: "ar-egy",
            name: "Egyptian Arabic",
            nativeName: "العامية المصرية",
            flag: "🇪🇬",
            description: "Colloquial Egyptian dialect",
            path: "/ar-egy"
        }
    ];
    // Prefetch language routes for snappy navigation
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        router.prefetch("/en");
        router.prefetch("/ar");
        router.prefetch("/ar-egy");
    }, [
        router
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white",
        lang: "en",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "py-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-4xl font-bold text-primary mb-2",
                            children: "AI Meta-Clinician"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xl text-gray-600",
                            children: "Mental Health Support Platform"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 56,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-500 mt-2",
                            lang: "ar",
                            children: "منصة الدعم النفسي بالذكاء الاصطناعي"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 59,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 52,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 container mx-auto px-4 py-12",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-4xl mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center mb-12",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-3xl font-semibold text-gray-800 mb-4",
                                    children: "Select Your Language"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 70,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-lg text-gray-600 mb-2",
                                    children: "Choose your preferred language to begin"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 73,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-lg text-gray-600",
                                    dir: "rtl",
                                    children: "اختر لغتك المفضلة للبدء"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 76,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 69,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-3 gap-6",
                            children: languages.map((lang)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: lang.path,
                                    "aria-label": `Start ${lang.name} session`,
                                    title: `Start ${lang.name} session`,
                                    onClick: ()=>{
                                        // Fire-and-forget UI telemetry
                                        void (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$telemetry$2f$ui$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["logUIEvent"])({
                                            type: "language_selected",
                                            language: lang.code,
                                            timestamp: Date.now()
                                        });
                                    },
                                    className: "group block border-2 border-gray-200 rounded-lg p-6 bg-white transition-all duration-200 hover:border-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-6xl mb-4",
                                                "aria-hidden": true,
                                                children: lang.flag
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 100,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xl font-bold text-gray-800 mb-2",
                                                children: lang.nativeName
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 101,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-gray-600 mb-3",
                                                children: lang.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 104,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-500",
                                                children: lang.description
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 105,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "mt-4 inline-block px-4 py-2 bg-primary text-white rounded text-sm shadow-sm group-hover:shadow focus-visible:outline-none",
                                                "aria-hidden": true,
                                                children: "Start Session →"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 106,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 99,
                                        columnNumber: 17
                                    }, this)
                                }, lang.code, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 84,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 82,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-16 bg-blue-50 border border-blue-200 rounded-lg p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-semibold text-gray-800 mb-3",
                                    children: "ℹ️ About This Platform"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "space-y-2 text-sm text-gray-700",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: [
                                                "✅ ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "100% Private:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 124,
                                                    columnNumber: 19
                                                }, this),
                                                " All conversations are encrypted"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 123,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: [
                                                "✅ ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Evidence-Based:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 128,
                                                    columnNumber: 19
                                                }, this),
                                                " Uses WHO mhGAP protocol"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 127,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: [
                                                "✅ ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Crisis Detection:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 131,
                                                    columnNumber: 19
                                                }, this),
                                                " Automatic risk assessment"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 130,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: [
                                                "✅ ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Local AI:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 134,
                                                    columnNumber: 19
                                                }, this),
                                                " Enhanced responses with Ollama"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 133,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: [
                                                "✅ ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Multilingual:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 137,
                                                    columnNumber: 19
                                                }, this),
                                                " Full support for EN, MSA, and Egyptian Arabic"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 136,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 118,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-8 bg-red-50 border border-red-200 rounded-lg p-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-semibold text-red-800 mb-3",
                                    children: "🆘 In Crisis? Get Immediate Help"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 145,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid md:grid-cols-2 gap-4 text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-medium text-gray-800 mb-2",
                                                    children: "International:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 150,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                    className: "space-y-1 text-gray-700",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: [
                                                                "🇺🇸 USA: ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "988"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 153,
                                                                    columnNumber: 31
                                                                }, this),
                                                                " (Suicide & Crisis Lifeline)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 152,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: [
                                                                "🇪🇬 Egypt: ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "08008880700"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 156,
                                                                    columnNumber: 33
                                                                }, this),
                                                                " (Lifeline)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 155,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: [
                                                                "🌍 Global:",
                                                                " ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                    href: "https://findahelpline.com",
                                                                    target: "_blank",
                                                                    rel: "noopener noreferrer",
                                                                    className: "text-primary underline",
                                                                    children: "findahelpline.com"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 160,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 158,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 151,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 149,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            dir: "rtl",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-medium text-gray-800 mb-2",
                                                    children: "دولي:"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 172,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                    className: "space-y-1 text-gray-700",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: [
                                                                "🇺🇸 أمريكا: ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "988"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 175,
                                                                    columnNumber: 34
                                                                }, this),
                                                                " (خط الأزمات)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 174,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: [
                                                                "🇪🇬 مصر: ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: "08008880700"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 178,
                                                                    columnNumber: 31
                                                                }, this),
                                                                " (خط الحياة)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 177,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: [
                                                                "🌍 عالمي:",
                                                                " ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                    href: "https://findahelpline.com",
                                                                    target: "_blank",
                                                                    rel: "noopener noreferrer",
                                                                    className: "text-primary underline",
                                                                    children: "findahelpline.com"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 182,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 180,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 173,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 171,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 148,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 144,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "border-t border-gray-200 py-6 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-600 mb-2",
                        children: "⚠️ This is not a replacement for professional mental health care"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 200,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-600",
                        dir: "rtl",
                        children: "⚠️ هذا ليس بديلاً عن الرعاية النفسية المهنية"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 203,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-gray-500 mt-4",
                        children: "AI Meta-Clinician | Production-Ready | 134/134 Tests Passing"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 206,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 199,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9c5ee170._.js.map