import { Message } from "@/components/ChatWindow";

export interface Session {
  id: string;
  startTime: string; // ISO string for serialization
  lastUpdate: string; // ISO string for serialization
  messages: Message[];
  riskLevel: "low" | "moderate" | "high" | "critical";
  language: "en" | "ar_egy" | "ar_msa";
  flaggedForReview: boolean;
}

const STORAGE_KEY = "ai_meta_clinician_sessions";
const MAX_SESSIONS = 10; // Keep last 10 sessions
const SESSION_EXPIRY_DAYS = 90; // Delete after 90 days

/**
 * Save current session to localStorage
 */
export function saveSession(session: Session): void {
  try {
    const sessions = getSessions();

    // Remove old sessions (>90 days)
    const validSessions = sessions.filter((s) => {
      const daysSinceUpdate =
        (Date.now() - new Date(s.lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate < SESSION_EXPIRY_DAYS;
    });

    // Find existing session or add new one
    const existingIndex = validSessions.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      validSessions[existingIndex] = session;
    } else {
      validSessions.push(session);
    }

    // Keep only MAX_SESSIONS most recent
    const recentSessions = validSessions
      .sort(
        (a, b) =>
          new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
      )
      .slice(0, MAX_SESSIONS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

/**
 * Get all saved sessions
 */
export function getSessions(): Session[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const sessions: Session[] = JSON.parse(data);
    return sessions;
  } catch (error) {
    console.error("Error loading sessions:", error);
    return [];
  }
}

/**
 * Get a specific session by ID
 */
export function getSession(id: string): Session | null {
  const sessions = getSessions();
  return sessions.find((s) => s.id === id) || null;
}

/**
 * Delete a session
 */
export function deleteSession(id: string): void {
  try {
    const sessions = getSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting session:", error);
  }
}

/**
 * Clear all sessions
 */
export function clearAllSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing sessions:", error);
  }
}

/**
 * Export session as JSON file
 */
export function exportSession(session: Session): void {
  try {
    const dataStr = JSON.stringify(session, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `session_${session.id}_${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting session:", error);
  }
}

/**
 * Export session as text transcript
 */
export function exportSessionAsText(session: Session): void {
  try {
    let transcript = `AI Meta-Clinician - Session Transcript\n`;
    transcript += `========================================\n\n`;
    transcript += `Session ID: ${session.id}\n`;
    transcript += `Start Time: ${session.startTime.toLocaleString()}\n`;
    transcript += `Language: ${session.language}\n`;
    transcript += `Risk Level: ${session.riskLevel}\n`;
    transcript += `Flagged for Review: ${
      session.flaggedForReview ? "Yes" : "No"
    }\n\n`;
    transcript += `========================================\n\n`;

    session.messages.forEach((msg) => {
      const role =
        msg.role === "user"
          ? "YOU"
          : msg.role === "ai"
          ? "AI CLINICIAN"
          : "SYSTEM";
      transcript += `[${msg.timestamp.toLocaleTimeString()}] ${role}:\n`;
      transcript += `${msg.text}\n\n`;
      if (msg.riskLevel && msg.riskLevel !== "low") {
        transcript += `⚠️ Risk Level: ${msg.riskLevel.toUpperCase()}\n\n`;
      }
    });

    transcript += `========================================\n`;
    transcript += `End of Transcript\n`;

    const dataBlob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `session_${session.id}_${new Date().toISOString()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting session as text:", error);
  }
}

/**
 * Generate session statistics
 */
export function getSessionStats(session: Session) {
  const userMessages = session.messages.filter((m) => m.role === "user").length;
  const aiMessages = session.messages.filter((m) => m.role === "ai").length;
  const duration =
    new Date(session.lastUpdate).getTime() -
    new Date(session.startTime).getTime();
  const durationMinutes = Math.round(duration / (1000 * 60));

  return {
    totalMessages: session.messages.length,
    userMessages,
    aiMessages,
    durationMinutes,
    riskLevel: session.riskLevel,
    flagged: session.flaggedForReview,
  };
}
