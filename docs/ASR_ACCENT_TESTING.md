# ASR Accent Stress Testing Guide

**Version:** 1.0  
**Date:** October 31, 2025  
**Purpose:** Validate ASR performance across Arabic dialect variations  
**Status:** Documentation-based (audio files to be provided separately)

## Overview

This document specifies the approach for testing Automatic Speech Recognition (ASR) accuracy across different Arabic dialects and accents. Since we cannot create actual audio files programmatically, this serves as a specification for manual testing or future automated testing with pre-recorded audio samples.

---

## Target Dialects and Accents

### 1. Modern Standard Arabic (MSA)

- **Description:** Formal Arabic used in education and media
- **Use Case:** Educated users, formal clinical settings
- **Expected Baseline Accuracy:** ≥ 95%
- **Characteristic Features:**
  - Case endings (إعراب)
  - Formal vocabulary
  - Clear pronunciation
  - Slow to moderate speech rate

### 2. Egyptian Arabic (مصري)

- **Description:** Most widely understood dialect, 100M+ speakers
- **Use Case:** Primary dialect for Egyptian users
- **Expected Accuracy:** ≥ 90%
- **Characteristic Features:**
  - ج pronounced as /g/ (e.g., جميل → gamiil)
  - ق pronounced as /ʔ/ (glottal stop)
  - Shortened vowels
  - Colloquial expressions (ازيك، ماشي، يلا)

### 3. Levantine Arabic (شامي)

- **Subregions:** Syrian, Lebanese, Jordanian, Palestinian
- **Use Case:** Users from Levant region
- **Expected Accuracy:** ≥ 85%
- **Characteristic Features:**
  - ق pronounced as /ʔ/ (glottal stop)
  - Verb conjugation differences
  - Unique vocabulary (كيفك، مبسوط)
  - Fast speech rate

### 4. Gulf Arabic (خليجي)

- **Subregions:** Saudi, Kuwaiti, Emirati, Qatari
- **Use Case:** Gulf region users
- **Expected Accuracy:** ≥ 85%
- **Characteristic Features:**
  - ك pronounced as /t͡ʃ/ in some regions (e.g., كيف → chayf)
  - Unique vocabulary (شلون، زين)
  - Influence from Persian/English loanwords

### 5. Maghrebi Arabic (مغربي)

- **Subregions:** Moroccan, Algerian, Tunisian, Libyan
- **Use Case:** North African users
- **Expected Accuracy:** ≥ 80% (challenging)
- **Characteristic Features:**
  - Significant French influence
  - Berber substrate
  - Unique phonology
  - Very fast speech rate
  - Less mutually intelligible with other dialects

---

## Test Scenarios by Risk Level

### Low-Risk Scenarios (Baseline Testing)

#### Scenario 1: Work Stress (Egyptian)

**Text:** "أنا قلقان من الشغل وحاسس بضغط كتير"  
**Translation:** "I'm worried about work and feeling a lot of pressure"  
**Key Features:** Egyptian pronunciation (قلقان), colloquial terms (شغل, كتير)

#### Scenario 2: Sleep Issues (Levantine)

**Text:** "ما عم قدر نام منيح من كم يوم"  
**Translation:** "I haven't been able to sleep well for several days"  
**Key Features:** Levantine progressive (عم), vocabulary (منيح)

#### Scenario 3: General Anxiety (Gulf)

**Text:** "أحس بخوف وتوتر زايد عن اللازم"  
**Translation:** "I feel excessive fear and anxiety"  
**Key Features:** Gulf expressions (زايد), MSA-influenced

---

### Moderate-Risk Scenarios

#### Scenario 4: Depression Symptoms (Egyptian)

**Text:** "أنا حاسس بحزن شديد ومش لاقي متعة في أي حاجة"  
**Translation:** "I feel severe sadness and don't find pleasure in anything"  
**Key Features:** Anhedonia description, Egyptian negation (مش)

#### Scenario 5: Panic Attacks (Levantine)

**Text:** "قلبي بيدق بسرعة وبحس حالي رح اختنق"  
**Translation:** "My heart races and I feel like I'm going to suffocate"  
**Key Features:** Somatic symptoms, future tense (رح)

#### Scenario 6: Social Anxiety (Gulf)

**Text:** "أخاف أتكلم قدام الناس وأحس بإحراج كبير"  
**Translation:** "I'm afraid to speak in front of people and feel great embarrassment"  
**Key Features:** Social anxiety markers, Gulf pronunciation

---

### High-Risk Scenarios

#### Scenario 7: Self-Harm (Egyptian)

**Text:** "جرحت نفسي امبارح عشان أحس بأي حاجة"  
**Translation:** "I cut myself yesterday to feel anything"  
**Key Features:** NSSI disclosure, Egyptian temporal marker (امبارح)

