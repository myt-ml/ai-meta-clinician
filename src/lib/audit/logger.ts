/**
 * Audit Logger Service
 *
 * HIPAA-compliant audit logging with persistence
 * Note: Encryption is handled at the storage layer
 */

import type {
  AuditEvent,
  AuditCategory,
  AuditSeverity,
  ComplianceLevel,
  ClinicalDecision,
  AuditQueryFilter,
  AuditExport,
} from "./types";
import {
  getDatabase,
  addToStore,
  getAllFromStore,
  STORES,
} from "../persistence/storage";

const BATCH_SIZE = 50;
const BATCH_INTERVAL = 5000; // 5 seconds

/**
 * In-memory batch for pending audit events
 */
let auditBatch: AuditEvent[] = [];
let batchTimer: NodeJS.Timeout | null = null;

/**
 * Generate unique audit event ID
 */
function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log an audit event
 */
export async function logAudit(
  category: AuditCategory,
  action: string,
  options: {
    severity?: AuditSeverity;
    complianceLevel?: ComplianceLevel;
    description?: string;
    metadata?: Record<string, unknown>;
    clinicalContext?: AuditEvent["clinicalContext"];
    sessionId?: string;
    userId?: string;
    piiPresent?: boolean;
    correlationId?: string;
    parentEventId?: string;
  } = {}
): Promise<void> {
  try {
    const event: AuditEvent = {
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
      encrypted: true, // Always encrypt audit logs
      piiPresent: options.piiPresent || false,
      correlationId: options.correlationId,
      parentEventId: options.parentEventId,
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
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[AUDIT] ${event.severity.toUpperCase()} - ${category}:${action}`,
        event
      );
    }
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

/**
 * Schedule batch flush
 */
function scheduleBatchFlush(): void {
  if (batchTimer) return;

  batchTimer = setTimeout(async () => {
    await flushAuditBatch();
    batchTimer = null;
  }, BATCH_INTERVAL);
}

/**
 * Flush audit batch to persistent storage
 */
async function flushAuditBatch(): Promise<void> {
  if (auditBatch.length === 0) return;

  const eventsToFlush = [...auditBatch];
  auditBatch = [];

  try {
    await getDatabase(); // Ensure DB is initialized

    for (const event of eventsToFlush) {
      // Store event (encryption handled at storage layer)
      await addToStore(STORES.AUDIT, event);
    }

    console.log(`[AUDIT] Flushed ${eventsToFlush.length} events to storage`);
  } catch (error) {
    console.error("Failed to flush audit batch:", error);
    // Re-add failed events to batch
    auditBatch.unshift(...eventsToFlush);
  }
}

/**
 * Query audit logs
 */
export async function queryAuditLogs(
  filter: AuditQueryFilter = {}
): Promise<AuditEvent[]> {
  try {
    await getDatabase(); // Ensure DB is initialized
    const allLogs = await getAllFromStore<AuditEvent>(STORES.AUDIT);

    // Filter events
    const events: AuditEvent[] = [];

    for (const event of allLogs) {
      // Apply filters
      if (filter.sessionId && event.sessionId !== filter.sessionId) continue;
      if (filter.category && !filter.category.includes(event.category))
        continue;
      if (filter.severity && !filter.severity.includes(event.severity))
        continue;
      if (filter.startTime && event.timestamp < filter.startTime) continue;
      if (filter.endTime && event.timestamp > filter.endTime) continue;
      if (
        filter.complianceLevel &&
        event.complianceLevel !== filter.complianceLevel
      )
        continue;
      if (filter.piiOnly && !event.piiPresent) continue;

      events.push(event);
    }

    return events.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Failed to query audit logs:", error);
    return [];
  }
}

/**
 * Export audit logs
 */
export async function exportAuditLogs(
  filter: AuditQueryFilter = {}
): Promise<AuditExport> {
  const events = await queryAuditLogs(filter);

  // Calculate summary
  const summary = {
    totalEvents: events.length,
    bySeverity: {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0,
    } as Record<AuditSeverity, number>,
    byCategory: {} as Record<AuditCategory, number>,
    complianceFlags: [] as string[],
  };

  for (const event of events) {
    summary.bySeverity[event.severity]++;
    summary.byCategory[event.category] =
      (summary.byCategory[event.category] || 0) + 1;

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
    summary,
  };
}

/**
 * Log clinical decision
 */
export async function logClinicalDecision(
  decision: ClinicalDecision,
  sessionId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAudit("assessment", "clinical_decision", {
    severity: decision.confidence < 0.5 ? "warning" : "info",
    complianceLevel: "hipaa",
    description: decision.reasoning,
    sessionId,
    metadata: {
      ...metadata,
      decisionType: decision.type,
      confidence: decision.confidence,
    },
    clinicalContext: {
      decision,
    },
    piiPresent: false,
  });
}

/**
 * Log safety escalation
 */
export async function logSafetyEscalation(
  riskLevel: string,
  trigger: string,
  sessionId: string
): Promise<void> {
  await logAudit("safety", "risk_escalation", {
    severity: riskLevel === "critical" ? "critical" : "warning",
    complianceLevel: "hipaa",
    description: `Risk escalated to ${riskLevel}`,
    sessionId,
    metadata: {
      trigger,
      riskLevel,
    },
    piiPresent: false,
  });
}

/**
 * Clear old audit logs based on retention policy
 */
export async function cleanupAuditLogs(retentionDays: number): Promise<number> {
  const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const allLogs = await queryAuditLogs({ endTime: cutoffTime });

  // TODO: Implement deletion from IndexedDB
  console.log(`[AUDIT] Would delete ${allLogs.length} old audit logs`);

  return allLogs.length;
}

/**
 * Force flush any pending audit events
 */
export async function flushAuditLogs(): Promise<void> {
  if (batchTimer) {
    clearTimeout(batchTimer);
    batchTimer = null;
  }
  await flushAuditBatch();
}
