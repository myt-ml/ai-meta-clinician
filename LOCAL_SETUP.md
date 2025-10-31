# 🚀 Local-First Setup Guide

**Complete guide for setting up AI Meta Clinician with Ollama local inference**

---

## 📋 Overview

This app now supports **dual-mode inference**:

1. **Ollama (Local)** - Fast, private inference on your machine (preferred)
2. **WebLLM (Browser)** - Fallback when Ollama unavailable

**Benefits of local inference**:

- ⚡ Faster responses (native CPU/GPU vs browser)
- 🔒 Complete privacy (nothing leaves your machine)
- 💾 Lower memory usage (optimized models)
- 🌍 Works offline
- 🆓 No API costs

---

## 🪟 Windows Setup (E: Drive)

### Step 1: Install Ollama

1. Download Ollama from: https://ollama.ai/download
2. Run the installer
3. Restart your terminal

### Step 2: Configure E: Drive Storage

Run the automated setup script:

```powershell
npm run setup:ollama:windows
```

This script will:

- Create `E:\ai\` directory structure
- Set `OLLAMA_HOME=E:\ai\ollama` environment variable
- Download 4 recommended models (~6GB total):
  - `llama3.2:3b` - General clinical reasoning (2GB)
  - `qwen2.5:1.5b` - Arabic language support (1GB)
  - `phi3:mini` - Safety validation (2.3GB)
  - `smollm:1.7b` - Development tools (1GB)

**Important**: Restart your terminal after setup to apply environment variables!

### Step 3: Verify Setup

```powershell
# Check Ollama is running
npm run check:ollama

# List installed models
ollama list

# Check environment variable
echo $env:OLLAMA_HOME
```

### Manual Setup (if script fails)

```powershell
# Create directories
mkdir E:\ai\models
mkdir E:\ai\ollama
mkdir E:\ai\venv
mkdir E:\ai\logs

# Set environment variable
setx OLLAMA_HOME "E:\ai\ollama"

# Restart terminal, then start Ollama
ollama serve

# Pull models (in new terminal)
ollama pull llama3.2:3b
ollama pull qwen2.5:1.5b
ollama pull phi3:mini
ollama pull smollm:1.7b
```

---

## 🍎 macOS / Linux Setup

### Step 1: Run Automated Setup

```bash
npm run setup:ollama:unix
```

This will:

- Install Ollama (via Homebrew on Mac, curl on Linux)
- Start Ollama server
- Download 4 recommended models

### Step 2: Verify Setup

```bash
# Check Ollama status
npm run check:ollama

# List models
ollama list

# Check server logs
tail -f /tmp/ollama.log
```

### Manual Setup

```bash
# Install Ollama
# Mac:
brew install ollama

# Linux:
curl -fsSL https://ollama.ai/install.sh | sh

# Start server
ollama serve &

# Pull models
ollama pull llama3.2:3b
ollama pull qwen2.5:1.5b
ollama pull phi3:mini
ollama pull smollm:1.7b
```

---

## 🧪 Testing Local Inference

### 1. Start the App

```bash
npm run dev
```

### 2. Open Test Page

Navigate to: `http://localhost:3000/test`

Click **"Run All Tests"** and check:

- ✅ **Ollama (Optional)** - Should show 8/8 tests passed if Ollama is running
- ⚠️ If Ollama unavailable, tests will pass with warnings (graceful degradation)

### 3. Check Console

Look for these messages:

```
✅ Ollama available with models: [...list of models...]
🚀 Using Ollama model: Llama 3.2 3B
```

If you see:

```
⚠️ Ollama not available, will use WebLLM fallback
```

Then Ollama isn't running - start it with `ollama serve`

---

## 📊 Model Selection Strategy

The app intelligently routes requests based on:

| Task Type         | Preferred Model                | Fallback        |
| ----------------- | ------------------------------ | --------------- |
| General clinical  | `llama3.2:3b`                  | WebLLM          |
| Arabic language   | `qwen2.5:1.5b`                 | Llama 3.2       |
| Safety checks     | `phi3:mini`                    | Skip (optional) |
| Crisis situations | **Offline protocols** (no LLM) | N/A             |

**Crisis handling is always offline** for deterministic, immediate response.

---

## 🔧 Useful Commands

### Check Ollama Status

```bash
# Windows
npm run check:ollama

# Unix
curl http://localhost:11434/api/version
```

### Manage Models

```bash
# List installed models
ollama list

# Download a model
ollama pull <model-name>

# Remove a model
ollama rm <model-name>

# Show running models
ollama ps

# Get model info
ollama show llama3.2:3b
```

### Troubleshooting

