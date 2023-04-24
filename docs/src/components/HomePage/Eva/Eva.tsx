import React from 'react';
import { Button } from '@nebular-react/core';
import useStyles from './Eva.styles';

export function Eva({ className }: React.ComponentPropsWithoutRef<'div'>) {
  const { classes, cx } = useStyles();

  return (
    <div className={cx(classes.root, className)}>
      <div className="description">
        <h2 className="h1 heading">
          <span className="pre-heading">Based on the</span>
          Eva Design System
        </h2>
        <p className="text">
          Construct stunning and consistent interfaces using atomic components by following the Eva
          Design System’s specifications.
        </p>
        <Button
          component="a"
          className="learn-more"
          href="https://eva.design?utm_campaign=eva_design%20-%20home%20-%20nebular%20landing&utm_source=nebular&utm_medium=referral&utm_content=learn_more_button"
          size="giant"
        >
          Learn more about Eva
        </Button>
      </div>
      <div className="images">
        <img
          className="theme-colors"
          src="assets/img/theme-colors.png"
          srcSet="assets/img/theme-colors.png,
               assets/img/theme-colors-2x.png 2x"
          alt="Theme colors"
        />
        <img
          className="components"
          src="assets/img/components-preview.png"
          srcSet="assets/img/components-preview.png,
               assets/img/components-preview-2x.png 2x"
          alt="Components preview"
        />
      </div>
    </div>
  );
}
