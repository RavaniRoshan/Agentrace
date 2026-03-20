---
title: Installation
description: Full install guide for pip and npm.
---

# Installation

## Python library (required)
```bash
pip install agentclaw
```

Alternative Python installation with built-in server:
```bash
pip install "agentclaw[server]"
```

## npm CLI (recommended)
```bash
# Always get the latest version without installation
npx agentclaw

# Or install globally for frequent use
npm install -g agentclaw
```

## Verify both installations
Check Python package version:
```bash
python -c "import agentclaw; print(agentclaw.__version__)"
```

Check npm CLI version:
```bash
npx agentclaw --version
```

## Troubleshooting table
| Problem | Fix |
|---------|-----|
| Port 7823 in use → already running, open browser directly | The UI server is already running. Simply open http://localhost:7823 in your browser |
| No traces found → check ~/.agentclaw/traces/ exists | Ensure your agent code ran successfully and generated traces. Check the directory exists and contains .json files |
| ModuleNotFoundError → pip install in the right venv | Make sure you're using the same Python environment where you installed agentclaw |
| Python too old → pyenv install 3.11 | AgentTrace requires Python 3.10+. Use pyenv or similar to install a supported version |

## Directory Structure
After running your first traced agent, you'll see:
```
~/.agentclaw/
└── traces/
    ├── a3f9c1b2.json
    ├── b4d0e2c3.json
    └── ...
```

Each JSON file contains a complete trace of one agent run.