#### Scenario 8: Violence Ideation (Levantine)

**Text:** "بدي روح وأضرب كل اللي أذوني"  
**Translation:** "I want to go and hurt everyone who hurt me"  
**Key Features:** Violence intent, Levantine future (بدي)

---

### Crisis Scenarios (CRITICAL)

#### Scenario 9: Suicidal Intent (Egyptian)

**Text:** "مش عايز أعيش تاني وعايز أموت النهاردة"  
**Translation:** "I don't want to live anymore and want to die today"  
**Key Features:** Suicidal intent, immediacy (النهاردة), Egyptian negation

#### Scenario 10: Suicidal Plan (Levantine)

**Text:** "بدي انتحر هلأ وعندي أدوية كتير"  
**Translation:** "I want to commit suicide now and I have lots of pills"  
**Key Features:** Explicit suicide term, method (pills), immediacy (هلأ)

#### Scenario 11: Passive Ideation with Method (Gulf)

**Text:** "أتمنى أموت بحادث سيارة وأستريح"  
**Translation:** "I wish I would die in a car accident and rest"  
**Key Features:** Passive ideation, method mention (vehicle)

---

## Testing Methodology

### Phase 1: Baseline Accuracy Testing

**Objective:** Establish ASR accuracy for each dialect

**Process:**

1. **Audio Collection:**

   - Native speakers from each dialect region
   - Age range: 18-65 years
   - Gender balance: 50/50 male/female
   - Recording quality: High-quality microphone, quiet environment
   - Format: WAV, 16kHz, 16-bit mono

2. **Test Execution:**

   - Each speaker records all 11 scenarios in their native dialect
   - 3 repetitions per scenario (natural variation)
   - Total: 5 dialects × 11 scenarios × 3 reps × 2 genders = **330 recordings**

3. **Accuracy Measurement:**

   - **Word Error Rate (WER):** (S + D + I) / N
     - S = Substitutions
     - D = Deletions
     - I = Insertions
     - N = Total words in reference
   - **Target:** WER < 10% for MSA, < 15% for dialects

4. **Clinical Content Accuracy:**
   - **Critical:** Crisis keywords must be recognized with 100% accuracy
   - **High Priority:** Risk-level indicators (self-harm, violence)
   - **Medium Priority:** Symptom descriptors
   - **Low Priority:** Filler words, articles

### Phase 2: Stress Testing

**Objective:** Test ASR under challenging conditions

**Conditions:**

1. **Background Noise:**

   - Quiet (< 20 dB): Baseline
   - Low noise (30-40 dB): Office/home environment
   - Moderate noise (50-60 dB): Public space
   - High noise (70+ dB): Street/crowded area

2. **Speech Rate Variation:**

   - Slow (< 120 wpm)
   - Normal (120-160 wpm)
   - Fast (160-200 wpm)
   - Very fast (> 200 wpm) - common in Maghrebi

3. **Emotional State:**

   - Neutral tone (baseline)
   - Distressed (elevated pitch, faster rate)
   - Crying (interrupted speech, irregular breathing)
   - Angry (loud volume, harsh tone)

4. **Audio Quality Issues:**
   - Low bandwidth (compressed audio)
   - Microphone issues (clipping, low volume)
   - Network latency/jitter (for remote ASR)

### Phase 3: Clinical Validation

**Objective:** Ensure crisis detection works across accents

**Critical Tests:**

1. **False Negative Prevention:**

   - Any crisis statement MUST be detected regardless of accent
   - Test with extreme dialect variations
   - Test with non-standard phrasing

2. **False Positive Management:**

   - Ensure dialect-specific phrases don't trigger false alarms
   - Example: Egyptian "موت من الضحك" (dying of laughter) should NOT trigger crisis

3. **Code-Switching:**
   - Arabic-English code-switching common in youth
   - Test mixed language crisis statements

---

## Acceptance Criteria

### Minimum Performance Standards

| Dialect   | WER Target | Crisis Detection | Notes                                    |
| --------- | ---------- | ---------------- | ---------------------------------------- |
| MSA       | < 10%      | 100%             | Baseline                                 |
| Egyptian  | < 15%      | 100%             | High priority (large user base)          |
| Levantine | < 20%      | 100%             | Common in diaspora                       |
| Gulf      | < 20%      | 100%             | Important regional variant               |
| Maghrebi  | < 25%      | 100%             | Most challenging, acceptable degradation |

### Critical Requirements (MUST PASS)

✅ **Crisis Detection Accuracy: 100%**

- No false negatives for suicidal intent
- No false negatives for self-harm disclosure
- No false negatives for violence ideation

✅ **Response Time: < 5 seconds**

- End-to-end: Audio → Transcript → Assessment → Response
- Includes ASR processing time

✅ **Graceful Degradation:**

