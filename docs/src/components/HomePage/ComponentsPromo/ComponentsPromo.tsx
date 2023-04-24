import React from 'react';
import useStyles from './ComponentsPromo.styles';

export function ComponentsPromo() {
  const { classes, cx } = useStyles();

  return (
    <div className={cx(classes.root)}>
      <h2>Angular UI components</h2>
      <p>
        Choose from 40+ ready-to-use Angular UI components with no 3rd party dependencies. Benefit
        from an easier and faster way of building a visually appealing and responsive UI for apps.
      </p>
    </div>
  );
}
