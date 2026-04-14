from __future__ import annotations

import pickle
from collections import defaultdict
from pathlib import Path
from typing import Any

from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

from config import Settings
from schemas import ChunkRecord, NormalizedQuery, RetrievedChunk
from text_utils import tokenize_for_bm25


class HybridRetriever:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or Settings.from_env()
        self._validate_artifacts()
        self.chunk_lookup = self._load_chunk_lookup(self.settings.chunks_path)
        self.embeddings = OpenAIEmbeddings(model=self.settings.embedding_model)
        self.vectorstore = FAISS.load_local(
            str(self.settings.vector_index_dir),
            self.embeddings,
            allow_dangerous_deserialization=True,
        )
        with self.settings.bm25_path.open("rb") as handle:
            bm25_payload = pickle.load(handle)
        self.bm25 = bm25_payload["bm25"]
        self.bm25_chunk_ids = bm25_payload["chunk_ids"]


    def _validate_artifacts(self) -> None:
        missing = [
            str(path)
            for path in (self.settings.chunks_path, self.settings.bm25_path)
            if not path.exists()
        ]
        vector_files = (
            self.settings.vector_index_dir / "index.faiss",
            self.settings.vector_index_dir / "index.pkl",
        )
        for path in vector_files:
            if not path.exists():
                missing.append(str(path))
        if missing:
            raise FileNotFoundError(
                "Index artifacts are missing. From `AfhamHaqqak/back`, run `python ingestion.py` "
                "and `python indexing.py` first. "
                f"Missing: {', '.join(missing)}"
            )

    @staticmethod
    def _load_chunk_lookup(path: Path) -> dict[str, ChunkRecord]:
        lookup: dict[str, ChunkRecord] = {}
        with path.open("r", encoding="utf-8") as handle:
            for line in handle:
                chunk = ChunkRecord.model_validate_json(line)
                lookup[chunk.metadata.chunk_id] = chunk
        return lookup

    def _vector_search(self, query: str, top_k: int) -> list[tuple[str, float]]:
        results = self.vectorstore.similarity_search_with_relevance_scores(query, k=top_k)
        prepared: list[tuple[str, float]] = []
        for document, score in results:
            chunk_id = document.metadata.get("chunk_id")
            if chunk_id:
                prepared.append((chunk_id, float(score)))
        return prepared

    def _bm25_search(self, query: str, top_k: int) -> list[tuple[str, float]]:
        tokenized_query = tokenize_for_bm25(query)
        if not tokenized_query:
            return []
        scores = self.bm25.get_scores(tokenized_query)
        ranked = sorted(enumerate(scores), key=lambda item: item[1], reverse=True)[:top_k]
        return [(self.bm25_chunk_ids[index], float(score)) for index, score in ranked if score > 0]

    def search(self, normalized_query: NormalizedQuery, top_k: int | None = None) -> list[RetrievedChunk]:
        limit = top_k or self.settings.top_k
        aggregated: dict[str, dict[str, Any]] = defaultdict(
            lambda: {"hybrid_score": 0.0, "vector_score": 0.0, "bm25_score": 0.0}
        )

        query_variants = normalized_query.search_queries or [normalized_query.cleaned_input]
        query_variants = [query for query in query_variants if query]

        for variant in query_variants[:4]:
            vector_results = self._vector_search(variant, limit)
            for rank, (chunk_id, score) in enumerate(vector_results, start=1):
                entry = aggregated[chunk_id]
                entry["vector_score"] = max(entry["vector_score"], score)
                entry["hybrid_score"] += 0.65 / (60 + rank)

            bm25_results = self._bm25_search(variant, limit)
            for rank, (chunk_id, score) in enumerate(bm25_results, start=1):
                entry = aggregated[chunk_id]
                entry["bm25_score"] = max(entry["bm25_score"], score)
                entry["hybrid_score"] += 0.35 / (60 + rank)

        if not aggregated:
            return []

        ranked_chunk_ids = sorted(
            aggregated.items(),
            key=lambda item: item[1]["hybrid_score"],
            reverse=True,
        )[:limit]

        max_hybrid = ranked_chunk_ids[0][1]["hybrid_score"] or 1.0
        results: list[RetrievedChunk] = []
        for chunk_id, scores in ranked_chunk_ids:
            base_chunk = self.chunk_lookup[chunk_id]
            results.append(
                RetrievedChunk(
                    metadata=base_chunk.metadata,
                    content=base_chunk.content,
                    normalized_content=base_chunk.normalized_content,
                    hybrid_score=round(scores["hybrid_score"] / max_hybrid, 6),
                    vector_score=round(scores["vector_score"], 6),
                    bm25_score=round(scores["bm25_score"], 6),
                )
            )

        return results
