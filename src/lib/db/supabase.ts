/**
 * Supabase Client Configuration
 *
 * This module provides a configured Supabase client for:
 * - User authentication (email/password, magic links)
 * - Session persistence (cloud backup)
 * - Multi-device sync
 * - Analytics and reporting
 *
 * Setup Steps:
 * 1. Create Supabase project at https://supabase.com
 * 2. Copy project URL and anon key
 * 3. Create .env.local file with:
 *    NEXT_PUBLIC_SUPABASE_URL=your_project_url
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
 * 4. Run database migrations (see schema.sql)
 */

import { createClient } from "@supabase/supabase-js";

// Supabase project credentials (from environment variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials not found. Database features will be disabled."
  );
}

/**
 * Supabase client instance
 * Provides access to authentication, database, and storage APIs
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Database type definitions
 * These match the schema in schema.sql
 */

export interface DbUser {
  id: string; // UUID from Supabase Auth
  email?: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    name?: string;
    age?: number;
    country?: string;
    preferred_language?: "en" | "ar_egy" | "ar_msa";
  };
}

export interface DbSession {
  id: string; // UUID
  user_id: string | null; // NULL for anonymous users
  start_time: string; // ISO timestamp
  last_update: string; // ISO timestamp
  risk_level: "low" | "moderate" | "high" | "critical";
  language: "en" | "ar_egy" | "ar_msa";
  flagged_for_review: boolean;
  created_at: string;
}

export interface DbMessage {
  id: string; // UUID
  session_id: string; // Foreign key to sessions
  role: "user" | "ai" | "system";
  text: string;
  timestamp: string; // ISO timestamp
  risk_level?: "low" | "moderate" | "high" | "critical";
  created_at: string;
}

export interface DbAssessment {
  id: string; // UUID
  session_id: string; // Foreign key to sessions
  type: "phq9" | "gad7" | "custom";
  score: number;
  responses: number[]; // Array of question responses
  interpretation: string;
  created_at: string;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<DbUser | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch user profile from database
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: DbUser["metadata"]
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;

    // Create user profile in database
    if (data.user) {
      await supabase.from("users").insert({
        id: data.user.id,
        email,
        metadata,
      });
    }

    return { data, error: null };
  } catch (error) {
    console.error("Sign up error:", error);
    return { data: null, error };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Sign in error:", error);
    return { data: null, error };
  }
}

/**
 * Sign in with magic link (passwordless)
 */
export async function signInWithMagicLink(email: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Magic link error:", error);
    return { data: null, error };
  }
}

/**
 * Sign out
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    return { error };
  }
}

/**
 * Save session to database
 */
export async function saveSessionToDb(session: {
  id: string;
  startTime: string;
  lastUpdate: string;
  messages: any[];
  riskLevel: "low" | "moderate" | "high" | "critical";
  language: "en" | "ar_egy" | "ar_msa";
  flaggedForReview: boolean;
}): Promise<{ error: any }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Insert or update session
    const { error: sessionError } = await supabase.from("sessions").upsert({
      id: session.id,
      user_id: user?.id || null,
      start_time: session.startTime,
      last_update: session.lastUpdate,
      risk_level: session.riskLevel,
      language: session.language,
      flagged_for_review: session.flaggedForReview,
    });

    if (sessionError) throw sessionError;

    // Insert messages
    const messagesToInsert = session.messages.map((msg) => ({
      session_id: session.id,
      role: msg.role,
      text: msg.text,
      timestamp: msg.timestamp.toISOString
        ? msg.timestamp.toISOString()
        : msg.timestamp,
      risk_level: msg.riskLevel,
    }));

    // Delete old messages for this session
    await supabase.from("messages").delete().eq("session_id", session.id);

    // Insert new messages
    const { error: messagesError } = await supabase
      .from("messages")
      .insert(messagesToInsert);

    if (messagesError) throw messagesError;

    return { error: null };
  } catch (error) {
    console.error("Error saving session to database:", error);
    return { error };
  }
}

/**
 * Get user sessions from database
 */
export async function getSessionsFromDb(): Promise<DbSession[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("last_update", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
}

/**
 * Get messages for a session
 */
export async function getSessionMessages(
  sessionId: string
): Promise<DbMessage[]> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

/**
 * Delete session from database
 */
export async function deleteSessionFromDb(sessionId: string) {
  try {
    // Delete messages first (cascade should handle this, but explicit is safe)
    await supabase.from("messages").delete().eq("session_id", sessionId);

    // Delete session
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", sessionId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting session:", error);
    return { error };
  }
}

/**
 * Save assessment (PHQ-9, GAD-7, etc.) to database
 */
export async function saveAssessmentToDb(assessment: {
  sessionId: string;
  type: "phq9" | "gad7" | "custom";
  score: number;
  responses: number[];
  interpretation: string;
}) {
  try {
    const { error } = await supabase.from("assessments").insert({
      session_id: assessment.sessionId,
      type: assessment.type,
      score: assessment.score,
      responses: assessment.responses,
      interpretation: assessment.interpretation,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error saving assessment:", error);
    return { error };
  }
}

/**
 * Get flagged sessions for clinical review
 */
export async function getFlaggedSessions(): Promise<DbSession[]> {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("flagged_for_review", true)
      .order("last_update", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching flagged sessions:", error);
    return [];
  }
}

/**
 * Get session statistics for dashboard
 */
export async function getSessionStats() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Total sessions
    const { count: totalSessions } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Flagged sessions
    const { count: flaggedSessions } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("flagged_for_review", true);

    // Risk level distribution
    const { data: riskData } = await supabase
      .from("sessions")
      .select("risk_level")
      .eq("user_id", user.id);

    const riskDistribution = {
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
    };

    riskData?.forEach((session) => {
      const level = session.risk_level as
        | "low"
        | "moderate"
        | "high"
        | "critical";
      riskDistribution[level]++;
    });

    return {
      totalSessions: totalSessions || 0,
      flaggedSessions: flaggedSessions || 0,
      riskDistribution,
    };
  } catch (error) {
    console.error("Error fetching session stats:", error);
    return null;
  }
}
