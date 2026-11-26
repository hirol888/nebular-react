import { createBroadcastCollaboration } from '@nebular-react/core';

describe('Desktop collaboration', () => {
  it('supports presence and layout subscriptions without throwing when BroadcastChannel is absent', () => {
    const adapter = createBroadcastCollaboration('self');
    const presence = jest.fn();
    const layout = jest.fn();
    const unsubscribePresence = adapter.subscribePresence(presence);
    const unsubscribeLayout = adapter.subscribeLayout?.(layout);

    expect(() => adapter.connect()).not.toThrow();
    expect(() => adapter.broadcastPresence({ id: 'self', name: 'Me' })).not.toThrow();
    expect(() =>
      adapter.broadcastLayout?.({
        version: 2,
        windows: []
      })
    ).not.toThrow();

    unsubscribePresence();
    unsubscribeLayout?.();
    expect(() => adapter.disconnect()).not.toThrow();
    expect(presence).not.toHaveBeenCalled();
    expect(layout).not.toHaveBeenCalled();
  });
});
