"use client";

/**
 * Clinical Engine Test Runner
 *
 * Browser-based test suite for encryption, storage, and reasoning layers.
 * Run this page to validate the clinical backbone before moving forward.
 */

import { useEffect, useState } from "react";
import { runEncryptionTests } from "@/lib/__tests__/encryption.test";
import { runStorageTests } from "@/lib/__tests__/storage.test";
import { runReasoningTests } from "@/lib/__tests__/reasoning.test";
import { runLLMTests } from "@/lib/__tests__/llm.test";

interface TestResult {
  totalTests: number;
  passed: number;
  failed: number;
  results: Array<{ name: string; pass: boolean; message: string }>;
}

export default function TestRunnerPage() {
  const [encryptionResults, setEncryptionResults] = useState<boolean | null>(
    null
  );
  const [storageResults, setStorageResults] = useState<boolean | null>(null);
  const [reasoningResults, setReasoningResults] = useState<TestResult | null>(
    null
  );
  const [llmResults, setLlmResults] = useState<boolean | null>(null);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Capture console output
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      setLogs((prev) => [...prev, args.join(" ")]);
      originalLog(...args);
    };

    console.error = (...args) => {
      setLogs((prev) => [...prev, "ERROR: " + args.join(" ")]);
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const runTests = async () => {
    setRunning(true);
    setLogs([]);
    setEncryptionResults(null);
    setStorageResults(null);
    setReasoningResults(null);
    setLlmResults(null);

    try {
      // Run encryption tests
      const encryptionPass = await runEncryptionTests();
      setEncryptionResults(encryptionPass);

      // Run storage tests
      const storagePass = await runStorageTests();
      setStorageResults(storagePass);

      // Run reasoning tests
      const reasoningTestResults = await runReasoningTests();
      setReasoningResults(reasoningTestResults);

      // Run LLM tests
      try {
        await runLLMTests();
        setLlmResults(true);
      } catch (llmError) {
        setLlmResults(false);
      }
    } catch (error) {
      console.error("Test suite error:", error);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-surfaceAlt p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-surface border border-border rounded-lg p-6 mb-6">
          <h1 className="text-h1 font-semibold text-textMain mb-2">
            🧪 Clinical Engine Test Suite
          </h1>
          <p className="text-body text-textSubtle">
            Validates encryption, storage, and reasoning layers before
            proceeding to next steps.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-surface border border-border rounded-lg p-6 mb-6">
          <button
            onClick={runTests}
            disabled={running}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              running
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary-dark"
            }`}
          >
            {running ? "⏳ Running Tests..." : "▶️ Run All Tests"}
          </button>
        </div>

        {/* Results Summary */}
        {(encryptionResults !== null ||
          storageResults !== null ||
          reasoningResults !== null ||
          llmResults !== null) && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Encryption Results */}
            <div
              className={`border rounded-lg p-6 ${
                encryptionResults === null
                  ? "bg-surface border-border"
                  : encryptionResults
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {encryptionResults === null
                    ? "⏳"
                    : encryptionResults
                    ? "✅"
                    : "❌"}
                </span>
                <h3 className="text-h3 font-semibold text-textMain">
                  Encryption Layer
                </h3>
              </div>
              <p className="text-caption text-textSubtle">
                {encryptionResults === null
                  ? "Waiting..."
                  : encryptionResults
                  ? "All encryption tests passed"
                  : "Some encryption tests failed"}
              </p>
            </div>

            {/* Storage Results */}
            <div
              className={`border rounded-lg p-6 ${
                storageResults === null
                  ? "bg-surface border-border"
                  : storageResults
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {storageResults === null
                    ? "⏳"
                    : storageResults
                    ? "✅"
                    : "❌"}
                </span>
                <h3 className="text-h3 font-semibold text-textMain">
                  Storage Layer
                </h3>
              </div>
              <p className="text-caption text-textSubtle">
                {storageResults === null
                  ? "Waiting..."
                  : storageResults
                  ? "All storage tests passed"
                  : "Some storage tests failed"}
              </p>
            </div>

            {/* Reasoning Results */}
            <div
              className={`border rounded-lg p-6 ${
                reasoningResults === null
                  ? "bg-surface border-border"
                  : reasoningResults.passed === reasoningResults.totalTests
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {reasoningResults === null
                    ? "⏳"
                    : reasoningResults.passed === reasoningResults.totalTests
                    ? "✅"
                    : "❌"}
                </span>
                <h3 className="text-h3 font-semibold text-textMain">
                  Reasoning Layer
                </h3>
              </div>
              <p className="text-caption text-textSubtle">
                {reasoningResults === null
                  ? "Waiting..."
                  : `${reasoningResults.passed}/${reasoningResults.totalTests} tests passed`}
              </p>
            </div>

            {/* LLM Results */}
            <div
              className={`border rounded-lg p-6 ${
                llmResults === null
                  ? "bg-surface border-border"
                  : llmResults
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {llmResults === null ? "⏳" : llmResults ? "✅" : "❌"}
                </span>
                <h3 className="text-h3 font-semibold text-textMain">
                  LLM Layer
                </h3>
              </div>
              <p className="text-caption text-textSubtle">
                {llmResults === null
                  ? "Waiting..."
                  : llmResults
                  ? "All LLM tests passed"
                  : "Some LLM tests failed"}
              </p>
            </div>
          </div>
        )}

        {/* Reasoning Test Details */}
        {reasoningResults && (
          <div className="bg-surface border border-border rounded-lg p-6 mb-6">
            <h3 className="text-h2 font-semibold text-textMain mb-4">
              Reasoning Tests Detailed Results
            </h3>
            <div className="space-y-2">
              {reasoningResults.results.map((result, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded ${
                    result.pass ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <span className="text-xl">{result.pass ? "✅" : "❌"}</span>
                  <div className="flex-1">
                    <div className="font-medium text-textMain">
                      {result.name}
                    </div>
                    <div className="text-sm text-textSubtle">
                      {result.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Console Output */}
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-auto max-h-[600px]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
            <span>💻</span>
            <span className="text-gray-400">Test Console Output</span>
          </div>
          {logs.length === 0 ? (
            <div className="text-gray-500">
              No output yet. Click "Run All Tests" to start.
            </div>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={`mb-1 ${
                  log.includes("FAIL") || log.includes("ERROR")
                    ? "text-red-400"
                    : log.includes("PASS")
                    ? "text-green-400"
                    : log.includes("✅")
                    ? "text-green-300 font-bold"
                    : log.includes("❌")
                    ? "text-red-300 font-bold"
                    : "text-gray-300"
                }`}
              >
                {log}
              </div>
            ))
          )}
        </div>

        {/* Navigation Hint */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-body text-textMain">
            <strong>Next Step:</strong> Once all tests pass (encryption,
            storage, reasoning, LLM), we'll proceed to Layer 7 (Audit Logging
            Hooks).
          </p>
        </div>
      </div>
    </div>
  );
}
