import type { DesktopCollaborationAdapter, DesktopCollaborator } from './Desktop.collaboration';
import type { DesktopLayoutSnapshot } from './Desktop.types';

/** Minimal surface implemented by the browser WebSocket and by test doubles. */
export interface DesktopWebSocketLike {
  readonly readyState: number;
  onopen: ((event: Event) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

export interface DesktopWebSocketReconnectOptions {
  /** Defaults to true. */
  enabled?: boolean;
  /** Delay before the first reconnect attempt. Defaults to 1000ms. */
  initialDelayMs?: number;
  /** Upper bound for the exponential delay. Defaults to 30000ms. */
  maxDelayMs?: number;
  /** Exponential factor. Defaults to 2. */
  multiplier?: number;
  /** Maximum reconnect attempts; defaults to unlimited. */
  maxAttempts?: number;
  /**
   * Optional deterministic jitter source. Receives the zero-based attempt index and
   * returns a factor between 0 and 1. The final delay is `base * (0.5 + factor * 0.5)`
   * (equal jitter), so tests can inject a stable value instead of `Math.random`.
   */
  jitter?: (attempt: number) => number;
}

export interface DesktopCollaborationWireMessage {
  type: 'presence' | 'layout' | 'ping';
  sender: string;
  presence?: DesktopCollaborator;
  layout?: DesktopLayoutSnapshot;
  sentAt: string;
}

export interface DesktopCollaborationCodec {
  /** Serializes a message for the socket (defaults to JSON). */
  encode(message: DesktopCollaborationWireMessage): string;
  /** Parses an incoming socket payload; return null for malformed messages. */
  decode(data: unknown): DesktopCollaborationWireMessage | null;
}

export interface DesktopWebSocketUrlContext {
  /** Zero-based reconnect attempt index; `0` for the first connection. */
  attempt: number;
  /** The local collaborator id configured for the adapter. */
  selfId: string;
}

/** A fixed URL or a factory evaluated on every connection attempt. */
export type DesktopWebSocketUrl = string | ((context: DesktopWebSocketUrlContext) => string);

export interface DesktopWebSocketCollaborationOptions {
  selfId: string;
  protocols?: string | string[];
  /**
   * Resolves the subprotocols on every connection attempt, overriding `protocols`.
   * Useful for rotating access tokens without recreating the adapter.
   */
  getProtocols?(): string | string[] | undefined;
  /** Override used by tests and SSR environments. Falls back to the global WebSocket. */
  WebSocketImpl?: new (url: string, protocols?: string | string[]) => DesktopWebSocketLike;
  reconnect?: DesktopWebSocketReconnectOptions;
  /** Sends `ping` messages at this interval while connected. Disabled by default. */
  heartbeatMs?: number;
  /** Custom wire format (MessagePack, base64, protobuf-as-base64, etc.). */
  codec?: DesktopCollaborationCodec;
}

interface IncomingSocketMessage {
  type?: unknown;
  sender?: unknown;
  presence?: unknown;
  layout?: unknown;
}

const WS_CONNECTING = 0;
const WS_OPEN = 1;
const DEFAULT_INITIAL_DELAY_MS = 1000;
const DEFAULT_MAX_DELAY_MS = 30000;
const DEFAULT_MULTIPLIER = 2;

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function parseIncomingMessage(data: unknown): IncomingSocketMessage | null {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data) as unknown;

      return parsed && typeof parsed === 'object' ? (parsed as IncomingSocketMessage) : null;
    } catch {
      return null;
    }
  }

  return data && typeof data === 'object' ? (data as IncomingSocketMessage) : null;
}

function isCollaborator(value: unknown): value is DesktopCollaborator {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<DesktopCollaborator>;
  return typeof candidate.id === 'string' && candidate.id.length > 0;
}

function isLayoutSnapshot(value: unknown): value is DesktopLayoutSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<DesktopLayoutSnapshot>;
  return candidate.version === 2 && Array.isArray(candidate.windows);
}

/**
 * Multi-user collaboration transport backed by a WebSocket.
 *
 * The wire format is JSON: `{ type: 'presence' | 'layout' | 'ping', sender, presence?,
 * layout?, sentAt }`. Messages sent by `selfId` are ignored. While offline the adapter
 * keeps the last presence and the last layout, replaying both after a reconnect.
 */
