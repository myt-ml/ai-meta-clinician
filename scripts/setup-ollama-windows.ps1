# Ollama Setup Script for Windows (E: Drive)
# This script configures Ollama to use E: drive for models and data

Write-Host "🚀 Setting up Ollama on E: drive..." -ForegroundColor Cyan

# Create directory structure on E:
$directories = @(
    "E:\ai\models",
    "E:\ai\ollama",
    "E:\ai\venv",
    "E:\ai\logs"
)

Write-Host "`n📁 Creating directory structure..." -ForegroundColor Yellow
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   ✓ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "   ✓ Exists: $dir" -ForegroundColor Gray
    }
}

# Set OLLAMA_HOME environment variable (USER level)
Write-Host "`n🔧 Configuring environment variables..." -ForegroundColor Yellow
$ollamaHome = "E:\ai\ollama"
[System.Environment]::SetEnvironmentVariable("OLLAMA_HOME", $ollamaHome, "User")
Write-Host "   ✓ Set OLLAMA_HOME=$ollamaHome" -ForegroundColor Green

# Also set for current session
$env:OLLAMA_HOME = $ollamaHome
Write-Host "   ✓ Applied to current session" -ForegroundColor Green

# Check if Ollama is installed
Write-Host "`n🔍 Checking Ollama installation..." -ForegroundColor Yellow
$ollamaInstalled = $false
try {
    $ollamaVersion = ollama --version 2>&1
    $ollamaInstalled = $true
    Write-Host "   ✓ Ollama is installed: $ollamaVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Ollama not found" -ForegroundColor Red
    Write-Host "`n❌ Please install Ollama first:" -ForegroundColor Red
    Write-Host "   1. Download from: https://ollama.ai/download" -ForegroundColor White
    Write-Host "   2. Run installer" -ForegroundColor White
    Write-Host "   3. Restart PowerShell" -ForegroundColor White
    Write-Host "   4. Run this script again" -ForegroundColor White
    exit 1
}

# Stop Ollama if running (so it picks up new OLLAMA_HOME)
Write-Host "`n🛑 Stopping Ollama service..." -ForegroundColor Yellow
try {
    Stop-Process -Name "ollama" -Force -ErrorAction SilentlyContinue
    Write-Host "   ✓ Ollama stopped" -ForegroundColor Green
} catch {
    Write-Host "   ℹ Ollama was not running" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# Start Ollama server in background
Write-Host "`n🚀 Starting Ollama server..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "   ✓ Ollama server started" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed to start Ollama server" -ForegroundColor Red
    Write-Host "   Try running manually: ollama serve" -ForegroundColor Yellow
}

# Pull recommended models
Write-Host "`n📥 Downloading recommended models..." -ForegroundColor Yellow
Write-Host "   This will take several minutes depending on your internet speed." -ForegroundColor Gray

$models = @(
    @{Name="llama3.2:3b"; Size="2GB"; Description="General reasoning"},
    @{Name="qwen2.5:1.5b"; Size="1GB"; Description="Arabic support"},
    @{Name="phi3:mini"; Size="2.3GB"; Description="Safety validation"},
    @{Name="smollm:1.7b"; Size="1GB"; Description="Development tools"}
)

foreach ($model in $models) {
    Write-Host "`n   📦 $($model.Name) ($($model.Size)) - $($model.Description)" -ForegroundColor Cyan
    try {
        ollama pull $model.Name
        Write-Host "      ✓ Downloaded successfully" -ForegroundColor Green
    } catch {
        Write-Host "      ✗ Failed to download" -ForegroundColor Red
        Write-Host "      You can download manually later: ollama pull $($model.Name)" -ForegroundColor Yellow
    }
}

# Verify installation
Write-Host "`n✅ Verifying setup..." -ForegroundColor Yellow
$localModels = ollama list 2>&1
Write-Host "`n📋 Installed models:" -ForegroundColor Cyan
Write-Host $localModels

# Check disk usage
Write-Host "`n💾 Disk usage on E: drive:" -ForegroundColor Yellow
$drive = Get-PSDrive -Name E
$usedGB = [math]::Round(($drive.Used / 1GB), 2)
$freeGB = [math]::Round(($drive.Free / 1GB), 2)
$totalGB = [math]::Round(($usedGB + $freeGB), 2)
Write-Host "   Total: $totalGB GB" -ForegroundColor White
Write-Host "   Used: $usedGB GB" -ForegroundColor White
Write-Host "   Free: $freeGB GB" -ForegroundColor Green

# Display model storage location
Write-Host "`n📍 Model storage location:" -ForegroundColor Yellow
Write-Host "   $ollamaHome\models" -ForegroundColor White

# Final instructions
Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Restart your terminal (to apply environment variables)" -ForegroundColor White
Write-Host "   2. Start dev server: npm run dev" -ForegroundColor White
Write-Host "   3. Test Ollama: npm run check:ollama" -ForegroundColor White
Write-Host "   4. Run tests: http://localhost:3000/test" -ForegroundColor White

Write-Host "`n⚠️  IMPORTANT: Restart your terminal now for changes to take effect!" -ForegroundColor Yellow
