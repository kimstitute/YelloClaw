from __future__ import annotations

from pydantic import BaseModel, Field


class OutboxCreateRequest(BaseModel):
    kakao_user_key: str
    message: str
    session_id: str | None = None
    title: str | None = None
    priority: str = Field(default="normal", pattern="^(low|normal|critical)$")


class OutboxCreateResponse(BaseModel):
    id: int
    status: str = "pending"


class OutboxMessageItem(BaseModel):
    id: int
    title: str | None
    message: str
    priority: str
    created_at: str


class OutboxPendingResponse(BaseModel):
    kakao_user_key: str
    count: int
    messages: list[OutboxMessageItem]


class PulledResponse(BaseModel):
    id: int
    status: str = "pulled"


class HealthResponse(BaseModel):
    status: str
    pending_total: int
    db_path: str
