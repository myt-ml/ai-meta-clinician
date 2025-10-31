# Safety Policy: AI Meta Clinician

**Version:** 1.0.0  
**Effective Date:** October 31, 2025  
**Review Cycle:** Quarterly  
**Owner:** Clinical Safety Team

---

## Executive Summary

This Safety Policy defines the crisis management protocols, escalation procedures, and safety guardrails for the AI Meta Clinician system. **Patient safety is the absolute top priority** - when in doubt, the system defaults to emergency protocols.

---

## Core Safety Principles

### 1. Crisis-First Architecture
**The system ALWAYS prioritizes crisis detection over all other functions.**

- Crisis detection runs before any AI inference
- Positive crisis signals trigger immediate offline protocols
- No LLM involvement in crisis situations
- Emergency contact information always provided

### 2. Fail-Safe Design
**If anything fails, the system defaults to safe, offline protocols.**

- Network failure → Offline mhGAP protocols
- LLM unavailable → Offline mhGAP protocols  
- Uncertain classification → Escalate to human
- Missing data → Assume higher risk level

### 3. Never Standalone
**This system is NOT a replacement for clinical judgment.**

- Must be supervised by licensed clinician
- Outputs are recommendations, not directives
- User retains full autonomy
- Escalation pathways always available

---

## Crisis Detection Protocols

### Level 1: IMMINENT DANGER (Crisis)

**Triggers:**
- Active suicidal intent with plan/method
- Stated intent to harm self or others immediately
- Acute psychotic state with safety concerns
- Keywords: "kill myself tonight", "I have pills", "going to jump"

**System Response:**
1. **IMMEDIATE:** Display emergency banner
2. **IMMEDIATE:** Provide 988 (suicide lifeline) and 911
3. **IMMEDIATE:** Generate offline crisis protocol
4. **BYPASS:** No LLM inference allowed
5. **LOG:** Encrypted incident report (non-PHI)
6. **ALERT:** Flag for clinical supervisor review

**Response Template:**
```
🚨 EMERGENCY: This is a mental health crisis.

IMMEDIATE ACTIONS:
• Call 988 (Suicide & Crisis Lifeline) - Available 24/7
• Call 911 for emergency services
• Go to nearest emergency department
• Contact your crisis support person: [if on file]

You are not alone. Help is available RIGHT NOW.

DO NOT use this system for emergency situations. 
Contact emergency services immediately.
```

**Arabic Template:**
```
🚨 حالة طوارئ: هذه أزمة صحة نفسية

إجراءات فورية:
• اتصل بخدمات الطوارئ المحلية
• اذهب إلى أقرب قسم طوارئ
• اتصل بشخص الدعم في الأزمات

أنت لست وحدك. المساعدة متاحة الآن.
```

---

### Level 2: HIGH RISK

**Triggers:**
- Passive suicidal ideation (wish to die)
- Recent self-harm behavior  
- Escalating violent thoughts
- Severe depression with hopelessness

**System Response:**
1. Display urgent care recommendation
2. Provide crisis resources prominently
3. Use offline mhGAP protocols (preferred)
4. LLM inference only if explicitly safe
5. Log encounter for review
6. Recommend same-day clinical contact

**Response Template:**
```
⚠️ URGENT: Your responses indicate significant risk.

RECOMMENDED ACTIONS (Today):
• Contact your mental health provider immediately
• Call 988 if thoughts worsen
• Remove access to means of self-harm
• Stay with supportive person if possible

This system cannot provide emergency intervention.
Please contact a professional immediately.
```

---

### Level 3: MODERATE RISK

**Triggers:**
- Moderate depression/anxiety scores
- Vague harm ideation without plan
- Significant distress but stable
- Requesting help with coping

**System Response:**
1. Provide mhGAP-based recommendations
2. LLM inference allowed with guardrails
3. Crisis resources listed (not emergency)
4. Follow-up recommended within week
5. Standard logging

---

### Level 4: LOW RISK

**Triggers:**
- Mild symptoms
- General wellness questions
- Psychoeducation requests
- No harm indicators

**System Response:**
1. Full system capabilities available
2. LLM inference with tone enforcement
3. Educational content provided
4. Routine follow-up suggestions
5. Standard logging

---

## Escalation Pathways

### User-Initiated Escalation
Users can ALWAYS request immediate escalation:

- "I need to talk to someone now" → Route to crisis resources
- "This isn't helping" → Offer human clinician contact
- "I'm not safe" → Trigger Level 1 crisis protocol

### System-Initiated Escalation

**Automatic Escalation Triggers:**
1. Risk level increase during session
2. Repeated crisis keywords
3. User expresses intent to harm
4. System confidence below threshold
5. LLM generates concerning content

**Escalation Actions:**
- Elevate to next risk tier
- Apply stricter safety protocols
- Log for clinical review
- Provide immediate resources

### Clinical Supervisor Notification

**Immediate Notification (within 1 hour):**
- Level 1 crisis detected
- User requested emergency help
- System malfunction during crisis assessment

**Daily Notification:**
- Summary of all Level 2 encounters
- Failed safety checks
- LLM tone violations

**Weekly Notification:**
- Aggregate statistics
- Trend analysis
- System performance metrics

---

## Safety Guardrails

### Content Filtering

**Prohibited LLM Outputs:**
- Medical advice (medication recommendations)
- Diagnostic statements ("You have depression")
- Minimizing language ("It's not that bad")
- Toxic positivity ("Just think positive!")
- Cultural insensitivity
- Casual/unprofessional tone

