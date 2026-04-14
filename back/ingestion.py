from __future__ import annotations

import argparse
import csv
import json
from collections import Counter
from pathlib import Path
from typing import Any

from config import Settings
from schemas import ChunkMetadata, ChunkRecord
from text_utils import basic_clean_text, normalize_file_name, normalize_query_text, split_legal_text

csv.field_size_limit(10**9)


def load_master_documents(settings: Settings) -> list[dict[str, Any]]:
    deduplicated: dict[str, dict[str, Any]] = {}

    with settings.dataset_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            file_name = normalize_file_name(row.get("file_name", ""))
            file_content = basic_clean_text(row.get("file_content", ""))
            if not file_name or not file_content:
                continue

            document = {
                "file_name": file_name,
                "long_title": collapse_or_default(row.get("long_title"), file_name),
                "date": collapse_or_default(row.get("date"), ""),
                "doc_type": collapse_or_default(row.get("doc_type"), "Unknown"),
                "Id": collapse_or_default(row.get("Id"), file_name),
                "file_content": file_content,
            }

            existing = deduplicated.get(file_name)
            if existing is None or len(document["file_content"]) > len(existing["file_content"]):
                deduplicated[file_name] = document

    return list(deduplicated.values())


def collapse_or_default(value: str | None, default: str) -> str:
    collapsed = " ".join((value or "").split()).strip()
    return collapsed or default


def build_chunks(documents: list[dict[str, Any]], settings: Settings) -> list[ChunkRecord]:
    chunks: list[ChunkRecord] = []
    for document in documents:
        parts = split_legal_text(
            document["file_content"],
            max_chars=settings.chunk_size_chars,
            overlap_chars=settings.chunk_overlap_chars,
        )
        for index, chunk_text in enumerate(parts):
            metadata = ChunkMetadata(
                file_name=document["file_name"],
                doc_id=document["Id"],
                long_title=document["long_title"],
                date=document["date"],
                doc_type=document["doc_type"],
                chunk_id=f"{document['Id']}::{index}",
                chunk_index=index,
            )
            chunks.append(
                ChunkRecord(
                    metadata=metadata,
                    content=chunk_text,
                    normalized_content=normalize_query_text(chunk_text),
                )
            )
    return chunks


def write_jsonl(path: Path, records: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def build_ingestion_artifacts(settings: Settings) -> tuple[list[dict[str, Any]], list[ChunkRecord], dict[str, Any]]:
    settings.ensure_directories()
    documents = load_master_documents(settings)
    chunks = build_chunks(documents, settings)

    doc_types = Counter(document["doc_type"] for document in documents)
    report = {
        "documents": len(documents),
        "chunks": len(chunks),
        "dataset_path": str(settings.dataset_path),
        "chunks_path": str(settings.chunks_path),
        "cleaned_corpus_path": str(settings.cleaned_corpus_path),
        "doc_types": dict(doc_types.most_common()),
        "chunk_size_chars": settings.chunk_size_chars,
        "chunk_overlap_chars": settings.chunk_overlap_chars,
    }
    return documents, chunks, report


def save_ingestion_artifacts(
    settings: Settings,
    documents: list[dict[str, Any]],
    chunks: list[ChunkRecord],
    report: dict[str, Any],
) -> None:
    write_jsonl(settings.cleaned_corpus_path, documents)
    write_jsonl(settings.chunks_path, [chunk.model_dump() for chunk in chunks])
    with settings.ingestion_report_path.open("w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)


def main() -> None:
    parser = argparse.ArgumentParser(description="Clean and chunk the Moroccan legal corpus.")
    parser.parse_args()

    settings = Settings.from_env()
    documents, chunks, report = build_ingestion_artifacts(settings)
    save_ingestion_artifacts(settings, documents, chunks, report)
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
