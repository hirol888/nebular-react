import React, { useEffect, useRef, useState } from 'react';
import { DefaultProps } from '@nebular-react/styles';
import { useOverlay, useFocusTrap } from '@nebular-react/hooks';
import { Card } from '../Card';
import { Button } from '../Button';
import { Icon } from '../Icon';
import useStyles from './Window.styles';
import { WindowConfig } from './types';
import { closeWindow } from './events';

export type WindowState = 'minimized' | 'maximized' | 'full-screen';

export interface WindowProps extends DefaultProps {
  windowConfig: WindowConfig;
  apply: () => void;
  paneRef: React.RefObject<HTMLDivElement | null>;
  globalWrapperRef: React.RefObject<HTMLDivElement | null>;
}

function Window(props: WindowProps) {
  const {
    windowConfig,
    apply,
    paneRef,
    globalWrapperRef,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = props;
  const {
    title,
    initialState,
    hasBackdrop,
    backdropClass,
    closeOnBackdropClick,
    closeOnEsc,
    windowClass,
    hasMinimizeButton,
    hasMaximizeButton,
    hasFullScreenButton,
    hasCloseButton,
    content
  } = windowConfig;
  const { classes, cx } = useStyles(null, { name: 'window' });

  const [windowState, setWindowState] = useState<WindowState>(initialState ?? 'full-screen');
  const previousWindowState = useRef<WindowState | undefined>(undefined);

  const close = () => {
    restoreFocus();
    closeWindow(windowConfig);
  };

  const { backdropElementRef, enableBlockStrategy, disableBlockStrategy } = useOverlay({
    apply,
    paneRef,
    paneWrapperRef: globalWrapperRef,
    opened: true,
    panelClass: windowClass,
    scrollStrategy: windowState === 'full-screen' ? 'block' : 'noop',
    hasBackdrop: windowState === 'full-screen' && hasBackdrop,
    backdropClass,
    backdropClickHandler: closeOnBackdropClick ? close : () => ({})
  });
  const {
    elementRef: ftElementRef,
    blurPreviousFocusedElement,
    focusInitialElement,
    restoreFocus
  } = useFocusTrap();

  const focusActionsRef = useRef({ blurPreviousFocusedElement, focusInitialElement });
  const closeRef = useRef(close);
  const overlayActionsRef = useRef({ enableBlockStrategy, disableBlockStrategy });

  focusActionsRef.current = { blurPreviousFocusedElement, focusInitialElement };
  closeRef.current = close;
  overlayActionsRef.current = { enableBlockStrategy, disableBlockStrategy };

  useEffect(() => {
    if (ftElementRef.current) {
      focusActionsRef.current.blurPreviousFocusedElement();
      focusActionsRef.current.focusInitialElement();
    }
  }, [ftElementRef]);

  useEffect(() => {
    if (!closeOnEsc) {
      return undefined;
    }

    const keyupListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeRef.current();
      }
    };

    document.addEventListener('keyup', keyupListener);

    return () => {
      document.removeEventListener('keyup', keyupListener);
    };
  }, [closeOnEsc]);

  useEffect(() => {
    if (windowState === 'full-screen') {
      overlayActionsRef.current.enableBlockStrategy();
      if (hasBackdrop) {
        backdropElementRef.current?.removeAttribute('hidden');
      }
    } else {
      overlayActionsRef.current.disableBlockStrategy();
      if (hasBackdrop) {
        backdropElementRef.current?.setAttribute('hidden', '');
      }
    }
  }, [windowState, hasBackdrop, backdropElementRef]);

  const minimize = () => {
    if (windowState === 'minimized' && previousWindowState.current) {
      setWindowState(previousWindowState.current);
    } else {
      previousWindowState.current = windowState;
      setWindowState('minimized');
    }
  };

  const maximize = () => {
    setWindowState('maximized');
  };

  const maximizeOrFullScreen = () => {
    if (windowState === 'minimized' && hasMaximizeButton) {
      setWindowState('maximized');
    } else {
      setWindowState('full-screen');
    }
  };

  return (
    <div className={cx(classes.windowContainer)} {...others}>
      <div
        className={cx(classes.root, {
          [classes.fullScreen]: windowState === 'full-screen',
          [classes.maximized]: windowState === 'maximized'
        })}
        ref={ftElementRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' && title ? title : 'Window'}
      >
        <Card>
          <Card.Header>
            {title && (
              <div className={cx(classes.title)} tabIndex={-1} data-focus-initial>
                {title}
              </div>
            )}
            <div className={cx(classes.buttons)}>
              {hasMinimizeButton && (
                <Button
                  appearance="ghost"
                  aria-label="Minimize window"
                  onClick={() => minimize()}
                  prefixIcon={<Icon icon="minus-outline" pack="nebular-essentials" />}
                />
              )}
              {hasMaximizeButton && windowState === 'full-screen' && (
                <Button
                  appearance="ghost"
                  aria-label="Maximize window"
                  onClick={() => maximize()}
                  prefixIcon={<Icon icon="collapse-outline" pack="nebular-essentials" />}
                />
              )}
              {hasFullScreenButton &&
                (windowState === 'minimized' || windowState === 'maximized') && (
                  <Button
                    appearance="ghost"
                    aria-label="Full screen window"
                    onClick={() => maximizeOrFullScreen()}
                    prefixIcon={<Icon icon="expand-outline" pack="nebular-essentials" />}
                  />
                )}
              {hasCloseButton && (
                <Button
                  appearance="ghost"
                  aria-label="Close window"
                  onClick={() => close()}
                  prefixIcon={<Icon icon="close-outline" pack="nebular-essentials" />}
                />
              )}
            </div>
          </Card.Header>
          {(windowState === 'maximized' || windowState === 'full-screen') && (
            <Card.Body>{content}</Card.Body>
          )}
        </Card>
      </div>
    </div>
  );
}

export { Window };
