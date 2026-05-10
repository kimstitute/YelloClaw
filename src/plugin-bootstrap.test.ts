import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  configureRelayAdapter: vi.fn(),
  runtimeConfigure: vi.fn(),
}));

vi.mock('./adapters/relay', () => ({
  configureRelayAdapter: mocks.configureRelayAdapter,
}));

vi.mock('./plugin-runtime', () => ({
  YellowClawRuntime: {
    configure: mocks.runtimeConfigure,
  },
}));

import { bootstrap, bootstrapAndGetRelayAdapter } from './plugin-bootstrap';

describe('plugin-bootstrap', () => {
  beforeEach(() => {
    mocks.configureRelayAdapter.mockClear();
    mocks.runtimeConfigure.mockClear();
  });

  it('initializes runtime policy and relay adapter only', async () => {
    await bootstrap({
      kakao: {
        enabled: true,
        channelId: 'kakao',
        relayUrl: 'https://relay.example',
        relayToken: 'token-123',
      },
      auth: {
        pairingRequired: true,
        adminUserId: 'admin-1',
      },
      policy: {
        adminOnlyTools: true,
        allowlistOnly: true,
        allowedUsers: [],
      },
    });

    expect(mocks.runtimeConfigure).toHaveBeenCalledTimes(1);
    expect(mocks.configureRelayAdapter).toHaveBeenCalledTimes(1);
  });

  it('returns relay adapter when asked', async () => {
    mocks.configureRelayAdapter.mockReturnValueOnce({} as never);

    const adapter = await bootstrapAndGetRelayAdapter();
    expect(adapter).toBeDefined();
    expect(mocks.configureRelayAdapter).toHaveBeenCalledTimes(1);
  });
});
