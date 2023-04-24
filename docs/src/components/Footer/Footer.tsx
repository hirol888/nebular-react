import React from 'react';
import { Icon } from '@nebular-react/core';
import useStyles from './Footer.styles';

export function Footer() {
  const { classes, cx } = useStyles(null, { name: 'docs-footer' });

  return (
    <div className={cx(classes.root)}>
      <div className="logo">
        <a
          href="https://www.akveo.com?utm_campaign=service%20-%20akveo%20website%20-%20nebular%20landing%20-%20traffic&utm_source=nebular&utm_medium=referral&utm_content=logo"
          target="_blank"
          rel="noreferrer"
        >
          <img src="assets/img/akveo-logo.png" />
        </a>
      </div>
      <div>
        <ul>
          <li>
            <strong className="title">More from Akveo</strong>
          </li>
          <li>
            <a
              href="https://www.akveo.com?utm_campaign=service%20-%20akveo%20website%20-%20nebular%20landing%20-%20traffic&utm_source=nebular&utm_medium=referral&utm_content=homepage"
              target="_blank"
              rel="noreferrer"
            >
              Homepage
            </a>
          </li>
          <li>
            <a href="https://akveo.github.io/eva-icons?utm_campaign=eva_icons%20-%20website%20-%20nebular%20landing%20-%20traffic&utm_source=nebular&utm_medium=referral&utm_content=footer_link">
              Eva Icons
            </a>
          </li>
          <li>
            <a href="https://akveo.github.io/react-native-ui-kitten?utm_campaign=ui_kitten%20-%20website%20-%20nebular%20landing%20-%20traffic&utm_source=nebular&utm_medium=referral&utm_content=footer_link">
              React Native UI Kitten
            </a>
          </li>
          <li>
            <a
              href="https://akveo.github.io/ngx-admin?utm_campaign=ngx_admin%20-%20website%20-%20nebular%20landing%20-%20traffic&utm_source=nebular&utm_medium=referral&utm_content=footer_link"
              target="_blank"
              rel="noreferrer"
            >
              ngx-admin
            </a>
          </li>
        </ul>
      </div>
      <div>
        <ul>
          <li>
            <strong className="title">Follow Us</strong>
          </li>
          <li className="social">
            <a href="https://github.com/akveo/ngx-admin" target="_blank" rel="noreferrer">
              <Icon icon="github" />
            </a>
            <a href="https://twitter.com/akveo_inc" target="_blank" rel="noreferrer">
              <Icon icon="twitter" />
            </a>
            <a href="https://www.facebook.com/akveo" target="_blank" rel="noreferrer">
              <Icon icon="facebook" />
            </a>
          </li>
          <li className="copy">
            &copy; 2015-2019{' '}
            <a
              href="https://www.akveo.com?utm_campaign=service%20-%20akveo%20website%20-%20nebular%20landing%20-%20traffic&utm_source=nebular&utm_medium=referral&utm_content=akveo_llc"
              target="_blank"
              rel="noreferrer"
            >
              Akveo LLC
            </a>
            <br />
            Documentation licensed under CC BY 4.0.
          </li>
        </ul>
      </div>
      <div className="contact">
        <ul>
          <li>
            <strong className="title">Contact Us</strong>
          </li>
          <li>
            <a href="mailto:contact@akveo.com">contact@akveo.com</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
