import React from 'react';
// import { Title, Text, Badge } from '@mantine/core';
// import { GithubIcon, NpmIcon } from '@mantine/ds';
import { Badge, Card } from '@nebular-react/core';
import { Prism } from '@mantine/prism';
// import { getGradient } from '../../HomePage/get-gradient';
import { MdxPageProps } from '../../../types';
import useStyles from './MdxPageHeader.styles';
import { HeaderItem } from './HeaderItem/HeaderItem';

// const REPO_BASE = 'https://github.com/mantinedev/mantine/blob/master';
// const DOCS_BASE = `${REPO_BASE}/docs/src/docs`;
// const SOURCE_BASE = `${REPO_BASE}/src`;

export function MdxPageHeader({ frontmatter }: MdxPageProps) {
  const { classes, cx } = useStyles();

  const hasTabs = Array.isArray(frontmatter.props);
  const hasLinks = !!(frontmatter.import || frontmatter.source || frontmatter.installation);

  if (!hasLinks && !hasTabs && !frontmatter.release) {
    return null;
  }

  return (
    <div className={cx(classes.root)}>
      <Card>
        <Card.Body>
          <h1 className="page-header">
            {frontmatter.pageTitle || frontmatter.title}
            {frontmatter.polymorphic && <Badge text="polymorphic" status="info" />}
          </h1>
          <div className="description">{frontmatter.description}</div>
          {frontmatter.import && (
            <HeaderItem label="Import">
              <Prism language="tsx" noCopy>
                {frontmatter.import}
              </Prism>
            </HeaderItem>
          )}

          {frontmatter.source && <>{frontmatter.source}</>}

          {frontmatter.release && <>{frontmatter.release}</>}
        </Card.Body>
      </Card>
    </div>
  );
}
