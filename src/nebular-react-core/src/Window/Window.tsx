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
  paneRef: React.MutableRefObject<HTMLDivElement>;
  globalWrapperRef: React.MutableRefObject<HTMLDivElement>;
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

  const [windowState, setWindowState] = useState<WindowState>(initialState);
  const previousWindowState = useRef<WindowState>();

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

  useEffect(() => {
    if (ftElementRef.current) {
      blurPreviousFocusedElement();
      focusInitialElement();
    }
  }, [ftElementRef.current]);

  useEffect(() => {
    if (closeOnEsc) {
      document.addEventListener('keyup', keyupListener);
    }

    return () => {
      if (closeOnEsc) {
        document.removeEventListener('keyup', keyupListener);
      }
    };
  }, []);

  useEffect(() => {
    if (windowState === 'full-screen') {
      enableBlockStrategy();
      if (hasBackdrop) {
        backdropElementRef.current?.removeAttribute('hidden');
      }
    } else {
      disableBlockStrategy();
      if (hasBackdrop) {
        backdropElementRef.current?.setAttribute('hidden', '');
      }
    }
  }, [windowState]);

  const keyupListener = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      close();
    }
  };

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
                  onClick={() => minimize()}
                  prefixIcon={<Icon icon="minus-outline" pack="nebular-essentials" />}
                />
              )}
              {hasMaximizeButton && windowState === 'full-screen' && (
                <Button
                  appearance="ghost"
                  onClick={() => maximize()}
                  prefixIcon={<Icon icon="collapse-outline" pack="nebular-essentials" />}
                />
              )}
              {hasFullScreenButton &&
                (windowState === 'minimized' || windowState === 'maximized') && (
                  <Button
                    appearance="ghost"
                    onClick={() => maximizeOrFullScreen()}
                    prefixIcon={<Icon icon="expand-outline" pack="nebular-essentials" />}
                  />
                )}
              {hasCloseButton && (
                <Button
                  appearance="ghost"
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
