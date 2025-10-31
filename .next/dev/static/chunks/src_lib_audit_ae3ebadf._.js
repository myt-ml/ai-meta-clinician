(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/audit/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Audit Logging Types
 *
 * HIPAA-compliant audit trail for clinical decision tracking
 */ __turbopack_context__.s([
    "DEFAULT_RETENTION",
    ()=>DEFAULT_RETENTION
]);
const DEFAULT_RETENTION = {
    standard: 90,
    hipaa: 2190,
    critical: 3650,
    autoDelete: false
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/audit/logger.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Audit Logger Service
 *
 * HIPAA-compliant audit logging with persistence
 * Note: Encryption is handled at the storage layer
 */ __turbopack_context__.s([
    "cleanupAuditLogs",
    ()=>cleanupAuditLogs,
    "exportAuditLogs",
    ()=>exportAuditLogs,
    "flushAuditLogs",
    ()=>flushAuditLogs,
    "logAudit",
    ()=>logAudit,
    "logClinicalDecision",
    ()=>logClinicalDecision,
    "logSafetyEscalation",
    ()=>logSafetyEscalation,
    "queryAuditLogs",
    ()=>queryAuditLogs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/persistence/storage.ts [app-client] (ecmascript)");
;
const BATCH_SIZE = 50;
const BATCH_INTERVAL = 5000; // 5 seconds
/**
 * In-memory batch for pending audit events
 */ let auditBatch = [];
let batchTimer = null;
/**
 * Generate unique audit event ID
 */ function generateAuditId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
async function logAudit(category, action, options = {}) {
    try {
        const event = {
            id: generateAuditId(),
            timestamp: Date.now(),
            sessionId: options.sessionId || "no-session",
            userId: options.userId,
            category,
            action,
            severity: options.severity || "info",
            complianceLevel: options.complianceLevel || "standard",
            description: options.description,
            metadata: options.metadata,
            clinicalContext: options.clinicalContext,
            encrypted: true,
            piiPresent: options.piiPresent || false,
            correlationId: options.correlationId,
            parentEventId: options.parentEventId
        };
        // Add to batch
        auditBatch.push(event);
        // If batch is full, flush immediately
        if (auditBatch.length >= BATCH_SIZE) {
            await flushAuditBatch();
        } else {
            // Schedule batch flush
            scheduleBatchFlush();
        }
        // Log to console in development
        if ("TURBOPACK compile-time truthy", 1) {
            console.log(`[AUDIT] ${event.severity.toUpperCase()} - ${category}:${action}`, event);
        }
    } catch (error) {
        console.error("Failed to log audit event:", error);
    }
}
/**
 * Schedule batch flush
 */ function scheduleBatchFlush() {
    if (batchTimer) return;
    batchTimer = setTimeout(async ()=>{
        await flushAuditBatch();
        batchTimer = null;
    }, BATCH_INTERVAL);
}
/**
 * Flush audit batch to persistent storage
 */ async function flushAuditBatch() {
    if (auditBatch.length === 0) return;
    const eventsToFlush = [
        ...auditBatch
    ];
    auditBatch = [];
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDatabase"])(); // Ensure DB is initialized
        for (const event of eventsToFlush){
            // Store event (encryption handled at storage layer)
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addToStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].AUDIT, event);
        }
        console.log(`[AUDIT] Flushed ${eventsToFlush.length} events to storage`);
    } catch (error) {
        console.error("Failed to flush audit batch:", error);
        // Re-add failed events to batch
        auditBatch.unshift(...eventsToFlush);
    }
}
async function queryAuditLogs(filter = {}) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDatabase"])(); // Ensure DB is initialized
        const allLogs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllFromStore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$persistence$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STORES"].AUDIT);
        // Filter events
        const events = [];
        for (const event of allLogs){
            // Apply filters
            if (filter.sessionId && event.sessionId !== filter.sessionId) continue;
            if (filter.category && !filter.category.includes(event.category)) continue;
            if (filter.severity && !filter.severity.includes(event.severity)) continue;
            if (filter.startTime && event.timestamp < filter.startTime) continue;
            if (filter.endTime && event.timestamp > filter.endTime) continue;
            if (filter.complianceLevel && event.complianceLevel !== filter.complianceLevel) continue;
            if (filter.piiOnly && !event.piiPresent) continue;
            events.push(event);
        }
        return events.sort((a, b)=>b.timestamp - a.timestamp);
    } catch (error) {
        console.error("Failed to query audit logs:", error);
        return [];
    }
}
async function exportAuditLogs(filter = {}) {
    const events = await queryAuditLogs(filter);
    // Calculate summary
    const summary = {
        totalEvents: events.length,
        bySeverity: {
            info: 0,
            warning: 0,
            error: 0,
            critical: 0
        },
        byCategory: {},
        complianceFlags: []
    };
    for (const event of events){
        summary.bySeverity[event.severity]++;
        summary.byCategory[event.category] = (summary.byCategory[event.category] || 0) + 1;
        if (event.complianceLevel === "hipaa" || event.complianceLevel === "full") {
            summary.complianceFlags.push(`HIPAA event: ${event.id}`);
        }
        if (event.piiPresent) {
            summary.complianceFlags.push(`PII present: ${event.id}`);
        }
    }
    return {
        exportId: `export_${Date.now()}`,
        exportTime: Date.now(),
        filter,
        events,
        summary
    };
}
async function logClinicalDecision(decision, sessionId, metadata) {
    await logAudit("assessment", "clinical_decision", {
        severity: decision.confidence < 0.5 ? "warning" : "info",
        complianceLevel: "hipaa",
        description: decision.reasoning,
        sessionId,
        metadata: {
            ...metadata,
            decisionType: decision.type,
            confidence: decision.confidence
        },
        clinicalContext: {
            decision
        },
        piiPresent: false
    });
}
async function logSafetyEscalation(riskLevel, trigger, sessionId) {
    await logAudit("safety", "risk_escalation", {
        severity: riskLevel === "critical" ? "critical" : "warning",
        complianceLevel: "hipaa",
        description: `Risk escalated to ${riskLevel}`,
        sessionId,
        metadata: {
            trigger,
            riskLevel
        },
        piiPresent: false
    });
}
async function cleanupAuditLogs(retentionDays) {
    const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const allLogs = await queryAuditLogs({
        endTime: cutoffTime
    });
    // TODO: Implement deletion from IndexedDB
    console.log(`[AUDIT] Would delete ${allLogs.length} old audit logs`);
    return allLogs.length;
}
async function flushAuditLogs() {
    if (batchTimer) {
        clearTimeout(batchTimer);
        batchTimer = null;
    }
    await flushAuditBatch();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/audit/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Audit Module - Public API
 */ __turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/audit/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/audit/logger.ts [app-client] (ecmascript)");
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/audit/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_RETENTION",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_RETENTION"],
    "cleanupAuditLogs",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cleanupAuditLogs"],
    "exportAuditLogs",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["exportAuditLogs"],
    "flushAuditLogs",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["flushAuditLogs"],
    "logAudit",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logAudit"],
    "logClinicalDecision",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logClinicalDecision"],
    "logSafetyEscalation",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logSafetyEscalation"],
    "queryAuditLogs",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryAuditLogs"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/audit/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/audit/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2f$logger$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/audit/logger.ts [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=src_lib_audit_ae3ebadf._.js.map