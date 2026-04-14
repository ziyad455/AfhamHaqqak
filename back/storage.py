from __future__ import annotations

import json
from typing import Any

from sqlalchemy import JSON, Column, DateTime, Integer, MetaData, String, Table, Text, create_engine, func, insert
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

from schemas import PersistedScenario


class ScenarioRepository:
    def __init__(self, mysql_url: str | None):
        self.mysql_url = mysql_url
        self.engine: Engine | None = None
        self.init_error: str | None = None
        self.metadata = MetaData()
        self.table = Table(
            "scenarios",
            self.metadata,
            Column("id", Integer, primary_key=True, autoincrement=True),
            Column("raw_input", Text, nullable=False),
            Column("normalized_query", Text, nullable=False),
            Column("detected_language", String(32), nullable=False),
            Column("legal_domain", String(64), nullable=False),
            Column("retrieved_chunks", JSON, nullable=False),
            Column("final_response", JSON, nullable=False),
            Column("confidence", String(16), nullable=False),
            Column("created_at", DateTime, nullable=False, server_default=func.now()),
            mysql_charset="utf8mb4",
        )

        self.cache_table = Table(
            "scenario_cache",
            self.metadata,
            Column("id", Integer, primary_key=True, autoincrement=True),
            Column("raw_input", Text, nullable=False),
            Column("normalized_input", Text, nullable=False),
            Column("response_json", JSON, nullable=False),
            Column("scenario_type", String(64), nullable=True, default="general"),
            Column("created_at", DateTime, nullable=False, server_default=func.now()),
            Column("updated_at", DateTime, nullable=False, server_default=func.now(), onupdate=func.now()),
            mysql_charset="utf8mb4",
        )

        if mysql_url:
            try:
                self.engine = create_engine(mysql_url, pool_pre_ping=True, future=True)
                self.metadata.create_all(self.engine)
            except SQLAlchemyError as exc:
                self.engine = None
                self.init_error = str(exc)

    def save(self, scenario: PersistedScenario) -> int | None:
        if not self.engine:
            return None

        payload: dict[str, Any] = {
            "raw_input": scenario.raw_input,
            "normalized_query": scenario.normalized_query,
            "detected_language": scenario.detected_language,
            "legal_domain": scenario.legal_domain,
            "retrieved_chunks": scenario.retrieved_chunks,
            "final_response": scenario.final_response,
            "confidence": scenario.confidence,
        }

        with self.engine.begin() as connection:
            result = connection.execute(insert(self.table).values(payload))
            inserted = result.inserted_primary_key
            return int(inserted[0]) if inserted else None

    def get_cached_analysis(self, normalized_input: str) -> dict[str, Any] | None:
        """Exact-match lookup for previously analyzed scenarios."""
        if not self.engine:
            return None

        from sqlalchemy import select
        query = select(self.cache_table.c.response_json).where(self.cache_table.c.normalized_input == normalized_input).limit(1)
        
        try:
            with self.engine.connect() as connection:
                result = connection.execute(query).fetchone()
                return result[0] if result else None
        except SQLAlchemyError:
            return None

    def save_cache(self, raw_input: str, normalized_input: str, response: dict[str, Any], scenario_type: str = "general") -> None:
        """Stores a successful analysis in the cache."""
        if not self.engine:
            return

        payload = {
            "raw_input": raw_input,
            "normalized_input": normalized_input,
            "response_json": response,
            "scenario_type": scenario_type,
        }

        try:
            with self.engine.begin() as connection:
                connection.execute(insert(self.cache_table).values(payload))
        except SQLAlchemyError:
            return

    @staticmethod
    def serialize_normalized_query(normalized_query: dict[str, Any]) -> str:
        return json.dumps(normalized_query, ensure_ascii=False)
