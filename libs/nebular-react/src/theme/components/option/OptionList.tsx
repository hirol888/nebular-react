import classNames from 'classnames';
import { NbPosition } from 'libs/nebular-react/src/core/cdk';
import React, { Children, isValidElement, useImperativeHandle, useLayoutEffect, useMemo, useState } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';
import { NbComponentSize } from '../component';
import { NbOption, NbOptionRef } from './Option';
import { NbOptionGroup } from './OptionGroup';
import { OptionListContext } from './OptionList.context';

export type NbOptionListProps = {
  size?: NbComponentSize;
  multiple?: boolean;
  position?: NbPosition;
  onOptionChange?: (selected: boolean, optionId: string, value: any) => void;
};

export type NbOptionListRef = {
  optionRefs$: Observable<React.RefObject<NbOptionRef>[]>;
};

const NbOptionList = React.forwardRef<NbOptionListRef, NbOptionListProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ size = 'medium', multiple = false, position, className, children, onOptionChange, ...otherProps }, ref) => {
    const [_optionRefs$] = useState<BehaviorSubject<React.RefObject<NbOptionRef>[]>>(
      new BehaviorSubject<React.RefObject<NbOptionRef>[]>([])
    );

    const getOptionRefs = useMemo(
      () => () => {
        const _optionRefs: React.RefObject<NbOptionRef>[] = [];

        const _getOptionRefs = (children: React.ReactNode) => {
          return Children.map(children, (child) => {
            if (isValidElement(child) && child.type === NbOption) {
              _optionRefs.push((child as any).ref);
            }
            if (isValidElement(child) && child.type === NbOptionGroup) {
              _getOptionRefs(child.props.children as React.ReactNode);
            }
          });
        };

        _getOptionRefs(children);
        return _optionRefs;
      },
      [children]
    );

    useLayoutEffect(() => {
      const optionRefs = getOptionRefs();
      _optionRefs$.next(optionRefs);
    }, [children]);

    useImperativeHandle(ref, () => ({
      optionRefs$: _optionRefs$.asObservable()
    }));

    return (
      <OptionListContext.Provider value={{ multiple: multiple, handleOptionChange: onOptionChange }}>
        <div
          className={classNames('nb-option-list', `size-${size}`, className, {
            'position-top': position === 'top',
            'position-bottom': position === 'bottom',
            'no-boarder': getOptionRefs().length === 0
          })}
          {...otherProps}
        >
          <ul className="option-list">{children}</ul>
        </div>
      </OptionListContext.Provider>
    );
  }
);

export { NbOptionList };
