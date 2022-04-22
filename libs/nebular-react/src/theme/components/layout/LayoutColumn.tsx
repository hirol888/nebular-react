import classNames from 'classnames';
import React from 'react';

export interface LayoutColumnProps {
  left?: boolean;
  start?: boolean;
}

const NbLayoutColumn: React.FC<
  LayoutColumnProps & React.HTMLAttributes<HTMLDivElement>
> = ({ left, start, className, children, ...otherProps }) => {
  const startValue = left ? false : start;
  const leftValue = start ? false : left;

  return (
    <div
      className={classNames('nb-layout-column', className, {
        left: leftValue,
        start: startValue
      })}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export { NbLayoutColumn };
