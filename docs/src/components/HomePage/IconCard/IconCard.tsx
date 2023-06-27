/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Link } from 'gatsby';
import useStyles from './IconCard.styles';

interface IconCardProps {
  link?: string;
  title?: string;
  icon?: string;
  description?: string;
}

export function IconCard({ link, title, icon, description }: IconCardProps) {
  const { classes, cx } = useStyles();

  return (
    <Link to={link} className={cx(classes.root)}>
      <div className="icon">
        <img src={icon} />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </Link>
  );
}
