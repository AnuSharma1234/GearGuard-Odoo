# WSL2 Setup Guide for GearGuard Server

This guide is specifically for team members using Windows with WSL2.

## Prerequisites

1. **Windows 10 version 2004+** or **Windows 11**
2. **WSL2 installed** with a Linux distribution (Ubuntu recommended)
3. **Docker Desktop for Windows** with WSL2 backend enabled

## Initial Setup

### 1. Install WSL2 (if not already installed)

Open PowerShell as Administrator and run:
```powershell
wsl --install
```

Restart your computer when prompted.

### 2. Install Docker Desktop

1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop
2. During installation, ensure "Use WSL 2 based engine" is checked
3. After installation, open Docker Desktop settings
4. Go to **Resources → WSL Integration**
5. Enable integration with your WSL2 distro (e.g., Ubuntu)

### 3. Clone the Repository

**IMPORTANT:** Clone the repository inside WSL2, NOT in Windows filesystem!

```bash
# Open your WSL2 terminal (Ubuntu, Debian, etc.)
cd ~
mkdir -p Projects
cd Projects

# Clone the repository
git clone <your-repo-url>
cd TheCodebreakers-GearGuard-Odoo/server
```

⚠️ **DO NOT** clone in `/mnt/c/` or any Windows path! This causes:
- Slow file I/O (2-5x slower)
- Permission issues
- Docker volume mounting problems

### 4. Run Setup

```bash
./setup.sh
```

That's it! The setup script will handle everything else.

## Verifying Your Setup

1. **Check you're in WSL2 filesystem:**
   ```bash
   pwd
   # Should show something like: /home/username/Projects/...
   # NOT: /mnt/c/Users/...
   ```

2. **Check Docker is accessible:**
   ```bash
   docker --version
   docker-compose --version
   ```

3. **Check containers are running:**
   ```bash
   docker-compose ps
   ```

## Common Issues

### Issue: "Cannot connect to Docker daemon"

**Solution:** Make sure Docker Desktop is running on Windows and WSL2 integration is enabled.

1. Start Docker Desktop on Windows
2. Open Docker Desktop Settings → Resources → WSL Integration
3. Enable integration for your distro
4. Restart WSL: `wsl --shutdown` in PowerShell, then reopen terminal

### Issue: Permission denied errors

**Solution:** Make sure you're working in WSL2 filesystem, not Windows filesystem.

```bash
# Bad (Windows filesystem)
cd /mnt/c/Users/YourName/Projects/...

# Good (WSL2 filesystem)
cd ~/Projects/...
```

### Issue: Slow performance

**Solution:** This usually means you're working in Windows filesystem (`/mnt/c/`).

Move your project to WSL2 filesystem:
```bash
cp -r /mnt/c/Users/YourName/Projects/project-name ~/Projects/
cd ~/Projects/project-name
```

## Tips for WSL2 Development

1. **Access WSL files from Windows:**
   - Open File Explorer
   - Type in address bar: `\\wsl$\Ubuntu\home\username`
   - Or just use VS Code with WSL extension

2. **Install VS Code WSL extension:**
   ```bash
   code .
   ```
   This will prompt you to install the WSL extension if not already installed.

3. **Use Windows Terminal:**
   - Better than default Command Prompt or PowerShell
   - Download from Microsoft Store
   - Supports multiple tabs, themes, and WSL integration

4. **Git configuration:**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

## File System Locations

- **WSL2 Home:** `/home/username/` (fast, use this!)
- **Windows C:** `/mnt/c/` (slow, avoid for development)
- **Docker volumes:** Managed by Docker, don't access directly

## Getting Help

If you encounter issues:

1. Check Docker Desktop is running
2. Verify WSL2 integration is enabled
3. Ensure you're in WSL2 filesystem (not `/mnt/c/`)
4. Check logs: `docker-compose logs`
5. Try clean restart: `docker-compose down -v && ./setup.sh`

For more help, refer to the main [README.md](README.md) or contact the team.
