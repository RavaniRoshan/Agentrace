<div align="center">

<br />

```
 █████   ██████  ███████ ███    ██ ████████ ██████   █████   ██████ ███████ 
██   ██ ██       ██      ████   ██    ██    ██   ██ ██   ██ ██      ██      
███████ ██   ███ █████   ██ ██  ██    ██    ██████  ███████ ██      █████   
██   ██ ██    ██ ██      ██  ██ ██    ██    ██   ██ ██   ██ ██      ██      
██   ██  ██████  ███████ ██   ████    ██    ██   ██ ██   ██  ██████ ███████ 
```

**Visual debugger for AI agent loops. Step-by-step. Locally. Zero config.**

<br />

[![PyPI version](https://img.shields.io/pypi/v/agentrace?color=7c6af7&labelColor=1a1a1f&style=flat-square)](https://pypi.org/project/agentrace/)
[![Python](https://img.shields.io/pypi/pyversions/agentrace?color=3ecf8e&labelColor=1a1a1f&style=flat-square)](https://pypi.org/project/agentrace/)
[![License: MIT](https://img.shields.io/badge/license-MIT-4da6ff?labelColor=1a1a1f&style=flat-square)](LICENSE)
[![Downloads](https://img.shields.io/pypi/dm/agentrace?color=f5a623&labelColor=1a1a1f&style=flat-square)](https://pypi.org/project/agentrace/)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/agentrace?color=7c6af7&labelColor=1a1a1f&style=flat-square)](https://github.com/yourusername/agentrace)

<br />

[**Quick Start**](#quick-start) · [**How It Works**](#how-it-works) · [**Framework Support**](#works-with-any-framework) · [**API Reference**](#api-reference) · [**Roadmap**](#roadmap)

<br />

</div>

---

## The Problem

You built an AI agent. It runs 15 steps. Something breaks at step 9.

You have no idea why.

The LLM got a bad prompt? A tool returned garbage? A file permission failed silently? You add `print()` everywhere. You re-run it. You grep through 300 lines of logs. Forty minutes later, you find the bug.

**This is the debugging dark age for AI agents.** No step-by-step visibility. No tool call inspector. No way to see what the LLM was actually thinking at each decision point.

AgentTrace fixes this.

---

## Quick Start

```bash
pip install agentrace
```

Add **3 decorators** to your existing agent. Nothing else changes.

```python
from agentrace import trace, trace_llm, trace_tool
import ollama

@trace(name="research_agent")          # 1. marks the agent boundary
def run_agent(task: str):
    response = call_llm([{"role": "user", "content": task}])
    results  = web_search(response.message.content)
    write_file("output.md", results)

@trace_llm                             # 2. captures prompt + response + tokens
def call_llm(messages: list):
    return ollama.chat(model="qwen2.5:7b", messages=messages)

@trace_tool                            # 3. captures input + output + errors
def web_search(query: str) -> str:
    ...

# Run your agent as normal
run_agent("Summarize the latest papers on LLM agents")
```

```
[AgentTrace] Run complete → COMPLETED
[AgentTrace] 8 steps  |  2840 tokens  |  4.2s
[AgentTrace] View trace → http://localhost:7823/trace/a3f9c1b2
```

Open the link. See this:

```
● ──── ● ──── ● ──── ● ──── ● ──── ● ──── ● ──── ✕
1      2      3      4      5      6      7      8
                                               ERROR ↑

  STEP 8   write_file   [FAILED]   12ms
  ─────────────────────────────────────────────────
  INPUT
    path:    "output.md"
    content: "# Research Summary..."

  ERROR
    PermissionError: cannot write to output.md
    File is open in another process

  ← Step 7: LLM decided to write the summary
  → Step 9:  never reached
```

Bug found. Fixed in 30 seconds.

---

## How It Works

AgentTrace wraps your functions and builds a structured trace of the entire run. Every LLM call, every tool invocation, every error — captured as an ordered sequence of events with full input/output visibility.

```
Your Agent Code
    │
    │  @trace / @trace_llm / @trace_tool decorators
    ▼
TraceCollector              captures events in-memory, per-thread
    │
    ▼
~/.agentrace/traces/        one JSON file per run, never leaves your machine
    │
    ▼
FastAPI  localhost:7823      serves trace data
    │
    ▼
Visual UI                   timeline + step inspector + token counts
```

**Everything is local.** No cloud. No accounts. No API keys. No data leaves your machine.

---

## What Gets Captured

### LLM Calls (`@trace_llm`)

| Field | Description |
|---|---|
| Full message history | Every message sent to the model |
| Model name | Which model was called |
| Response content | What the model replied |
| Tokens in / out | Prompt + completion token counts |
| Latency | Execution time in ms |
| Error | Full traceback if the call failed |

### Tool Calls (`@trace_tool`)

| Field | Description |
|---|---|
| Function arguments | Exact values passed in |
| Return value | What the tool returned |
| Latency | Execution time in ms |
| Error | Full traceback — including the line number |

---

## Works With Any Framework

AgentTrace is **framework-agnostic**. It wraps your functions directly. No monkey-patching. No SDK. No middleware.

```python
# ✅ Raw Python agents
# ✅ LangChain
# ✅ LlamaIndex
# ✅ CrewAI
# ✅ AutoGen
# ✅ Smolagents
# ✅ Async agents (asyncio / anyio)
# ✅ Any custom agent loop
```

### LangChain Example

```python
from agentrace import trace, trace_llm, trace_tool
from langchain_ollama import ChatOllama

llm = ChatOllama(model="qwen2.5:7b")

@trace(name="langchain_agent")
def run_chain(question: str):
    return chain.invoke({"question": question})

@trace_llm
def call_model(messages):
    return llm.invoke(messages)
```

### CrewAI Example

```python
from agentrace import trace, trace_tool

@trace(name="crewai_research")
def run_crew(topic: str):
    crew = Crew(agents=[researcher, writer], tasks=[research_task, write_task])
    return crew.kickoff(inputs={"topic": topic})

@trace_tool(name="search.web")
def search_tool(query: str) -> str:
    return SerperDevTool().run(query)
```

---

## API Reference

### `@trace`

Marks an agent entry point. Starts a new trace for the entire run.

```python
@trace                              # bare decorator — uses function name
@trace(name="my_agent")            # explicit run name
@trace(name="agent", metadata={})  # attach custom metadata to the run
@trace(auto_open=False)            # don't auto-start the UI server
```

Supports both `def` and `async def`.

---

### `@trace_llm`

Wraps an LLM call. Captures prompt, response, token counts, model, and latency.

```python
@trace_llm                         # auto-detects model from call arguments
@trace_llm(model="gpt-4o")        # explicit model label
```

Auto-detects token counts from Ollama, OpenAI, and Anthropic response formats.

---

### `@trace_tool`

Wraps a tool function. Captures input arguments, return value, and any exception.

```python
@trace_tool                            # uses function name as tool name
@trace_tool(name="filesystem.write")   # explicit name for the trace UI
```

---

### `EventCapture` (manual instrumentation)

For cases where decorators don't fit — wrapping third-party code, dynamic dispatch, etc.

```python
from agentrace import EventCapture

with EventCapture("tool_call", "database.query", input={"sql": query}) as cap:
    result = db.execute(query)
    cap.output   = result.fetchall()
    cap.metadata = {"rows": len(result)}
```

---

## CLI

```bash
agentrace ui            # start UI at http://localhost:7823
agentrace traces        # list all recorded traces
agentrace clear         # delete all traces from ~/.agentrace/traces/
```

Or run the server directly:

```bash
python -m agentrace.server
```

---

## Trace Storage

Traces are stored as plain JSON at `~/.agentrace/traces/<trace_id>.json`.

```
~/.agentrace/
└── traces/
    ├── a3f9c1b2.json   # completed run — 8 steps
    ├── 9367b8c4.json   # failed run — error at step 6
    └── ...
```

Read programmatically:

```python
from agentrace import TraceStorage

traces = TraceStorage.list_all()             # all trace summaries
trace  = TraceStorage.load("a3f9c1b2")      # full trace with all steps
```

---

## Async Support

All decorators work on `async def` with zero changes:

```python
@trace(name="async_agent")
async def run_agent(task: str):
    response = await call_llm(...)
    result   = await fetch_data(...)

@trace_llm
async def call_llm(messages):
    return await async_client.chat(model="qwen2.5:7b", messages=messages)
```

---

## Installation

**Minimal** (collector + storage, no UI server):

```bash
pip install agentrace
```

**With UI server** (recommended):

```bash
pip install "agentrace[server]"
# Installs: fastapi, uvicorn
```

**Requirements:** Python 3.10+

---

## Why Not Just Use...

| Tool | What's missing |
|---|---|
| **LangSmith** | Cloud-only. LangChain lock-in. Paid beyond free tier. |
| **Helicone** | LLM proxy only. No step-level agent visibility. |
| **WandB** | Built for model training. Not agent debugging. |
| **MLflow** | Experiment tracking. No agent loop awareness. |
| **Print statements** | You are reading this README. |

AgentTrace is the first tool built specifically to debug **agentic loops** — the multi-step, tool-using, decision-making flows that break in ways traditional logging cannot explain.

---

## Roadmap

**v0.1** *(current)*
- [x] Core event capture — `@trace`, `@trace_llm`, `@trace_tool`
- [x] JSON trace persistence (local, `~/.agentrace/`)
- [x] Visual timeline UI with step inspector
- [x] Token tracking (Ollama, OpenAI, Anthropic)
- [x] Error highlighting with full traceback
- [x] CLI (`ui`, `traces`, `clear`)
- [x] Async support

**v0.2** *(next)*
- [ ] Side-by-side run comparison
- [ ] Cost tracking ($ per run, per step)
- [ ] Token timeline chart — visualize where budget goes
- [ ] LangChain auto-instrumentation (zero decorators needed)
- [ ] CrewAI auto-instrumentation

**v0.3** *(planned)*
- [ ] Regression mode — flag behavior changes between runs
- [ ] CI/CD integration — fail build on behavior regression
- [ ] VS Code extension — see traces inline while coding
- [ ] Export trace as shareable HTML report

**v1.0** *(horizon)*
- [ ] AgentTrace Cloud — share traces across your team
- [ ] Team dashboards and run history
- [ ] Slack / Discord alerts on agent failure

---

## Contributing

Built because debugging agents was making us insane.

```bash
git clone https://github.com/yourusername/agentrace
cd agentrace
pip install -e ".[server]"
python examples/basic_agent.py    # generates two sample traces
agentrace ui                      # open UI at localhost:7823
```

Before opening a PR:
- Open an issue first for non-trivial changes
- Add an example for new features
- Keep `collector.py` and `decorators.py` dependency-free (stdlib only)

---

## License

[MIT](LICENSE) — use it, fork it, ship it.

---

<div align="center">

<br />

**If this saved you an hour of debugging — [star the repo](https://github.com/yourusername/agentrace).**

That's the only metric that matters right now.

<br />

Made with frustration and Python
&nbsp;·&nbsp;
[GitHub](https://github.com/yourusername/agentrace)
&nbsp;·&nbsp;
[PyPI](https://pypi.org/project/agentrace/)
&nbsp;·&nbsp;
[Issues](https://github.com/yourusername/agentrace/issues)

<br />

</div>
