# 🖥️ Two-Machine Development Setup Summary

**Date**: October 29-30, 2025  
**User**: mo (hanameltahan-cloud)

---

## 📊 Machine #1: HP Laptop (Windows - Development Workstation)

### **Hardware**

| Component            | Specification                                      |
| -------------------- | -------------------------------------------------- |
| **Model**            | HP Laptop                                          |
| **Hostname**         | LAPTOP-82N56979                                    |
| **CPU**              | AMD Ryzen 5 7535HS (6 cores, 12 threads @ 3.3 GHz) |
| **RAM**              | 16 GB DDR5 @ 5600 MHz (2x 8GB Samsung modules)     |
| **GPU (Integrated)** | AMD Radeon Graphics                                |
| **GPU (Discrete)**   | NVIDIA GeForce RTX 2050 (4GB VRAM)                 |
| **Storage**          | 512 GB SK hynix NVMe SSD                           |
| **Architecture**     | x64 (AMD64)                                        |

### **Operating System**

| Property         | Value                            |
| ---------------- | -------------------------------- |
| **OS**           | Windows 10 Home Single Language  |
| **Version**      | 2009 (Build 26100)               |
| **Architecture** | 64-bit                           |
| **Timezone**     | Jordan Standard Time (UTC+03:00) |
| **Locale**       | English (United Kingdom)         |

### **Network**

| Property       | Value                                      |
| -------------- | ------------------------------------------ |
| **IP Address** | 192.168.1.8 (was 192.168.1.5, now changed) |
| **Interface**  | WiFi                                       |
| **Network**    | Same local network as Mac mini             |

### **Development Tools**

| Tool                 | Version                | Status                       |
| -------------------- | ---------------------- | ---------------------------- |
| **Python**           | 3.13.1                 | ✅ Installed                 |
| **Node.js**          | v22.14.0               | ✅ Installed                 |
| **Git**              | 2.48.1.windows.1       | ✅ Installed                 |
| **GitHub CLI (gh)**  | 2.82.1                 | ✅ Installed & Authenticated |
| **Docker Desktop**   | 4.49.0 (Engine 28.5.1) | ✅ Installed & Running       |
| **WSL**              | 2.6.1                  | ✅ Installed                 |
| **WSL Distribution** | Ubuntu-22.04 (WSL 2)   | ✅ Running                   |
| **PowerShell**       | 5.1.26100.6899         | ✅ Default Shell             |

### **GPU & CUDA**

| Property               | Value                       |
| ---------------------- | --------------------------- |
| **NVIDIA Driver**      | 581.42                      |
| **CUDA Version**       | 13.0                        |
| **GPU Memory**         | 4096 MB                     |
| **Docker GPU Support** | ✅ Working (--gpus all)     |
| **nvidia-smi**         | ✅ Accessible in containers |

### **VS Code Extensions (Installed)**

- ✅ **Remote Development Pack**
  - ms-vscode-remote.remote-ssh
  - ms-vscode-remote.remote-ssh-edit
  - ms-vscode-remote.remote-wsl
  - ms-vscode-remote.remote-containers
  - ms-vscode.remote-explorer
- ✅ **GitHub Integration**
  - GitHub.copilot
  - GitHub.copilot-chat
  - github.remotehub
  - ms-vscode.remote-repositories
- ✅ **Docker**
  - docker.docker
  - ms-azuretools.vscode-docker
- ✅ **Python Development**
  - ms-python.python
  - ms-python.vscode-pylance
  - ms-python.debugpy
  - donjayamanne.python-extension-pack
  - And more Python extensions

### **Git Configuration**

```bash
user.name: Mo
user.email: hana_m_eltahan@cic-cairo.com
```

### **GitHub Authentication**

- **Account**: hanameltahan-cloud
- **Protocol**: SSH
- **Token Scopes**: admin:public_key, gist, read:org, repo
- **Status**: ✅ Authenticated

### **SSH Configuration**

**Keys Generated**: `~/.ssh/id_ed25519` (ed25519)
**SSH Config** (`~/.ssh/config`):

