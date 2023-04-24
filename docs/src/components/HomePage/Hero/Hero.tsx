import React from 'react';
import { Button, Icon } from '@nebular-react/core';
import { Link } from 'gatsby';
import useStyles from './Hero.styles';

export function Hero() {
  const { classes, cx } = useStyles();

  return (
    <div className={cx(classes.root)}>
      <div className="block">
        <h1>Nebular: Customizable Angular UI Kit</h1>
        <p className="hero-promo">
          Nebular is a customizable Angular UI library that contains 40+ UI components, four visual
          themes, and Auth and Security modules. Recognized at the prestigious AngularConnect 2018,
          this Angular framework allows focusing on beautiful designs to adapt them to your brand.
          Nebular is free of charge and open-source.
        </p>
        <div className="btns-wrapper">
          <Button
            component={Link}
            to="/getting-started/what-is-nebular"
            className="btn get-started"
          >
            Get Started
          </Button>
          <Button
            component="a"
            href="https://www.akveo.com/ngx-admin?utm_campaign=ngx_admin%20-%20website%20-%20nebular%20landing%20-%20traffic&utm_source=nebular&utm_medium=referral&utm_content=nebular_docs_home_hero"
            target="_blank"
            className="btn"
          >
            Demo
          </Button>
          {/* <Button className="btn download" onClick={openDownload}>
            Download
          </Button> */}
        </div>
        <div className="hero-features">
          <div className="hero-feature">
            <div className="feature-key">40+</div>
            <h3 className="feature-title">Angular Components</h3>
          </div>
          <div className="hero-feature">
            <div className="feature-key">4</div>
            <h3 className="feature-title">Visual themes</h3>
          </div>
          <div className="hero-feature">
            <div className="feature-key">3</div>
            <h3 className="feature-title">Auth strategies</h3>
          </div>
          <div className="hero-feature">
            <div className="feature-key">
              <Icon icon="lock" />
            </div>
            <h3 className="feature-title">Security</h3>
          </div>
        </div>
      </div>
      <div className="right-block">
        <div className="hero-components" />
      </div>
    </div>
  );
}
