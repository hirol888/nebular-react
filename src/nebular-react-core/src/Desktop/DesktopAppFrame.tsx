import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { DefaultProps, Selectors, createStyles } from '@nebular-react/styles';

export type DesktopAppFrameSandboxToken =
  | 'allow-downloads'
  | 'allow-forms'
  | 'allow-modals'
  | 'allow-popups'
  | 'allow-popups-to-escape-sandbox'
  | 'allow-presentation'
  | 'allow-same-origin'
  | 'allow-scripts'
  | 'allow-top-navigation-by-user-activation';

export interface DesktopAppFrameHandle {
  /** Posts a message to the embedded app, only after validating its origin. */
  postMessage(message: unknown, targetOrigin?: string): void;
  getFrame(): HTMLIFrameElement | null;
}

export interface DesktopAppFrameProps extends DefaultProps<DesktopAppFrameStylesNames> {
  src: string;
  title: string;
  appId?: string;
  /** Sandbox tokens. Defaults to `allow-scripts` only (no same-origin). */
  sandbox?: DesktopAppFrameSandboxToken[];
  allow?: string;
  loading?: 'lazy' | 'eager';
  /** Origins allowed to post messages to the host. Empty blocks every message. */
  allowedOrigins?: string[];
  onMessage?(message: unknown, origin: string): void;
  onLoad?(): void;
  onError?(): void;
}

const DEFAULT_SANDBOX: DesktopAppFrameSandboxToken[] = ['allow-scripts'];

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'relative',
    display: 'block',
    width: '100%',
    height: '100%',
    border: 0,
    backgroundColor: 'var(--desktop-app-frame-background, transparent)'
  }
}));

export type DesktopAppFrameStylesNames = Selectors<typeof useStyles>;

/**
 * Sandboxed iframe used to host third-party Desktop apps. By default the frame
 * cannot access the host origin, cookies or storage; add `allow-same-origin` only
 * for trusted apps.
 */
export const DesktopAppFrame = forwardRef<DesktopAppFrameHandle, DesktopAppFrameProps>(
  (props, ref) => {
    const {
      src,
      title,
      appId,
      sandbox = DEFAULT_SANDBOX,
      allow,
      loading = 'lazy',
      allowedOrigins = [],
      onMessage,
      onLoad,
      onError,
      className,
      classNames,
      styles,
      unstyled,
      ...others
    } = props;
    const { classes, cx } = useStyles(undefined, {
      name: 'desktop-app-frame',
      classNames,
      styles,
      unstyled
    });
    const frameRef = useRef<HTMLIFrameElement | null>(null);
    const origins = useRef(allowedOrigins);
    origins.current = allowedOrigins;
    const messageHandler = useRef(onMessage);
    messageHandler.current = onMessage;

    const isAllowedOrigin = useCallback((origin: string) => {
      if (origins.current.length === 0) {
        return false;
      }

      return origins.current.some((allowed) => allowed === '*' || allowed === origin);
    }, []);

    useEffect(() => {
      if (typeof window === 'undefined') {
        return undefined;
      }

      const listener = (event: MessageEvent) => {
        if (event.source !== frameRef.current?.contentWindow) {
          return;
        }

        if (!isAllowedOrigin(event.origin)) {
          return;
        }

        messageHandler.current?.(event.data, event.origin);
      };

      window.addEventListener('message', listener);
      return () => window.removeEventListener('message', listener);
    }, [isAllowedOrigin]);

    useImperativeHandle(
      ref,
      () => ({
        postMessage(message, targetOrigin) {
          const frame = frameRef.current;
          if (!frame?.contentWindow) {
            return;
          }

          const origin = targetOrigin ?? origins.current.find((value) => value !== '*') ?? '';
          if (!origin) {
            return;
          }

          frame.contentWindow.postMessage(message, origin);
        },
        getFrame: () => frameRef.current
      }),
      []
    );

    return (
      <iframe
        {...others}
        ref={frameRef}
        className={cx(classes.root, className)}
        title={title}
        src={src}
        sandbox={sandbox.join(' ')}
        allow={allow}
        loading={loading}
        referrerPolicy="no-referrer"
        data-desktop-app-frame={appId ?? 'true'}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }
);

DesktopAppFrame.displayName = 'DesktopAppFrame';
