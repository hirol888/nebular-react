import React, { isValidElement } from 'react';
import { MDXProvider } from '@mdx-js/react';
// import { Code, Text } from '@mantine/core';
// import { Prism } from '@mantine/prism';
// import { Demo } from '@mantine/ds';
import { Card, useNebularTheme } from '@nebular-react/core';
import { uniqueId } from 'lodash';
import { Prism } from '@mantine/prism';
import { PrismTheme } from 'prism-react-renderer';
import DataTable from './DataTable/DataTable';
import GatsbyLink from './GatsbyLink/GatsbyLink';
import { KeyboardEventsTable } from './KeyboardEventsTable/KeyboardEventsTable';
import { PrismWrapper } from './PrismWrapper/PrismWrapper';

const getPrismTheme = (): PrismTheme => ({
  plain: {
    color: '#f8f8f2',
    background: 'linear-gradient(225deg,#333c66 0%,#1d2447 100%)'
  },

  styles: [
    {
      types: ['comment'],
      style: {
        color: '#6272a4'
      }
    },
    {
      types: ['string', 'inserted', 'selector', 'atrule'],
      style: {
        color: '#f1fa8c'
      }
    },
    {
      types: ['number'],
      style: {
        color: '#4dabf7'
      }
    },
    {
      types: ['builtin', 'char', 'constant', 'function'],
      style: {
        color: '#ff922b'
      }
    },
    {
      types: ['punctuation'],
      style: {
        color: '#adb5bd'
      }
    },
    {
      types: ['variable'],
      style: {
        color: '#adb5bd'
      }
    },
    {
      types: ['class-name', 'attr-name'],
      style: {
        color: '#fcc419'
      }
    },
    {
      types: ['tag', 'deleted'],
      style: {
        color: '#f8f8f2'
      }
    },
    {
      types: ['operator'],
      style: {
        color: '#adb5bd'
      }
    },
    {
      types: ['boolean'],
      style: {
        color: '#fa5252'
      }
    },
    {
      types: ['keyword'],
      style: {
        color: '#8be9fd'
      }
    },
    {
      types: ['doctype'],
      style: {
        color: '#adb5bd'
      }
    },
    {
      types: ['url'],
      style: {
        color: '#adb5bd'
      }
    }
  ]
});

export const components = {
  // GatsbyLink,
  // DataTable,
  // Demo,
  // KeyboardEventsTable,
  // h1: h(1),
  // h2: h(2),
  // h3: h(3),
  // h4: h(4),
  // h5: h(5),
  // h6: h(6),
  // inlineCode: (props: any) => <Code {...props} />,
  // a: ({ href, children }: { href: string; children: string }) => {
  //   const replaced = href.replace('https://mantine.dev', '');
  //   const style = { fontSize: 15 };
  //   if (!replaced.startsWith('http') && replaced.trim().length > 0) {
  //     return (
  //       <GatsbyLink style={style} to={href.replace('https://mantine.dev', '')}>
  //         {children}
  //       </GatsbyLink>
  //     );
  //   }
  //   return (
  //     <Text style={style} component="a" variant="link" href={href}>
  //       {children}
  //     </Text>
  //   );
  // },
  // p: (props: any) => <p {...props} style={{ lineHeight: 1.55 }} />,
  // ul: (props: any) => (
  //   <ul {...props} style={{ lineHeight: 1.65, marginBottom: 20, marginTop: 10 }} />
  // ),
  // li: (props: any) => <li {...props} style={{ marginTop: 4 }} />,
  pre: (props: any) => {
    const matches = (props.children.props.className || '').match(/language-(?<lang>.*)/);
    return (
      <PrismWrapper
        language={matches && matches.groups && matches.groups.lang ? matches.groups.lang : ''}
        children={props.children.props.children}
      />
    );
  },
  wrapper: ({ children, ...props }) => {
    const elementArray = React.Children.toArray(children);

    const sections = elementArray.reduce(
      (acc: any[][], val) => {
        if ((val as any).props.mdxType === 'hr') {
          acc.push([]);
        } else {
          acc[acc.length - 1].push(val);
        }
        return acc;
      },
      [[]]
    );

    return (
      <>
        {sections.map((section) => (
          <Card key={uniqueId('section-')}>
            <Card.Body>{section}</Card.Body>
          </Card>
        ))}
      </>
    );
  }
};

export default function MdxProvider({ children }: { children: React.ReactNode }) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
