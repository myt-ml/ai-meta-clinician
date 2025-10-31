/**
 * Local Telemetry System
 *
 * Tracks system performance, routing decisions, and operational metrics.
 * All data stored locally and encrypted - no external telemetry.
 *
 * Metrics tracked:
 * - Stage latency (validation → risk → LLM → format)
 * - Routing decisions (mhGAP vs Ollama vs WebLLM vs fallback)
 * - Model selection (which model for which task)
 * - Error rates and types
 * - Safety check results
 *
 * HIPAA Compliance:
 * - No PHI stored (metadata only)
 * - All logs encrypted at rest
 * - Local storage only (IndexedDB)
 * - Automatic cleanup after 90 days
 *
 * @module telemetry/local
 */

import {
  encryptJSONWithRotation,
  decryptJSONWithRotation,
  type EncryptedDataWithKeyId,
} from "../security/keyRotation";

/**
 * Stage timing information
 */
export interface StageMetrics {
  stage:
    | "validation"
    | "risk-assessment"
    | "safety-check"
    | "llm-routing"
    | "mhgap-protocol"
    | "response-format"
    | "total";
  startTime: number;
  endTime: number;
  duration: number; // milliseconds
  success: boolean;
  error?: string;
}

/**
 * Routing decision log
 */
export interface RoutingDecision {
  timestamp: number;
  trigger: "crisis" | "arabic" | "general" | "safety-validation";
  routedTo: "mhgap-offline" | "ollama" | "webllm" | "fallback-offline";
  model?: string; // e.g., 'llama3.2:3b', 'qwen2.5:1.5b'
  fallbackReason?: string; // If fallback occurred
  success: boolean;
  latency: number; // milliseconds
}

/**
 * Safety check result
 */
export interface SafetyCheckResult {
  timestamp: number;
  method: "columbia-protocol" | "local-llm" | "keyword-based";
  riskLevel: "none" | "low" | "medium" | "high" | "crisis";
  crisisDetected: boolean;
  confidence?: number;
  duration: number; // milliseconds
}

/**
 * Session metrics (anonymized)
 */
export interface SessionMetrics {
  sessionId: string; // UUID, no PHI
  timestamp: number;
  stages: StageMetrics[];
  routing: RoutingDecision | null;
  safetyCheck: SafetyCheckResult | null;
  language: "en" | "ar" | "mixed" | "unknown";
  totalDuration: number; // milliseconds
  success: boolean;
  errorType?: string;
}

/**
 * Aggregated statistics
 */
export interface TelemetryStats {
  totalSessions: number;
  successRate: number;
  averageLatency: number;
  routingBreakdown: Record<string, number>;
  modelUsage: Record<string, number>;
  crisisDetectionRate: number;
  errorRate: number;
  lastUpdated: number;
}

class LocalTelemetryManager {
  private dbName = "clinician-telemetry";
  private sessionStore = "sessions";
  private statsStore = "stats";
  private db: IDBDatabase | null = null;
  private initialized = false;
  private retentionDays = 90;

