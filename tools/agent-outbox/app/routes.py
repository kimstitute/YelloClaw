from __future__ import annotations

import os

from fastapi import APIRouter, Depends, HTTPException, status

from .auth import require_bearer_token
from . import db
from .schemas import (
    HealthResponse,
    OutboxCreateRequest,
    OutboxCreateResponse,
    OutboxMessageItem,
    OutboxPendingResponse,
    PulledResponse,
)

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    pending = db.get_all_pending()
    return HealthResponse(
        status="ok",
        pending_total=len(pending),
        db_path=os.getenv("DB_PATH", "agent.db"),
    )


@router.post("/outbox", response_model=OutboxCreateResponse, status_code=status.HTTP_201_CREATED)
def create_outbox_message(
    body: OutboxCreateRequest,
    _token: str = Depends(require_bearer_token),
) -> OutboxCreateResponse:
    row_id = db.insert_message(
        kakao_user_key=body.kakao_user_key,
        message=body.message,
        session_id=body.session_id,
        title=body.title,
        priority=body.priority,
    )
    if row_id is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Duplicate message already pending")
    return OutboxCreateResponse(id=row_id)


@router.get("/outbox/{kakao_user_key}", response_model=OutboxPendingResponse)
def get_pending(
    kakao_user_key: str,
    _token: str = Depends(require_bearer_token),
) -> OutboxPendingResponse:
    rows = db.get_pending_for_user(kakao_user_key, limit=3)
    messages = [
        OutboxMessageItem(
            id=row["id"],
            title=row["title"],
            message=row["message"],
            priority=row["priority"],
            created_at=row["created_at"],
        )
        for row in rows
    ]
    return OutboxPendingResponse(
        kakao_user_key=kakao_user_key,
        count=len(messages),
        messages=messages,
    )


@router.post("/outbox/{row_id}/pulled", response_model=PulledResponse)
def mark_pulled(
    row_id: int,
    _token: str = Depends(require_bearer_token),
) -> PulledResponse:
    db.mark_pulled(row_id)
    return PulledResponse(id=row_id)
