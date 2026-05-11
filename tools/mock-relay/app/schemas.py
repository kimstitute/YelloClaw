from __future__ import annotations

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    authConfigured: bool
    pairingMode: str
    queueDepth: int


class MessagesQuery(BaseModel):
    limit: int = Field(default=1, ge=1)
    cursor: str | None = None
    wait: int | None = Field(default=None, ge=0)


class NormalizedMessage(BaseModel):
    userId: str
    text: str


class RelayMessagePayload(BaseModel):
    id: str
    conversationKey: str
    normalized: NormalizedMessage
    kakaoPayload: dict
    callbackUrl: str

    @classmethod
    def from_message(cls, message: object) -> "RelayMessagePayload":
        normalized = getattr(message, "normalized")
        return cls(
            id=getattr(message, "id"),
            conversationKey=getattr(message, "conversation_key"),
            normalized=NormalizedMessage(**normalized),
            kakaoPayload=getattr(message, "kakao_payload"),
            callbackUrl=getattr(message, "callback_url"),
        )


class MessagesResponse(BaseModel):
    messages: list[RelayMessagePayload]
    nextCursor: str | None = None


class ReplyRequest(BaseModel):
    messageId: str
    conversationKey: str
    response: dict


class ReplyResponse(BaseModel):
    ok: bool = True


class AckRequest(BaseModel):
    messageIds: list[str]


class AckResponse(BaseModel):
    acknowledged: int


class PairingGenerateRequest(BaseModel):
    expirySeconds: int | None = Field(default=None, ge=1)
    metadata: dict | None = None


class PairingGenerateResponse(BaseModel):
    pairingCode: str
    expiresAt: str
    mode: str


class SkillAckResponse(BaseModel):
    version: str = "2.0"
    useCallback: bool = True
