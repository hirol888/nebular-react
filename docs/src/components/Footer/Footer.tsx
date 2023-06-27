import React from 'react';
import { Icon } from '@nebular-react/core';
import useStyles from './Footer.styles';

export function Footer() {
  const { classes, cx } = useStyles(null, { name: 'docs-footer' });

  return (
    <div className={cx(classes.root)}>
      <div>
        <ul>
          <li>
            <strong className="title">Links</strong>
          </li>
          <li>
            <a href="https://github.com/hirol888/nebular-react" target="_blank" rel="noreferrer">
              Repo
            </a>
          </li>
          <li>
            <a href="https://github.com/hirol888/nebular-react-demo">Demo Repo</a>
          </li>
          <li>
            <a href="https://nebular-react-demo-vlx2m.ondigitalocean.app/">Live Demo</a>
          </li>
        </ul>
      </div>
      <div>
        <ul>
          <li>
            <strong className="title">Follow</strong>
          </li>
          <li className="social">
            <a href="https://github.com/hirol888" target="_blank" rel="noreferrer">
              <Icon icon="github" />
            </a>
          </li>
          <li className="copy">&copy; 2023</li>
        </ul>
      </div>
      <div className="contact">
        <ul>
          <li>
            <strong className="title">Contact</strong>
          </li>
          <li>
            <a href="mailto:nebularreact@gmail.com">nebularreact@gmail.com</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
