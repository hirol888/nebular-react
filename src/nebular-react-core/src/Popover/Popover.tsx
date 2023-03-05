import React, { useImperativeHandle, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  TransitionType,
  useComponentDefaultProps,
  useNebularDir
} from '@nebular-react/styles';
import {
  Position,
  PositionAdjustment,
  useOverlay,
  TriggerType,
  useOverlayTrigger,
  useIsomorphicEffect,
  useFlexibleConnectedPositionStrategy,
  useOverlayClickOutside
} from '@nebular-react/hooks';
import { Property } from 'csstype';
import { Transition, TransitionState } from '../Transition';
import { OptionalPortal } from '../OptionalPortal';
import useStyles, { PopoverStylesParams } from './Popover.style';
import { transitionEnterHandler, transitionExitedHandler } from '../Shared/OptionList/utils';

export type PopoverStylesNames = Selectors<typeof useStyles>;

export interface PopoverProps
  extends DefaultProps<PopoverStylesNames, PopoverStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  triggerRef: React.RefObject<HTMLElement>;
  position?: Position;
  adjustment?: PositionAdjustment;
  offset?: number;
  trigger?: TriggerType;
  popoverClass?: string;
  padding?: Property.Padding;
  transition?: TransitionType;
  transitionDuration?: number;
  transitionTimingFunction?: string;
  onPopoverOpen?: () => void;
  onPopoverClose?: () => void;
  children?: React.ReactNode;
}

export interface PopoverRef {
  show: () => void;
  hide: () => void;
}

const defaultProps: Partial<PopoverProps> = {
  position: 'top',
  adjustment: 'clockwise',
  offset: 15,
  trigger: 'click',
  padding: '0.75rem 1rem',
  popoverClass: '',
  transition: 'fade',
  transitionDuration: 150
};

const Popover = React.forwardRef<PopoverRef, PopoverProps>((props, ref) => {
  const {
    triggerRef,
    position,
    adjustment,
    offset,
    trigger,
    popoverClass,
    padding,
    transition,
    transitionDuration,
    transitionTimingFunction,
    onPopoverOpen,
    onPopoverClose,
    children,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles({ padding }, { name: 'popover', classNames, styles, unstyled });

  const [popoverState, setPopoverState] = useState<TransitionState>({
    mountTransition: false,
    mounted: false
  });

  const dir = useNebularDir();

  const show = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (!visible) {
      setPopoverState((state) => ({ ...state, mountTransition: true }));
    }
  };
  const hide = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (visible) {
      setPopoverState((state) => ({ ...state, mountTransition: false }));
    }
  };

  const { appliedPosition, apply, paneRef, boundingBoxRef } = useFlexibleConnectedPositionStrategy(
    position,
    adjustment,
    triggerRef.current,
    dir,
    offset
  );
  useOverlay({
    apply,
    paneRef,
    paneWrapperRef: boundingBoxRef,
    panelClass: popoverClass,
    opened: popoverState.mounted,
    scrollStrategy: 'repositon'
  });
  useOverlayTrigger(triggerRef, paneRef, boundingBoxRef, trigger, show, hide);
  useOverlayClickOutside([paneRef, triggerRef], hide);

  useIsomorphicEffect(() => {
    if (popoverState.mounted) {
      apply();
    }
  }, [children]);

  useImperativeHandle(ref, () => ({ show, hide }));

  return (
    <OptionalPortal withinPortal>
      <Transition
        mounted={popoverState.mountTransition}
        transition={transition}
        duration={transitionDuration}
        timingFunction={transitionTimingFunction}
        onEnter={() => transitionEnterHandler(setPopoverState, onPopoverOpen)}
        onExited={() => transitionExitedHandler(setPopoverState, onPopoverClose)}
      >
        {(transitionStyles) => (
          <div ref={boundingBoxRef} style={{ ...transitionStyles }}>
            <div ref={paneRef} className="overlay-pane">
              <div className={cx(classes.root, className)} {...others}>
                <span
                  className={cx(classes.arrow, {
                    [classes.overlayTop]: appliedPosition === 'top',
                    [classes.overlayTopStart]: appliedPosition === 'top-start',
                    [classes.overlayTopEnd]: appliedPosition === 'top-end',
                    [classes.overlayRight]:
                      appliedPosition === 'right' || appliedPosition === 'end',
                    [classes.overlayEndTop]: appliedPosition === 'end-top',
                    [classes.overlayEndBottom]: appliedPosition === 'end-bottom',
                    [classes.overlayBottom]: appliedPosition === 'bottom',
                    [classes.overlayBottomStart]: appliedPosition === 'bottom-start',
                    [classes.overlayBottomEnd]: appliedPosition === 'bottom-end',
                    [classes.overlayLeft]:
                      appliedPosition === 'left' || appliedPosition === 'start',
                    [classes.overlayStartTop]: appliedPosition === 'start-top',
                    [classes.overlayStartBottom]: appliedPosition === 'start-bottom'
                  })}
                />
                <div className={cx(classes.textContainer)}>{children}</div>
              </div>
            </div>
          </div>
        )}
      </Transition>
    </OptionalPortal>
  );
});

Popover.displayName = '@nebular-react/core/Popover';

export { Popover };
