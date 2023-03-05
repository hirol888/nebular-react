import React from 'react';
import { createStyles } from '@nebular-react/styles';

const useStyles = createStyles(() => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    margin: '-0.5rem',

    '> *': {
      margin: '0.5rem'
    }
  }
}));

export function ExampleItemsRows(props) {
  const { children, className, ...others } = props;
  const { classes, cx } = useStyles();

  return (
    <div className={cx(classes.root, className)} {...others}>
      {children}
    </div>
  );
}