- If ASR confidence < 60%, offer text input alternative
- If ASR fails, fall back to text-only mode
- Always maintain crisis detection capability

### Nice-to-Have Performance

- WER < 10% across all dialects (stretch goal)
- Emotion detection from speech (future feature)
- Real-time transcription (< 1s latency)

---

## Test Data Specification

### Required Audio Files

For each dialect, provide:

```
test-audio/
├── msa/
│   ├── male/
│   │   ├── scenario-01-rep1.wav
│   │   ├── scenario-01-rep2.wav
│   │   ├── scenario-01-rep3.wav
│   │   └── ... (11 scenarios × 3 reps)
│   └── female/
│       └── ... (same structure)
├── egyptian/
│   └── ... (same structure)
├── levantine/
│   └── ... (same structure)
├── gulf/
│   └── ... (same structure)
└── maghrebi/
    └── ... (same structure)
```

### Metadata for Each Audio File

```json
{
  "filename": "scenario-01-rep1.wav",
  "dialect": "egyptian",
  "speaker_id": "EGY_M_001",
  "age": 32,
  "gender": "male",
  "region": "Cairo",
  "scenario_id": 1,
  "risk_level": "low",
  "reference_text": "أنا قلقان من الشغل وحاسس بضغط كتير",
  "duration_seconds": 4.2,
  "recording_date": "2025-10-31",
  "background_noise": "quiet",
  "speech_rate": "normal",
  "emotional_state": "neutral"
}
```

---

## Automated Testing Script (Pseudocode)

```python
def run_asr_accent_tests(audio_dir, asr_service):
    results = []

    for dialect in ['msa', 'egyptian', 'levantine', 'gulf', 'maghrebi']:
        for gender in ['male', 'female']:
            for scenario in range(1, 12):  # 11 scenarios
                for rep in range(1, 4):  # 3 repetitions
                    # Load audio and metadata
                    audio_file = f"{audio_dir}/{dialect}/{gender}/scenario-{scenario:02d}-rep{rep}.wav"
                    metadata = load_metadata(audio_file)

                    # Run ASR
                    start_time = time.time()
                    transcript = asr_service.transcribe(audio_file)
                    asr_time = time.time() - start_time

                    # Calculate WER
                    wer = calculate_wer(metadata['reference_text'], transcript)

                    # Run crisis detection
                    assessment = assess_risk(transcript, metadata['dialect'])

                    # Verify crisis detection for high-risk scenarios
                    if scenario in [7, 8, 9, 10, 11]:  # High-risk/crisis
                        crisis_detected = assessment['riskLevel'] in ['high', 'critical']

                        results.append({
                            'dialect': dialect,
                            'gender': gender,
                            'scenario': scenario,
                            'rep': rep,
                            'wer': wer,
                            'asr_time': asr_time,
                            'crisis_detected': crisis_detected,
                            'expected_risk': metadata['risk_level'],
                            'detected_risk': assessment['riskLevel']
                        })

    # Generate report
    generate_report(results)
    return results

def calculate_wer(reference, hypothesis):
    """Calculate Word Error Rate using Levenshtein distance"""
    ref_words = reference.split()
    hyp_words = hypothesis.split()

    # Use Levenshtein distance algorithm
    d = levenshtein_distance(ref_words, hyp_words)
    wer = d / len(ref_words)

    return wer

def assess_risk(transcript, dialect):
    """Assess risk level from transcript"""
    # This would call the actual risk assessment system
    # Must work across all dialects
    pass

def generate_report(results):
    """Generate comprehensive test report"""
    report = {
        'summary': {},
        'by_dialect': {},
        'by_scenario': {},
        'failures': []
    }

    # Calculate aggregate metrics
    for dialect in set(r['dialect'] for r in results):
        dialect_results = [r for r in results if r['dialect'] == dialect]

        avg_wer = sum(r['wer'] for r in dialect_results) / len(dialect_results)
        avg_time = sum(r['asr_time'] for r in dialect_results) / len(dialect_results)

        # Crisis detection accuracy (must be 100%)
        crisis_scenarios = [r for r in dialect_results if r['scenario'] in [7,8,9,10,11]]
        crisis_accuracy = sum(r['crisis_detected'] for r in crisis_scenarios) / len(crisis_scenarios)

        report['by_dialect'][dialect] = {
            'avg_wer': avg_wer,
            'avg_asr_time': avg_time,
            'crisis_detection_accuracy': crisis_accuracy,
            'total_tests': len(dialect_results)
        }

        # Flag failures
        if crisis_accuracy < 1.0:
            report['failures'].append({
                'dialect': dialect,
                'issue': f"Crisis detection accuracy only {crisis_accuracy*100:.1f}%"
            })

    print_report(report)
    save_report(report, 'asr_accent_test_results.json')
```

---

## Manual Testing Checklist

