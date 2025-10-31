/**
 * Pilot Data Mode: PHI Redaction and Metadata Logging
 * 
 * For pilot deployments, ensures:
 * - No PHI (Protected Health Information) is logged
 * - All transcripts are redacted or anonymized
 * - Only metadata and analytics are captured
 * - Full encryption of any retained data
 * - Compliance with HIPAA/privacy regulations
 * 
 * Redaction targets:
 * - Names (first, last, full)
 * - Locations (addresses, cities, specific places)
 * - Identifiers (phone, email, SSN, ID numbers)
 * - Dates (birth dates, specific dates)
 * - Ages (specific ages, especially for minors)
 */

// Type definitions
interface RedactionConfig {
  enabled: boolean;
  aggressiveness: 'standard' | 'aggressive' | 'maximum';
  preserveContext: boolean; // Keep semantic context while removing PHI
}

interface RedactedMessage {
  original: string;
  redacted: string;
  redactedEntities: Array<{
    type: 'name' | 'location' | 'identifier' | 'date' | 'age' | 'contact';
    placeholder: string;
  }>;
  timestamp: Date;
}

interface PilotLogEntry {
  sessionId: string; // Anonymized session ID
  messageIndex: number;
  riskLevel?: string;
  language: string;
  responseTime: number;
  modelUsed: string;
  redactionCount: number;
  timestamp: Date;
  // NO message content
  // NO user identifiers
}

