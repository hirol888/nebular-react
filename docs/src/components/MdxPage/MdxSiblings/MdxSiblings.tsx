import { Card, Icon } from '@nebular-react/core';
import { Link } from 'gatsby';
import React from 'react';
import { MdxPageProps } from '../../../types';
import useStyles from './MdxSiblings.styles';

interface MdxSiblingsProps {
  siblings: MdxPageProps['siblings'];
}

export function MdxSiblings({ siblings }: MdxSiblingsProps) {
  const { classes, cx } = useStyles();

  return (
    <div className={cx(classes.root)}>
      <Card className={cx('left-block', { invisible: !siblings.prev })}>
        {siblings.prev && (
          <Link to={siblings.prev.slug} title={siblings.prev.title}>
            <div className="page-title">
              <Icon icon="arrow-back-outline" />
              <span>{siblings.prev.title}</span>
            </div>
            <div className="description">Previous page</div>
          </Link>
        )}
      </Card>
      <Card className={cx('right-block', { invisible: !siblings.next })}>
        {siblings.next && (
          <Link to={siblings.next.slug} title={siblings.next.title}>
            <div className="page-title">
              <span>{siblings.next.title}</span>
              <Icon icon="arrow-forward-outline" />
            </div>
            <div className="description">Next page</div>
          </Link>
        )}
      </Card>
    </div>
  );
}
