# Layer 6: LLM Plug-in Layer

**Status:** ✅ Complete  
**Date:** October 31, 2025

## Overview

Layer 6 integrates Large Language Model capabilities into the clinical engine, providing a hybrid architecture that gracefully degrades from LLM to rule-based reasoning based on availability.

## Architecture

### Core Components

1. **`src/lib/llm/types.ts`**

   - Type definitions for LLM providers, models, and responses
   - Model configuration interface
   - 4 pre-configured models (Llama 3.2 1B/3B, Phi 3.5, Gemma 2)

2. **`src/lib/llm/llm.ts`**

   - WebLLM initialization and model loading
   - Response generation with automatic fallback
   - Streaming support (for future implementation)
   - Cloud API placeholder (for future implementation)

3. **`src/lib/llm/prompts.ts`**

   - Clinical system prompt (compassionate, safety-focused)
   - Context-aware prompt building
   - Crisis-specific prompt override
   - Assessment interpretation prompts (PHQ-9, GAD-7)

4. **`src/lib/reasoning/engine.ts` (Updated)**
   - Hybrid reasoning orchestrator
   - 3-step flow: Safety check → LLM attempt → Offline fallback
   - Crisis situations always use deterministic offline protocols

### State Management

**Store Extensions:**

- `LLMState` now includes `loadingProgress` and `loadingText`
- New action: `setLLMProgress(progress, text)`
- Existing actions: `setLLMProvider`, `setLLMStatus`, `setLLMModel`, `activateFallback`

### Testing

**`src/lib/__tests__/llm.test.ts`**

- 6 tests covering:
  - Module structure validation
  - Type definitions
  - Prompt building (clinical, crisis, assessment)
  - Model availability checks

## Usage

### Loading a Model

```typescript
import { useLLMController } from "@/hooks/useLLMController";

const { loadLLMModel, isReady, progress, progressText } = useLLMController();

// Load Llama 3.2 1B (fastest, recommended)
await loadLLMModel("Llama-3.2-1B-Instruct-q4f16_1-MLC");
```

### Generating Responses

The system automatically uses the hybrid architecture:

```typescript
import { generateClinicalResponse } from "@/lib/reasoning/engine";

const result = await generateClinicalResponse(userMessage, clinicalState);

// result.metadata.reasoningMode will be "llm", "offline", or "hybrid"
```

## Safety Features

1. **Crisis Override:** Crisis situations (suicidal ideation, self-harm) always trigger offline deterministic protocols, bypassing LLM for immediate, predictable responses.

2. **Automatic Fallback:** If LLM fails or is unavailable, the system seamlessly falls back to the mhGAP rule-based engine (Layer 5).

3. **Clinical Prompting:** All LLM prompts include safety protocols, crisis hotlines, and clear limitations.

## Available Models

| Model        | Size  | Context | Description                               |
| ------------ | ----- | ------- | ----------------------------------------- |
| Llama 3.2 1B | 0.9GB | 4096    | ⭐ **Recommended** - Fastest, lightweight |
| Llama 3.2 3B | 1.8GB | 8192    | Balanced performance                      |
| Phi 3.5 Mini | 2.1GB | 4096    | Microsoft, excellent reasoning            |
| Gemma 2 2B   | 1.4GB | 8192    | Google, high quality                      |

## Performance

- **Model Load Time:** ~15-30 seconds (depends on network and model size)
- **First Inference:** ~1-2 seconds (cold start)
- **Subsequent Inferences:** ~200-500ms

## Next Steps

Layer 7 will add audit logging hooks for HIPAA-compliant event tracking and clinical decision trails.

## Testing

Run the test suite at `/test`:

```bash
npm run dev
# Navigate to http://localhost:3000/test
```

All 26 tests should pass:

- 7 encryption tests
- 5 storage tests
- 8 reasoning tests
- 6 LLM tests
