import React from 'react';
import { Layout } from '@nebular-react/core';
import { Link } from 'gatsby';
import { Footer } from '../Footer/Footer';
import { ComponentsPromo } from './ComponentsPromo/ComponentsPromo';
import { Eva } from './Eva/Eva';
import { ForBusiness } from './ForBusiness/ForBusiness';
import { Header } from '../Header/Header';
import { Hero } from './Hero/Hero';
import { IconCard } from './IconCard/IconCard';
import { TextCard } from './TextCard/TextCard';
import useStyles from './HomePage.styles';

export function HomePage() {
  const { cx, classes } = useStyles();
  const features = [
    {
      title: 'Introduction',
      description: 'Install from scratch or based on ngx-admin.',
      icon: 'assets/img/intro.svg',
      link: 'docs'
    },
    {
      title: 'Guides',
      description: 'Theme System configuration, customization, and other articles.',
      icon: 'assets/img/guides.svg',
      link: 'docs/guides/install-based-on-starter-kit'
    },
    {
      title: 'Components',
      description: 'Native Angular components with configurable styles.',
      icon: 'assets/img/components.svg',
      link: 'docs/components/components-overview'
    },
    {
      title: 'Design System',
      description: `Based on Eva Design System, with 4 visual themes & handy variables to create your custom ones.
                    With hot-reload out of the box.`,
      icon: 'assets/img/themes.svg',
      link: 'docs/design-system/eva-design-system-intro'
    },
    {
      title: 'Auth',
      description: 'The authentication layer with configurable strategies.',
      icon: 'assets/img/auth.svg',
      link: 'docs/auth/introduction'
    },
    {
      title: 'Security',
      description: 'An ACL list with helpful directives.',
      icon: 'assets/img/security.svg',
      link: 'docs/security/introduction'
    }
  ];

  const advantages = [
    {
      title: 'Modular',
      description: 'Each feature is a separate npm module. Use only what you need.',
      icon: 'assets/img/modular.svg'
    },
    {
      title: 'Configurable',
      description: 'Sizes, colors, appearances, shapes, and other useful settings.',
      icon: 'assets/img/native.svg'
    },
    {
      title: 'Open',
      description: 'Source code is free and available under the MIT license.',
      icon: 'assets/img/open-sourced.svg'
    },
    {
      title: 'Customizable',
      description: 'A straightforward way to integrate your brand.',
      icon: 'assets/img/extendable.svg'
    }
  ];

  return (
    <Layout
      columns={
        <Layout.Column className={cx(classes.root)}>
          <section className="hero-image">
            <div className="content-center">
              <Header showSearch={false} />
              <Hero />
            </div>
            <svg
              className="concave"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1920 222"
              preserveAspectRatio="xMidYMin slice"
            >
              <g>
                <path d="M1920,0c-248.44,93.45-587.33,151.09-960.52,151.09S248.44,93.45,0,0V222H1920Z" />
              </g>
            </svg>
          </section>

          <section className="for-business-section">
            <ForBusiness />
          </section>

          <section className="features">
            <div className="content-center">
              {features.map((feature) => (
                <Link to={feature.link} key={feature.title}>
                  <IconCard
                    title={feature.title}
                    icon={feature.icon}
                    description={feature.description}
                  />
                </Link>
              ))}
            </div>
          </section>

          <section className="eva">
            <div className="eva-concave">
              <svg
                viewBox="0 0 1440 112"
                preserveAspectRatio="xMidYMin slice"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="Page-1" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
                  <g transform="translate(0.000000, -720.000000)" fill="#FFFFFF">
                    <path
                      d="M1440,720.000142 L1440,830 C1440,831.104569 1439.10457,832 1438,832 L2,832 C0.8954305,832 1.3527075e-16,831.104569 0,830 L0,720 C192.489111,757.195808 444.350082,779.75851 720.000368,779.75851 C995.650302,779.75851 1247.51098,757.195865 1440,720.000142 Z"
                      id="Combined-Shape"
                    />
                  </g>
                </g>
              </svg>
            </div>
            <Eva className="content-center" />
          </section>

          <section className="components-promo">
            <div className="content-center">
              <ComponentsPromo />
            </div>
          </section>

          <section className="advantages">
            <div className="content-center">
              {advantages.map((advantage) => (
                <TextCard
                  key={advantage.title}
                  title={advantage.title}
                  description={advantage.description}
                  icon={advantage.icon}
                />
              ))}
            </div>
          </section>

          <Footer />
        </Layout.Column>
      }
    />
  );
}
