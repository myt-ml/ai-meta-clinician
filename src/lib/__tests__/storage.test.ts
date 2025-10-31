/**
 * Storage Layer Tests
 *
 * Tests for IndexedDB persistence functionality
 */

import {
  initDatabase,
  STORES,
  addToStore,
  getFromStore,
  updateInStore,
  deleteFromStore,
  getAllFromStore,
  queryStoreByIndex,
  clearStore,
  countStore,
} from "../persistence/storage";

async function testDatabaseInit() {
  console.log("🧪 Testing database initialization...");

  try {
    const db = await initDatabase();
    console.log("  ✓ Database opened successfully");
    console.log("    - Name:", db.name);
    console.log("    - Version:", db.version);

    // Check object stores exist
    const storeNames = Array.from(db.objectStoreNames);
    const expectedStores = Object.values(STORES);

    const allStoresExist = expectedStores.every((store) =>
      storeNames.includes(store)
    );

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
      encrypted: false,
    };

    // CREATE
    await addToStore(STORES.SESSIONS, testData);
    console.log("  ✓ CREATE: Data added to store");

    // READ
    const retrieved = await getFromStore<typeof testData>(
      STORES.SESSIONS,
      testData.id
    );
    if (retrieved && retrieved.id === testData.id) {
      console.log("  ✓ READ: Data retrieved successfully");
    } else {
      throw new Error("Retrieved data does not match");
    }

    // UPDATE
    const updatedData = { ...testData, messageCount: 10 };
    await updateInStore(STORES.SESSIONS, updatedData);
    const afterUpdate = await getFromStore<typeof testData>(
      STORES.SESSIONS,
      testData.id
    );
    if (afterUpdate && afterUpdate.messageCount === 10) {
      console.log("  ✓ UPDATE: Data updated successfully");
    } else {
      throw new Error("Update did not work");
    }

    // DELETE
    await deleteFromStore(STORES.SESSIONS, testData.id);
    const afterDelete = await getFromStore(STORES.SESSIONS, testData.id);
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
        text: "Hello",
      },
      {
        id: "msg-2",
        sessionId: "session-1",
        timestamp: 2000,
        role: "assistant",
        text: "Hi",
      },
      {
        id: "msg-3",
        sessionId: "session-2",
        timestamp: 3000,
        role: "user",
        text: "Test",
      },
    ];

    for (const msg of messages) {
      await addToStore(STORES.MESSAGES, msg);
    }
    console.log("  ✓ Test messages added");

    // Query by sessionId
    const session1Messages = await queryStoreByIndex<(typeof messages)[0]>(
      STORES.MESSAGES,
      "sessionId",
      "session-1"
    );

    if (session1Messages.length === 2) {
      console.log("  ✓ Query by sessionId returned correct count");
    } else {
      throw new Error(`Expected 2 messages, got ${session1Messages.length}`);
    }

    // Query by role
    const userMessages = await queryStoreByIndex<(typeof messages)[0]>(
      STORES.MESSAGES,
      "role",
      "user"
    );

    if (userMessages.length === 2) {
      console.log("  ✓ Query by role returned correct count");
    } else {
      throw new Error(`Expected 2 user messages, got ${userMessages.length}`);
    }

    // Cleanup
    for (const msg of messages) {
      await deleteFromStore(STORES.MESSAGES, msg.id);
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
    const items = Array.from({ length: 10 }, (_, i) => ({
      id: `batch-${i}`,
      timestamp: Date.now() + i,
      data: `test-${i}`,
    }));

    for (const item of items) {
      await addToStore(STORES.AUDIT, item);
    }
    console.log("  ✓ Batch insert: 10 items added");

    // Get all
    const allItems = await getAllFromStore<(typeof items)[0]>(STORES.AUDIT);
    const batchItems = allItems.filter((item) => item.id.startsWith("batch-"));

    if (batchItems.length === 10) {
      console.log("  ✓ Batch retrieve: All items retrieved");
    } else {
      throw new Error(`Expected 10 items, got ${batchItems.length}`);
    }

    // Count
    const count = await countStore(STORES.AUDIT);
    if (count >= 10) {
      console.log(`  ✓ Count: ${count} items in store`);
    }

    // Clear
    await clearStore(STORES.AUDIT);
    const afterClear = await countStore(STORES.AUDIT);
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
      data: { nested: { value: "test" } },
      array: [1, 2, 3],
      boolean: true,
      number: 42,
    };

    await addToStore(STORES.SESSIONS, testSession);
    const retrieved = await getFromStore<typeof testSession>(
      STORES.SESSIONS,
      testSession.id
    );

    if (!retrieved) {
      throw new Error("Data not retrieved");
    }

    // Check all field types preserved
    const checksPass =
      retrieved.data.nested.value === "test" &&
      retrieved.array.length === 3 &&
      retrieved.boolean === true &&
      retrieved.number === 42;

    await deleteFromStore(STORES.SESSIONS, testSession.id);

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

// Run all tests
export async function runStorageTests() {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("💾 STORAGE LAYER TEST SUITE");
  console.log("═══════════════════════════════════════════════════════\n");

  const results = [];

  results.push(await testDatabaseInit());
  results.push(await testBasicCRUD());
  results.push(await testIndexQueries());
  results.push(await testBatchOperations());
  results.push(await testStorageIntegrity());

  const passed = results.filter((r) => r).length;
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
if (typeof window !== "undefined") {
  (window as any).runStorageTests = runStorageTests;
}
