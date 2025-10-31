/**
 * Encryption Layer Tests
 *
 * Tests for AES-GCM encryption functionality
 */

import {
  generateEncryptionKey,
  deriveKeyFromPassword,
  generateSalt,
  encrypt,
  decrypt,
  encryptJSON,
  decryptJSON,
  validateKey,
  exportKey,
  importKey,
} from "../security/encryption";

async function testBasicEncryption() {
  console.log("🧪 Testing basic encryption/decryption...");

  try {
    const key = await generateEncryptionKey();
    const plaintext = "This is sensitive patient data";

    const encrypted = await encrypt(plaintext, key);
    console.log("  ✓ Encryption successful");
    console.log("    - IV length:", encrypted.iv.length);
    console.log("    - Ciphertext length:", encrypted.ciphertext.length);

    const decrypted = await decrypt(encrypted, key);
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
    const key = await generateEncryptionKey();
    const data = {
      patientId: "12345",
      symptoms: ["depression", "anxiety"],
      phqScore: 15,
      riskLevel: "moderate",
    };

    const encrypted = await encryptJSON(data, key);
    console.log("  ✓ JSON encryption successful");

    const decrypted = await decryptJSON<typeof data>(encrypted, key);
    console.log("  ✓ JSON decryption successful");

    if (
      decrypted.patientId === data.patientId &&
      decrypted.phqScore === data.phqScore &&
      decrypted.riskLevel === data.riskLevel
    ) {
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
    const salt = generateSalt();
    console.log("  ✓ Salt generated:", salt.substring(0, 20) + "...");

    const key1 = await deriveKeyFromPassword({ password, salt });
    console.log("  ✓ Key derived from password");

    const key2 = await deriveKeyFromPassword({ password, salt });
    console.log("  ✓ Key derived again with same password/salt");

    // Test that both keys work the same
    const plaintext = "Test data";
    const encrypted = await encrypt(plaintext, key1);
    const decrypted = await decrypt(encrypted, key2);

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
    const validKey = await generateEncryptionKey();
    const isValid = await validateKey(validKey);

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
    const originalKey = await generateEncryptionKey();
    const plaintext = "Test export/import";

    // Encrypt with original key
    const encrypted = await encrypt(plaintext, originalKey);
    console.log("  ✓ Encrypted with original key");

    // Export key
    const jwk = await exportKey(originalKey);
    console.log("  ✓ Key exported to JWK");
    console.log("    - Key type:", jwk.kty);
    console.log("    - Algorithm:", jwk.alg);

    // Import key
    const importedKey = await importKey(jwk);
    console.log("  ✓ Key imported from JWK");

    // Decrypt with imported key
    const decrypted = await decrypt(encrypted, importedKey);

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
    const key = await generateEncryptionKey();
    const plaintext = "Sensitive data";

    const encrypted = await encrypt(plaintext, key);
    console.log("  ✓ Data encrypted");

    // Tamper with ciphertext
    const tamperedCiphertext =
      encrypted.ciphertext.slice(0, -10) + "TAMPERED!!";
    const tamperedData = { ...encrypted, ciphertext: tamperedCiphertext };

    let tamperDetected = false;
    try {
      await decrypt(tamperedData, key);
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
    const key = await generateEncryptionKey();
    const plaintext = "Same data";

    const encrypted1 = await encrypt(plaintext, key);
    const encrypted2 = await encrypt(plaintext, key);

    if (encrypted1.iv !== encrypted2.iv) {
      console.log(
        "  ✓ Different IVs generated:",
        encrypted1.iv.substring(0, 20) + "... vs",
        encrypted2.iv.substring(0, 20) + "..."
      );
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

// Run all tests
export async function runEncryptionTests() {
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

  const passed = results.filter((r) => r).length;
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
if (typeof window !== "undefined") {
  (window as any).runEncryptionTests = runEncryptionTests;
}
