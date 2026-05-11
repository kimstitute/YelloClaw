from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime, timedelta

from . import db

logger = logging.getLogger(__name__)

POLL_INTERVAL = 10        # seconds
COOLDOWN_SECONDS = 300    # 5 minutes between triggers
DAILY_LIMIT = 50
QUIET_START = 2           # 02:00 local
QUIET_END = 8             # 08:00 local


class Watcher:
    def __init__(self) -> None:
        self._task: asyncio.Task | None = None
        self._last_sent_at: datetime | None = None

    def start(self) -> None:
        self._task = asyncio.create_task(self._loop())

    def stop(self) -> None:
        if self._task:
            self._task.cancel()

    async def _loop(self) -> None:
        while True:
            try:
                await asyncio.sleep(POLL_INTERVAL)
                await self._tick()
            except asyncio.CancelledError:
                break
            except Exception as exc:
                logger.error("[watcher] error: %s", exc)

    async def _tick(self) -> None:
        pending = db.get_all_pending()
        if not pending:
            return

        now = datetime.now()

        # Daily limit
        if db.count_triggers_today() >= DAILY_LIMIT:
            logger.warning("[watcher] daily limit reached (%d)", DAILY_LIMIT)
            return

        # Cooldown
        if self._last_sent_at and (now - self._last_sent_at) < timedelta(seconds=COOLDOWN_SECONDS):
            return

        # Quiet hours — only critical passes
        in_quiet = QUIET_START <= now.hour < QUIET_END
        if in_quiet:
            pending = [r for r in pending if r["priority"] == "critical"]
            if not pending:
                return

        row = pending[0]
        await self._send_trigger(row["id"])

    async def _send_trigger(self, row_id: int) -> None:
        script = os.getenv("SEND_SCRIPT")
        if not script:
            logger.error("[watcher] SEND_SCRIPT is not set — skipping trigger")
            return

        try:
            proc = await asyncio.create_subprocess_exec(
                script,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            _, stderr = await asyncio.wait_for(proc.communicate(), timeout=15)
            if proc.returncode != 0:
                logger.error("[watcher] send script failed (rc=%d): %s", proc.returncode, stderr.decode())
                return

            db.mark_triggered(row_id)
            self._last_sent_at = datetime.now()
            logger.info("[watcher] trigger sent for outbox id=%d", row_id)

        except TimeoutError:
            logger.error("[watcher] send script timed out")
        except Exception as exc:
            logger.error("[watcher] send script error: %s", exc)


_watcher = Watcher()


def get_watcher() -> Watcher:
    return _watcher