```bash
# Stop Ollama
# Windows:
Stop-Process -Name ollama

# Unix:
pkill ollama

# Restart Ollama
ollama serve

# Check logs (Unix)
tail -f /tmp/ollama.log

# Test API directly
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Say hello"
}'
```

---

## 💾 Storage Requirements

### Recommended Models (Total: ~6.3GB)

- `llama3.2:3b` - 2GB
- `qwen2.5:1.5b` - 1GB
- `phi3:mini` - 2.3GB
- `smollm:1.7b` - 1GB

### Optional Models

- `llama3.2:1b` - 0.9GB (even faster, less accurate)
- `mistral:7b` - 4.1GB (better quality, slower)
- `codellama:7b` - 3.8GB (code generation)

### Storage Locations

- **Windows**: `E:\ai\ollama\models` (configurable)
- **macOS**: `~/.ollama/models`
- **Linux**: `~/.ollama/models`

---

## 🔒 Privacy & Security

### Local Inference Benefits

- ✅ All inference happens on your machine
- ✅ No data sent to external servers
- ✅ HIPAA-compliant (when used with encryption layer)
- ✅ Works in air-gapped environments
- ✅ Complete audit trail in IndexedDB

### Data Flow

```
User Message
    ↓
Safety Check (offline - always)
    ↓
Ollama Local Inference (if available)
    ↓
Validation Layer
    ↓
Encrypted Storage (IndexedDB)
```

**Nothing leaves your machine** unless you explicitly configure cloud LLM providers.

---

## 🚨 Troubleshooting

### Ollama Not Starting

```bash
# Check if port 11434 is in use
# Windows:
netstat -ano | findstr 11434

# Unix:
lsof -i :11434

# Kill conflicting process
# Windows:
taskkill /PID <pid> /F

# Unix:
kill -9 <pid>

# Restart Ollama
ollama serve
```

### Models Not Downloading

```bash
# Check disk space
# Windows:
Get-Volume

# Unix:
df -h

# Check network
ping ollama.ai

# Retry with verbose logging
OLLAMA_DEBUG=1 ollama pull llama3.2:3b
```

### Slow Inference

```bash
# Check running models
ollama ps

# Unload models to free memory
ollama stop llama3.2:3b

# Use smaller model
ollama pull llama3.2:1b
```

### Permission Errors (Windows)

```powershell
# Run PowerShell as Administrator
# Then:
npm run setup:ollama:windows
```

---

## 🎯 Performance Optimization

### Hardware Recommendations

- **Minimum**: 8GB RAM, 10GB free disk
- **Recommended**: 16GB RAM, 50GB free disk, GPU (optional)
- **Optimal**: 32GB RAM, NVMe SSD, NVIDIA GPU

### GPU Acceleration (Optional)

```bash
# NVIDIA GPU (CUDA)
# Models automatically use GPU if available

# Check GPU usage
# Windows:
nvidia-smi

# Unix:
watch -n 1 nvidia-smi
```

### Memory Management

```bash
# Show Ollama memory usage
ollama ps

# Free memory by unloading models
ollama stop <model-name>

# Or restart Ollama
pkill ollama && ollama serve
```

---

## 🔄 Switching Between Local and Cloud

The app automatically handles fallback:

1. **Ollama available** → Uses local models (fast, private)
2. **Ollama unavailable** → Falls back to WebLLM (slower, browser-based)
3. **All LLM fails** → Uses offline mhGAP protocols (always works)

**You don't need to configure anything** - the router handles it automatically!

---

## 📚 Additional Resources

- [Ollama Documentation](https://github.com/ollama/ollama)
- [Model Library](https://ollama.ai/library)
- [Llama 3.2 Guide](https://ai.meta.com/blog/llama-3-2/)
- [Qwen Models](https://github.com/QwenLM/Qwen2.5)
- [Phi-3 Documentation](https://azure.microsoft.com/en-us/products/phi-3)

---

## ✅ Checklist

Before starting development:

- [ ] Ollama installed and running (`ollama serve`)
- [ ] 4 recommended models downloaded (`ollama list`)
- [ ] Environment variable set (Windows: `OLLAMA_HOME`)
- [ ] Test page passes (`http://localhost:3000/test`)
- [ ] Models stored on E: drive (Windows only)
- [ ] Sufficient disk space (10GB+ free)

---

## 🎉 You're Ready!

Your app is now configured for **fast, private, local-first inference**.

Start the dev server and enjoy:

```bash
npm run dev
```

All clinical responses will use local Ollama models when available, with automatic fallback to browser-based inference if needed.

**Crisis situations are always handled offline** with WHO mhGAP protocols for safety.
