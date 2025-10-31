/**
 * Audit Logging Types
 *
 * HIPAA-compliant audit trail for clinical decision tracking
 */

import type { RiskLevel, Language, LLMProvider } from "../store/types";

/**
 * Audit event categories
 */
export type AuditCategory =
  | "session"
  | "message"
  | "risk"
  | "assessment"
  | "llm"
  | "safety"
  | "encryption"
  | "persistence"
  | "compliance"
  | "system";

/**
 * Audit event severity
 */
export type AuditSeverity = "info" | "warning" | "error" | "critical";

/**
 * Compliance requirement flags
 */
export type ComplianceLevel = "standard" | "hipaa" | "gdpr" | "full";

/**
 * Clinical decision event
 */
export interface ClinicalDecision {
  type: "assessment" | "escalation" | "referral" | "intervention";
  reasoning: string;
  confidence: number;
  basedOn: string[]; // What data informed this decision
  overriddenBy?: string; // If a clinician overrode this
}

/**
 * Enhanced audit event
 */
export interface AuditEvent {
  // Core identification
  id: string;
  timestamp: number;
  sessionId: string;
  userId?: string;

  // Event classification
  category: AuditCategory;
  action: string;
  severity: AuditSeverity;
  complianceLevel: ComplianceLevel;

  // Event details
  description?: string;
  metadata?: Record<string, unknown>;

  // Clinical context (if applicable)
  clinicalContext?: {
    riskLevel?: RiskLevel;
    decision?: ClinicalDecision;
    llmProvider?: LLMProvider;
    language?: Language;
  };

  // Security & Compliance
  encrypted: boolean;
  piiPresent: boolean; // Does this event contain PII?
  ipAddress?: string;
  userAgent?: string;

  // Correlation
  correlationId?: string; // Link related events
  parentEventId?: string; // For event chains
}

/**
 * Audit log query filters
 */
export interface AuditQueryFilter {
  sessionId?: string;
  category?: AuditCategory[];
  severity?: AuditSeverity[];
  startTime?: number;
  endTime?: number;
  complianceLevel?: ComplianceLevel;
  piiOnly?: boolean;
}

/**
 * Audit log export format
 */
export interface AuditExport {
  exportId: string;
  exportTime: number;
  filter: AuditQueryFilter;
  events: AuditEvent[];
  summary: {
    totalEvents: number;
    bySeverity: Record<AuditSeverity, number>;
    byCategory: Record<AuditCategory, number>;
    complianceFlags: string[];
  };
}

/**
 * Audit retention policy
 */
export interface RetentionPolicy {
  standard: number; // Days to keep standard logs
  hipaa: number; // Days to keep HIPAA logs (minimum 6 years)
  critical: number; // Days to keep critical events
  autoDelete: boolean;
}

/**
 * Default retention policy (HIPAA-compliant)
 */
export const DEFAULT_RETENTION: RetentionPolicy = {
  standard: 90, // 90 days
  hipaa: 2190, // 6 years (HIPAA minimum)
  critical: 3650, // 10 years
  autoDelete: false, // Require manual deletion
};
