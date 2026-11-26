import type { DesktopLayoutSnapshot } from './Desktop.types';

export interface DesktopCollaborator {
  id: string;
  name?: string;
  color?: string;
  activeWindowId?: string;
  workspaceId?: string;
  lastSeenAt?: string;
}

export interface DesktopCollaborationAdapter {
  connect(): void;
  disconnect(): void;
  broadcastPresence(presence: DesktopCollaborator): void;
  subscribePresence(listener: (presence: DesktopCollaborator) => void): () => void;
  broadcastLayout?(snapshot: DesktopLayoutSnapshot): void;
  subscribeLayout?(listener: (snapshot: DesktopLayoutSnapshot) => void): () => void;
}

interface CollaborationMessage {
  type: 'presence' | 'layout';
  sender: string;
  presence?: DesktopCollaborator;
  layout?: DesktopLayoutSnapshot;
}

/**
 * Same-origin collaboration adapter based on BroadcastChannel.
 * For multi-user collaboration replace this transport with a WebSocket/SignalR adapter
 * that implements the same interface.
 */
export function createBroadcastCollaboration(
  selfId: string,
  channelName = 'nebular-desktop-collaboration'
): DesktopCollaborationAdapter {
  const presenceListeners = new Set<(presence: DesktopCollaborator) => void>();
  const layoutListeners = new Set<(snapshot: DesktopLayoutSnapshot) => void>();
  const channel =
    typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(channelName) : null;

  const post = (message: CollaborationMessage) => {
    channel?.postMessage(message);
  };

  channel?.addEventListener('message', (event) => {
    const message = event.data as CollaborationMessage;

    if (!message || message.sender === selfId) {
      return;
    }

    if (message.type === 'presence' && message.presence) {
      presenceListeners.forEach((listener) => listener(message.presence!));
    }

    if (message.type === 'layout' && message.layout) {
      layoutListeners.forEach((listener) => listener(message.layout!));
    }
  });

  return {
    connect() {},
    disconnect() {
      presenceListeners.clear();
      layoutListeners.clear();
      channel?.close();
    },
    broadcastPresence(presence) {
      post({ type: 'presence', sender: selfId, presence });
    },
    subscribePresence(listener) {
      presenceListeners.add(listener);
      return () => presenceListeners.delete(listener);
    },
    broadcastLayout(snapshot) {
      post({ type: 'layout', sender: selfId, layout: snapshot });
    },
    subscribeLayout(listener) {
      layoutListeners.add(listener);
      return () => layoutListeners.delete(listener);
    }
  };
}