export function createWebSocketCollaboration(
  url: DesktopWebSocketUrl,
  options: DesktopWebSocketCollaborationOptions
): DesktopCollaborationAdapter {
  const { selfId, protocols, getProtocols, heartbeatMs: heartbeatOption, codec } = options;
  const reconnectOptions = options.reconnect ?? {};
  const reconnectEnabled = reconnectOptions.enabled !== false;
  const initialDelayMs = Math.max(
    0,
    finiteOr(reconnectOptions.initialDelayMs, DEFAULT_INITIAL_DELAY_MS)
  );
  const maxDelayMs = Math.max(0, finiteOr(reconnectOptions.maxDelayMs, DEFAULT_MAX_DELAY_MS));
  const multiplierCandidate = finiteOr(reconnectOptions.multiplier, DEFAULT_MULTIPLIER);
  const multiplier = multiplierCandidate > 0 ? multiplierCandidate : DEFAULT_MULTIPLIER;
  const maxAttemptsCandidate = reconnectOptions.maxAttempts;
  const maxAttempts =
    typeof maxAttemptsCandidate === 'number' && Number.isFinite(maxAttemptsCandidate)
      ? Math.max(0, maxAttemptsCandidate)
      : Number.POSITIVE_INFINITY;
  const heartbeatMs = Math.max(0, finiteOr(heartbeatOption, 0));
  const WebSocketImpl =
    options.WebSocketImpl ?? (typeof WebSocket !== 'undefined' ? WebSocket : undefined);

  const presenceListeners = new Set<(presence: DesktopCollaborator) => void>();
  const layoutListeners = new Set<(snapshot: DesktopLayoutSnapshot) => void>();

  let socket: DesktopWebSocketLike | null = null;
  let open = false;
  let manualDisconnect = false;
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let lastPresence: DesktopCollaborator | null = null;
  let pendingLayout: DesktopLayoutSnapshot | null = null;

  const resolveUrl = (): string =>
    typeof url === 'string' ? url : url({ attempt: reconnectAttempts, selfId });

  const resolveProtocols = (): string | string[] | undefined => {
    if (!getProtocols) {
      return protocols;
    }

    try {
      return getProtocols();
    } catch {
      return undefined;
    }
  };

  const clearReconnectTimer = () => {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const sendMessage = (message: DesktopCollaborationWireMessage): boolean => {
    const target = socket;

    if (!target || !open || target.readyState !== WS_OPEN) {
      return false;
    }

    try {
      target.send(codec ? codec.encode(message) : JSON.stringify(message));
      return true;
    } catch {
      return false;
    }
  };

  const sendPresence = (presence: DesktopCollaborator) => {
    sendMessage({
      type: 'presence',
      sender: selfId,
      presence,
      sentAt: new Date().toISOString()
    });
  };

  const startHeartbeat = () => {
    stopHeartbeat();

    if (heartbeatMs <= 0) {
      return;
    }

    heartbeatTimer = setInterval(() => {
      sendMessage({ type: 'ping', sender: selfId, sentAt: new Date().toISOString() });
    }, heartbeatMs);
  };

  const flushQueuedMessages = () => {
    if (lastPresence) {
      sendPresence(lastPresence);
    }

    if (
      pendingLayout &&
      sendMessage({
        type: 'layout',
        sender: selfId,
        layout: pendingLayout,
        sentAt: new Date().toISOString()
      })
    ) {
      pendingLayout = null;
    }
  };

  const scheduleReconnect = () => {
    if (manualDisconnect || !reconnectEnabled || reconnectTimer !== null) {
      return;
    }

    if (reconnectAttempts >= maxAttempts) {
      return;
    }

    const exponent = reconnectAttempts;
    const baseDelay = Math.min(initialDelayMs * multiplier ** exponent, maxDelayMs);
    let delay = baseDelay;

    if (reconnectOptions.jitter) {
      let factor = 0;

      try {
        factor = reconnectOptions.jitter(exponent);
      } catch {
        factor = 0;
      }

      const normalizedFactor = Number.isFinite(factor) ? Math.min(1, Math.max(0, factor)) : 0;
      delay = baseDelay * (0.5 + normalizedFactor * 0.5);
    }

    reconnectAttempts += 1;
    reconnectTimer = setTimeout(
      () => {
        reconnectTimer = null;

        if (!manualDisconnect) {
          openSocket();
        }
      },
      Math.max(0, Math.round(delay))
    );
  };

  const handleDisconnected = (source: DesktopWebSocketLike) => {
    if (socket !== source) {
      return;
    }

    socket = null;
    open = false;
    stopHeartbeat();

    if (!manualDisconnect) {
      scheduleReconnect();
    }
  };

  const openSocket = () => {
    if (!WebSocketImpl) {
      return;
    }

    if (socket && (socket.readyState === WS_CONNECTING || socket.readyState === WS_OPEN)) {
      return;
    }

    let nextSocket: DesktopWebSocketLike;

    try {
      // Resolved on every attempt so hosts can refresh auth tokens or endpoints.
      const nextUrl = resolveUrl();
      const nextProtocols = resolveProtocols();

      nextSocket =
        typeof nextProtocols === 'undefined'
          ? new WebSocketImpl(nextUrl)
          : new WebSocketImpl(nextUrl, nextProtocols);
    } catch {
      scheduleReconnect();
      return;
    }

    socket = nextSocket;
    open = false;

    nextSocket.onopen = () => {
      if (socket !== nextSocket) {
        return;
      }

      open = true;
      reconnectAttempts = 0;
      startHeartbeat();
      flushQueuedMessages();
    };

    nextSocket.onmessage = (event: MessageEvent) => {
      const message = codec ? codec.decode(event?.data) : parseIncomingMessage(event?.data);

      // Messages without a sender are malformed; own messages are echoes.
      if (!message || typeof message.sender !== 'string' || message.sender === selfId) {
        return;
      }

      if (message.type === 'presence' && isCollaborator(message.presence)) {
        presenceListeners.forEach((listener) => listener(message.presence as DesktopCollaborator));
      }

      if (message.type === 'layout' && isLayoutSnapshot(message.layout)) {
        layoutListeners.forEach((listener) => listener(message.layout as DesktopLayoutSnapshot));
      }
    };

    nextSocket.onclose = () => {
      handleDisconnected(nextSocket);
    };

    nextSocket.onerror = () => {
      handleDisconnected(nextSocket);

      try {
        nextSocket.close();
      } catch {
        // Browsers may throw when closing an already-closed socket; nothing to do.
      }
    };
  };

  return {
    connect() {
      manualDisconnect = false;

      if (socket && (socket.readyState === WS_CONNECTING || socket.readyState === WS_OPEN)) {
        return;
      }

      if (reconnectTimer !== null) {
        return;
      }

      reconnectAttempts = 0;
      openSocket();
    },
    disconnect() {
      manualDisconnect = true;
      clearReconnectTimer();
      stopHeartbeat();

      const target = socket;
      socket = null;
      open = false;
      lastPresence = null;
      pendingLayout = null;
      reconnectAttempts = 0;
      presenceListeners.clear();
      layoutListeners.clear();

      if (target) {
        try {
          target.close(1000, 'Collaboration disconnected');
        } catch {
          // Ignore transports that cannot close gracefully.
        }
      }
    },
    broadcastPresence(presence) {
      if (manualDisconnect) {
        return;
      }

      lastPresence = presence;

      if (open) {
        sendPresence(presence);
      }
    },
    subscribePresence(listener) {
      presenceListeners.add(listener);

      return () => {
        presenceListeners.delete(listener);
      };
    },
    broadcastLayout(snapshot) {
      if (
        sendMessage({
          type: 'layout',
          sender: selfId,
          layout: snapshot,
          sentAt: new Date().toISOString()
        })
      ) {
        pendingLayout = null;
        return;
      }

      if (!manualDisconnect) {
        // Bounded queue: only the latest layout is replayed after reconnecting.
        pendingLayout = snapshot;
      }
    },
    subscribeLayout(listener) {
      layoutListeners.add(listener);

      return () => {
        layoutListeners.delete(listener);
      };
    }
  };
}
