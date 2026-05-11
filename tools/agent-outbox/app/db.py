from __future__ import annotations

import hashlib
import os
import sqlite3
from datetime import datetime, date
from pathlib import Path


def _db_path() -> str:
    return os.getenv("DB_PATH", str(Path(__file__).parent.parent / "agent.db"))


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(_db_path(), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS agent_outbox (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                kakao_user_key  TEXT    NOT NULL,
                session_id      TEXT,
                title           TEXT,
                message         TEXT    NOT NULL,
                priority        TEXT    NOT NULL DEFAULT 'normal',
                status          TEXT    NOT NULL DEFAULT 'pending',
                message_hash    TEXT,
                created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
                triggered_at    DATETIME,
                pulled_at       DATETIME,
                error_message   TEXT
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_outbox_user_status ON agent_outbox(kakao_user_key, status)")
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_outbox_hash ON agent_outbox(message_hash) WHERE message_hash IS NOT NULL AND status IN ('pending', 'triggered')")


def _make_hash(kakao_user_key: str, message: str) -> str:
    return hashlib.sha256(f"{kakao_user_key}:{message}".encode()).hexdigest()


def insert_message(
    kakao_user_key: str,
    message: str,
    session_id: str | None = None,
    title: str | None = None,
    priority: str = "normal",
) -> int | None:
    """Insert a message. Returns new row id, or None if duplicate."""
    msg_hash = _make_hash(kakao_user_key, message)
    with _conn() as conn:
        # Check for active duplicate
        existing = conn.execute(
            "SELECT id FROM agent_outbox WHERE message_hash = ? AND status IN ('pending', 'triggered')",
            (msg_hash,),
        ).fetchone()
        if existing:
            return None

        cursor = conn.execute(
            """
            INSERT INTO agent_outbox (kakao_user_key, session_id, title, message, priority, message_hash)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (kakao_user_key, session_id, title, message, priority, msg_hash),
        )
        return cursor.lastrowid


def get_pending_for_user(kakao_user_key: str, limit: int = 3) -> list[sqlite3.Row]:
    with _conn() as conn:
        return conn.execute(
            """
            SELECT id, title, message, priority, created_at
            FROM agent_outbox
            WHERE kakao_user_key = ? AND status IN ('pending', 'triggered')
            ORDER BY
                CASE priority WHEN 'critical' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END,
                created_at ASC
            LIMIT ?
            """,
            (kakao_user_key, limit),
        ).fetchall()


def mark_pulled(row_id: int) -> None:
    with _conn() as conn:
        conn.execute(
            "UPDATE agent_outbox SET status = 'pulled', pulled_at = CURRENT_TIMESTAMP WHERE id = ?",
            (row_id,),
        )


def get_all_pending() -> list[sqlite3.Row]:
    with _conn() as conn:
        return conn.execute(
            """
            SELECT id, kakao_user_key, priority, created_at
            FROM agent_outbox
            WHERE status = 'pending'
            ORDER BY
                CASE priority WHEN 'critical' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END,
                created_at ASC
            """
        ).fetchall()


def mark_triggered(row_id: int) -> None:
    with _conn() as conn:
        conn.execute(
            "UPDATE agent_outbox SET status = 'triggered', triggered_at = CURRENT_TIMESTAMP WHERE id = ?",
            (row_id,),
        )


def count_triggers_today() -> int:
    today = date.today().isoformat()
    with _conn() as conn:
        row = conn.execute(
            "SELECT COUNT(*) FROM agent_outbox WHERE triggered_at >= ? AND status != 'pending'",
            (today,),
        ).fetchone()
        return row[0] if row else 0
