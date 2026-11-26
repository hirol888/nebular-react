import {
  createWebSocketCollaboration,
  type DesktopCollaborator,
  type DesktopLayoutSnapshot,
  type DesktopWebSocketLike
} from '@nebular-react/core';

class FakeWebSocket implements DesktopWebSocketLike {
  static instances: FakeWebSocket[] = [];

  static reset() {
    FakeWebSocket.instances = [];
  }

  readonly url: string;

  readonly protocols?: string | string[];

  readyState = 0;

  sent: string[] = [];

  closeCalls = 0;

  onopen: ((event: Event) => void) | null = null;

  onclose: ((event: CloseEvent) => void) | null = null;

  onerror: ((event: Event) => void) | null = null;

  onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;
    FakeWebSocket.instances.push(this);
  }

  send(data: string) {
    if (this.readyState !== 1) {
      throw new Error('WebSocket is not open');
    }

    this.sent.push(data);
  }

  close(_code?: number, _reason?: string) {
    this.closeCalls += 1;

    if (this.readyState === 3) {
      return;
    }

    this.readyState = 3;
    this.onclose?.(new Event('close') as CloseEvent);
  }

  open() {
    this.readyState = 1;
    this.onopen?.(new Event('open'));
  }

  serverClose() {
    this.readyState = 3;
    this.onclose?.(new Event('close') as CloseEvent);
  }

  fail() {
    this.onerror?.(new Event('error'));
  }

  receive(data: unknown) {
    this.onmessage?.(
      new MessageEvent('message', {
        data: typeof data === 'string' ? data : JSON.stringify(data)
      })
    );
  }
}

function sentMessages(socket: FakeWebSocket) {
  return socket.sent.map((message) => JSON.parse(message) as Record<string, unknown>);
}

function layout(savedAt: string, x = 0): DesktopLayoutSnapshot {
  return {
    version: 2,
    savedAt,
    windows: [
      {
        id: 'notes',
        x,
        y: 10,
        width: 320,
        height: 240,
        minimized: false,
        maximized: false,
        zIndex: 1
      }
    ]
  };
}

