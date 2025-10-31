#!/bin/bash
# Ollama Setup Script for macOS/Linux
# This script installs and configures Ollama with recommended models

set -e

echo "🚀 Setting up Ollama for local-first inference..."

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Darwin*)    MACHINE=Mac;;
    Linux*)     MACHINE=Linux;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "📍 Detected OS: $MACHINE"

# Install Ollama if not present
echo ""
echo "🔍 Checking Ollama installation..."
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found. Installing..."
    
    if [ "$MACHINE" == "Mac" ]; then
        echo "📥 Installing via Homebrew..."
        brew install ollama
    elif [ "$MACHINE" == "Linux" ]; then
        echo "📥 Installing via curl..."
        curl -fsSL https://ollama.ai/install.sh | sh
    else
        echo "❌ Unsupported OS: $MACHINE"
        echo "Please install Ollama manually from: https://ollama.ai/download"
        exit 1
    fi
    
    echo "✅ Ollama installed successfully"
else
    OLLAMA_VERSION=$(ollama --version 2>&1)
    echo "✅ Ollama is already installed: $OLLAMA_VERSION"
fi

# Start Ollama server in background
echo ""
echo "🚀 Starting Ollama server..."
if pgrep -x "ollama" > /dev/null; then
    echo "ℹ️  Ollama is already running"
else
    nohup ollama serve > /tmp/ollama.log 2>&1 &
    sleep 3
    echo "✅ Ollama server started"
fi

# Pull recommended models
echo ""
echo "📥 Downloading recommended models..."
echo "   This will take several minutes depending on your internet speed."

declare -a MODELS=(
    "llama3.2:3b|2GB|General reasoning for clinical responses"
    "qwen2.5:1.5b|1GB|Best Arabic language support"
    "phi3:mini|2.3GB|Safety validation and structured outputs"
    "smollm:1.7b|1GB|Development and tooling tasks"
)

for MODEL_INFO in "${MODELS[@]}"; do
    IFS='|' read -ra PARTS <<< "$MODEL_INFO"
    MODEL_NAME="${PARTS[0]}"
    MODEL_SIZE="${PARTS[1]}"
    MODEL_DESC="${PARTS[2]}"
    
    echo ""
    echo "📦 $MODEL_NAME ($MODEL_SIZE) - $MODEL_DESC"
    
    if ollama pull "$MODEL_NAME"; then
        echo "   ✅ Downloaded successfully"
    else
        echo "   ⚠️  Failed to download - you can try manually later:"
        echo "      ollama pull $MODEL_NAME"
    fi
done

# Verify installation
echo ""
echo "✅ Verifying setup..."
echo ""
echo "📋 Installed models:"
ollama list

# Check storage
echo ""
echo "💾 Model storage location:"
if [ "$MACHINE" == "Mac" ]; then
    MODEL_PATH="$HOME/.ollama/models"
else
    MODEL_PATH="$HOME/.ollama/models"
fi
echo "   $MODEL_PATH"

if [ -d "$MODEL_PATH" ]; then
    STORAGE_SIZE=$(du -sh "$MODEL_PATH" 2>/dev/null | cut -f1)
    echo "   Total size: $STORAGE_SIZE"
fi

# Test Ollama API
echo ""
echo "🧪 Testing Ollama API..."
if curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
    VERSION=$(curl -s http://localhost:11434/api/version | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    echo "   ✅ API is responding (version: $VERSION)"
else
    echo "   ⚠️  API not responding - try restarting:"
    echo "      pkill ollama && ollama serve"
fi

# Final instructions
echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Start dev server: npm run dev"
echo "   2. Test Ollama: npm run check:ollama"
echo "   3. Run tests: http://localhost:3000/test"
echo ""
echo "💡 Useful commands:"
echo "   ollama list           # List installed models"
echo "   ollama pull <model>   # Download a model"
echo "   ollama rm <model>     # Remove a model"
echo "   ollama ps             # Show running models"
