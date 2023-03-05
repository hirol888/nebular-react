import React, { useState } from 'react';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  Selectors,
  TransitionType,
  useComponentDefaultProps,
  useNebularDir
} from '@nebular-react/styles';
import {
  Position,
  PositionAdjustment,
  useOverlayTrigger,
  useFlexibleConnectedPositionStrategy,
  useOverlay
} from '@nebular-react/hooks';
import { createPolymorphicComponent } from '@mantine/utils';
import { Transition, TransitionState } from '../Transition';
import { OptionalPortal } from '../OptionalPortal';
import useStyles, { TooltipStylesParams } from './Tooltip.styles';
import { transitionEnterHandler, transitionExitedHandler } from '../Shared/OptionList/utils';

export type TooltipStylesNames = Selectors<typeof useStyles>;

export interface TooltipProps
  extends DefaultProps<TooltipStylesNames, TooltipStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  triggerRef: React.RefObject<HTMLElement>;
  content?: string;
  position?: Position;
  adjustment?: PositionAdjustment;
  offset?: number;
  status?: ComponentOrCustomStatus;
  tooltipClass?: string;
  icon?: React.ReactNode;
  transition?: TransitionType;
  transitionDuration?: number;
  transitionTimingFunction?: string;
  onTooltipOpen?: () => void;
  onTooltipClose?: () => void;
}

const defaultProps: Partial<TooltipProps> = {
  content: '',
  position: 'top',
  adjustment: 'clockwise',
  offset: 15,
  status: '',
  tooltipClass: '',
  transition: 'fade',
  transitionDuration: 150
};

const _Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>((props, ref) => {
  const {
    content,
    triggerRef,
    position,
    adjustment,
    offset,
    status,
    tooltipClass,
    icon,
    transition,
    transitionDuration,
    transitionTimingFunction,
    onTooltipOpen,
    onTooltipClose,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles({ status }, { name: 'tooltip', classNames, styles, unstyled });

  const [tooltipState, setTooltipState] = useState<TransitionState>({
    mountTransition: false,
    mounted: false
  });

  const dir = useNebularDir();

  const show = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (!visible) {
      setTooltipState((state) => ({ ...state, mountTransition: true }));
    }
  };
  const hide = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current.style.display !== 'none';
    if (visible) {
      setTooltipState((state) => ({ ...state, mountTransition: false }));
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
    panelClass: tooltipClass,
    opened: tooltipState.mounted,
    scrollStrategy: 'repositon'
  });
  useOverlayTrigger(triggerRef, paneRef, boundingBoxRef, 'hint', show, hide);

  return (
    <OptionalPortal withinPortal>
      <Transition
        mounted={tooltipState.mountTransition}
        transition={transition}
        duration={transitionDuration}
        timingFunction={transitionTimingFunction}
        onEnter={() => transitionEnterHandler(setTooltipState, onTooltipOpen)}
        onExited={() => transitionExitedHandler(setTooltipState, onTooltipClose)}
      >
        {(transitionStyles) => (
          <div ref={boundingBoxRef} style={{ ...transitionStyles }}>
            <div ref={paneRef} className="overlay-pane">
              <div className={cx(classes.root, status, className)} ref={ref} {...others}>
                <span
                  className={cx(classes.arrow, {
                    [classes.top]: appliedPosition === 'top',
                    [classes.topStart]: appliedPosition === 'top-start',
                    [classes.topEnd]: appliedPosition === 'top-end',
                    [classes.right]: appliedPosition === 'right',
                    [classes.end]: appliedPosition === 'end',
                    [classes.endTop]: appliedPosition === 'end-top',
                    [classes.endBottom]: appliedPosition === 'end-bottom',
                    [classes.bottom]: appliedPosition === 'bottom',
                    [classes.bottomStart]: appliedPosition === 'bottom-start',
                    [classes.bottomEnd]: appliedPosition === 'bottom-end',
                    [classes.left]: appliedPosition === 'left',
                    [classes.start]: appliedPosition === 'start',
                    [classes.startTop]: appliedPosition === 'start-top',
                    [classes.startBottom]: appliedPosition === 'start-bottom'
                  })}
                />
                <div className={cx(classes.content)}>
                  {!!icon && <>{icon}</>}
                  {content.length > 0 && <>{content}</>}
                </div>
              </div>
            </div>
          </div>
        )}
      </Transition>
    </OptionalPortal>
  );
});

_Tooltip.displayName = '@nebular-react/core/Tooltip';

export const Tooltip = createPolymorphicComponent<'div', TooltipProps>(_Tooltip);
