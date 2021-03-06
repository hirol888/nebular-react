import { NbFocusTrap, NbFocusTrapFactoryService } from 'libs/nebular-react/src/core/cdk';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { NbDialogConfig } from './dialog-config';

export type NbDialogContainerProps = {
  config: NbDialogConfig;
};

export type NbDialogContainerRef = {
  restoreFocus: () => void;
  elementRef: React.RefObject<HTMLDivElement>;
};

const NbDialogContainer = React.forwardRef<
  NbDialogContainerRef,
  NbDialogContainerProps & React.HTMLAttributes<HTMLDivElement>
>(({ config, children }, ref) => {
  const focusTrapFactory = useInjection<NbFocusTrapFactoryService>(TYPES.NbFocusTrapFactoryService);
  const [focusTrap, setFocusTrap] = useState<NbFocusTrap>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (config.autoFocus) {
      const _focusTrap = focusTrapFactory.create(containerRef.current!);
      setFocusTrap(_focusTrap);
    }
  }, []);

  useEffect(() => {
    if (focusTrap) {
      focusTrap.blurPreviouslyFocusedElement();
      focusTrap.focusInitialElement();
    }
  }, [focusTrap]);

  useImperativeHandle(ref, () => ({
    restoreFocus: () => {
      if (config.autoFocus && focusTrap) {
        focusTrap.restoreFocus();
      }
    },
    elementRef: containerRef
  }));

  return <div ref={containerRef}>{children}</div>;
});

export { NbDialogContainer };
