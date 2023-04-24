/* eslint-disable react/no-unescaped-entities */
import { Link } from 'gatsby';
import React from 'react';
import { PageHead } from '../components/PageHead/PageHead';

export default function PageNotFound() {
  return (
    <>
      <p>
        <h1>Congratulations!</h1>
        You've found a completely secret place on Mantine website. Unfortunately, this is only a 404
        page. If you've landed on this page from a link on the Mantine website, please{' '}
        <a href="https://github.com/mantinedev/mantine/issues/new">create an issue</a>. Otherwise,
        here are some learning materials that will help you get started with Mantine:
      </p>
      <ul>
        <li>
          <Link to="/pages/contributing/">Mantine contributions guideline</Link>
        </li>
        <li>
          <Link to="/guides/ssr/">Learn how to setup server side rendering with Mantine</Link>
        </li>
        <li>
          <Link to="/others/notifications/">Mantine notifications system</Link>
        </li>
        <li>
          <Link to="/theming/mantine-provider/">Learn how to customize Mantine theme</Link>
        </li>
        <li>
          <Link to="/hooks/use-merged-ref/">Learn how to merge react refs into single one</Link>
        </li>
      </ul>
    </>
  );
}

export const Head = () => <PageHead title="404" disableTitleTemplate />;
