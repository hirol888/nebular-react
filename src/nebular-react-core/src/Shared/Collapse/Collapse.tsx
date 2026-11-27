import React from 'react';
import { createStyles } from '@nebular-react/styles';

const useStyles = createStyles((_theme, expanded: boolean) => ({
  root: {
    display: 'grid',
    gridTemplateRows: expanded ? '1fr' : '0fr',
    transition: 'grid-template-rows 300ms cubic-bezier(0.16, 1, 0.3, 1)',

    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none'
    }
  },

  viewport: {
    minHeight: 0,
    overflow: 'hidden'
  }
}));

interface CollapseProps {
  expanded: boolean;
  children: React.ReactNode;
}

export function Collapse({ expanded, children }: CollapseProps) {
  const { classes } = useStyles(expanded);

  return (
    <div className={classes.root} inert={!expanded}>
      <div className={classes.viewport}>{children}</div>
    </div>
  );
}
