from __future__ import annotations

import json
import re
from typing import Any

from langchain_openai import ChatOpenAI

from config import Settings
from retrieval import HybridRetriever
from schemas import (
    AnswerDraft,
    ChatResponse,
    Citation,
    LegalAnalysisResponse,
    NormalizedQuery,
    PersistedScenario,
    QueryNormalizationDraft,
    RerankDraft,
    RetrievedChunk,
)
from storage import ScenarioRepository
from text_utils import (
    dedupe_preserve_order,
    detect_language,
    expand_darija_terms,
    extract_supporting_excerpt,
    infer_legal_domain,
    informative_tokens,
    normalize_query_text,
)

DOMAIN_QUERY_HINTS = {
    "labor": ["droit du travail maroc", "قانون الشغل المغربي"],
    "rent": ["location immobilière maroc", "قانون الكراء بالمغرب"],
    "family": ["code de la famille maroc", "مدونة الأسرة المغربية"],
    "police": ["procédure pénale maroc", "المسطرة الجنائية المغربية"],
    "criminal": ["code pénal maroc", "القانون الجنائي المغربي"],
    "administrative": ["droit administratif maroc", "القانون الإداري المغربي"],
    "commercial": ["droit commercial maroc", "القانون التجاري المغربي"],
    "property": ["droit immobilier maroc", "القانون العقاري المغربي"],
    "tax": ["droit fiscal maroc", "القانون الضريبي المغربي"],
    "customs": ["réglementation douanière maroc", "قانون الجمارك المغربي"],
    "civil": ["droit civil maroc", "القانون المدني المغربي"],
}


