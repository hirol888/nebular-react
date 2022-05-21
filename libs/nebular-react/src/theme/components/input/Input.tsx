import { NbComponentSize, NbComponentOrCustomStatus } from '@nebular-react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { NbComponentShape, NbFormControlProps } from '../component';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { FocusMonitor } from 'libs/nebular-react/src/core/cdk';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { mergedRefs } from 'libs/nebular-react/src/core/helpers/helpers';
import { filter, finalize, map, switchMap } from 'rxjs';
import { useObservable, useSubscription } from 'observable-hooks';

export interface NbInputProps extends NbFormControlProps {
  fieldSize?: NbComponentSize;
  status?: NbComponentOrCustomStatus;
  shape?: NbComponentShape;
  fullWidth?: boolean;
  disabled?: boolean;
}

const NbInput = React.forwardRef<HTMLInputElement, NbInputProps & React.InputHTMLAttributes<HTMLInputElement>>(
  (
    {
      fieldSize = 'medium',
      status = 'basic',
      shape = 'rectangle',
      fullWidth = false,
      disabled = false,
      onSizeChange,
      onFullWidthChange,
      onStatusChange,
      onDisableChange,
      onFocusChange,
      className,
      ...otherProps
    },
    ref
  ) => {
    const [sizeValue, setSizeValue] = useState<NbComponentSize>(fieldSize);
    const [statusValue, setStatusValue] = useState<NbComponentOrCustomStatus>(status);
    const [disabledValue, setDisabledValue] = useState<boolean>(disabled);
    const [fullWidthValue, setFullWidthValue] = useState<boolean>(fullWidth);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setSizeValue(fieldSize);
      onSizeChange && onSizeChange(fieldSize);
    }, [fieldSize]);

    useEffect(() => {
      setStatusValue(status);
      onStatusChange && onStatusChange(status);
    }, [status]);

    useEffect(() => {
      setDisabledValue(disabled);
      onDisableChange && onDisableChange(disabled);
    }, [disabled]);

    useEffect(() => {
      setFullWidthValue(fullWidth);
      onFullWidthChange && onFullWidthChange(fullWidth);
    }, [fullWidth]);

    const focusMonitor = useInjection<FocusMonitor>(TYPES.FocusMonitor);
    const monitor$ = useObservable(
      (input$) =>
        input$.pipe(
          filter(([inputRefValue]) => !!inputRefValue),
          switchMap(([inputRefValue, focusMonitorValue]) => {
            return focusMonitorValue.monitor(inputRefValue!).pipe(
              map((origin) => !!origin),
              finalize(() => focusMonitorValue.stopMonitoring(inputRef.current!))
            );
          })
        ),
      [inputRef.current, focusMonitor]
    );
    useSubscription(monitor$, (focused) => onFocusChange && onFocusChange(focused));

    return (
      <input
        className={classNames(
          'nb-input',
          `status-${statusValue}`,
          `shape-${shape}`,
          `size-${sizeValue}`,
          'nb-transition',
          className,
          {
            'input-full-width': fullWidthValue
          }
        )}
        disabled={disabledValue}
        ref={mergedRefs(ref, inputRef)}
        {...otherProps}
      />
    );
  }
);

export { NbInput };
