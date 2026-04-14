from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ChunkMetadata(BaseModel):
    model_config = ConfigDict(extra="ignore")

    file_name: str
    doc_id: str
    long_title: str
    date: str
    doc_type: str
    chunk_id: str
    chunk_index: int


class ChunkRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    metadata: ChunkMetadata
    content: str
    normalized_content: str


class RetrievedChunk(ChunkRecord):
    hybrid_score: float = 0.0
    vector_score: float = 0.0
    bm25_score: float = 0.0


class NormalizedQuery(BaseModel):
    model_config = ConfigDict(extra="ignore")

    raw_input: str
    cleaned_input: str
    detected_language: str
    legal_domain: str
    intent: str
    normalized_arabic_query: str = ""
    normalized_french_query: str = ""
    keywords: list[str] = Field(default_factory=list)
    facts: list[str] = Field(default_factory=list)
    search_queries: list[str] = Field(default_factory=list)


class Citation(BaseModel):
    model_config = ConfigDict(extra="ignore")

    file_name: str
    title: str
    date: str
    chunk_id: str
    excerpt: str


class LegalAnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    summary: str
    legal_basis: list[str]
    citations: list[Citation]
    confidence: str
    uncertainty: str
    next_steps: list[str]
    cache_hit: bool = False
    disclaimer: str = "This is informational and not a substitute for legal advice."


class AnalyzeRequest(BaseModel):
    scenario: str = Field(min_length=3)


class QueryNormalizationDraft(BaseModel):
    model_config = ConfigDict(extra="ignore")

    detected_language: str = "unknown"
    legal_domain: str = "general"
    intent: str = "legal scenario analysis"
    normalized_arabic_query: str = ""
    normalized_french_query: str = ""
    keywords: list[str] = Field(default_factory=list)
    facts: list[str] = Field(default_factory=list)


class RerankDraft(BaseModel):
    model_config = ConfigDict(extra="ignore")

    ordered_chunk_ids: list[str] = Field(default_factory=list)


class AnswerDraft(BaseModel):
    model_config = ConfigDict(extra="ignore")

    summary: str = "insufficient evidence"
    legal_basis: list[str] = Field(default_factory=list)
    citation_chunk_ids: list[str] = Field(default_factory=list)
    uncertainty: str = ""
    next_steps: list[str] = Field(default_factory=list)


class PersistedScenario(BaseModel):
    model_config = ConfigDict(extra="ignore")

    raw_input: str
    normalized_query: str
    detected_language: str
    legal_domain: str
    retrieved_chunks: list[dict[str, Any]]
    final_response: dict[str, Any]
    confidence: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    situation_summary: str
    guidance_message: str
    source_lines: list[str]


class ChatResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    answer: str
    in_scope: bool

