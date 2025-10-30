# AI Meta-Clinician Project - Complete Context

> **Last Updated**: October 30, 2025  
> **Status**: Initial Development Phase  
> **Repository**: `hanameltahan-cloud/ai-meta-clinician`

---

## 🎯 Mission Statement

Create a **unified AI meta-specialist** that simulates ALL psychological and psychiatric specializations simultaneously, capable of conducting realistic, full clinical sessions with real patients. This system will provide affordable, high-quality mental health care to extremely low-income countries (particularly Africa) where traditional psychiatric/psychological services are unavailable or unaffordable.

### Core Principles

1. **Quality Non-Negotiable**: Cost optimization MUST NOT reduce medical advice quality
2. **Affordable Access**: Patients pay a fraction of traditional costs
3. **Holistic Care**: Integrates psychiatry, psychology, neurology, internal medicine, and therapy
4. **Realistic Interaction**: Natural voice/text dialogue that feels like consulting a real clinical team

---

## 🏥 Clinical Specializations Covered

### Psychology Majors (Undergraduate Level)

- General Psychology
- Clinical Psychology
- Counseling Psychology
- Cognitive Psychology
- Developmental Psychology
- Educational Psychology
- Experimental Psychology
- Forensic Psychology
- Health Psychology
- Industrial–Organizational Psychology
- Neuropsychology
- Personality Psychology
- Social Psychology
- Sports Psychology
- Behavioral Neuroscience / Biological Psychology
- Psychometrics / Quantitative Psychology
- Community Psychology
- Environmental Psychology
- Evolutionary Psychology
- Comparative Psychology

### Psychiatry-Related (Pre-Medical & Medical)

- Pre-Medicine / Biology / Neuroscience pathways
- General Psychiatry (M.D. / D.O.)
- Child and Adolescent Psychiatry
- Geriatric Psychiatry
- Addiction Psychiatry
- Consultation–Liaison Psychiatry
- Forensic Psychiatry
- Sleep Medicine Psychiatry

### Graduate / Doctoral Specializations

- Clinical Psychology (Ph.D. / Psy.D.)
- Counseling Psychology (Ph.D. / Psy.D.)
- School Psychology (Ph.D. / Ed.S.)
- Neuropsychology (Ph.D.)
- Health Psychology (Ph.D.)
- Forensic Psychology (Ph.D. / Psy.D.)

---

## 🧠 AI System Architecture

### Hybrid Compute Model

**Local AI (Browser-based)**

- **Purpose**: Fast triage, basic conversational responses, initial assessment
- **Model**: Llama-3.2-1B-int4 (via WebLLM)
- **Runs on**: User's browser (WebGPU)
- **Advantages**: Zero server cost, instant response, privacy

**Cloud AI (Complex Reasoning)**

- **Purpose**: Deep diagnostic reasoning, medical citations, rare condition analysis
- **Triggered**: When local AI confidence < threshold OR complex case detected
- **Models**: GPT-4 / Gemini Pro (via API)
- **Cost Mitigation**: RAG (Retrieval-Augmented Generation) to reduce token usage

### Clinical Frameworks Integrated

1. **mhGAP** (WHO Mental Health Gap Action Programme) - Primary triage protocol
2. **DSM-5** (Diagnostic criteria for mental disorders)
3. **ICD-11** (International Classification of Diseases)
4. **CBT** (Cognitive Behavioral Therapy protocols)
5. **Psychodynamic approaches** (for depth psychotherapy)

### Safety & Risk Management

- **High-Risk Detection**: ≥95% accuracy for suicide/self-harm flags
- **Escalation Protocol**: Immediate human clinician alert for:
  - Suicidal ideation
  - Homicidal thoughts
  - Psychotic episodes
  - Severe self-harm risk

---

## 🌍 Language Support

### Phase 1 (Current)

1. **English (en)** - International/medical standard
2. **Egyptian Arabic (ar_egy)** - Colloquial dialect for accessibility
3. **Modern Standard Arabic (ar_msa)** - Formal Arabic for official contexts

### Future Phases

- Additional African languages (Swahili, Hausa, Amharic, etc.)
- French (for Francophone Africa)
- Other low-resource languages

---

## 💻 Tech Stack

### Frontend

