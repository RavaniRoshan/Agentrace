# AgentTrace

Visual debugger for AI agent loops. Step-by-step. Locally. Zero config.

## Quick Start
```bash
npx agentclaw
```

Opens the trace viewer at http://localhost:7823

## Full Setup

Install the Python tracer in your agent project:
```bash
pip install agentclaw
```

Add decorators to your agent:
```python
from agentclaw import trace, trace_llm, trace_tool

@trace(name="my_agent")
def run_agent(task: str):
    ...

@trace_llm
def call_llm(messages):
    return ollama.chat(model="qwen2.5:7b", messages=messages)

@trace_tool
def web_search(query: str) -> str:
    ...
```

View traces from any terminal:
```bash
npx agentclaw
```

## Commands
```bash
npx agentclaw              # start UI viewer (default)
npx agentclaw ui           # start UI viewer
npx agentclaw traces       # list all traces in terminal
npx agentclaw clear        # delete all traces
npx agentclaw --version    # show version
npx agentclaw --help       # show help
```

## Global Install
```bash
npm install -g agentclaw
agentclaw ui
```

## How It Works

The Python library saves trace files to ~/.agentclaw/traces/
The npm CLI reads those same files and serves the web viewer.
No configuration needed between the two.

## Requirements
- Node.js 18+
- Python agent instrumented with pip install agentclaw

## License
MIT
