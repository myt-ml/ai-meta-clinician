/**
 * useLLMController Hook
 *
 * React hook for managing LLM lifecycle and interactions
 */

import { useEffect, useState, useCallback } from "react";
import { useClinicalStore } from "@/lib/store";
import {
  initializeWebLLM,
  loadModel,
  generateResponse,
  type ModelName,
  type ModelProgress,
} from "@/lib/llm";

export function useLLMController() {
  const llmState = useClinicalStore((state) => state.llm);
  const setLLMStatus = useClinicalStore((state) => state.setLLMStatus);
  const setLLMModel = useClinicalStore((state) => state.setLLMModel);
  const setLLMProgress = useClinicalStore((state) => state.setLLMProgress);
  const setLLMError = useClinicalStore((state) => state.setLLMError);

  /**
   * Initialize and load a specific model
   */
  const loadLLMModel = useCallback(
    async (modelName: ModelName) => {
      try {
        setLLMStatus("loading");
        setLLMProgress(0, "Initializing WebLLM...");

        // Initialize WebLLM (if not already done)
        const initialized = await initializeWebLLM();
        if (!initialized) {
          throw new Error("Failed to initialize WebLLM");
        }

        // Load the model with progress updates
        const onProgress = (progress: ModelProgress) => {
          setLLMProgress(progress.progress, progress.text);
        };

        const loaded = await loadModel(modelName, onProgress);
        if (!loaded) {
          throw new Error(`Failed to load model: ${modelName}`);
        }

        setLLMModel(modelName);
        setLLMStatus("ready");
        setLLMProgress(100, "Model ready");
      } catch (error) {
        console.error("Failed to load LLM model:", error);
        setLLMError(error instanceof Error ? error.message : "Unknown error");
      }
    },
    [setLLMStatus, setLLMModel, setLLMProgress, setLLMError]
  );

  return {
    llmState,
    loadLLMModel,
    isReady: llmState.status === "ready",
    isLoading: llmState.status === "loading",
    hasError: llmState.status === "error",
    progress: llmState.loadingProgress,
    progressText: llmState.loadingText,
  };
}
