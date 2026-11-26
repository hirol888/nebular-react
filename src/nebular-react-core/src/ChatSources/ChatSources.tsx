import React, { forwardRef, useId } from 'react';
import type { ReactNode } from 'react';
import { useUncontrolled } from '@nebular-react/hooks';
import { createStyles, useComponentDefaultProps } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';

const useStyles = createStyles(() => ({
  root: { display: 'grid', justifyItems: 'start', gap: '0.5rem', minWidth: 0 },
  trigger: { maxWidth: '100%' },
  list: {
    margin: 0,
    paddingInlineStart: '1.5rem',
    maxWidth: '100%',
    overflowWrap: 'anywhere',
    '&[hidden]': { display: 'none' }
  },
  item: { paddingBlock: '0.25rem' },
  link: {
    color: 'var(--text-primary-color, #3366ff)',
    textDecoration: 'underline',
    '&:focus-visible': { outline: '2px solid var(--color-primary-500, #3366ff)' }
  },
  title: { fontWeight: 600 },
  excerpt: { margin: '0.25rem 0 0', color: 'var(--text-basic-color, #222b45)' }
}));

export type ChatSourcesStylesNames = Selectors<typeof useStyles>;

export interface ChatSource {
  id: string;
  title: string;
  href?: string;
  excerpt?: ReactNode;
}

export interface ChatSourcesProps extends DefaultProps<ChatSourcesStylesNames> {
  items: readonly ChatSource[];
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?(expanded: boolean): void;
  onSourceClick?(source: ChatSource): void;
  label?: (count: number) => string;
}

const defaultProps: Partial<ChatSourcesProps> = { label: (count) => `Sources (${count})` };

function getLink(href: string | undefined): string | undefined {
  if (!href?.trim()) return undefined;
  try {
    const { protocol } = new URL(href, 'https://nebular.invalid');
    return protocol === 'http:' || protocol === 'https:' ? href : undefined;
  } catch {
    return undefined;
  }
}

const ChatSources = forwardRef<HTMLDivElement, ChatSourcesProps>((props, ref) => {
  const {
    items,
    expanded,
    defaultExpanded,
    onExpandedChange,
    onSourceClick,
    label,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'chat-sources', classNames, styles, unstyled });
  const [opened, setOpened] = useUncontrolled({
    value: expanded,
    defaultValue: defaultExpanded,
    finalValue: true,
    onChange: onExpandedChange
  });
  const listId = useId();

  if (!items.length) return null;

  return (
    <div ref={ref} className={cx(classes.root, className)}>
      <Button
        type="button"
        appearance="ghost"
        size="small"
        status="basic"
        className={classes.trigger}
        aria-expanded={opened}
        aria-controls={listId}
        onClick={() => setOpened(!opened)}
      >
        {label(items.length)}
      </Button>
      <ol id={listId} className={classes.list} hidden={!opened}>
        {items.map((item) => {
          const link = getLink(item.href);
          return (
            <li key={item.id} className={classes.item}>
              {link ? (
                <a
                  href={link}
                  className={cx(classes.link, classes.title)}
                  onClick={() => onSourceClick?.(item)}
                >
                  {item.title}
                </a>
              ) : onSourceClick ? (
                <Button
                  type="button"
                  size="small"
                  appearance="ghost"
                  onClick={() => onSourceClick(item)}
                >
                  {item.title}
                </Button>
              ) : (
                <span className={classes.title}>{item.title}</span>
              )}
              {item.excerpt != null && <div className={classes.excerpt}>{item.excerpt}</div>}
            </li>
          );
        })}
      </ol>
    </div>
  );
});

ChatSources.displayName = 'ChatSources';

export { ChatSources };
