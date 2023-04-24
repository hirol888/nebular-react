import React from 'react';
import { Icon, Input } from '@nebular-react/core';
import useStyles from './Search.styles';

export function Search() {
  const { classes, cx } = useStyles(null, { name: 'docs-search' });

  return (
    <div className={cx(classes.root)}>
      <Icon icon="search-outline" />
      <Input type="text" id="doc-search" placeholder="Start typing..." />
    </div>
  );
}
