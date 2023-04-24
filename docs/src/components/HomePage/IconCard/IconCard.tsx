import React from 'react';
import useStyles from './IconCard.styles';

interface IconCardProps {
  title?: string;
  icon?: string;
  description?: string;
}

export function IconCard({ title, icon, description }: IconCardProps) {
  const { classes, cx } = useStyles();

  return (
    <div className={cx(classes.root)}>
      <div className="icon">
        <img src={icon} />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
