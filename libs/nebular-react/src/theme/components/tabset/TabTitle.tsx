import React from 'react';

const NbTabTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...otherProps }) => {
  return <div {...otherProps}>{children}</div>;
};

export { NbTabTitle };
