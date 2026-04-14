from __future__ import annotations

import argparse
import json
import pickle
from itertools import islice

from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from rank_bm25 import BM25Okapi

from config import Settings
from ingestion import build_ingestion_artifacts, save_ingestion_artifacts
from schemas import ChunkRecord
from text_utils import tokenize_for_bm25


def batched(sequence: list[ChunkRecord], size: int):
    iterator = iter(sequence)
    while batch := list(islice(iterator, size)):
        yield batch


def load_chunks(settings: Settings) -> list[ChunkRecord]:
    if not settings.chunks_path.exists():
        documents, chunks, report = build_ingestion_artifacts(settings)
        save_ingestion_artifacts(settings, documents, chunks, report)
        return chunks

    chunks: list[ChunkRecord] = []
    with settings.chunks_path.open("r", encoding="utf-8") as handle:
        for line in handle:
            chunks.append(ChunkRecord.model_validate_json(line))
    return chunks


def build_vector_index(settings: Settings, chunks: list[ChunkRecord]) -> None:
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY is required to build the FAISS vector index.")

    embeddings = OpenAIEmbeddings(
        model=settings.embedding_model,
        chunk_size=settings.embedding_batch_size,
    )

    vectorstore: FAISS | None = None
    for i, batch in enumerate(batched(chunks, settings.embedding_batch_size)):
        if i % 10 == 0:
            print(f"Indexing vector batch {i} (chunks {i * settings.embedding_batch_size} / {len(chunks)})...")
        texts = [chunk.content for chunk in batch]
        metadatas = [chunk.metadata.model_dump() for chunk in batch]
        ids = [chunk.metadata.chunk_id for chunk in batch]
        if vectorstore is None:
            vectorstore = FAISS.from_texts(texts=texts, embedding=embeddings, metadatas=metadatas, ids=ids)
        else:
            vectorstore.add_texts(texts=texts, metadatas=metadatas, ids=ids)

    print("Vector indexing complete.")

    if vectorstore is None:
        raise RuntimeError("No chunks were produced. Index build aborted.")

    vectorstore.save_local(str(settings.vector_index_dir))


def build_bm25_index(settings: Settings, chunks: list[ChunkRecord]) -> None:
    print(f"Building BM25 index for {len(chunks)} chunks...")
    tokenized_corpus = [tokenize_for_bm25(chunk.normalized_content or chunk.content) for chunk in chunks]
    print("Corpus tokenized. Creating BM25Okapi instance...")
    bm25 = BM25Okapi(tokenized_corpus)
    payload = {
        "bm25": bm25,
        "chunk_ids": [chunk.metadata.chunk_id for chunk in chunks],
        "documents": [chunk.content for chunk in chunks],
        "metadatas": [chunk.metadata.model_dump() for chunk in chunks],
    }
    with settings.bm25_path.open("wb") as handle:
        pickle.dump(payload, handle)


def main() -> None:
    parser = argparse.ArgumentParser(description="Build FAISS and BM25 indexes for the Moroccan legal corpus.")
    parser.parse_args()

    settings = Settings.from_env()
    settings.ensure_directories()
    chunks = load_chunks(settings)
    build_vector_index(settings, chunks)
    build_bm25_index(settings, chunks)

    report = {
        "chunks_indexed": len(chunks),
        "vector_index_dir": str(settings.vector_index_dir),
        "bm25_path": str(settings.bm25_path),
        "embedding_model": settings.embedding_model,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
