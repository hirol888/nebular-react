import classNames from 'classnames';
import React from 'react';
import './option-group.scoped.scss';

export type NbOptionGroupProps = {
  title?: string;
  disabled?: boolean;
};

export const OptionGroupContext = React.createContext<{
  disabled: boolean;
}>({ disabled: false });

const NbOptionGroup: React.FC<
  NbOptionGroupProps & React.HTMLAttributes<HTMLDivElement>
> = ({ title, disabled = false, className, children, ...otherProps }) => {
  return (
    <OptionGroupContext.Provider value={{ disabled: disabled }}>
      <div
        className={classNames('nb-option-group', className, {
          disabled: disabled
        })}
        {...otherProps}
      >
        <span className="option-group-title">{title}</span>
        {children}
      </div>
    </OptionGroupContext.Provider>
  );
};

export { NbOptionGroup };
