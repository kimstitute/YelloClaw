from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class RelayMessage:
    id: str
    conversation_key: str
    normalized: dict[str, Any]
    kakao_payload: dict[str, Any]
    callback_url: str


@dataclass
class ReplyRecord:
    message_id: str
    conversation_key: str
    response: dict[str, Any]


@dataclass
class RelayState:
    relay_token: str | None = None
    pairing_mode: str = "stub"
    queue: list[RelayMessage] = field(default_factory=list)
    replies: list[ReplyRecord] = field(default_factory=list)
    acked_message_ids: list[str] = field(default_factory=list)
    fail_next_reply: bool = False

    def snapshot(self) -> dict[str, Any]:
        return {
            "status": "ok",
            "authConfigured": self.relay_token is not None,
            "pairingMode": self.pairing_mode,
            "queueDepth": len(self.queue),
        }

    def seed_message(self, message: RelayMessage) -> None:
        self.queue.append(message)

    def list_messages(
        self,
        limit: int = 1,
        cursor: str | None = None,
        wait: int | None = None,
    ) -> tuple[list[RelayMessage], str | None]:
        _ = wait
        start = 0
        if cursor:
            try:
                start = max(int(cursor), 0)
            except ValueError:
                start = 0
        messages = self.queue[start : start + limit]
        next_index = start + len(messages)
        next_cursor = str(next_index) if next_index < len(self.queue) else None
        return messages, next_cursor

    def record_reply(self, message_id: str, conversation_key: str, response: dict[str, Any]) -> None:
        self.replies.append(
            ReplyRecord(
                message_id=message_id,
                conversation_key=conversation_key,
                response=response,
            )
        )

    def ack_messages(self, message_ids: list[str]) -> int:
        acked = 0
        remaining: list[RelayMessage] = []
        target_ids = set(message_ids)
        for message in self.queue:
            if message.id in target_ids:
                acked += 1
                self.acked_message_ids.append(message.id)
                continue
            remaining.append(message)
        self.queue = remaining
        return acked

    def reset_state(self) -> None:
        self.queue.clear()
        self.replies.clear()
        self.acked_message_ids.clear()
        self.fail_next_reply = False


_state = RelayState()


def get_state() -> RelayState:
    return _state


def set_state(state: RelayState) -> RelayState:
    global _state
    _state = state
    return _state


def reset_state(relay_token: str | None = None, pairing_mode: str = "stub") -> RelayState:
    state = RelayState(relay_token=relay_token, pairing_mode=pairing_mode)
    return set_state(state)
