import React from 'react';

const NbStepHeader: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, children, ...otherProps }) => {
  return (
    <span className={className} {...otherProps}>
      {children}
    </span>
  );
};

export { NbStepHeader };
