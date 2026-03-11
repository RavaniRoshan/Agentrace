# AgentTrace

**Your agent ran 15 steps. Something broke at step 9. You have no idea why.**

AgentTrace gives you a visual, step-by-step timeline of exactly what your AI agent did, decided, and why it failed. Works with any framework. Zero config. 100% local.

```
pip install agentrace
```

![AgentTrace Demo](https://raw.githubusercontent.com/yourusername/agentrace/main/docs/demo.gif)

---

## The Problem

You build an agent. It does 15 steps. Something goes wrong.

```
Step 1: search web ✓
Step 2: read file ✓
Step 3: call LLM ✓
...
Step 9: ??? ← it just... stopped working
```

You have no idea what the LLM was thinking at step 9. What prompt it received. What tool it tried to call. Why it failed.

So you add `print()` statements everywhere. You run it again. You grep through 200 lines of logs. An hour later, you find the bug.

**There is a better way.**

---

## What AgentTrace Does

```
You run your agent normally.
AgentTrace captures everything that happened.
You open a browser tab.
You see this:
```

```
● ─── ● ─── ● ─── ● ─── ● ─── ● ─── ● ─── ● ─── ✕
1     2     3     4     5     6     7     8     9
                                              ERROR ↑

Step 9 — write_file                    [FAILED] 12ms
────────────────────────────────────────────────────
INPUT
  path: "output.md"
  content: "# Summary..."

ERROR
  PermissionError: cannot write to output.md
  File is open in another process

← Step 8: LLM decided to write summary
→ Step 10: never reached
```

Bug found. Fixed in 30 seconds.

---

## Install

```bash
pip install agentrace
pip install agentrace[server]   # includes FastAPI UI server
```

---

## Usage

Add **3 decorators**. That's it.

```python
from agentrace import trace, trace_llm, trace_tool

# 1. Wrap your agent entry point
@trace(name="my_research_agent")
def run_agent(task: str):
    response = call_llm([{"role": "user", "content": task}])
    result = web_search(response)
    write_file("output.md", result)

# 2. Wrap LLM calls
@trace_llm
def call_llm(messages: list):
    return ollama.chat(model="qwen2.5:7b", messages=messages)

# 3. Wrap tool calls
@trace_tool
def web_search(query: str) -> str:
    ...

@trace_tool
def write_file(path: str, content: str) -> str:
    ...

# Run your agent normally
run_agent("Summarize the latest AI papers")
# [AgentTrace] Run complete → COMPLETED
# [AgentTrace] 8 steps | 2840 tokens | 4.2s
# [AgentTrace] View trace: http://localhost:7823/trace/abc12345
```

---

## What You See

For every step in the timeline:

| Field | LLM Call | Tool Call |
|---|---|---|
| Input | Full prompt + message history | Function arguments |
| Output | LLM response content | Return value |
| Tokens | Prompt tokens + completion tokens | — |
| Model | Model name + version | — |
| Duration | Latency in ms | Latency in ms |
| Error | Full traceback | Full traceback |

---

## Works With Any Framework

AgentTrace is framework-agnostic. Just wrap the functions.

```python
# Raw Python agents ✓
# LangChain ✓
# LlamaIndex ✓
# CrewAI ✓
# AutoGen ✓
# Custom loops ✓
# Async agents ✓
```

No lock-in. No SDK. No cloud.

---

## Start the UI

```bash
# Option 1: Auto-starts when you run your agent (default)

# Option 2: Manual
agentrace ui
# → http://localhost:7823

# Option 3: As a module
python -m agentrace.server
```

---

## CLI

```bash
agentrace traces        # list all recorded traces
agentrace ui            # start UI server
agentrace clear         # delete all traces
```

---

## Architecture

```
Your Agent Code
    │
    │  @trace decorators (3 lines of instrumentation)
    ▼
TraceCollector          ← captures every event in memory
    │
    ▼
~/.agentrace/traces/    ← one JSON file per run, local only
    │
    ▼
FastAPI server          ← localhost:7823
    │
    ▼
Visual UI               ← timeline, step inspector, token counts
```

Everything runs locally. No accounts. No API keys. No data leaves your machine.

---

## Why Not Just Use...

| Tool | Problem |
|---|---|
| LangSmith | Cloud-only, LangChain ecosystem, paid at scale |
| WandB | ML training focus, not agent debugging |
| Helicone | Proxy-based, no step-level visibility |
| Print statements | You're reading this README |

AgentTrace is the first tool built specifically for debugging agentic loops, step by step, locally.

---

## Roadmap

- [x] Core trace collection
- [x] JSON persistence
- [x] Visual timeline UI
- [x] LLM call capture (tokens, model, latency)
- [x] Tool call capture
- [x] Error highlighting
- [ ] Multi-run comparison
- [ ] Cost tracking ($ per run)
- [ ] Regression test mode
- [ ] AgentTrace Cloud (team sharing)
- [ ] VS Code extension
- [ ] LangChain auto-instrumentation
- [ ] CrewAI auto-instrumentation

---

## Contributing

Built because debugging agents was making us insane.

PRs welcome. Open an issue before starting large changes.

```bash
git clone https://github.com/yourusername/agentrace
cd agentrace
pip install -e ".[server]"
python examples/basic_agent.py   # generate sample traces
agentrace ui                     # open the UI
```

---

## License

MIT — use it, fork it, build on it.

---

*If this saved you an hour of debugging, star the repo. That's the only metric that matters right now.*
