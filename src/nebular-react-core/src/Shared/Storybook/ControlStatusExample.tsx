import React from 'react';
import { createStyles } from '@nebular-react/styles';

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: theme.color_primary_default,
    borderRadius: theme.card_border_radius,
    padding: '1rem'
  }
}));
export function ControlStatusExample(props) {
  const { children, ...others } = props;
  const { classes, cx } = useStyles();

  return (
    <div className={cx(classes.root)} {...others}>
      {children}
    </div>
  );
}
