import React from 'react';
import useStyles from './MdxPageBase.styles';

interface MdxPageBaseProps {
  children: React.ReactNode;
}

export function MdxPageBase({ children }: MdxPageBaseProps) {
  const { classes } = useStyles();

  return (
    <>
      <div className={classes.content}>{children}</div>
    </>
  );
}
