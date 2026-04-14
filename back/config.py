from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


def _env_int(name: str, default: int) -> int:
    value = os.getenv(name)
    return int(value) if value else default


def _env_float(name: str, default: float) -> float:
    value = os.getenv(name)
    return float(value) if value else default


def _env_path(base_dir: Path, env_name: str, default_relative_path: str) -> Path:
    value = os.getenv(env_name)
    if not value:
        return base_dir / default_relative_path
    candidate = Path(value)
    return candidate if candidate.is_absolute() else base_dir / candidate


@dataclass(frozen=True)
class Settings:
    base_dir: Path
    dataset_path: Path
    qa_dataset_path: Path
    shard_glob: str
    artifacts_dir: Path
    cleaned_corpus_path: Path
    chunks_path: Path
    vector_index_dir: Path
    bm25_path: Path
    ingestion_report_path: Path
    evaluation_report_path: Path
    mysql_url: str | None
    openai_api_key: str | None
    openai_model: str
    openai_fallback_model: str
    embedding_model: str
    temperature: float
    chunk_size_chars: int
    chunk_overlap_chars: int
    top_k: int
    rerank_top_k: int
    final_context_k: int
    embedding_batch_size: int

    @classmethod
    def from_env(cls) -> "Settings":
        base_dir = Path(__file__).resolve().parent
        load_dotenv(base_dir / ".env", override=False)

        artifacts_dir = _env_path(base_dir, "ARTIFACTS_DIR", "artifacts")

        return cls(
            base_dir=base_dir,
            dataset_path=_env_path(base_dir, "DATASET_PATH", "archive/train_with_file_content.csv"),
            qa_dataset_path=_env_path(base_dir, "QA_DATASET_PATH", "archive/qa.csv"),
            shard_glob=os.getenv("SHARDED_QA_GLOB", "archive/data/data/*.html.csv"),
            artifacts_dir=artifacts_dir,
            cleaned_corpus_path=_env_path(base_dir, "CLEANED_CORPUS_PATH", "artifacts/corpus/cleaned_documents.jsonl"),
            chunks_path=_env_path(base_dir, "CHUNKS_PATH", "artifacts/corpus/chunks.jsonl"),
            vector_index_dir=_env_path(base_dir, "VECTOR_INDEX_DIR", "artifacts/index/faiss"),
            bm25_path=_env_path(base_dir, "BM25_PATH", "artifacts/index/bm25.pkl"),
            ingestion_report_path=_env_path(base_dir, "INGESTION_REPORT_PATH", "artifacts/reports/ingestion_report.json"),
            evaluation_report_path=_env_path(base_dir, "EVALUATION_REPORT_PATH", "artifacts/reports/evaluation_report.json"),
            mysql_url=os.getenv("MYSQL_URL"),
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            openai_model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
            openai_fallback_model=os.getenv("OPENAI_FALLBACK_MODEL", "gpt-4.1"),
            embedding_model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-large"),
            temperature=_env_float("OPENAI_TEMPERATURE", 0.1),
            chunk_size_chars=_env_int("CHUNK_SIZE_CHARS", 1800),
            chunk_overlap_chars=_env_int("CHUNK_OVERLAP_CHARS", 250),
            top_k=_env_int("TOP_K", 20),
            rerank_top_k=_env_int("RERANK_TOP_K", 10),
            final_context_k=_env_int("FINAL_CONTEXT_K", 5),
            embedding_batch_size=_env_int("EMBEDDING_BATCH_SIZE", 64),
        )

    def ensure_directories(self) -> None:
        for path in (
            self.artifacts_dir,
            self.cleaned_corpus_path.parent,
            self.chunks_path.parent,
            self.vector_index_dir,
            self.bm25_path.parent,
            self.ingestion_report_path.parent,
            self.evaluation_report_path.parent,
        ):
            path.mkdir(parents=True, exist_ok=True)

