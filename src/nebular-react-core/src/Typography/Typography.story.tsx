import React from 'react';
import { Blockquote, Code, Link, Paragraph, Text, Title } from './Typography';

export default { title: 'Typography', component: Title };

export function Headings() {
  return (
    <div>
      <Title order={1}>Heading 1</Title>
      <Title order={2}>Heading 2</Title>
      <Title order={3}>Heading 3</Title>
      <Title order={4}>Heading 4</Title>
      <Title order={5}>Heading 5</Title>
      <Title order={6}>Heading 6</Title>
    </div>
  );
}

export function TextStyles() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Text size="xs">Extra small text</Text>
      <Text size="sm">Small text</Text>
      <Text size="md">Medium text</Text>
      <Text size="lg">Large text</Text>
      <Text size="xl">Extra large text</Text>
      <Text weight="bold" color="primary">
        Primary bold text
      </Text>
      <Text color="hint" align="center">
        Centered hint text
      </Text>
      <Text truncate style={{ maxWidth: 220 }}>
        A very long line that is truncated with an ellipsis once it overflows
      </Text>
      <Text lineClamp={2} style={{ maxWidth: 260 }}>
        A longer paragraph that is clamped to two lines so the remaining content stays hidden from
        the layout.
      </Text>
    </div>
  );
}

export function InlineElements() {
  return (
    <div>
      <Paragraph>
        Read the <Code>README</Code> and check the <Link href="#docs">documentation</Link> before
        running the build.
      </Paragraph>
      <Paragraph>
        <Link href="https://example.com" external>
          Open the external reference
        </Link>
      </Paragraph>
      <Blockquote>Simplicity is the ultimate sophistication.</Blockquote>
    </div>
  );
}