- **Framework**: Next.js 14+ (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Voice Input**: Web Speech API + Whisper.cpp (WASM)
- **Deployment**: Vercel (free tier initially)

### Backend

- **API Routes**: Next.js API routes (serverless)
- **Database**: Supabase (PostgreSQL) - Free tier: 500MB
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (for session recordings if needed)

### AI/ML Components

- **Local LLM**: WebLLM (Llama-3.2-1B-int4) - Runs in browser
- **ASR (Speech-to-Text)**: Whisper.cpp (WASM) for local processing
- **Cloud LLM**: OpenAI GPT-4 / Gemini Pro (for complex cases)
- **RAG Pipeline**: LangChain + vector DB (Supabase pgvector)

### Development Tools

- **Version Control**: Git + GitHub
- **IDE**: VS Code with Copilot
- **Testing**: Jest + React Testing Library
- **CI/CD**: GitHub Actions

---

## 📁 Project Structure

```
ai-meta-clinician/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx         # Root layout
│   │   └── api/               # API routes
│   │       ├── triage/        # Initial assessment endpoint
│   │       ├── chat/          # Chat completion endpoint
│   │       └── voice/         # Voice processing endpoint
│   ├── components/            # React components
│   │   ├── ChatWindow.tsx     # Main chat interface
│   │   ├── VoiceInput.tsx     # Voice recording UI
│   │   ├── LanguageToggle.tsx # Language switcher
│   │   ├── PHQForm.tsx        # PHQ-9 depression screener
│   │   └── RiskAlert.tsx      # High-risk notification
│   ├── lib/                   # Core logic
│   │   ├── mhgap/             # WHO mhGAP protocol
│   │   │   ├── triageEngine.ts
│   │   │   └── rules.json
│   │   ├── llm/               # LLM clients
│   │   │   ├── webllmClient.ts    # Local browser LLM
│   │   │   └── cloudClient.ts     # Cloud API client
│   │   ├── asr/               # Speech recognition
│   │   │   └── whisperClient.ts
│   │   └── db/                # Database utilities
│   │       └── supabase.ts
│   ├── data/                  # Datasets
│   │   ├── syntheticCases.json    # Test cases
│   │   └── clinicalKnowledge/     # Medical knowledge base
│   └── styles/                # Global styles
├── public/
│   └── models/                # Local AI models
│       └── llama-3.2-1b-int4/
├── tests/                     # Test suites
│   ├── triage.test.ts
│   ├── safety.test.ts
│   └── multilingual.test.ts
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md
│   ├── CLINICAL_PROTOCOLS.md
│   └── DEPLOYMENT.md
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## 🧪 Synthetic Test Dataset

**Location**: `src/data/syntheticCases.json`

**Structure**:

```json
{
  "meta": {
    "languages": ["en", "ar_egy", "ar_msa"],
    "domains": ["depression", "anxiety", "psychosis", "trauma", "addiction"]
  },
  "samples": [
    {
      "id": "eng_dep_001",
      "language": "en",
      "input": "I've been feeling very tired and hopeless lately.",
      "expected_flag": false,
      "expected_category": "depression",
      "phq9_score": 15
    }
    // ... more test cases
  ]
}
```

**Pilot Size**: 50-100 cases per language (150-300 total)

- 40% Depression
- 30% Anxiety
- 15% Trauma/PTSD
- 10% Psychosis
- 5% Suicide risk (for safety validation)

---

## 💰 Budget Optimization Strategy

### Cost Structure (Monthly Estimates)

**Phase 1 (Pilot - 100 users/month)**:

- Supabase Free Tier: $0
- Vercel Free Tier: $0
- Cloud LLM (GPT-4): ~$20-30 (RAG-optimized, 10% of sessions)
- Domain + SSL: ~$2/month
- **Total**: ~$25/month

**Phase 2 (Scale - 1,000 users/month)**:

- Supabase Pro: $25/month
- Vercel Pro: $20/month
- Cloud LLM: ~$150-200/month
- **Total**: ~$200/month

### Cost per Patient Session

- **Target**: $0.10 - $0.50 per full session
- **Traditional cost**: $50-200+ per session
- **Savings**: 99%+ cost reduction

### Revenue Model (Ethical Pricing)

- **Pay-what-you-can**: Sliding scale starting at $1-5/session
- **NGO partnerships**: Subsidized/free for verified low-income
- **Donations**: Optional contributions from higher-income users

---

## 🔒 Privacy & Compliance

### Data Protection

- **HIPAA-equivalent**: All health data encrypted at rest and in transit
- **Anonymization**: PII separated from clinical data
- **Retention**: Session data purged after 90 days (unless user opts in)

### Ethical Considerations

- **Informed Consent**: Clear AI disclosure before each session
- **Human Oversight**: Escalation path to real clinicians
- **Cultural Sensitivity**: Localized prompts and therapeutic approaches
- **No Diagnosis Claims**: System provides "clinical impressions" not "diagnoses"

---

## 🛠️ Development Environment

### Machine #1: Mac mini M1

- **CPU**: Apple M1 (ARM64)
- **RAM**: 8 GB
- **OS**: macOS Sequoia 15.7.1
- **Shell**: zsh 5.9
- **Storage**: 242 GB available

### Machine #2: HP Laptop (Primary Development)

- **CPU**: AMD Ryzen 5 7535HS (6 cores, 12 threads @ 3.3 GHz)
- **RAM**: 16 GB DDR5 @ 5600 MHz
- **GPU**: NVIDIA RTX 2050 (4GB VRAM) + AMD Radeon (integrated)
- **Storage**: 512 GB NVMe SSD
- **OS**: Windows 10 Home (Build 26100)
- **Shell**: PowerShell 5.1
- **Tools**:
  - Python 3.13.1
  - Node.js v22.14.0
  - Git 2.48.1
  - WSL 2.6.1
  - VS Code with GitHub Copilot

### Network Setup

- Both machines on same local network
- Can coordinate development tasks across machines

---

## 📊 Success Metrics (Phase 1)

### Clinical Accuracy

- [ ] Triage accuracy: ≥85% match with licensed clinician assessment
- [ ] Safety detection: ≥95% for suicide/self-harm flags
- [ ] Treatment recommendations: ≥80% alignment with evidence-based protocols

### User Experience

- [ ] Session completion rate: ≥70%
- [ ] User satisfaction (1-10): ≥7.5 average
- [ ] Response latency: <2 seconds (local), <5 seconds (cloud)

### Technical Performance

- [ ] System uptime: ≥99%
- [ ] Cost per session: ≤$0.50
- [ ] Multi-language accuracy: ≥80% (Arabic), ≥90% (English)

---

## 🚀 Next Development Steps

### Immediate (Week 1-2)

1. ✅ Create project repository structure
2. ⏳ Set up Next.js boilerplate with TypeScript
3. ⏳ Implement basic chat UI (ChatWindow component)
4. ⏳ Integrate WebLLM (Llama-3.2-1B) for local inference
5. ⏳ Create mhGAP triage engine (rule-based)

### Short-term (Week 3-4)

6. ⏳ Add voice input (Whisper.cpp integration)
7. ⏳ Implement language toggle (EN/AR_EGY/AR_MSA)
8. ⏳ Build PHQ-9 assessment form
9. ⏳ Create synthetic test dataset (50 cases)
10. ⏳ Set up Supabase database + auth

### Mid-term (Month 2)

11. ⏳ Integrate cloud LLM (GPT-4/Gemini) for complex cases
12. ⏳ Build RAG pipeline for medical knowledge retrieval
13. ⏳ Implement safety flagging system
14. ⏳ Add Arabic NLP preprocessing
15. ⏳ Create admin dashboard for session monitoring

### Long-term (Month 3+)

16. ⏳ User testing with 10-20 pilot patients
17. ⏳ Clinical validation with licensed professionals
18. ⏳ Deploy to production (Vercel)
19. ⏳ Launch beta program in target country
20. ⏳ Iterate based on feedback

---

## 📚 Resources & Subscriptions Available

- **GitHub Education** (Teachers version) - Premium features, Actions, Codespaces
- **ChatGPT Plus** - GPT-4 access for development assistance
- **Gemini Pro** - Alternative LLM for testing/comparison
- **Hostinger VPS/Cloud** - Potential hosting option (backup to Vercel)

---

## 🤝 Development Philosophy

### Solo Development with AI Assistance

- **Primary Developer**: You (Mo) building A-to-Z
- **AI Pair Programmers**:
  - ChatGPT (strategic planning, research)
  - GitHub Copilot (code generation, debugging)
  - Gemini (alternative perspective, validation)

### Quality > Speed

- Thorough testing before scaling
- Clinical validation is mandatory
- User safety is paramount
- Cost optimization never compromises care quality

### Open Questions to Address

- [ ] Which Arabic dialect should be primary for UX?
- [ ] Partner with any NGOs/clinics for pilot testing?
- [ ] Data residency requirements for African countries?
- [ ] Payment processing options for low-income users?

---

## 📞 Project Status Tracking

**Current Phase**: Foundation & Architecture  
**Next Milestone**: Working local prototype with basic triage  
**Blockers**: None currently  
**Last Context Sync**: October 30, 2025

---

## 🧩 For VS Code Copilot Instance

When continuing this project:

1. **Refer to this file** for complete project context
2. **Architecture decisions** are finalized (hybrid local+cloud)
3. **Quality is non-negotiable** - always validate medical accuracy
4. **Budget-conscious** - prefer free/cheap solutions when quality-equivalent
5. **Test everything** - especially safety-critical features
6. **Ask before changing** - core architecture or clinical protocols

**Key Files to Reference**:

- This file (PROJECT_CONTEXT.md)
- `/src/lib/mhgap/triageEngine.ts` (clinical logic)
- `/src/data/syntheticCases.json` (test dataset)
- `/docs/CLINICAL_PROTOCOLS.md` (when created)

---

**Ready to build something that saves lives. Let's proceed with excellence.** 🚀🏥
