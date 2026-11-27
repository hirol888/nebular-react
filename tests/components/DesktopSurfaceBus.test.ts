import { createDesktopSurfaceBus, type DesktopLayoutSnapshot } from '@nebular-react/core';

class FakeBroadcastChannel {
  static instances: FakeBroadcastChannel[] = [];

  readonly name: string;

  readonly listeners = new Set<(event: MessageEvent) => void>();

  closed = false;

  constructor(name: string) {
    this.name = name;
    FakeBroadcastChannel.instances.push(this);
  }

  addEventListener(type: string, listener: EventListener) {
    if (type === 'message') {
      this.listeners.add(listener as (event: MessageEvent) => void);
    }
  }

  postMessage(data: unknown) {
    this.listeners.forEach((listener) => listener(new MessageEvent('message', { data })));
  }

  close() {
    this.closed = true;
  }

  emit(data: unknown) {
    this.postMessage(data);
  }
}

describe('createDesktopSurfaceBus', () => {
  const original = (globalThis as { BroadcastChannel?: unknown }).BroadcastChannel;

  beforeEach(() => {
    FakeBroadcastChannel.instances = [];
    (globalThis as { BroadcastChannel?: unknown }).BroadcastChannel = FakeBroadcastChannel;
  });

  afterEach(() => {
    (globalThis as { BroadcastChannel?: unknown }).BroadcastChannel = original;
  });

  it('sends snapshots and structured commands independently', () => {
    const bus = createDesktopSurfaceBus('test-surface');
    const snapshots = jest.fn();
    const commands = jest.fn();
    const unsubscribeSnapshot = bus.subscribe(snapshots);
    const unsubscribeCommand = bus.subscribeCommand(commands);
    const snapshot: DesktopLayoutSnapshot = { version: 2, windows: [] };

    bus.send(snapshot);
    bus.sendCommand({ type: 'focus', windowId: 'w1' });
    bus.sendCommand({ type: 'move-window', windowId: 'w1', displayId: 'right' });

    expect(snapshots).toHaveBeenCalledWith(snapshot);
    expect(commands).toHaveBeenNthCalledWith(1, { type: 'focus', windowId: 'w1' });
    expect(commands).toHaveBeenNthCalledWith(2, {
      type: 'move-window',
      windowId: 'w1',
      displayId: 'right'
    });

    unsubscribeSnapshot();
    unsubscribeCommand();
    bus.send(snapshot);
    expect(snapshots).toHaveBeenCalledTimes(1);
  });

  it('is a no-op without BroadcastChannel and closes the channel', () => {
    const bus = createDesktopSurfaceBus('test-surface');
    const channel = FakeBroadcastChannel.instances[0];

    expect(channel.name).toBe('test-surface');
    bus.close();
    expect(channel.closed).toBe(true);

    delete (globalThis as { BroadcastChannel?: unknown }).BroadcastChannel;
    const fallback = createDesktopSurfaceBus('fallback');

    expect(() => {
      fallback.send({ version: 2, windows: [] });
      fallback.sendCommand({ type: 'close', windowId: 'w' });
      fallback.subscribe(() => undefined)();
      fallback.subscribeCommand(() => undefined)();
      fallback.close();
    }).not.toThrow();
  });
});
