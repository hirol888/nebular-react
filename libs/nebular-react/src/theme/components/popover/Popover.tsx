import {
  getContainerPositionClasses,
  NbAdjustment,
  NbPosition,
  NbTrigger,
  Portal
} from 'libs/nebular-react/src/core/cdk';
import React, { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { uniqueId } from 'lodash';
import {
  useOverlay,
  usePositionStrategy,
  useRepositionScrollStrategy,
  useTriggerStrategy
} from 'libs/nebular-react/src/core/cdk/hooks';
import classNames from 'classnames';
import './popover.scoped.scss';

export type NbPopoverProps = {
  hostRef: React.RefObject<HTMLElement>;
  position?: NbPosition;
  adjustment?: NbAdjustment;
  trigger?: NbTrigger;
  offset?: number;
  disabled?: boolean;
  popoverClass?: string;
  usePrimitiveContainer?: boolean;
};

export type NbPopoverRef = {
  show: () => void;
  hide: () => void;
  disable: () => void;
  enable: () => void;
};

const NbPopover = React.forwardRef<NbPopoverRef, NbPopoverProps & React.HTMLAttributes<HTMLElement>>(
  (
    {
      hostRef,
      position = NbPosition.TOP,
      adjustment = NbAdjustment.CLOCKWISE,
      trigger = NbTrigger.CLICK,
      offset = 15,
      disabled = false,
      popoverClass = '',
      usePrimitiveContainer = true,
      children
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [rendered, setRendered] = useState<boolean>(false);
    const [paneId] = useState<string>(uniqueId('cdk-overlay-'));

    const paneRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setRendered(true);
    }, []);

    useLayoutEffect(() => {
      if (disabled) {
        hostRef.current?.setAttribute('disabled', '');
        hostRef.current?.classList.add('btn-disabled', 'disabled');
        hostRef.current?.setAttribute('aria-disabled', 'true');
      } else {
        hostRef.current?.removeAttribute('disabled');
        hostRef.current?.classList.remove('btn-disabled', 'disabled');
        hostRef.current?.setAttribute('aria-disabled', 'false');
      }
    }, [disabled]);

    useLayoutEffect(() => {
      isOpen && overlayRef?.updatePosition();
    }, [children]);

    const show = () => {
      if (!isOpen) {
        setIsOpen(true);
      }
    };

    const hide = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    const { positionStrategy, overlayPosition } = usePositionStrategy(rendered, hostRef, offset, position, adjustment);
    const scrollStrategy = useRepositionScrollStrategy();
    const overlayRef = useOverlay(rendered, popoverClass, positionStrategy, scrollStrategy);
    useTriggerStrategy(rendered, isOpen, paneId, hostRef, hostRef, trigger, show, hide);

    useImperativeHandle(ref, () => ({
      show: () => show(),
      hide: () => hide(),
      disable: () => {
        hostRef.current?.setAttribute('disabled', '');
        hostRef.current?.classList.add('disabled');
      },
      enable: () => {
        hostRef.current?.removeAttribute('disabled');
        hostRef.current?.classList.remove('disabled');
      }
    }));

    return (
      <Portal overlayRef={overlayRef} isOpen={isOpen} paneRef={paneRef}>
        <div ref={paneRef} id={paneId} className="cdk-overlay-pane">
          <div className={classNames('nb-popover', getContainerPositionClasses(overlayPosition))}>
            <span className="arrow"></span>
            {usePrimitiveContainer ? <div className="primitive-overlay">{children}</div> : <>{children}</>}
          </div>
        </div>
      </Portal>
    );
  }
);

export { NbPopover };
