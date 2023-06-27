import React from 'react';
import { Button } from '@nebular-react/core';
import { Link } from 'gatsby';
import useStyles from './Hero.styles';

export function Hero() {
  const { classes, cx } = useStyles();

  return (
    <div className={cx(classes.root)}>
      <div className="block">
        <h1>Nebular React: Customizable React UI Kit</h1>
        <p className="hero-promo">
          Nebular React is a customizable React UI library that contains 40+ UI components, four
          visual themes. This React framework allows focusing on beautiful designs to adapt them to
          your brand. Nebular React is free of charge and open-source.
        </p>
        <div className="btns-wrapper">
          <Button
            component={Link}
            to="/getting-started/what-is-nebular-react"
            fullWidth
            wrapperClassName="btn-wrapper"
            className="btn get-started"
          >
            Get Started
          </Button>
          <Button
            component="a"
            href="https://nebular-react-demo-vlx2m.ondigitalocean.app/"
            target="_blank"
            fullWidth
            wrapperClassName="btn-wrapper"
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
            <h3 className="feature-title">React Components</h3>
          </div>
          <div className="hero-feature">
            <div className="feature-key">4</div>
            <h3 className="feature-title">Visual themes</h3>
          </div>
          {/* <div className="hero-feature">
            <div className="feature-key">3</div>
            <h3 className="feature-title">Auth strategies</h3>
          </div>
          <div className="hero-feature">
            <div className="feature-key">
              <Icon icon="lock" />
            </div>
            <h3 className="feature-title">Security</h3>
          </div> */}
        </div>
      </div>
      <div className="right-block">
        <div className="hero-components" />
      </div>
    </div>
  );
}