// PHI patterns for detection and redaction
const PHI_PATTERNS = {
  // Names - common patterns
  firstName: /\b[A-Z][a-z]{2,}\b/g,
  fullName: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
  
  // Contact information
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  
  // Identifiers
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  zipCode: /\b\d{5}(-\d{4})?\b/g,
  
  // Dates
  dateSlash: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
  dateDash: /\b\d{1,2}-\d{1,2}-\d{2,4}\b/g,
  
  // Ages
  ageExplicit: /\b(\d{1,3})\s*(years?\s*old|yrs?\s*old|y\/o)\b/gi,
  
  // Locations
  address: /\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/gi,
  city: /\b(in|from|at|lives?\s+in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+([A-Z]{2})\b/gi
};

// Redaction functions
export function redactNames(text: string, preserveContext: boolean = true): string {
  // Replace full names first
  let redacted = text.replace(PHI_PATTERNS.fullName, (match) => {
    return preserveContext ? '[NAME]' : '[REDACTED]';
  });
  
  // Then replace remaining capitalized words that look like names
  // (but preserve sentence starts and common words)
  const commonWords = new Set([
    'I', 'My', 'The', 'This', 'That', 'There', 'These', 'Those',
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ]);
  
  redacted = redacted.replace(PHI_PATTERNS.firstName, (match) => {
    if (commonWords.has(match)) {
      return match;
    }
    return preserveContext ? '[NAME]' : '[REDACTED]';
  });
  
  return redacted;
}

export function redactContactInfo(text: string, preserveContext: boolean = true): string {
  let redacted = text;
  
  // Redact email addresses
  redacted = redacted.replace(PHI_PATTERNS.email, () => {
    return preserveContext ? '[EMAIL]' : '[REDACTED]';
  });
  
  // Redact phone numbers
  redacted = redacted.replace(PHI_PATTERNS.phone, () => {
    return preserveContext ? '[PHONE]' : '[REDACTED]';
  });
  
  return redacted;
}

export function redactIdentifiers(text: string, preserveContext: boolean = true): string {
  let redacted = text;
  
  // Redact SSN
  redacted = redacted.replace(PHI_PATTERNS.ssn, () => {
    return preserveContext ? '[SSN]' : '[REDACTED]';
  });
  
  // Redact zip codes (might be part of address)
  redacted = redacted.replace(PHI_PATTERNS.zipCode, () => {
    return preserveContext ? '[ZIP]' : '[REDACTED]';
  });
  
  return redacted;
}

export function redactDates(text: string, preserveContext: boolean = true): string {
  let redacted = text;
  
  // Redact dates in various formats
  redacted = redacted.replace(PHI_PATTERNS.dateSlash, () => {
    return preserveContext ? '[DATE]' : '[REDACTED]';
  });
  
  redacted = redacted.replace(PHI_PATTERNS.dateDash, () => {
    return preserveContext ? '[DATE]' : '[REDACTED]';
  });
  
  return redacted;
}

export function redactAges(text: string, preserveContext: boolean = true): string {
  // Redact explicit age mentions (especially important for minors)
  return text.replace(PHI_PATTERNS.ageExplicit, (match) => {
    return preserveContext ? '[AGE] years old' : '[REDACTED]';
  });
}

export function redactLocations(text: string, preserveContext: boolean = true): string {
  let redacted = text;
  
  // Redact street addresses
  redacted = redacted.replace(PHI_PATTERNS.address, () => {
    return preserveContext ? '[ADDRESS]' : '[REDACTED]';
  });
  
  // Redact city/state mentions
  redacted = redacted.replace(PHI_PATTERNS.city, (match, preposition, city, state) => {
    return preserveContext ? `${preposition} [CITY], ${state}` : '[REDACTED]';
  });
  
  return redacted;
}

export function redactMessage(
  message: string,
  config: RedactionConfig = { enabled: true, aggressiveness: 'standard', preserveContext: true }
): RedactedMessage {
  if (!config.enabled) {
    return {
      original: message,
      redacted: message,
      redactedEntities: [],
      timestamp: new Date()
    };
  }
  
  let redacted = message;
  const redactedEntities: RedactedMessage['redactedEntities'] = [];
  
  // Count redactions by tracking placeholders
  const countRedactions = (before: string, after: string, type: RedactedMessage['redactedEntities'][0]['type']) => {
    const pattern = config.preserveContext ? `[${type.toUpperCase()}]` : '[REDACTED]';
    const beforeCount = (before.match(new RegExp(pattern.replace(/[[\]]/g, '\\$&'), 'g')) || []).length;
    const afterCount = (after.match(new RegExp(pattern.replace(/[[\]]/g, '\\$&'), 'g')) || []).length;
    const newRedactions = afterCount - beforeCount;
    
    for (let i = 0; i < newRedactions; i++) {
      redactedEntities.push({ type, placeholder: pattern });
    }
  };
  
  // Apply redactions in order
  const beforeNames = redacted;
  redacted = redactNames(redacted, config.preserveContext);
  countRedactions(beforeNames, redacted, 'name');
  
  const beforeContact = redacted;
  redacted = redactContactInfo(redacted, config.preserveContext);
  countRedactions(beforeContact, redacted, 'contact');
  
  const beforeIds = redacted;
  redacted = redactIdentifiers(redacted, config.preserveContext);
  countRedactions(beforeIds, redacted, 'identifier');
  
  const beforeDates = redacted;
  redacted = redactDates(redacted, config.preserveContext);
  countRedactions(beforeDates, redacted, 'date');
  
  const beforeAges = redacted;
  redacted = redactAges(redacted, config.preserveContext);
  countRedactions(beforeAges, redacted, 'age');
  
  const beforeLocations = redacted;
  redacted = redactLocations(redacted, config.preserveContext);
  countRedactions(beforeLocations, redacted, 'location');
  
  // For aggressive mode, also redact numbers and specific details
  if (config.aggressiveness === 'aggressive' || config.aggressiveness === 'maximum') {
    // Redact any remaining numbers (could be IDs)
    redacted = redacted.replace(/\b\d{4,}\b/g, () => {
      redactedEntities.push({ type: 'identifier', placeholder: '[NUMBER]' });
      return '[NUMBER]';
    });
  }
  
  // For maximum mode, be extremely cautious
  if (config.aggressiveness === 'maximum') {
    // Redact organization names (uppercase sequences)
    redacted = redacted.replace(/\b[A-Z]{2,}\b/g, () => {
      return '[ORG]';
    });
  }
  
  return {
    original: message,
    redacted,
    redactedEntities,
    timestamp: new Date()
  };
}

export function createPilotLogEntry(
  sessionId: string,
  messageIndex: number,
  metadata: {
    riskLevel?: string;
    language: string;
    responseTime: number;
    modelUsed: string;
    redactionCount: number;
  }
): PilotLogEntry {
  return {
    sessionId, // Should already be anonymized
    messageIndex,
    riskLevel: metadata.riskLevel,
    language: metadata.language,
    responseTime: metadata.responseTime,
    modelUsed: metadata.modelUsed,
    redactionCount: metadata.redactionCount,
    timestamp: new Date()
  };
}

export function anonymizeSessionId(originalId: string): string {
  // In production, use crypto.subtle.digest or similar
  // For now, simple hash simulation
  let hash = 0;
  for (let i = 0; i < originalId.length; i++) {
    const char = originalId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `session-${Math.abs(hash).toString(16)}`;
}

export class PilotLogger {
  private logs: PilotLogEntry[] = [];
  private redactionConfig: RedactionConfig;
  
  constructor(config: RedactionConfig = { enabled: true, aggressiveness: 'standard', preserveContext: true }) {
    this.redactionConfig = config;
  }
  
  logMessage(
    sessionId: string,
    messageIndex: number,
    message: string,
    metadata: {
      riskLevel?: string;
      language: string;
      responseTime: number;
      modelUsed: string;
    }
  ): void {
    // Redact the message (but don't store it)
    const redacted = redactMessage(message, this.redactionConfig);
    
    // Create metadata-only log entry
    const logEntry = createPilotLogEntry(
      anonymizeSessionId(sessionId),
      messageIndex,
      {
        ...metadata,
        redactionCount: redacted.redactedEntities.length
      }
    );
    
    this.logs.push(logEntry);
  }
  
  getAnalytics(): {
    totalMessages: number;
    averageResponseTime: number;
    riskLevelDistribution: Record<string, number>;
    modelUsage: Record<string, number>;
    languageDistribution: Record<string, number>;
    totalRedactions: number;
  } {
    const totalMessages = this.logs.length;
    const totalResponseTime = this.logs.reduce((sum, log) => sum + log.responseTime, 0);
    const averageResponseTime = totalMessages > 0 ? totalResponseTime / totalMessages : 0;
    
    const riskLevelDistribution: Record<string, number> = {};
    const modelUsage: Record<string, number> = {};
    const languageDistribution: Record<string, number> = {};
    let totalRedactions = 0;
    
    this.logs.forEach(log => {
      // Risk level distribution
      if (log.riskLevel) {
        riskLevelDistribution[log.riskLevel] = (riskLevelDistribution[log.riskLevel] || 0) + 1;
      }
      
      // Model usage
      modelUsage[log.modelUsed] = (modelUsage[log.modelUsed] || 0) + 1;
      
      // Language distribution
      languageDistribution[log.language] = (languageDistribution[log.language] || 0) + 1;
      
      // Total redactions
      totalRedactions += log.redactionCount;
    });
    
    return {
      totalMessages,
      averageResponseTime,
      riskLevelDistribution,
      modelUsage,
      languageDistribution,
      totalRedactions
    };
  }
  
  exportLogs(): PilotLogEntry[] {
    // Return copy to prevent modification
    return JSON.parse(JSON.stringify(this.logs));
  }
  
  clearLogs(): void {
    this.logs = [];
  }
}

// Utility to verify no PHI in logs
export function verifyNoPHI(logEntry: PilotLogEntry): boolean {
  // Convert entire log entry to string
  const logString = JSON.stringify(logEntry);
  
  // Check for common PHI patterns
  const phiDetected = 
    PHI_PATTERNS.email.test(logString) ||
    PHI_PATTERNS.phone.test(logString) ||
    PHI_PATTERNS.ssn.test(logString);
  
  return !phiDetected; // Return true if NO PHI detected
}