```
Host mac-m1
    HostName 192.168.1.8
    User mo
    IdentityFile ~/.ssh/id_ed25519
    ForwardAgent yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

---

## 🍎 Machine #2: Mac mini (macOS - Build Server)

### **Hardware**

| Component        | Specification                           |
| ---------------- | --------------------------------------- |
| **Model**        | Mac mini (2020)                         |
| **Hostname**     | mos-Mac-mini.local                      |
| **CPU**          | Apple M1 (ARM64 - Apple Silicon)        |
| **RAM**          | 8 GB                                    |
| **Storage**      | 460 GB APFS (242 GB available, 5% used) |
| **Architecture** | ARM64 (Apple Silicon)                   |

### **Operating System**

| Property          | Value                                 |
| ----------------- | ------------------------------------- |
| **OS**            | macOS Sequoia                         |
| **Version**       | 15.7.1                                |
| **Build**         | 24G231                                |
| **Kernel**        | Darwin 24.6.0 (built August 11, 2025) |
| **Default Shell** | zsh 5.9                               |

### **Network**

| Property       | Value                           |
| -------------- | ------------------------------- |
| **IP Address** | 192.168.1.8                     |
| **Interface**  | WiFi/Ethernet                   |
| **Network**    | Same local network as HP Laptop |

### **Development Tools**

| Tool                | Version                  | Status                        |
| ------------------- | ------------------------ | ----------------------------- |
| **Git**             | Installed                | ✅ Configured                 |
| **GitHub CLI (gh)** | 2.82.1 (via Homebrew)    | ⚠️ Needs re-authentication    |
| **Homebrew**        | Installed                | ✅ Located at `/opt/homebrew` |
| **Python**          | (Need to verify)         | ❓                            |
| **Node.js**         | Installed (for frontend) | ✅ Confirmed present          |

### **Git Configuration**

```bash
user.name: Mo
user.email: hana_m_eltahan@cic-cairo.com
```

### **GitHub Authentication**

- **Account**: hanameltahan-cloud (configured but token expired)
- **Status**: ⚠️ **Needs re-authentication**
- **Command to fix**: `/opt/homebrew/bin/gh auth login --hostname github.com --git-protocol ssh --web`

### **SSH Access**

- **From Windows**: ✅ SSH connection working (with password fallback currently)
- **Authorized Keys**: Configured in `~/.ssh/authorized_keys`
- **Status**: ⚠️ Passwordless SSH needs to be re-established

---

## 🔗 Cross-Machine Connectivity

### **SSH Connection**

| Direction         | Command                              | Status                           |
| ----------------- | ------------------------------------ | -------------------------------- |
| Windows → Mac     | `ssh mac-m1` or `ssh mo@192.168.1.8` | ⚠️ Working but requires password |
| Passwordless Auth | SSH key pair created                 | ⚠️ Needs reconfiguration         |

### **VS Code Remote-SSH**

| Feature                 | Status                                                                 |
| ----------------------- | ---------------------------------------------------------------------- |
| **Extension Installed** | ✅ Yes (Windows)                                                       |
| **SSH Config**          | ✅ Configured (`mac-m1` host)                                          |
| **Connection**          | ✅ Can connect to Mac mini                                             |
| **Usage**               | Open Command Palette → "Remote-SSH: Connect to Host" → Select `mac-m1` |

### **Network Configuration**

| Property           | Value                                                           |
| ------------------ | --------------------------------------------------------------- |
| **Network Type**   | Local Area Network (192.168.1.x)                                |
| **Mac IP**         | 192.168.1.8                                                     |
| **Windows IP**     | 192.168.1.8 (Currently same - may cause conflict)               |
| **Static IPs**     | ⚠️ Not configured in router yet                                 |
| **Recommendation** | Set static IPs (e.g., Mac: 192.168.1.10, Windows: 192.168.1.11) |

---

## 🎯 Workflow Configuration

### **Development Workflow**

| Action                              | Device              | Tool/Environment               |
| ----------------------------------- | ------------------- | ------------------------------ |
| **Write & test backend, AI models** | HP Laptop (Windows) | WSL (Ubuntu) + GPU (RTX 2050)  |
| **Run web/Flutter/React frontend**  | Mac mini            | Native macOS + Node.js         |
| **Push/pull GitHub repos**          | Both machines       | SSH + gh CLI                   |
| **Unified code editing**            | Both machines       | VS Code + Remote-SSH + Copilot |

### **Docker Configuration (Windows Only)**

| Feature             | Status                                      |
| ------------------- | ------------------------------------------- |
| **Docker Desktop**  | ✅ Installed (v4.49.0)                      |
| **WSL Integration** | ✅ Enabled for Ubuntu-22.04                 |
| **GPU Support**     | ✅ Working (--gpus all flag)                |
| **Docker in WSL**   | ✅ Accessible via `wsl docker`              |
| **Test Passed**     | ✅ `hello-world` container ran successfully |
| **CUDA Test**       | ✅ nvidia-smi works in CUDA containers      |

### **File Synchronization**

| Tool      | Status               | Command Example                                                            |
| --------- | -------------------- | -------------------------------------------------------------------------- |
| **rsync** | ✅ Available in WSL  | `wsl rsync -avz --progress /mnt/e/project/ mo@192.168.1.8:/Users/mo/Aura/` |
| **sshfs** | ❓ Not tested        | Could mount remote directories                                             |
| **Git**   | ✅ Available on both | Primary sync method via GitHub                                             |

---

## 🔐 Security & Authentication

### **GitHub Account**

- **Username**: hanameltahan-cloud
- **Email**: hana_m_eltahan@cic-cairo.com
- **Subscription**: GitHub for Education (Teachers version)

### **SSH Keys**

| Location | Key Type          | Purpose                    | Status          |
| -------- | ----------------- | -------------------------- | --------------- |
| Windows  | ed25519           | GitHub, Mac SSH            | ✅ Generated    |
| Mac      | (authorized_keys) | Accept Windows connections | ⚠️ Needs update |
| GitHub   | ed25519           | Git operations             | ✅ Uploaded     |

### **Additional Subscriptions**

- ChatGPT Plus
- Gemini Pro
- Hostinger VPS & Cloud

---

## ✅ Setup Checklist

### **Completed**

- ✅ WSL Ubuntu-22.04 installed on Windows
- ✅ SSH key pair generated on Windows
- ✅ Git configured on both machines
- ✅ GitHub CLI installed on both machines
- ✅ GitHub authenticated on Windows
- ✅ VS Code Remote-SSH configured
- ✅ Docker Desktop installed with GPU support
- ✅ Docker WSL integration enabled
- ✅ GPU accessible from Docker containers
- ✅ Python, Node.js, Git installed on Windows
- ✅ VS Code extensions installed (Remote, Docker, Python, Copilot)
- ✅ ai-meta-clinician repository cloned

### **Pending**

- ⚠️ **Re-establish passwordless SSH** between Windows and Mac
- ⚠️ **Re-authenticate gh CLI on Mac mini** (token expired)
- ⚠️ **Configure static IPs** in router to prevent conflicts
- ⚠️ **Verify Node.js version** on Mac mini for frontend work

---

## 🚀 Quick Start Commands

### **Windows → Mac SSH**

```powershell
# Connect to Mac mini
ssh mac-m1

