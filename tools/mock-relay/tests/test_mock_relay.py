from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.state import RelayMessage, RelayState, reset_state


@pytest.fixture()
def relay_state() -> RelayState:
    state = reset_state(relay_token="secret-token", pairing_mode="stub")
    state.reset_state()
    return state


@pytest.fixture()
def client(relay_state: RelayState) -> TestClient:
    app = create_app(relay_state)
    with TestClient(app) as test_client:
        yield test_client


HEADERS = {"Authorization": "Bearer secret-token"}


def seed_message(state: RelayState, message_id: str = "msg-1") -> RelayMessage:
    message = RelayMessage(
        id=message_id,
        conversation_key="conv-1",
        normalized={"userId": "u-1", "text": "hello"},
        kakao_payload={"body": "hello"},
        callback_url="https://example.test/callback",
    )
    state.seed_message(message)
    return message


def test_health_reports_readiness(client: TestClient, relay_state: RelayState) -> None:
    response = client.get("/health", headers=HEADERS)
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "authConfigured": True,
        "pairingMode": "stub",
        "queueDepth": 0,
    }


def test_401_without_token(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 401


def test_empty_inbox_returns_empty_list(client: TestClient) -> None:
    response = client.get("/openclaw/messages?limit=1", headers=HEADERS)
    assert response.status_code == 200
    payload = response.json()
    assert payload["messages"] == []
    assert payload["nextCursor"] is None


def test_success_poll_reply_ack_flow(client: TestClient, relay_state: RelayState) -> None:
    message = seed_message(relay_state)

    poll = client.get("/openclaw/messages?limit=1", headers=HEADERS)
    assert poll.status_code == 200
    payload = poll.json()
    assert len(payload["messages"]) == 1
    assert payload["messages"][0]["id"] == message.id

    reply = client.post(
        "/openclaw/reply",
        headers=HEADERS,
        json={
            "messageId": message.id,
            "conversationKey": message.conversation_key,
            "response": {"text": "ok"},
        },
    )
    assert reply.status_code == 200
    assert reply.json() == {"ok": True}
    assert len(relay_state.replies) == 1

    ack = client.post(
        "/openclaw/messages/ack",
        headers=HEADERS,
        json={"messageIds": [message.id]},
    )
    assert ack.status_code == 200
    assert ack.json() == {"acknowledged": 1}
    assert relay_state.queue == []


def test_reply_failure_mode(client: TestClient, relay_state: RelayState) -> None:
    message = seed_message(relay_state, message_id="msg-err")
    relay_state.fail_next_reply = True

    response = client.post(
        "/openclaw/reply",
        headers=HEADERS,
        json={
            "messageId": message.id,
            "conversationKey": message.conversation_key,
            "response": {"text": "fail"},
        },
    )
    assert response.status_code == 500
    assert relay_state.replies == []
