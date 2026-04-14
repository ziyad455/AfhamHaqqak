from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from agent import MoroccanLegalRAGAgent
from schemas import AnalyzeRequest, ChatRequest, ChatResponse, LegalAnalysisResponse

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.agent = None
    app.state.startup_error = None
    try:
        app.state.agent = MoroccanLegalRAGAgent()
    except Exception as exc:
        app.state.startup_error = str(exc)
    yield


app = FastAPI(
    title="Moroccan Legal Scenario RAG Agent",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/health")
async def health(request: Request) -> dict[str, object]:
    startup_error = request.app.state.startup_error
    agent = request.app.state.agent
    persistence_error = None
    persistence_ready = False
    if agent is not None:
        persistence_error = getattr(agent.repository, "init_error", None)
        persistence_ready = persistence_error is None
    return {
        "status": "ok" if not startup_error else "degraded",
        "agent_ready": startup_error is None,
        "startup_error": startup_error,
        "persistence_ready": persistence_ready,
        "persistence_error": persistence_error,
    }


@app.get("/", include_in_schema=False)
async def test_page() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.post("/analyze", response_model=LegalAnalysisResponse)
async def analyze(request: Request, payload: AnalyzeRequest) -> LegalAnalysisResponse:
    startup_error = request.app.state.startup_error
    if startup_error:
        raise HTTPException(status_code=503, detail=f"Agent is not ready: {startup_error}")

    try:
        agent: MoroccanLegalRAGAgent = request.app.state.agent
        return agent.analyze(payload.scenario)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Index artifacts are missing. From `AfhamHaqqak/back`, run `python ingestion.py` "
                "and `python indexing.py` first."
            ),
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc


@app.post("/chat", response_model=ChatResponse)
async def chat(request: Request, payload: ChatRequest) -> ChatResponse:
    startup_error = request.app.state.startup_error
    if startup_error:
        raise HTTPException(status_code=503, detail=f"Agent is not ready: {startup_error}")

    try:
        agent: MoroccanLegalRAGAgent = request.app.state.agent
        return agent.chat(
            message=payload.message,
            situation_summary=payload.situation_summary,
            guidance_message=payload.guidance_message,
            source_lines=payload.source_lines
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Chat failed: {exc}") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=False)
