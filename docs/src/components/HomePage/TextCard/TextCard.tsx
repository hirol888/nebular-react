import React from 'react';
import useStyles from './TextCard.styles';

interface TextCardProps {
  title?: string;
  description?: string;
  icon?: string;
}

export function TextCard({ title, description, icon }: TextCardProps) {
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
