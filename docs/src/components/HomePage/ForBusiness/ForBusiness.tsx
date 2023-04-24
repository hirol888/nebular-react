import React from 'react';
import { Button } from '@nebular-react/core';
import useStyles from './ForBusiness.styles';

export function ForBusiness() {
  const { classes, cx } = useStyles();

  const offerings: string[] = [
    'A custom template development',
    'The services of developers, designers, analytics, QAs, PMs & marketing specialists;',
    'Nebular customization services;',
    'The review of your project.'
  ];

  return (
    <div className={cx(classes.root)}>
      <div className="left">
        <h2 className="heading h1 text-control">Nebular for business</h2>
        <Button className="submit" status="control">
          Submit your request
        </Button>
      </div>

      <div className="right">
        <p className="h6 offerings-title">
          If you use Nebular for business,
          <span className="offerings-title-second-line">we&quot;d like to offer you:</span>
        </p>

        <ul className="offerings">
          {offerings.map((offering) => (
            <li key={offering} className="offering text-hint">
              {offering}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