describe('createWebSocketCollaboration', () => {
  beforeEach(() => {
    FakeWebSocket.reset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('connects idempotently and flushes the latest presence on open', () => {
    const adapter = createWebSocketCollaboration('wss://example.test/desktop', {
      selfId: 'alice',
      protocols: ['nebular'],
      WebSocketImpl: FakeWebSocket
    });

    adapter.connect();
    adapter.connect();

    expect(FakeWebSocket.instances).toHaveLength(1);

    const socket = FakeWebSocket.instances[0];
    expect(socket.url).toBe('wss://example.test/desktop');
    expect(socket.protocols).toEqual(['nebular']);

    adapter.broadcastPresence({ id: 'alice', name: 'Alice' });
    expect(socket.sent).toHaveLength(0);

    socket.open();
    adapter.connect();
    expect(FakeWebSocket.instances).toHaveLength(1);

    const messages = sentMessages(socket);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      type: 'presence',
      sender: 'alice',
      presence: { id: 'alice', name: 'Alice' }
    });
    expect(typeof messages[0].sentAt).toBe('string');
  });

  it('delivers remote presence/layout and ignores self, malformed and invalid messages', () => {
    const adapter = createWebSocketCollaboration('wss://example.test/desktop', {
      selfId: 'alice',
      WebSocketImpl: FakeWebSocket
    });
    const presenceListener = jest.fn();
    const layoutListener = jest.fn();
    const presenceUnsubscribe = adapter.subscribePresence(presenceListener);
    const layoutUnsubscribe = adapter.subscribeLayout?.(layoutListener);

    adapter.connect();
    const socket = FakeWebSocket.instances[0];
    socket.open();

    const remotePresence: DesktopCollaborator = { id: 'bob', name: 'Bob' };
    const remoteLayout = layout('2026-01-01T00:00:00.000Z');

    expect(() => {
      socket.receive({ type: 'presence', sender: 'bob', presence: remotePresence });
      socket.receive({ type: 'layout', sender: 'bob', layout: remoteLayout });
    }).not.toThrow();

    expect(presenceListener).toHaveBeenCalledWith(remotePresence);
    expect(layoutListener).toHaveBeenCalledWith(remoteLayout);

    expect(() => {
      socket.receive({ type: 'presence', sender: 'alice', presence: { id: 'alice' } });
      socket.receive({ type: 'layout', sender: 'alice', layout: remoteLayout });
      socket.receive('{not-json');
      socket.receive('null');
      socket.receive({ type: 'presence', presence: { id: 'nobody' } });
      socket.receive({ type: 'presence', sender: 'bob', presence: { name: 'No id' } });
      socket.receive({ type: 'layout', sender: 'bob', layout: { version: 1, windows: [] } });
      socket.receive({ type: 'layout', sender: 'bob', layout: { version: 2, windows: 'nope' } });
      socket.receive({ type: 'unknown', sender: 'bob' });
    }).not.toThrow();

    expect(presenceListener).toHaveBeenCalledTimes(1);
    expect(layoutListener).toHaveBeenCalledTimes(1);

    presenceUnsubscribe();
    layoutUnsubscribe?.();

    socket.receive({ type: 'presence', sender: 'bob', presence: remotePresence });
    expect(presenceListener).toHaveBeenCalledTimes(1);
  });

  it('reconnects with exponential backoff and deterministic jitter', () => {
    const adapter = createWebSocketCollaboration('wss://example.test/desktop', {
      selfId: 'alice',
      WebSocketImpl: FakeWebSocket,
      reconnect: {
        initialDelayMs: 100,
        maxDelayMs: 1000,
        multiplier: 2,
        jitter: () => 0.5
      }
    });

    adapter.connect();
    expect(FakeWebSocket.instances).toHaveLength(1);

    FakeWebSocket.instances[0].serverClose();
    jest.advanceTimersByTime(74);
    expect(FakeWebSocket.instances).toHaveLength(1);

    // attempt 0: 100 * (0.5 + 0.5 * 0.5) = 75ms
    jest.advanceTimersByTime(1);
    expect(FakeWebSocket.instances).toHaveLength(2);

    FakeWebSocket.instances[1].serverClose();
    jest.advanceTimersByTime(149);
    expect(FakeWebSocket.instances).toHaveLength(2);

    // attempt 1: 200 * (0.5 + 0.5 * 0.5) = 150ms
    jest.advanceTimersByTime(1);
    expect(FakeWebSocket.instances).toHaveLength(3);

    FakeWebSocket.instances[2].open();
    FakeWebSocket.instances[2].serverClose();
    jest.advanceTimersByTime(74);
    expect(FakeWebSocket.instances).toHaveLength(3);

    // Opening resets the attempts, so the delay returns to 75ms.
    jest.advanceTimersByTime(1);
    expect(FakeWebSocket.instances).toHaveLength(4);
  });

  it('stops reconnecting after maxAttempts', () => {
    const adapter = createWebSocketCollaboration('wss://example.test/desktop', {
      selfId: 'alice',
      WebSocketImpl: FakeWebSocket,
      reconnect: { initialDelayMs: 10, maxAttempts: 2 }
    });

    adapter.connect();
    FakeWebSocket.instances[0].serverClose();
    jest.advanceTimersByTime(10);
    expect(FakeWebSocket.instances).toHaveLength(2);

    FakeWebSocket.instances[1].serverClose();
    jest.advanceTimersByTime(20);
    expect(FakeWebSocket.instances).toHaveLength(3);

    FakeWebSocket.instances[2].serverClose();
    jest.advanceTimersByTime(1000);
    expect(FakeWebSocket.instances).toHaveLength(3);
  });

  it('resends presence and only the latest queued layout after reconnecting', () => {
    const adapter = createWebSocketCollaboration('wss://example.test/desktop', {
      selfId: 'alice',
      WebSocketImpl: FakeWebSocket,
      reconnect: { initialDelayMs: 100 }
    });

    adapter.connect();
    const first = FakeWebSocket.instances[0];
    first.open();

    adapter.broadcastPresence({ id: 'alice', name: 'Alice' });
    adapter.broadcastLayout(layout('2026-01-01T00:00:01.000Z', 1));
    expect(sentMessages(first).map((message) => message.type)).toEqual(['presence', 'layout']);

    first.serverClose();
    adapter.broadcastLayout(layout('2026-01-01T00:00:02.000Z', 2));
    adapter.broadcastLayout(layout('2026-01-01T00:00:03.000Z', 3));

    jest.advanceTimersByTime(100);
    expect(FakeWebSocket.instances).toHaveLength(2);

    const second = FakeWebSocket.instances[1];
    second.open();

    const messages = sentMessages(second);
    expect(messages.map((message) => message.type)).toEqual(['presence', 'layout']);
    expect(messages[0].presence).toMatchObject({ id: 'alice', name: 'Alice' });
    expect(messages[1].layout).toMatchObject({ savedAt: '2026-01-01T00:00:03.000Z' });
  });

  it('sends heartbeats only while connected', () => {
    const adapter = createWebSocketCollaboration('wss://example.test/desktop', {
      selfId: 'alice',
      WebSocketImpl: FakeWebSocket,
      heartbeatMs: 100
    });

    adapter.connect();
    const socket = FakeWebSocket.instances[0];
    socket.open();

    jest.advanceTimersByTime(200);
    const messages = sentMessages(socket);
    expect(messages).toHaveLength(2);
    expect(messages.every((message) => message.type === 'ping' && message.sender === 'alice')).toBe(
      true
    );

    adapter.disconnect();
    jest.advanceTimersByTime(500);
    expect(sentMessages(socket)).toHaveLength(2);
  });

  it('disconnect clears timers and listeners, closes the socket and prevents reconnect', () => {
    const adapter = createWebSocketCollaboration('wss://example.test/desktop', {
      selfId: 'alice',
      WebSocketImpl: FakeWebSocket,
      reconnect: { initialDelayMs: 10 },
      heartbeatMs: 50
    });
    const presenceListener = jest.fn();
    const layoutListener = jest.fn();

    adapter.subscribePresence(presenceListener);
    adapter.subscribeLayout?.(layoutListener);

    adapter.connect();
    const socket = FakeWebSocket.instances[0];
    socket.open();

    adapter.disconnect();

    expect(socket.readyState).toBe(3);
    expect(socket.closeCalls).toBe(1);

    jest.advanceTimersByTime(10000);
    expect(FakeWebSocket.instances).toHaveLength(1);

    expect(() => {
      socket.receive({ type: 'presence', sender: 'bob', presence: { id: 'bob' } });
      socket.receive({ type: 'layout', sender: 'bob', layout: layout('2026-01-01T00:00:00.000Z') });
      adapter.broadcastPresence({ id: 'alice' });
      adapter.broadcastLayout?.(layout('2026-01-01T00:00:00.000Z'));
    }).not.toThrow();

    expect(presenceListener).not.toHaveBeenCalled();
    expect(layoutListener).not.toHaveBeenCalled();
    expect(sentMessages(socket)).toHaveLength(0);
  });

  it('treats a transport error as a disconnect without throwing', () => {
    const adapter = createWebSocketCollaboration('wss://example.test/desktop', {
      selfId: 'alice',
      WebSocketImpl: FakeWebSocket,
      reconnect: { initialDelayMs: 25 }
    });

    adapter.connect();
    const socket = FakeWebSocket.instances[0];

    expect(() => socket.fail()).not.toThrow();
    expect(socket.closeCalls).toBe(1);

    jest.advanceTimersByTime(25);
    expect(FakeWebSocket.instances).toHaveLength(2);
  });
});