  /**
   * Initialize IndexedDB
   */
  async initialize(): Promise<void> {
    if (this.initialized && this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Sessions store
        if (!db.objectStoreNames.contains(this.sessionStore)) {
          const sessionStore = db.createObjectStore(this.sessionStore, {
            keyPath: "sessionId",
          });
          sessionStore.createIndex("timestamp", "timestamp", { unique: false });
          sessionStore.createIndex("success", "success", { unique: false });
        }

        // Stats store
        if (!db.objectStoreNames.contains(this.statsStore)) {
          db.createObjectStore(this.statsStore, { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        resolve();
      };
    });
  }

  /**
   * Log session metrics
   */
  async logSession(metrics: SessionMetrics): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error("Database not initialized");

    try {
      // Encrypt metrics before storage
      const encrypted = await encryptJSONWithRotation(metrics);

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(
          this.sessionStore,
          "readwrite"
        );
        const store = transaction.objectStore(this.sessionStore);

        const request = store.put({
          sessionId: metrics.sessionId,
          timestamp: metrics.timestamp,
          success: metrics.success,
          encrypted,
        });

        request.onsuccess = () => {
          this.updateStats(metrics);
          resolve();
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("[Telemetry] Failed to log session:", error);
    }
  }

  /**
   * Update aggregated statistics
   */
  private async updateStats(metrics: SessionMetrics): Promise<void> {
    if (!this.db) return;

    try {
      const stats = await this.getStats();

      stats.totalSessions++;
      if (metrics.success) {
        stats.successRate =
          (stats.successRate * (stats.totalSessions - 1) + 1) /
          stats.totalSessions;
      } else {
        stats.successRate =
          (stats.successRate * (stats.totalSessions - 1)) / stats.totalSessions;
        stats.errorRate = 1 - stats.successRate;
      }

      stats.averageLatency =
        (stats.averageLatency * (stats.totalSessions - 1) +
          metrics.totalDuration) /
        stats.totalSessions;

      if (metrics.routing) {
        const routeKey = metrics.routing.routedTo;
        stats.routingBreakdown[routeKey] =
          (stats.routingBreakdown[routeKey] || 0) + 1;

        if (metrics.routing.model) {
          stats.modelUsage[metrics.routing.model] =
            (stats.modelUsage[metrics.routing.model] || 0) + 1;
        }
      }

      if (metrics.safetyCheck?.crisisDetected) {
        const currentDetections =
          stats.crisisDetectionRate * (stats.totalSessions - 1);
        stats.crisisDetectionRate =
          (currentDetections + 1) / stats.totalSessions;
      }

      stats.lastUpdated = Date.now();

      // Encrypt and save stats
      const encrypted = await encryptJSONWithRotation(stats);

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(this.statsStore, "readwrite");
        const store = transaction.objectStore(this.statsStore);

        const request = store.put({
          id: "global-stats",
          encrypted,
        });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("[Telemetry] Failed to update stats:", error);
    }
  }

  /**
   * Get aggregated statistics
   */
  async getStats(): Promise<TelemetryStats> {
    await this.initialize();
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.statsStore, "readonly");
      const store = transaction.objectStore(this.statsStore);
      const request = store.get("global-stats");

      request.onsuccess = async () => {
        if (request.result && request.result.encrypted) {
          try {
            const stats = await decryptJSONWithRotation<TelemetryStats>(
              request.result.encrypted
            );
            resolve(stats);
          } catch (error) {
            console.error("[Telemetry] Failed to decrypt stats:", error);
            resolve(this.getDefaultStats());
          }
        } else {
          resolve(this.getDefaultStats());
        }
      };

      request.onerror = () => {
        console.error("[Telemetry] Failed to get stats:", request.error);
        resolve(this.getDefaultStats());
      };
    });
  }

  /**
   * Get recent sessions (last N)
   */
  async getRecentSessions(limit: number = 100): Promise<SessionMetrics[]> {
    await this.initialize();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.sessionStore, "readonly");
      const store = transaction.objectStore(this.sessionStore);
      const index = store.index("timestamp");
      const request = index.openCursor(null, "prev"); // Descending order

      const sessions: SessionMetrics[] = [];
      let count = 0;

      request.onsuccess = async (event) => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor && count < limit) {
          try {
            const decrypted = await decryptJSONWithRotation<SessionMetrics>(
              cursor.value.encrypted
            );
            sessions.push(decrypted);
            count++;
            cursor.continue();
          } catch (error) {
            console.error("[Telemetry] Failed to decrypt session:", error);
            cursor.continue();
          }
        } else {
          resolve(sessions);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clean up old data (retention policy)
   */
  async cleanup(): Promise<number> {
    await this.initialize();
    if (!this.db) return 0;

    const cutoffTime = Date.now() - this.retentionDays * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.sessionStore, "readwrite");
      const store = transaction.objectStore(this.sessionStore);
      const index = store.index("timestamp");
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`[Telemetry] Cleaned up ${deletedCount} old sessions`);
          resolve(deletedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get default stats structure
   */
  private getDefaultStats(): TelemetryStats {
    return {
      totalSessions: 0,
      successRate: 0,
      averageLatency: 0,
      routingBreakdown: {},
      modelUsage: {},
      crisisDetectionRate: 0,
      errorRate: 0,
      lastUpdated: Date.now(),
    };
  }
}

// Singleton instance
const telemetryManager = new LocalTelemetryManager();

/**
 * Performance tracker for measuring stage latency
 */
export class PerformanceTracker {
  private stages: Map<string, { start: number; stage: StageMetrics["stage"] }> =
    new Map();
  private completedStages: StageMetrics[] = [];
  private sessionStart: number = Date.now();

  /**
   * Start tracking a stage
   */
  startStage(stage: StageMetrics["stage"]): void {
    this.stages.set(stage, {
      start: performance.now(),
      stage,
    });
  }

  /**
   * End tracking a stage
   */
  endStage(
    stage: StageMetrics["stage"],
    success: boolean,
    error?: string
  ): void {
    const stageData = this.stages.get(stage);
    if (!stageData) {
      console.warn(`[PerformanceTracker] Stage ${stage} was not started`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - stageData.start;

    this.completedStages.push({
      stage,
      startTime: stageData.start,
      endTime,
      duration,
      success,
      error,
    });

    this.stages.delete(stage);
  }

  /**
   * Get all completed stages
   */
  getStages(): StageMetrics[] {
    return [...this.completedStages];
  }

  /**
   * Get total duration
   */
  getTotalDuration(): number {
    return Date.now() - this.sessionStart;
  }
}

/**
 * Log session metrics
 */
export async function logSessionMetrics(
  metrics: SessionMetrics
): Promise<void> {
  await telemetryManager.logSession(metrics);
}

/**
 * Get telemetry statistics
 */
export async function getTelemetryStats(): Promise<TelemetryStats> {
  return await telemetryManager.getStats();
}

/**
 * Get recent sessions
 */
export async function getRecentSessions(
  limit?: number
): Promise<SessionMetrics[]> {
  return await telemetryManager.getRecentSessions(limit);
}

/**
 * Clean up old telemetry data
 */
export async function cleanupTelemetry(): Promise<number> {
  return await telemetryManager.cleanup();
}

/**
 * Initialize telemetry system
 */
export async function initializeTelemetry(): Promise<void> {
  await telemetryManager.initialize();
}
