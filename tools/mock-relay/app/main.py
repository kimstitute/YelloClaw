from __future__ import annotations

import os

from fastapi import FastAPI

from .routes import router
from .state import RelayState, get_state, set_state


def create_app(state: RelayState | None = None) -> FastAPI:
    resolved_state = state or get_state()
    resolved_state.relay_token = resolved_state.relay_token or os.getenv("RELAY_TOKEN")
    resolved_state.pairing_mode = resolved_state.pairing_mode or os.getenv("PAIRING_MODE", "stub")
    set_state(resolved_state)

    app = FastAPI(title="YellowClaw Mock Relay")
    app.state.relay_state = resolved_state
    app.include_router(router)
    return app


app = create_app()