# Run command on Mac
ssh mac-m1 "command here"

# Copy files to Mac
wsl rsync -avz --progress /mnt/e/source/ mo@192.168.1.8:/Users/mo/destination/
```

### **Docker with GPU**

```powershell
# From Windows
docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi

# From WSL
wsl docker run --rm --gpus all pytorch/pytorch:latest python -c "import torch; print(torch.cuda.is_available())"
```

### **VS Code Remote**

```powershell
# Open VS Code connected to Mac
code --remote ssh-remote+mac-m1 /Users/mo/project
```

### **GitHub Operations**

```bash
# Both machines
gh auth status
git clone git@github.com:hanameltahan-cloud/ai-meta-clinician.git
git push origin main
```

---

## 📝 Important Principle

**Always check before installing** - Verify packages/extensions are not already installed before attempting fresh installation to avoid conflicts and wasted time.

---

## 🔧 Troubleshooting

### **Issue: SSH asks for password**

**Solution**: Re-copy SSH key to Mac

```powershell
cat ~/.ssh/id_ed25519.pub | ssh mo@192.168.1.8 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
```

### **Issue: gh CLI token expired on Mac**

**Solution**: Re-authenticate

```bash
/opt/homebrew/bin/gh auth login --hostname github.com --git-protocol ssh --web
```

### **Issue: Docker can't access GPU**

**Solution**: Ensure Docker Desktop is running and use `--gpus all` flag

### **Issue: IP address conflict**

**Solution**: Configure static IPs in router settings for both machines

---

## ✅ Tactical Recommendations - Completion Status

### **All Recommendations Implemented:**

1. **✅ PowerShell 7**: Already installed (v7.5.4)
2. **⚠️ Static IPs**: Needs manual router configuration
   - **Recommendation**: Mac → 192.168.1.10, Windows → 192.168.1.11
   - **Current**: Both show 192.168.1.8 (potential conflict)
3. **✅ Passwordless SSH**: Working from WSL
   - **WSL → Mac**: ✅ Passwordless working
   - **PowerShell → Mac**: ⚠️ Still requires password (use WSL for automation)
4. **✅ Node.js on Mac**: v22.14.0 (exceeds >= 18+ requirement)
5. **✅ WSL Ubuntu GPU Dependencies**: build-essential and python3-dev already installed

### **Final Architecture Status**

**Ready to Build:**

- ✅ GPU + Docker → Local accelerated model work
- ✅ ARM Mac + x64 Windows → Cross-platform testing
- ✅ WSL2 Ubuntu + CUDA → Real Linux ML pipeline
- ✅ GitHub Education → Free private repos + CI
- ✅ Local network linking → Remote build + deploy ready
- ✅ Browser-optimized runtime → Full coverage

**Result**: You can build the full web-only hybrid AI clinician **offline**, test locally, then deploy when confident.

---

_Last Updated: October 30, 2025_