**Post-Processing Enforcement:**
- All LLM outputs run through tone validator
- Casual phrases automatically corrected
- Clinical disclaimers added
- Medical advice blocked entirely

### Input Validation

**Rejected Inputs:**
- Requests for medication changes
- Diagnostic requests
- Third-party assessments (user must consent)
- Inappropriate content (harassment, spam)

**Sanitization:**
- PII detection and flagging
- SQL injection prevention
- XSS attack mitigation
- Input length limits

---

## Operational Safety

### Pre-Deployment Checklist

- [ ] All 13 crisis detection tests passing
- [ ] Ollama models downloaded and verified
- [ ] Encryption keys generated
- [ ] Clinical supervisor designated
- [ ] Emergency contact list updated
- [ ] Staff training completed
- [ ] Incident reporting pipeline tested
- [ ] Backup clinician available

### Daily Safety Checks

- [ ] Review crisis encounters from previous 24 hours
- [ ] Check system health (Ollama, encryption, storage)
- [ ] Verify emergency resource links active
- [ ] Review any user escalation requests
- [ ] Check for system errors in logs

### Monthly Safety Audits

- [ ] Crisis detection accuracy review
- [ ] Sample 10 random encounters for quality
- [ ] LLM tone enforcement effectiveness
- [ ] User feedback analysis
- [ ] Update emergency resources if needed

### Quarterly Safety Reviews

- [ ] Full system audit by external clinician
- [ ] Update mhGAP guidelines if WHO publishes changes
- [ ] Review and update crisis keywords
- [ ] Staff retraining on protocols
- [ ] Policy revision as needed

---

## Incident Response

### Severity Levels

**Critical (P0):**
- Missed crisis detection (false negative)
- System failure during active crisis
- Data breach or encryption failure
- LLM generated harmful advice

**High (P1):**
- False positive crisis (unnecessary alarm)
- LLM tone violation in high-risk case
- Escalation pathway failure
- Extended downtime (>4 hours)

**Medium (P2):**
- LLM tone violations (routine)
- Performance degradation
- Non-crisis system errors
- User complaints

**Low (P3):**
- Minor UI issues
- Documentation errors
- Non-urgent feature requests

### Incident Reporting

**Who Reports:**
- Users (via feedback mechanism)
- Clinical supervisors (from audits)
- System (automated error detection)
- Technical team (monitoring alerts)

**What to Report:**
1. Date/time of incident
2. Severity level
3. Description of issue
4. User impact (anonymized)
5. System state at time of incident
6. Steps taken to resolve

**Where to Report:**
- Critical/High: Immediate notification to clinical supervisor + technical lead
- Medium/Low: Daily incident log review

### Post-Incident Actions

1. **Immediate:** Stop any ongoing harm (if applicable)
2. **Short-term:** Implement workaround or fix
3. **Medium-term:** Root cause analysis
4. **Long-term:** System improvement to prevent recurrence
5. **Always:** Update safety documentation

---

## Training Requirements

### Clinical Supervisors

**Initial Training (8 hours):**
- System architecture and capabilities
- Crisis detection protocols
- Escalation procedures
- Incident response
- mhGAP guidelines review
- Cultural competency (Arabic support)

**Ongoing Training:**
- Quarterly: System updates and new features
- Monthly: Case review and quality improvement
- As needed: Incident debriefs

### Technical Staff

**Initial Training (4 hours):**
- Safety-first development principles
- Crisis detection architecture
- Encryption and security
- Monitoring and alerting
- Incident response procedures

**Ongoing Training:**
- Quarterly: Security updates
- Monthly: Performance review
- As needed: Technical incident analysis

---

## Emergency Contacts

### Crisis Resources (Always Provide to Users)

**United States:**
- 988: Suicide & Crisis Lifeline
- 911: Emergency services
- 1-800-273-8255: National Suicide Prevention Lifeline (legacy)
- Crisis Text Line: Text "HELLO" to 741741

**International:**
- System should detect locale and provide local resources
- Maintain updated list of international crisis lines

### Internal Escalation

**Clinical Supervisor:** [Contact Info]  
**Backup Clinician:** [Contact Info]  
**Technical Lead:** [Contact Info]  
**System Administrator:** [Contact Info]  
**Security Officer:** [Contact Info]

---

## Regulatory Compliance

### HIPAA (if applicable in US healthcare setting)

- All data encrypted at rest (AES-256-GCM)
- Local storage only (no cloud sync)
- Audit logs maintained
- User consent documented
- Breach notification procedures ready

### State/Local Requirements

- [To be filled based on deployment location]
- May require additional certifications
- May have specific crisis response protocols
- May need translation to local languages

---

## Policy Governance

### Review and Updates

- **Quarterly:** Clinical supervisor reviews with technical lead
- **Annually:** External expert review
- **As Needed:** After any P0/P1 incident
- **Continuous:** User feedback incorporation

### Change Management

1. Proposed changes documented
2. Risk assessment conducted
3. Clinical supervisor approval required
4. Staff training updated
5. Users notified of significant changes
6. Version control maintained

### Version History

**v1.0.0 (October 2025):**
- Initial safety policy
- Crisis detection protocols defined
- Escalation pathways established
- Training requirements specified

---

## Acknowledgments

This safety policy is informed by:
- WHO mhGAP guidelines
- Columbia Suicide Severity Rating Scale (C-SSRS)
- Joint Commission safety standards
- SAMHSA best practices
- Community input from mental health professionals

---

**For Questions or Policy Clarifications:**  
Contact Clinical Safety Team: [contact information]

**To Report Safety Concerns:**  
Emergency: [24/7 contact]  
Non-Emergency: [business hours contact]
