import classNames from 'classnames';
import React from 'react';

export interface LayoutFooterProps {
  fixed?: boolean;
}

const NbLayoutFooter: React.FC<
  LayoutFooterProps & React.HTMLAttributes<HTMLDivElement>
> = ({ fixed, className, children, ...otherProps }) => {
  return (
    <div className={classNames('nb-layout-footer', className)} {...otherProps}>
      <nav
        className={classNames({
          fixed: fixed
        })}
      >
        {children}
      </nav>
    </div>
  );
};

export { NbLayoutFooter };
