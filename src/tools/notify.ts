import { Type } from '@sinclair/typebox';
import type { OpenClawPluginToolFactory } from 'openclaw/plugin-sdk/core';

export const notifyUserToolFactory: OpenClawPluginToolFactory = (ctx) => {
  const kakaoUserKey = ctx.requesterSenderId;

  return {
    name: 'notify_user',
    label: '사용자 알림',
    description:
      '사용자에게 프로액티브 알림을 보냅니다. 지금 바로 전달되는 것이 아니라, 사용자가 다음에 "확인"을 보낼 때 전달됩니다.',
    parameters: Type.Object({
      message: Type.String({ description: '전달할 알림 내용' }),
      title: Type.Optional(Type.String({ description: '알림 제목 (생략 가능)' })),
      priority: Type.Optional(
        Type.Union(
          [Type.Literal('low'), Type.Literal('normal'), Type.Literal('critical')],
          { description: '우선순위. critical은 조용한 시간에도 즉시 전송됩니다. 기본값: normal' },
        ),
      ),
    }),
    async execute(_toolCallId, params) {
      const p = params as { message: string; title?: string; priority?: string };
      const url = (process.env['OUTBOX_URL'] ?? 'http://localhost:3001').replace(/\/$/, '');
      const token = process.env['OUTBOX_TOKEN'];

      if (!token) {
        return { content: [{ type: 'text' as const, text: '[notify_user] OUTBOX_TOKEN이 설정되지 않았습니다.' }], details: null };
      }
      if (!kakaoUserKey) {
        return { content: [{ type: 'text' as const, text: '[notify_user] 사용자 ID를 알 수 없습니다.' }], details: null };
      }

      const res = await fetch(`${url}/outbox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kakao_user_key: kakaoUserKey,
          session_id: ctx.sessionId,
          message: p.message,
          title: p.title,
          priority: p.priority ?? 'normal',
        }),
      });

      if (res.status === 409) {
        return { content: [{ type: 'text' as const, text: '동일한 알림이 이미 대기 중입니다.' }], details: null };
      }
      if (!res.ok) {
        return { content: [{ type: 'text' as const, text: `[notify_user] 오류: HTTP ${res.status}` }], details: null };
      }

      return {
        content: [{ type: 'text' as const, text: '알림이 대기 목록에 추가됐습니다. 사용자가 "확인"을 보내면 전달됩니다.' }],
        details: null,
      };
    },
  };
};
