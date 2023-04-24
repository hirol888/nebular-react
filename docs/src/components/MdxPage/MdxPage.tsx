import React from 'react';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import useStyles from './MdxPage.styles';
import { MdxPageProps } from '../../types';
import { MdxPageHeader } from './MdxPageHeader/MdxPageHeader';
import { MdxPageTabs } from './MdxPageTabs/MdxPageTabs';
import { MdxSiblings } from './MdxSiblings/MdxSiblings';
import TableOfContents from './TableOfContents/TableOfContents';

export function MdxPage(props: MdxPageProps) {
  const { cx, classes } = useStyles();

  return (
    <div className={cx(classes.root)}>
      <div className="middle-column docSearch-content">
        <MdxPageHeader {...props} />

        {Array.isArray(props.frontmatter.props) ? (
          <MdxPageTabs {...props} />
        ) : (
          <MDXRenderer>{props.body}</MDXRenderer>
        )}
        <MdxSiblings {...props} />
      </div>

      <div className="settings-column">
        <div className="fixed-panel">
          {!Array.isArray(props.frontmatter.props) && <TableOfContents headings={props.headings} />}
        </div>
      </div>
    </div>
  );
}
