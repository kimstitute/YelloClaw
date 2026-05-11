from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI

from . import db
from .routes import router
from .watcher import get_watcher


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    db.init_db()
    get_watcher().start()
    yield
    get_watcher().stop()


def create_app() -> FastAPI:
    app = FastAPI(title="YellowClaw Agent Outbox", lifespan=lifespan)
    app.include_router(router)
    return app


app = create_app()
