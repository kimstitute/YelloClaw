from __future__ import annotations

from fastapi import Depends, Header, HTTPException, status

from .state import RelayState, get_state


def parse_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    prefix = "Bearer "
    if not authorization.startswith(prefix):
        return None
    token = authorization[len(prefix) :].strip()
    return token or None


def require_bearer_token(
    authorization: str | None = Header(default=None),
    state: RelayState = Depends(get_state),
) -> str:
    token = parse_bearer_token(authorization)
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    if state.relay_token is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Relay token is not configured")
    if token != state.relay_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid bearer token")
    return token
