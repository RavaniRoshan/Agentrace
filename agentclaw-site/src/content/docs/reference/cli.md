---
title: CLI Commands
description: All AgentTrace CLI commands.
---

# CLI Commands

## Full Command Table

| Command | Description | Example |
|---------|-------------|---------|
| `ui` | Start the web UI at localhost:7823 | `npx agentclaw ui` |
| `traces` | List all trace runs in terminal | `npx agentclaw traces` |
| `clear` | Delete all traces from ~/.agentclaw/traces/ | `npx agentclaw clear` |
| `--version` | Print the AgentTrace version | `npx agentclaw --version` |
| `--help` | Show help message with all commands | `npx agentclaw --help` |

## Environment Variables
- `TRACES_DIR`: Directory where trace JSON files are stored (defaults to `~/.agentclaw/traces/`)

## Port
The web UI runs on port **7823** by default. If this port is in use, the CLI will attempt to find the next available port.

## npx vs Global Install Tradeoffs

### npx `agentclaw` (Recommended)
- ✅ Always runs the latest version
- ✅ No installation required
- ✅ No version conflicts
- ❌ Slightly slower startup (downloads on first use)

### Global Install (`npm install -g agentclaw`)
- ✅ Faster startup after initial install
- ✅ Works offline after installation
- ❌ Requires manual updates (`npm update -g agentclaw`)
- ❌ Potential version conflicts in shared environments

## Command Details

### `ui`
Starts the Express server that serves the AgentTrace web UI. By default, it opens at http://localhost:7823. The server automatically loads traces from `~/.agentclaw/traces/`.

```bash
# Start UI (same as running with no arguments)
npx agentclaw ui
npx agentclaw  # equivalent

# Specify custom traces directory
TRACES_DIR=/my/custom/path npx agentclaw ui
```

### `traces`
Prints a formatted table of all trace runs to the terminal, showing:
- Trace ID
- Run name
- Timestamp
- Status (completed/failed/running)
- Step count
- Total tokens
- Duration

```bash
npx agentclaw traces
```

Sample output:
```
Trace ID        | Run Name         | Started At          | Status    | Steps | Tokens | Duration
----------------|------------------|---------------------|-----------|-------|--------|----------
a3f9c1b2        | research_agent   | 2026-03-12 10:00:00 | completed | 3     | 180    | 1.2s
b4d0e2c3        | chatbot_v2       | 2026-03-12 09:45:00 | failed    | 5     | 420    | 2.1s
```

### `clear`
Permanently deletes all trace JSON files from the traces directory. Use with caution!

```bash
npx agentclaw clear
# Prompts for confirmation by default
npx agentclaw clear --force  # skip confirmation
```

### `--version`
Outputs the current AgentTrace version:

```bash
npx agentclaw --version
# Example output: 0.1.0
```

### `--help`
Displays the help menu with all available commands and options:

```bash
npx agentclaw --help
```