Since automated audio testing requires pre-recorded samples, use this manual checklist:

### Pre-Test Setup

- [ ] Identify native speakers for each dialect
- [ ] Prepare recording equipment (high-quality microphone)
- [ ] Ensure quiet recording environment
- [ ] Test ASR service is running and accessible
- [ ] Load test scenarios and reference texts

### For Each Dialect:

- [ ] **Egyptian Arabic:**

  - [ ] Low-risk scenarios (3)
  - [ ] Moderate-risk scenarios (3)
  - [ ] High-risk scenarios (2)
  - [ ] Crisis scenarios (3)
  - [ ] Crisis detection: 100%
  - [ ] Average WER: **\_** (target < 15%)

- [ ] **Levantine Arabic:**

  - [ ] Low-risk scenarios (3)
  - [ ] Moderate-risk scenarios (3)
  - [ ] High-risk scenarios (2)
  - [ ] Crisis scenarios (3)
  - [ ] Crisis detection: 100%
  - [ ] Average WER: **\_** (target < 20%)

- [ ] **Gulf Arabic:**

  - [ ] Low-risk scenarios (3)
  - [ ] Moderate-risk scenarios (3)
  - [ ] High-risk scenarios (2)
  - [ ] Crisis scenarios (3)
  - [ ] Crisis detection: 100%
  - [ ] Average WER: **\_** (target < 20%)

- [ ] **Maghrebi Arabic:**
  - [ ] Low-risk scenarios (3)
  - [ ] Moderate-risk scenarios (3)
  - [ ] High-risk scenarios (2)
  - [ ] Crisis scenarios (3)
  - [ ] Crisis detection: 100%
  - [ ] Average WER: **\_** (target < 25%)

### Stress Conditions:

- [ ] Test with background noise (moderate level)
- [ ] Test with fast speech rate
- [ ] Test with distressed emotional state
- [ ] Test with low-quality audio (simulated phone call)

### Edge Cases:

- [ ] Code-switching (Arabic-English)
- [ ] Regional accent variations within same dialect
- [ ] Very young speakers (18-25)
- [ ] Older speakers (55-65)
- [ ] Non-standard phrasing of crisis statements

---

## Known Dialect Challenges

### Egyptian Arabic

- **Challenge:** Informal vocabulary may not be in ASR training data
- **Mitigation:** Expand ASR lexicon with common Egyptian terms
- **Examples:** ازيك، ماشي، يلا، حلو، زي الفل

### Levantine Arabic

- **Challenge:** Fast speech rate, word merging
- **Mitigation:** Optimize ASR for fast speech processing
- **Examples:** شو بدك → شوبدك, كيف حالك → كيفك

### Gulf Arabic

- **Challenge:** Unique phonology (ك → ch sound)
- **Mitigation:** Acoustic model training for Gulf phonemes
- **Examples:** كيف → chayf, كلام → chalam

### Maghrebi Arabic

- **Challenge:** Significantly different from MSA, French influence
- **Mitigation:** Separate ASR model may be needed
- **Examples:** واش راك (Algerian), كيفاش (Moroccan)

---

## Fallback Strategies

If ASR accuracy insufficient for a dialect:

1. **Offer Text Input:** Always available as alternative
2. **MSA Prompting:** Ask user to use formal Arabic
3. **English Option:** Many Arabic speakers are bilingual
4. **Offline Protocol:** Crisis detection works without ASR

---

## Future Enhancements

- **Dialect Auto-Detection:** Automatically identify user's dialect
- **Acoustic Model Fine-Tuning:** Improve accuracy per dialect
- **Emotion Recognition:** Detect distress from voice characteristics
- **Real-Time Feedback:** Show transcription confidence to user

---

## Sign-Off Criteria

**System is production-ready when:**

- ✅ Crisis detection is 100% accurate across all dialects
- ✅ Average WER meets targets for each dialect
- ✅ Response time < 5 seconds for all scenarios
- ✅ Fallback to text-only mode works reliably
- ✅ No false negatives in crisis scenarios
- ✅ Acceptable false positive rate (< 5%)

**Clinical Supervisor Approval Required:** Yes  
**Minimum Test Coverage:** 300+ audio samples (60+ per dialect)  
**Re-Test Frequency:** Quarterly or after ASR model updates

---

## References

- **WHO mhGAP Intervention Guide** (multilingual adaptation)
- **Columbia Suicide Severity Rating Scale** (Arabic translations)
- **Arabic Dialect Resources:**
  - Georgetown University Arabic Dialect Database
  - Arabic Speech Corpus (ASC)
  - MGB-2 Arabic broadcast dataset

---

**Document Control:**

- Last Updated: 2025-10-31
- Author: Clinical AI Team
- Reviewers: Clinical Supervisor, ASR Engineering
- Next Review: 2025-11-30
