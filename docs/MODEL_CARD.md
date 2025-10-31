# Model Card: AI Meta Clinician

**Version:** 1.0.0  
**Last Updated:** October 31, 2025  
**Status:** Local Deployment Only - Pre-Production

---

## Model Overview

The AI Meta Clinician is a hybrid clinical reasoning system designed to provide mental health screening and support based on WHO mhGAP (Mental Health Gap Action Programme) guidelines. The system combines offline clinical protocols with optional AI inference for enhanced support.

###Purpose

- Mental health screening and initial assessment
- mhGAP guideline-based recommendations
- Crisis detection and emergency routing
- Multi-language support (English and Arabic)
- **NOT a replacement for professional clinical assessment**

---

## System Architecture

### Triple-Tier Inference Strategy

1. **Primary: Ollama (Local LLM)**

   - Models: llama3.2:3b, qwen2.5:1.5b, phi3:mini, smollm:1.7b
   - Total Size: ~6.3 GB
   - Purpose: Fast, private, local inference
   - Fallback: If unavailable, routes to Tier 2

2. **Secondary: WebLLM (Browser-based)**

   - Model: Llama-3.1-8B-Instruct-q4f32_1-MLC-1k
   - Purpose: Backup inference without server dependency
   - Fallback: If fails, routes to Tier 3

3. **Tertiary: Offline mhGAP Protocols**
   - Source: WHO mhGAP guidelines
   - Purpose: Deterministic, always-available responses
   - Guarantee: System ALWAYS works, even with no AI

### Crisis Override

**All crisis situations bypass AI and use offline protocols exclusively.**

---

## Capabilities

### ✅ What This System Can Do

1. **Crisis Detection**

   - Suicidal ideation (active and passive)
   - Self-harm behaviors
   - Violence risk assessment
   - Immediate emergency routing

2. **Mental Health Screening**

   - PHQ-9 (depression screening)
   - GAD-7 (anxiety screening)
   - Risk level assessment
   - Symptom pattern recognition

3. **Clinical Recommendations**

   - mhGAP-based interventions
   - Psychoeducation
   - Self-care strategies
   - Professional referral guidance

4. **Multi-Language Support**

   - English (primary)
   - Arabic (including Egyptian dialect)
   - Automatic language detection
   - Culture-aware responses

5. **Safety Features**
   - Local-first (no data leaves device)
   - Encrypted storage (AES-256-GCM)
   - Audit logging
   - HIPAA-compliant architecture

---

## Limitations

### ❌ What This System Cannot Do

1. **Medical Functions**

   - Cannot diagnose mental health conditions
   - Cannot prescribe medications
   - Cannot replace clinical assessment
   - Cannot provide emergency intervention

2. **Scope Limitations**

   - Not a crisis hotline (routes to 988/911)
   - Not suitable for acute psychosis
   - Limited to common mental disorders (CMD)
   - Not for complex psychiatric cases

3. **Technical Limitations**

   - Requires initial model download (~6 GB)
   - Performance varies by hardware
   - Arabic support may have regional variations
   - ASR (speech recognition) accuracy varies by accent

4. **LLM-Specific Limitations**
   - May generate plausible but incorrect information
   - Can exhibit cultural biases
   - Requires clinical tone post-processing
   - Not deterministic (except in crisis mode)

---

## Training Data & Biases

### Base Models

**Llama 3.2 (3B)**

- Trained by Meta AI
- General knowledge corpus
- Known biases: English-centric, Western medical focus
- Mitigation: mhGAP guidelines overlay, cultural adaptation

**Qwen 2.5 (1.5B)**

- Trained by Alibaba Cloud
- Multilingual (strong Arabic support)
- Known biases: Simplified Chinese dominant
- Mitigation: Arabic-specific routing, dialect testing

**Phi-3 Mini (2.3B)**

- Trained by Microsoft
- Safety-focused training
- Known biases: Conservative responses
- Mitigation: Used only for safety validation

### Clinical Guidelines

- **Source:** WHO mhGAP-IG version 2.0 (2016)
- **Evidence Base:** Systematic reviews, expert consensus
- **Geographic Scope:** Global, adaptable to local contexts
- **Known Gaps:** Limited substance use protocols, minimal child/adolescent content

