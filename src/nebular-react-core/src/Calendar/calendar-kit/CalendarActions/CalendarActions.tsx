import React, { forwardRef } from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import { Button } from '../../../Button';
import useStyles from './CalendarActions.style';
import { BaseCalendarActionsProps } from './types';

export type CalendarActionsStylesNames = Selectors<typeof useStyles>;

export interface CalendarActionsProps
  extends DefaultProps<CalendarActionsStylesNames>,
    BaseCalendarActionsProps {
  setCurrentTime?: () => void;
  saveValue?: () => void;
}

const defaultProps: Partial<CalendarActionsProps> = {
  showCurrentTimeButton: false,
  applyButtonText: 'ok',
  applyButtonAppearance: 'filled',
  applyButtonSize: 'small',
  applyButtonStatus: 'primary',
  currentTimeButtonText: 'now',
  currentTimeButtonAppearance: 'ghost',
  currentTimeButtonSize: 'small',
  currentTimeButtonStatus: 'primary'
};

const CalendarActions = forwardRef<HTMLDivElement, CalendarActionsProps>((props, ref) => {
  const {
    showCurrentTimeButton,
    applyButtonText,
    applyButtonAppearance,
    applyButtonSize,
    applyButtonStatus,
    currentTimeButtonText,
    currentTimeButtonAppearance,
    currentTimeButtonSize,
    currentTimeButtonStatus,
    setCurrentTime,
    saveValue,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'calendar-actions',
    classNames,
    styles,
    unstyled
  });

  return (
    <div className={cx(classes.root)} ref={ref} {...others}>
      {showCurrentTimeButton && (
        <Button
          appearance={currentTimeButtonAppearance}
          status={currentTimeButtonStatus}
          size={currentTimeButtonSize}
          onClick={() => typeof setCurrentTime === 'function' && setCurrentTime()}
        >
          {currentTimeButtonText}
        </Button>
      )}
      <Button
        wrapperClassName={cx(classes.applyButton)}
        appearance={applyButtonAppearance}
        status={applyButtonStatus}
        size={applyButtonSize}
        onClick={() => typeof saveValue === 'function' && saveValue()}
      >
        {applyButtonText}
      </Button>
    </div>
  );
});

CalendarActions.displayName = '@nebular-react/core/CalendarActions';

export { CalendarActions };
