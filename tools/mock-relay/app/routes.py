from __future__ import annotations

from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status

from .auth import require_bearer_token
from .schemas import (
    AckRequest,
    AckResponse,
    HealthResponse,
    MessagesQuery,
    MessagesResponse,
    PairingGenerateRequest,
    PairingGenerateResponse,
    RelayMessagePayload,
    ReplyRequest,
    ReplyResponse,
)
from .state import RelayMessage, RelayState, get_state


router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health(token: str = Depends(require_bearer_token), state: RelayState = Depends(get_state)) -> HealthResponse:
    _ = token
    return HealthResponse(**state.snapshot())


@router.get("/openclaw/messages", response_model=MessagesResponse)
def list_messages(
    token: str = Depends(require_bearer_token),
    state: RelayState = Depends(get_state),
    limit: int = Query(1, ge=1),
    cursor: str | None = Query(default=None),
    wait: int | None = Query(default=None, ge=0),
) -> MessagesResponse:
    _ = token
    query = MessagesQuery(limit=limit, cursor=cursor, wait=wait)
    messages, next_cursor = state.list_messages(limit=query.limit, cursor=query.cursor, wait=query.wait)
    return MessagesResponse(
        messages=[RelayMessagePayload.from_message(message) for message in messages],
        nextCursor=next_cursor,
    )


@router.post("/openclaw/reply", response_model=ReplyResponse)
def post_reply(payload: ReplyRequest, token: str = Depends(require_bearer_token), state: RelayState = Depends(get_state)) -> ReplyResponse:
    _ = token
    if state.fail_next_reply:
        state.fail_next_reply = False
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Injected downstream reply failure")

    match = next(
        (
            message
            for message in state.queue
            if message.id == payload.messageId and message.conversation_key == payload.conversationKey
        ),
        None,
    )
    if match is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown message reference")

    state.record_reply(payload.messageId, payload.conversationKey, payload.response)
    return ReplyResponse()


@router.post("/openclaw/messages/ack", response_model=AckResponse)
def ack_messages(payload: AckRequest, token: str = Depends(require_bearer_token), state: RelayState = Depends(get_state)) -> AckResponse:
    _ = token
    return AckResponse(acknowledged=state.ack_messages(payload.messageIds))


@router.post("/openclaw/pairing/generate", response_model=PairingGenerateResponse)
def generate_pairing(payload: PairingGenerateRequest, token: str = Depends(require_bearer_token), state: RelayState = Depends(get_state)) -> PairingGenerateResponse:
    _ = token
    expires_in = payload.expirySeconds or 600
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
    return PairingGenerateResponse(
        pairingCode="stub",
        expiresAt=expires_at.isoformat().replace("+00:00", "Z"),
        mode=state.pairing_mode,
    )
