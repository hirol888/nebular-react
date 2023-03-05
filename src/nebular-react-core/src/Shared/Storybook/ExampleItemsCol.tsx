import React from 'react';
import { createStyles } from '@nebular-react/styles';

const useStyles = createStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',

    '> *': {
      marginBottom: '1rem',
      '&:last-of-type': {
        marginBottom: 0
      }
    }
  }
}));

export function ExampleItemsCol(props) {
  const { children, ...others } = props;
  const { classes, cx } = useStyles();

  return (
    <div className={cx(classes.root)} {...others}>
      {children}
    </div>
  );
}