class MoroccanLegalRAGAgent:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or Settings.from_env()
        if not self.settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY is not configured.")

        self.retriever = HybridRetriever(self.settings)
        self.repository = ScenarioRepository(self.settings.mysql_url)
        self.primary_llm = ChatOpenAI(model=self.settings.openai_model, temperature=self.settings.temperature)
        self.fallback_llm = ChatOpenAI(model=self.settings.openai_fallback_model, temperature=self.settings.temperature)

    def analyze(self, scenario: str, persist: bool = True) -> LegalAnalysisResponse:
        content_for_cache = self._normalize_for_cache(scenario)
        cached_response = self.repository.get_cached_analysis(content_for_cache)
        
        if cached_response:
            try:
                response = LegalAnalysisResponse.model_validate(cached_response)
                response.cache_hit = True
                return response
            except Exception:
                # Fallback to normal pipeline if cache is corrupted
                pass

        normalized_query = self.normalize_scenario(scenario)
        candidates = self.retriever.search(normalized_query, top_k=self.settings.top_k)
        reranked = self.rerank_candidates(scenario, normalized_query, candidates)
        selected_chunks = reranked[: self.settings.final_context_k]

        if not selected_chunks:
            response = self._insufficient_evidence_response(
                "No sufficiently relevant Moroccan legal text was retrieved for this scenario."
            )
        else:
            draft = self.generate_answer(scenario, normalized_query, selected_chunks)
            response = self.compose_final_response(scenario, draft, selected_chunks)

        if persist:
            self._persist_scenario(scenario, normalized_query, candidates, response)

        # Save to cache if not already from cache
        if not getattr(response, 'cache_hit', False):
            self.repository.save_cache(
                raw_input=scenario,
                normalized_input=content_for_cache,
                response=response.model_dump(),
                scenario_type=normalized_query.legal_domain
            )

        return response

    @staticmethod
    def _normalize_for_cache(scenario: str) -> str:
        """Normalizes text for exact-match caching: trim, single-whitespace, lowercase."""
        if not scenario:
            return ""
        # Remove extra whitespace and trim
        text = re.sub(r"\s+", " ", scenario).strip()
        # Lowercase for case-insensitive exact matching
        return text.lower()

    def normalize_scenario(self, scenario: str, use_llm: bool = True) -> NormalizedQuery:
        cleaned_input = normalize_query_text(scenario)
        detected_language = detect_language(scenario)
        legal_domain = infer_legal_domain(scenario)
        darija_expansions = expand_darija_terms(scenario)
        search_queries = dedupe_preserve_order(
            [
                scenario,
                cleaned_input,
                *darija_expansions,
                *DOMAIN_QUERY_HINTS.get(legal_domain, []),
            ]
        )

        heuristic = NormalizedQuery(
            raw_input=scenario,
            cleaned_input=cleaned_input,
            detected_language=detected_language,
            legal_domain=legal_domain,
            intent="legal scenario analysis",
            keywords=darija_expansions,
            facts=[],
            search_queries=search_queries,
        )

        if not use_llm:
            return heuristic

        prompt = f"""
Return JSON only.

Task:
Normalize a Moroccan legal scenario for hybrid retrieval over Moroccan legal texts.
Support Arabic, Darija, French, and mixed input.

Allowed legal_domain values:
labor, rent, police, family, criminal, administrative, commercial, property, tax, customs, civil, general

Scenario:
{scenario}

Heuristic language: {detected_language}
Heuristic domain: {legal_domain}

Return:
{{
  "detected_language": "...",
  "legal_domain": "...",
  "intent": "...",
  "normalized_arabic_query": "...",
  "normalized_french_query": "...",
  "keywords": ["..."],
  "facts": ["..."]
}}
"""

        try:
            draft = QueryNormalizationDraft.model_validate(self._invoke_json(prompt))
        except Exception:
            return heuristic

        merged_queries = dedupe_preserve_order(
            [
                scenario,
                cleaned_input,
                draft.normalized_arabic_query,
                draft.normalized_french_query,
                *draft.keywords,
                *darija_expansions,
                *DOMAIN_QUERY_HINTS.get(draft.legal_domain or legal_domain, []),
            ]
        )

        return NormalizedQuery(
            raw_input=scenario,
            cleaned_input=cleaned_input,
            detected_language=draft.detected_language or detected_language,
            legal_domain=draft.legal_domain or legal_domain,
            intent=draft.intent or "legal scenario analysis",
            normalized_arabic_query=draft.normalized_arabic_query,
            normalized_french_query=draft.normalized_french_query,
            keywords=dedupe_preserve_order([*draft.keywords, *darija_expansions]),
            facts=draft.facts,
            search_queries=merged_queries,
        )

    def rerank_candidates(
        self,
        scenario: str,
        normalized_query: NormalizedQuery,
        candidates: list[RetrievedChunk],
    ) -> list[RetrievedChunk]:
        if not candidates:
            return []

        shortlist = candidates[: self.settings.rerank_top_k]
        serialized_candidates = []
        for candidate in shortlist:
            serialized_candidates.append(
                {
                    "chunk_id": candidate.metadata.chunk_id,
                    "file_name": candidate.metadata.file_name,
                    "title": candidate.metadata.long_title,
                    "date": candidate.metadata.date,
                    "doc_type": candidate.metadata.doc_type,
                    "hybrid_score": candidate.hybrid_score,
                    "excerpt": extract_supporting_excerpt(candidate.content, scenario, max_chars=500),
                }
            )

        prompt = f"""
Return JSON only.

Task:
Rerank the candidate Moroccan legal chunks for the user's scenario.
Prefer chunks with direct legal basis, procedure, definitions, rights, obligations, or sanctions.

Scenario:
{scenario}

Normalized query:
{json.dumps(normalized_query.model_dump(), ensure_ascii=False)}

Candidates:
{json.dumps(serialized_candidates, ensure_ascii=False, indent=2)}

Return:
{{
  "ordered_chunk_ids": ["chunk_id_1", "chunk_id_2", "chunk_id_3"]
}}
"""

        try:
            draft = RerankDraft.model_validate(self._invoke_json(prompt))
        except Exception:
            return shortlist

        reranked_lookup = {candidate.metadata.chunk_id: candidate for candidate in shortlist}
        reranked = [reranked_lookup[chunk_id] for chunk_id in draft.ordered_chunk_ids if chunk_id in reranked_lookup]
        seen_ids = {candidate.metadata.chunk_id for candidate in reranked}
        reranked.extend(candidate for candidate in shortlist if candidate.metadata.chunk_id not in seen_ids)
        return reranked

    def generate_answer(
        self,
        scenario: str,
        normalized_query: NormalizedQuery,
        selected_chunks: list[RetrievedChunk],
    ) -> AnswerDraft:
        context_payload = [
            {
                "chunk_id": chunk.metadata.chunk_id,
                "file_name": chunk.metadata.file_name,
                "title": chunk.metadata.long_title,
                "date": chunk.metadata.date,
                "doc_type": chunk.metadata.doc_type,
                "content": chunk.content,
            }
            for chunk in selected_chunks
        ]

        prompt = f"""
Return JSON only.

You are a Moroccan legal decision-support system.
Use only the supplied legal chunks.
Do not use external knowledge.
Do not invent laws, articles, or citations.
If the evidence is weak or indirect, say "insufficient evidence" in the summary.
Only cite chunk IDs that appear in the provided context.

Scenario:
{scenario}

Normalized query:
{json.dumps(normalized_query.model_dump(), ensure_ascii=False)}

Retrieved chunks:
{json.dumps(context_payload, ensure_ascii=False, indent=2)}

Return:
{{
  "summary": "simple grounded explanation",
  "legal_basis": ["..."],
  "citation_chunk_ids": ["..."],
  "uncertainty": "...",
  "next_steps": ["...", "..."]
}}
"""

        try:
            return AnswerDraft.model_validate(self._invoke_json(prompt))
        except Exception:
            return AnswerDraft(
                summary="insufficient evidence",
                legal_basis=[],
                citation_chunk_ids=[],
                uncertainty="The model could not produce a reliable grounded synthesis from the retrieved chunks.",
                next_steps=self._default_next_steps("low"),
            )

    def compose_final_response(
        self,
        scenario: str,
        draft: AnswerDraft,
        selected_chunks: list[RetrievedChunk],
    ) -> LegalAnalysisResponse:
        chunk_lookup = {chunk.metadata.chunk_id: chunk for chunk in selected_chunks}
        citation_ids = [chunk_id for chunk_id in draft.citation_chunk_ids if chunk_id in chunk_lookup]
        if not citation_ids:
            citation_ids = [chunk.metadata.chunk_id for chunk in selected_chunks[: min(3, len(selected_chunks))]]

        citations = []
        for chunk_id in citation_ids:
            chunk = chunk_lookup[chunk_id]
            citations.append(
                Citation(
                    file_name=chunk.metadata.file_name,
                    title=chunk.metadata.long_title,
                    date=chunk.metadata.date,
                    chunk_id=chunk.metadata.chunk_id,
                    excerpt=extract_supporting_excerpt(chunk.content, scenario),
                )
            )

        confidence = self.assess_confidence(draft, selected_chunks)
        uncertainty = draft.uncertainty.strip() or self.default_uncertainty(confidence)
        next_steps = dedupe_preserve_order(draft.next_steps or self._default_next_steps(confidence))[:3]

        if not draft.legal_basis and confidence == "low":
            legal_basis = ["insufficient evidence from the retrieved Moroccan legal texts"]
        elif not draft.legal_basis:
            legal_basis = ["The cited Moroccan legal texts are relevant, but the precise rule still needs manual confirmation from the cited provisions."]
        else:
            legal_basis = dedupe_preserve_order(draft.legal_basis)

        summary = draft.summary.strip() or "insufficient evidence"
        return LegalAnalysisResponse(
            summary=summary,
            legal_basis=legal_basis,
            citations=citations,
            confidence=confidence,
            uncertainty=uncertainty,
            next_steps=next_steps,
        )

    def assess_confidence(self, draft: AnswerDraft, selected_chunks: list[RetrievedChunk]) -> str:
        if not selected_chunks:
            return "low"

        top_score = selected_chunks[0].hybrid_score
        strong_matches = sum(chunk.hybrid_score >= 0.6 for chunk in selected_chunks)
        supporting_files = len({chunk.metadata.file_name for chunk in selected_chunks})
        summary_tokens = informative_tokens(draft.summary)
        chunk_tokens = set().union(*(informative_tokens(chunk.content) for chunk in selected_chunks))
        lexical_support = len(summary_tokens & chunk_tokens) / max(len(summary_tokens), 1)

        if "insufficient evidence" in draft.summary.lower():
            return "low"
        if top_score >= 0.85 and strong_matches >= 3 and lexical_support >= 0.35:
            return "high"
        if top_score >= 0.55 and strong_matches >= 2 and (lexical_support >= 0.2 or supporting_files >= 2):
            return "medium"
        return "low"

    @staticmethod
    def default_uncertainty(confidence: str) -> str:
        if confidence == "high":
            return "The retrieved Moroccan legal texts are consistent, but the exact outcome can still depend on procedural facts and the full official document."
        if confidence == "medium":
            return "Relevant texts were found, but key facts or the exact legal qualification remain partially ambiguous."
        return "The retrieved evidence is weak, partial, or only indirectly related to the scenario."

    @staticmethod
    def _default_next_steps(confidence: str) -> list[str]:
        base_steps = [
            "Compare the cited text with the full official document before acting.",
            "Gather the exact dates, notices, contracts, or administrative decisions linked to the scenario.",
        ]
        if confidence == "low":
            base_steps.append("Consult a Moroccan lawyer or the competent administration because the available evidence is incomplete.")
        else:
            base_steps.append("If deadlines, sanctions, or litigation risk exist, seek qualified Moroccan legal advice.")
        return base_steps

    def _persist_scenario(
        self,
        scenario: str,
        normalized_query: NormalizedQuery,
        candidates: list[RetrievedChunk],
        response: LegalAnalysisResponse,
    ) -> None:
        try:
            stored_chunks = [
                {
                    "chunk_id": chunk.metadata.chunk_id,
                    "file_name": chunk.metadata.file_name,
                    "title": chunk.metadata.long_title,
                    "date": chunk.metadata.date,
                    "doc_type": chunk.metadata.doc_type,
                    "hybrid_score": chunk.hybrid_score,
                    "vector_score": chunk.vector_score,
                    "bm25_score": chunk.bm25_score,
                    "content_preview": extract_supporting_excerpt(chunk.content, scenario, max_chars=320),
                }
                for chunk in candidates
            ]
            payload = PersistedScenario(
                raw_input=scenario,
                normalized_query=self.repository.serialize_normalized_query(normalized_query.model_dump()),
                detected_language=normalized_query.detected_language,
                legal_domain=normalized_query.legal_domain,
                retrieved_chunks=stored_chunks,
                final_response=response.model_dump(),
                confidence=response.confidence,
            )
            self.repository.save(payload)
        except Exception:
            return

    @staticmethod
    def _content_to_text(content: Any) -> str:
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts: list[str] = []
            for item in content:
                if isinstance(item, str):
                    parts.append(item)
                elif isinstance(item, dict):
                    parts.append(str(item.get("text", "")))
                else:
                    parts.append(str(item))
            return "\n".join(part for part in parts if part)
        return str(content)

    def _invoke_json(self, prompt: str) -> dict[str, Any]:
        errors: list[str] = []
        for llm in (self.primary_llm, self.fallback_llm):
            try:
                response = llm.invoke(prompt)
                content = self._content_to_text(response.content).strip()
                return self._extract_json(content)
            except Exception as exc:
                errors.append(str(exc))
        raise RuntimeError("; ".join(errors))

    @staticmethod
    def _extract_json(text: str) -> dict[str, Any]:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?", "", cleaned)
            cleaned = re.sub(r"```$", "", cleaned).strip()
        match = re.search(r"\{.*\}", cleaned, re.S)
        if not match:
            raise ValueError("No JSON object found in model response.")
        return json.loads(match.group(0))

    def _insufficient_evidence_response(self, uncertainty: str) -> LegalAnalysisResponse:
        return LegalAnalysisResponse(
            summary="insufficient evidence",
            legal_basis=["insufficient evidence from the retrieved Moroccan legal texts"],
            citations=[],
            confidence="low",
            uncertainty=uncertainty,
            next_steps=self._default_next_steps("low"),
        )

    def chat(self, message: str, situation_summary: str, guidance_message: str, source_lines: list[str]) -> ChatResponse:
        sources_text = "\n".join(f"- {line}" for line in source_lines)
        prompt = f"""
You are a contextual legal assistant embedded inside a platform that simplifies Moroccan legal situations.

Your role is to help the user understand and discuss ONLY the current legal situation provided to you.

You are given:
- A situation summary
- A generated guidance message (solutions/actions)
- Extracted source lines from a dataset

STRICT RULES:

1. Stay strictly within the current situation.
   - Do NOT answer questions out this context.
   - Do NOT introduce new legal topics.

2. Use ONLY the provided information:
   - situation summary
   - generated message
   - sources
   Do NOT use external knowledge.
   Do NOT invent laws, articles, or procedures.

3. Your goal is to:
   - Explain the situation clearly
   - Clarify the proposed solutions
   - Help the user understand next steps
   - Simplify legal language

4. If the user asks something out the current situation:
   - Respond politely that you can only discuss the current case.

5. If the information is insufficient:
   - Clearly say that the available data is not enough to answer.

6. Do NOT provide definitive legal advice.
   - Only provide general guidance based on the given data.

7. Always respond in a clear, simple, and practical way.

OUTPUT FORMAT (MANDATORY):
You must ALWAYS return a valid JSON object:

{{
  "answer": "...",
  "in_scope": true
}}

- "in_scope" = true -> if the question is related to the current situation
- "in_scope" = false -> if the question is out the situation

If the question is out of scope, respond like:
"I can only help with the current situation shown on this page."

---
Situation summary:
{situation_summary}

Generated guidance message:
{guidance_message}

Sources:
{sources_text}

User Question:
{message}
"""
        try:
            return ChatResponse.model_validate(self._invoke_json(prompt))
        except Exception:
            return ChatResponse(
                answer="I can only help with the current situation shown on this page.",
                in_scope=False
            )