### Bias Mitigation Strategies

1. **Clinical Overlay**

   - All responses validated against mhGAP guidelines
   - Tone enforcement removes casual/biased language
   - Mandatory clinical disclaimers

2. **Cultural Adaptation**

   - Arabic model routing for Middle Eastern users
   - Egyptian dialect support
   - Culturally-sensitive crisis language

3. **Safety Guardrails**
   - Crisis detection bypasses LLM entirely
   - Offline protocols ensure consistency
   - No medical advice generation

---

## Performance Metrics

### Crisis Detection (E2E Tests)

- **Test Cases:** 13 scenarios (suicidal ideation, self-harm, violence)
- **Sensitivity:** >95% (must not miss true crises)
- **Specificity:** >85% (minimize false alarms)
- **Languages Tested:** English, Arabic

### Response Latency (Target)

- Input validation: <50ms
- Risk assessment: <100ms
- LLM inference: <2s (Ollama), <5s (WebLLM)
- Offline response: <200ms
- **Total (non-crisis):** <3s
- **Total (crisis):** <300ms (offline only)

### Model Accuracy (Subjective)

- Clinical appropriateness: Requires human review
- Tone enforcement: >90% compliance
- Guideline adherence: 100% (offline), variable (LLM)

---

## Ethical Considerations

### Privacy

- **Data Storage:** Local only (IndexedDB)
- **Encryption:** AES-256-GCM at rest
- **Retention:** 90 days (auto-delete)
- **Sharing:** Never (no telemetry to external servers)

### Autonomy

- Users must consent before use
- Risk disclosures provided upfront
- Emergency services always user's choice
- Can opt out at any time

### Beneficence

- Provides access to evidence-based guidance
- Reduces stigma through private screening
- Multilingual support increases reach
- Free and open-source

### Non-Maleficence

- Crisis detection prioritized above all
- Cannot prescribe or diagnose (prevents harm)
- Clinical supervision required for deployment
- Incident reporting pipeline

---

## Deployment Requirements

### Technical

- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- 8 GB RAM minimum
- 10 GB free disk space (E: drive recommended)
- Network connection for initial model download
- Optional: Ollama server for fastest inference

### Clinical

- Must be supervised by licensed mental health professional
- Staff training on system capabilities and limitations
- Clear escalation pathways to human clinicians
- Regular audit of system outputs

### Regulatory

- HIPAA compliance (if in US healthcare setting)
- Local data protection regulations
- Informed consent from all users
- Incident reporting to clinical supervisor

---

## Maintenance & Updates

### Model Updates

- Base models updated quarterly (security patches)
- mhGAP guidelines updated per WHO releases
- Crisis detection rules reviewed monthly
- Cultural adaptation ongoing

### Performance Monitoring

- Encrypted telemetry (local only)
- Monthly audit of crisis detection accuracy
- Quarterly review of clinical appropriateness
- Annual external audit recommended

### Key Rotation

- Encryption keys rotated every 90 days
- Automatic rotation (transparent to users)
- Old keys retained for decryption
- Emergency rotation protocol available

---

## Contact & Support

**Clinical Supervision Inquiries:**  
[Designated Clinical Supervisor Contact]

**Technical Issues:**  
[System Administrator Contact]

**Emergency Use Questions:**  
Always route to local emergency services (911 in US, 988 for mental health crisis)

---

## Version History

**v1.0.0 (October 2025)**

- Initial production-ready release
- Ollama integration complete
- Triple fallback architecture
- Crisis detection E2E tested
- Encryption and telemetry implemented

---

## References

1. WHO mhGAP Intervention Guide version 2.0 (2016)
2. Columbia-Suicide Severity Rating Scale (C-SSRS)
3. PHQ-9 Patient Health Questionnaire
4. GAD-7 Generalized Anxiety Disorder Scale
5. Meta AI Llama 3.2 Model Card
6. Alibaba Cloud Qwen 2.5 Technical Report
7. Microsoft Phi-3 Model Documentation

---

**Disclaimer:** This system is a clinical decision support tool, not a medical device. It does not diagnose, treat, or prevent any disease. All outputs must be reviewed by qualified clinicians before clinical use. In emergencies, always contact local emergency services immediately.
