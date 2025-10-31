(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/llm/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AVAILABLE_MODELS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AVAILABLE_MODELS"],
    "CLINICAL_SYSTEM_PROMPT",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$prompts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLINICAL_SYSTEM_PROMPT"],
    "buildAssessmentPrompt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$prompts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildAssessmentPrompt"],
    "buildCrisisPrompt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$prompts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildCrisisPrompt"],
    "buildPrompt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$prompts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildPrompt"],
    "generateCloudResponse",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$llm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateCloudResponse"],
    "generateResponse",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$llm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateResponse"],
    "generateStreamingResponse",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$llm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateStreamingResponse"],
    "generateWebLLMResponse",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$llm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateWebLLMResponse"],
    "initializeWebLLM",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$llm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeWebLLM"],
    "isModelReady",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$llm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isModelReady"],
    "loadModel",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$llm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadModel"],
    "unloadModel",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$llm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unloadModel"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/llm/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$llm$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/llm.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llm$2f$prompts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llm/prompts.ts [app-client] (ecmascript)");
}),
]);