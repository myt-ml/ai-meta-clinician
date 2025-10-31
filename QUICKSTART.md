# 🚀 Quick Start: Local-First Setup

**30-second guide to get Ollama running with your clinical app**

---

## ⚡ Windows (E: Drive)

```powershell
# 1. Install Ollama
# Download and install from: https://ollama.ai/download

# 2. Run automated setup (in PowerShell)
npm run setup:ollama:windows

# 3. Restart your terminal

# 4. Start dev server
npm run dev

# 5. Test everything
# Open: http://localhost:3000/test
# Click "Run All Tests"
# Look for: ✅ Ollama (Optional) - 8/8 tests passed
```

**That's it!** The app will now use local Ollama models for faster, private inference.

---

## 🍎 macOS / Linux

```bash
# 1. Run automated setup
npm run setup:ollama:unix

# 2. Start dev server
npm run dev

# 3. Test everything
# Open: http://localhost:3000/test
# Click "Run All Tests"
# Look for: ✅ Ollama (Optional) - 8/8 tests passed
```

---

## ✅ Verify Setup

```bash
# Check Ollama is running
npm run check:ollama

# Should output:
# {"version":"0.x.x"}

# List installed models
ollama list

# Should show:
# llama3.2:3b   (2GB)
# qwen2.5:1.5b  (1GB)
# phi3:mini     (2.3GB)
# smollm:1.7b   (1GB)
```

---

## 🎯 What You Get

- **Faster responses** - Native inference vs browser-based
- **Complete privacy** - Nothing leaves your machine
- **Works offline** - No internet required after setup
- **No API costs** - Everything runs locally
- **Automatic fallback** - Uses WebLLM if Ollama unavailable

---

## 📊 Storage Used

**Total**: ~6.3GB on E: drive (Windows) or ~/.ollama (Mac/Linux)

- llama3.2:3b - 2GB (general clinical reasoning)
- qwen2.5:1.5b - 1GB (Arabic support)
- phi3:mini - 2.3GB (safety validation)
- smollm:1.7b - 1GB (dev tools)

---

## 🔧 Troubleshooting

### Ollama not starting?

```powershell
# Windows
ollama serve

# New terminal:
ollama list
```

### Models not downloaded?

```bash
ollama pull llama3.2:3b
ollama pull qwen2.5:1.5b
ollama pull phi3:mini
ollama pull smollm:1.7b
```

### Need more help?

Read the complete guide: `LOCAL_SETUP.md`

---

## 🎉 You're Ready!

Your app now has **3 layers of inference**:

1. **Ollama (local)** - Fast, private, preferred ⚡
2. **WebLLM (browser)** - Fallback when Ollama unavailable 🌐
3. **Offline mhGAP** - Always works, crisis-safe 🏥

**Crisis situations always use offline protocols** for deterministic, immediate response.

Start coding:

```bash
npm run dev
```

Open http://localhost:3000 and enjoy local-first AI! 🚀
