"""
AgentTrace — Server
FastAPI backend. Serves trace data + the UI.
Run: python -m agentrace.server
"""

import os
import sys
from pathlib import Path

# Add parent to path when run as module
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import HTMLResponse, JSONResponse
    from fastapi.staticfiles import StaticFiles
    import uvicorn
except ImportError:
    print("[AgentTrace] Missing dependencies. Run: pip install agentrace[server]")
    print("Or: pip install fastapi uvicorn")
    sys.exit(1)

from agentrace.storage import TraceStorage, SERVER_PORT

app = FastAPI(title="AgentTrace", docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/traces")
def list_traces():
    return TraceStorage.list_all()


@app.get("/api/traces/{trace_id}")
def get_trace(trace_id: str):
    trace = TraceStorage.load(trace_id)
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")
    return trace


@app.delete("/api/traces/{trace_id}")
def delete_trace(trace_id: str):
    deleted = TraceStorage.delete(trace_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Trace not found")
    return {"deleted": trace_id}


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "0.1.0"}


# Serve UI for all other routes
UI_PATH = Path(__file__).parent / "ui" / "index.html"


@app.get("/", response_class=HTMLResponse)
@app.get("/trace/{trace_id}", response_class=HTMLResponse)
def serve_ui(trace_id: str = None):
    if UI_PATH.exists():
        return UI_PATH.read_text()
    return HTMLResponse("<h1>AgentTrace UI not found. Run: agentrace build-ui</h1>")


if __name__ == "__main__":
    print(f"\n[AgentTrace] UI running at http://localhost:{SERVER_PORT}")
    print(f"[AgentTrace] Serving traces from ~/.agentrace/traces/\n")
    uvicorn.run(app, host="0.0.0.0", port=SERVER_PORT, log_level="error")
