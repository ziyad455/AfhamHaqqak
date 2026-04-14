from __future__ import annotations

import argparse
import csv
import json
from statistics import mean
from typing import Any

from agent import MoroccanLegalRAGAgent
from config import Settings
from schemas import LegalAnalysisResponse
from text_utils import informative_tokens

csv.field_size_limit(10**9)


def groundedness_score(response: LegalAnalysisResponse, supporting_text: str) -> float:
    answer_text = " ".join([response.summary, *response.legal_basis])
    answer_tokens = informative_tokens(answer_text)
    support_tokens = informative_tokens(supporting_text)
    if not answer_tokens:
        return 0.0
    return round(len(answer_tokens & support_tokens) / len(answer_tokens), 4)


def evaluate(sample_size: int | None = None, with_generation: bool = False) -> dict[str, Any]:
    settings = Settings.from_env()
    agent = MoroccanLegalRAGAgent(settings)

    total = 0
    hits = 0
    reciprocal_ranks: list[float] = []
    citation_scores: list[float] = []
    groundedness_scores: list[float] = []

    with settings.qa_dataset_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            if sample_size is not None and total >= sample_size:
                break

            question = row["Question"]
            expected_file = row["file_name"]
            normalized_query = agent.normalize_scenario(question, use_llm=False)
            retrieved = agent.retriever.search(normalized_query, top_k=5)

            total += 1
            rank = None
            for index, chunk in enumerate(retrieved, start=1):
                if chunk.metadata.file_name == expected_file:
                    rank = index
                    break

            if rank is not None:
                hits += 1
                reciprocal_ranks.append(1 / rank)
            else:
                reciprocal_ranks.append(0.0)

            if with_generation:
                reranked = agent.rerank_candidates(question, normalized_query, retrieved)
                response = agent.compose_final_response(
                    question,
                    agent.generate_answer(question, normalized_query, reranked[: settings.final_context_k]),
                    reranked[: settings.final_context_k],
                )
                citation_scores.append(
                    1.0 if any(citation.file_name == expected_file for citation in response.citations) else 0.0
                )
                groundedness_scores.append(
                    groundedness_score(response, " ".join(chunk.content for chunk in reranked[: settings.final_context_k]))
                )

    if total == 0:
        raise ValueError("No QA rows were available for evaluation.")

    report = {
        "examples_evaluated": total,
        "recall_at_5": round(hits / total, 4),
        "hit_at_5": round(hits / total, 4),
        "mrr": round(mean(reciprocal_ranks), 4),
        "citation_correctness": round(mean(citation_scores), 4) if citation_scores else None,
        "groundedness": round(mean(groundedness_scores), 4) if groundedness_scores else None,
    }

    settings.ensure_directories()
    with settings.evaluation_report_path.open("w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)

    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate retrieval and groundedness using qa.csv.")
    parser.add_argument("--sample-size", type=int, default=None, help="Optional cap on evaluated QA rows.")
    parser.add_argument(
        "--with-generation",
        action="store_true",
        help="Run full answer generation to measure citation correctness and groundedness.",
    )
    args = parser.parse_args()

    report = evaluate(sample_size=args.sample_size, with_generation=args.with_generation)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
