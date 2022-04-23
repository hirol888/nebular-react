import { ESCAPE, OverlayReference, Portal } from 'libs/nebular-react/src/core/cdk';
import {
  useBlockOrNoopScrollStrategy,
  useGlobalPositionStrategy,
  useOverlay
} from 'libs/nebular-react/src/core/cdk/hooks';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { NbDialogConfig } from './dialog-config';
import * as _ from 'lodash';
import { useObservable, useSubscription } from 'observable-hooks';
import { filter, fromEvent, switchMap } from 'rxjs';
import { NbDialogContainer, NbDialogContainerRef } from './DialogContainer';

export type NbDialogRef = {
  open: (config?: NbDialogConfig) => void;
  close: (res?: any) => void;
};

export type NbDialogProps = {
  config: NbDialogConfig;
};

const NbDialog = React.forwardRef<NbDialogRef, NbDialogProps & React.HTMLAttributes<HTMLElement>>(
  ({ config, children }, ref) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [rendered, setRendered] = useState<boolean>(false);
    const [paneId] = useState<string>(_.uniqueId('cdk-overlay-'));
    const paneRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<NbDialogContainerRef>(null);
    const [configValue, setConfigValue] = useState<NbDialogConfig>(config);
    const prevConfig = useRef<NbDialogConfig>(config);

    useEffect(() => {
      setRendered(true);
    }, []);

    /**
     * this effect detect if newConfig is passed in open method
     */
    useEffect(() => {
      if (rendered) {
        // if hasScroll is not changed, open overlay
        // if hasScroll is changed, do not open overlay because it will create a new
        // overlay, which needs another useEffect to handle
        if (prevConfig.current?.hasScroll === configValue.hasScroll) {
          setIsOpen(true);
          prevConfig.current = configValue;
        }
      }
    }, [configValue]);

    useImperativeHandle(ref, () => ({
      open: (newConfig?: NbDialogConfig) => {
        // If newConfig has value, do not open portal directly
        // Open portal after configValue is update in another useEffect
        // If hasScroll is changed, it needs a useEffect to detect overlay changes then open portal
        if (newConfig) {
          // change config with new value
          setConfigValue(newConfig);
        } else {
          setIsOpen(true);
        }
      },
      close: () => close()
    }));

    const close = () => {
      containerRef.current?.restoreFocus();
      overlayRef?.detach();
      setIsOpen(false);
    };

    const positionStrategy = useGlobalPositionStrategy(rendered);
    const scrollStrategy = useBlockOrNoopScrollStrategy(configValue.hasScroll);

    const overlayRef = useOverlay(
      rendered,
      configValue.dialogClass,
      positionStrategy,
      scrollStrategy,
      configValue.hasBackdrop,
      configValue.backdropClass
    );

    /**
     * This detects if overlay is changed.
     * If hasScroll is changed, it will create a new scroll strategy therefore create a new overlay
     * Open portal after the new overlay is created to avoid flickering
     */
    useEffect(() => {
      if (prevConfig.current && prevConfig.current?.hasScroll !== configValue.hasScroll) {
        setIsOpen(true);
        prevConfig.current = configValue;
      }
    }, [overlayRef]);

    useBackdropClickListener(configValue, overlayRef, close);
    useCloseOnEscListener(configValue, close);

    return (
      <Portal overlayRef={overlayRef} isOpen={isOpen} paneRef={paneRef}>
        <div ref={paneRef} id={paneId} className="cdk-overlay-pane">
          <NbDialogContainer config={configValue} ref={containerRef}>
            {children}
          </NbDialogContainer>
        </div>
      </Portal>
    );
  }
);

function useBackdropClickListener(config: NbDialogConfig, overlayRef: OverlayReference | null, close: () => void) {
  const backdropClick$ = useObservable(
    (input$) =>
      input$.pipe(
        filter(([overlayRefValue]) => !!overlayRefValue),
        switchMap(([overlayRefValue, closeOnBackdropClickValue]) =>
          overlayRefValue!.backdropClick().pipe(filter(() => closeOnBackdropClickValue))
        )
      ),
    [overlayRef, config.closeOnBackdropClick]
  );
  useSubscription(backdropClick$, () => close());
}

function useCloseOnEscListener(config: NbDialogConfig, close: () => void) {
  const closeOnEsc$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([closeOnEscValue]) =>
          fromEvent<KeyboardEvent>(document, 'keyup').pipe(
            filter((event: KeyboardEvent) => event.keyCode === ESCAPE && closeOnEscValue)
          )
        )
      ),
    [config.closeOnEsc]
  );
  useSubscription(closeOnEsc$, () => close());
}

export { NbDialog };
