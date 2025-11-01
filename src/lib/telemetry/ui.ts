/**
 * UI Telemetry (local-only, encrypted)
 *
 * Lightweight event logger for anonymous UI interactions like language selection.
 * Data is encrypted at rest using the existing key rotation system and stored in localStorage.
 *
 * No PHI. Events are small and rotated with the key manager.
 */

import { encryptJSONWithRotation, decryptJSONWithRotation, type EncryptedDataWithKeyId } from "../security/keyRotation";

const UI_EVENTS_KEY = "clinician-ui-events";

type LanguageCode = "en" | "ar" | "ar-egy";

export type UIEvent =
  | {
      type: "language_selected";
      language: LanguageCode;
      timestamp: number;
      sessionId?: string;
    };

interface StoredEvents {
  events: UIEvent[];
  savedAt: number;
}

async function readEvents(): Promise<UIEvent[]> {
  try {
    const raw = localStorage.getItem(UI_EVENTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as EncryptedDataWithKeyId;
    const decrypted = await decryptJSONWithRotation<StoredEvents>(parsed);
    return Array.isArray(decrypted.events) ? decrypted.events : [];
  } catch {
    // Corrupt or missing data, start fresh
    return [];
  }
}

async function writeEvents(events: UIEvent[]): Promise<void> {
  const payload: StoredEvents = { events, savedAt: Date.now() };
  const encrypted = await encryptJSONWithRotation(payload);
  localStorage.setItem(UI_EVENTS_KEY, JSON.stringify(encrypted));
}

export async function logUIEvent(event: UIEvent): Promise<void> {
  try {
    const events = await readEvents();
    events.push(event);
    // Keep only the most recent 500 events to limit size
    const trimmed = events.slice(-500);
    await writeEvents(trimmed);
  } catch (err) {
    // Non-fatal: UI should never break because telemetry failed
    console.warn("[UI Telemetry] Failed to log event:", err);
  }
}

export async function getUIEvents(): Promise<UIEvent[]> {
  return readEvents();
}
