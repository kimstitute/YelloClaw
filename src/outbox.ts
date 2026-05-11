export interface OutboxMessage {
  id: number;
  title?: string | null;
  message: string;
  priority: string;
  created_at: string;
}

interface OutboxPendingResponse {
  kakao_user_key: string;
  count: number;
  messages: OutboxMessage[];
}

function getOutboxConfig(): { url: string; token: string } | null {
  const url = (process.env['OUTBOX_URL'] ?? 'http://localhost:3001').trim().replace(/\/$/, '');
  const token = process.env['OUTBOX_TOKEN']?.trim();
  if (!token) return null;
  return { url, token };
}

export async function fetchPendingMessages(kakaoUserKey: string): Promise<OutboxMessage[]> {
  const cfg = getOutboxConfig();
  if (!cfg) return [];

  const res = await fetch(`${cfg.url}/outbox/${encodeURIComponent(kakaoUserKey)}`, {
    headers: { Authorization: `Bearer ${cfg.token}` },
  });
  if (!res.ok) throw new Error(`[outbox] fetch failed: HTTP ${res.status}`);

  const data = (await res.json()) as OutboxPendingResponse;
  return data.messages;
}

export async function markPulled(id: number): Promise<void> {
  const cfg = getOutboxConfig();
  if (!cfg) return;

  await fetch(`${cfg.url}/outbox/${id}/pulled`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}` },
  });
}

export function isOutboxEnabled(): boolean {
  return getOutboxConfig() !== null;
}
