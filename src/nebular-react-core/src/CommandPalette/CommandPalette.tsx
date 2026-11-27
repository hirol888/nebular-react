import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { Input } from '../Input';
import { Icon } from '../Icon';

export interface CommandPaletteAction {
  id: string;
  label: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  keywords?: string[];
  /** Optional group heading used to organize results. */
  group?: string;
  onSelect(): void;
}

export interface CommandPaletteProps extends DefaultProps<CommandPaletteStylesNames> {
  opened: boolean;
  onClose(): void;
  actions: CommandPaletteAction[];
  /** Delegates filtering to the consumer. Called on every query change. */
  onSearch?(query: string): void;
  loading?: boolean;
  loadingMessage?: React.ReactNode;
  /** Shown above the regular actions while the query is empty. */
  recentActions?: CommandPaletteAction[];
  recentLabel?: React.ReactNode;
  placeholder?: string;
  nothingFoundMessage?: React.ReactNode;
  ariaLabel?: string;
  zIndex?: number;
}

const useStyles = createStyles((_theme, { zIndex }: { zIndex: number }) => ({
  root: {
    position: 'fixed',
    inset: 0,
    zIndex,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '10vh 1rem 1rem'
  },

  backdrop: {
    position: 'absolute',
    inset: 0,
    padding: 0,
    border: 0,
    backgroundColor: 'var(--command-palette-backdrop-color, rgba(0, 0, 0, 0.35))'
  },

  panel: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 'var(--command-palette-max-width, 36rem)',
    maxHeight: 'var(--command-palette-max-height, 28rem)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 'var(--command-palette-border-radius, 0.5rem)',
    backgroundColor:
      'var(--command-palette-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--command-palette-shadow, 0 12px 40px rgba(0, 0, 0, 0.25))'
  },

  search: {
    padding: '0.75rem'
  },

  list: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    padding: '0.25rem'
  },

  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    width: '100%',
    padding: '0.55rem 0.65rem',
    border: 0,
    borderRadius: 'var(--command-palette-item-border-radius, 0.25rem)',
    background: 'transparent',
    color: 'var(--command-palette-item-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-2px'
    }
  },

  itemActive: {
    backgroundColor:
      'var(--command-palette-item-active-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--command-palette-icon-color, var(--text-hint-color, #8f9bb3))'
  },

  text: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    minWidth: 0
  },

  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.35
  },

  description: {
    color: 'var(--command-palette-description-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.75rem',
    lineHeight: 1.35
  },

  empty: {
    padding: '1rem',
    color: 'var(--command-palette-empty-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.8125rem',
    textAlign: 'center'
  },

  status: {
    padding: '0.75rem 1rem',
    color: 'var(--command-palette-empty-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.8125rem',
    textAlign: 'center'
  },

  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    padding: '0.15rem 0'
  },

  groupLabel: {
    padding: '0.35rem 0.65rem 0.2rem',
    color: 'var(--command-palette-group-label-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    lineHeight: 1.3,
    textTransform: 'uppercase'
  }
}));

export type CommandPaletteStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<CommandPaletteProps> = {
  placeholder: 'Search commands…',
  nothingFoundMessage: 'No commands found',
  loading: false,
  loadingMessage: 'Searching…',
  recentLabel: 'Recent',
  ariaLabel: 'Command palette',
  zIndex: 1200
};

const CommandPaletteComponent = (props: CommandPaletteProps) => {
  const {
    opened,
    onClose,
    actions,
    onSearch,
    loading,
    loadingMessage,
    recentActions,
    recentLabel,
    placeholder,
    nothingFoundMessage,
    ariaLabel,
    zIndex,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { zIndex },
    { name: 'command-palette', classNames, styles, unstyled }
  );
  const { t } = useNebularLocale();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = query.trim().toLowerCase();

  const visibleActions = useMemo(() => {
    const base =
      typeof onSearch === 'function'
        ? actions
        : normalizedQuery
          ? actions.filter((action) => {
              const searchable = [action.label, ...(action.keywords ?? [])].join(' ').toLowerCase();
              return searchable.includes(normalizedQuery);
            })
          : actions;

    if (!normalizedQuery && recentActions?.length) {
      const seen = new Set<string>();
      return [...recentActions, ...base].filter((action) => {
        if (seen.has(action.id)) {
          return false;
        }

        seen.add(action.id);
        return true;
      });
    }

    return base;
  }, [actions, normalizedQuery, onSearch, recentActions]);

  const groups = useMemo(() => {
    const result: Array<{ label?: React.ReactNode; actions: CommandPaletteAction[] }> = [];
    const recent = !normalizedQuery && recentActions?.length ? recentActions : [];
    const recentIds = new Set(recent.map((action) => action.id));

    if (recent.length > 0) {
      result.push({ label: recentLabel, actions: recent });
    }

    const grouped = new Map<string | undefined, CommandPaletteAction[]>();

    visibleActions
      .filter((action) => !recentIds.has(action.id))
      .forEach((action) => {
        const list = grouped.get(action.group);

        if (list) {
          list.push(action);
        } else {
          grouped.set(action.group, [action]);
        }
      });

    grouped.forEach((groupActions, label) => result.push({ label, actions: groupActions }));
    return result;
  }, [normalizedQuery, recentActions, recentLabel, visibleActions]);

  const indexById = useMemo(
    () => new Map(visibleActions.map((action, index) => [action.id, index])),
    [visibleActions]
  );

  useEffect(() => {
    if (opened) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [opened]);

  useEffect(() => {
    if (activeIndex >= visibleActions.length) {
      setActiveIndex(Math.max(0, visibleActions.length - 1));
    }
  }, [activeIndex, visibleActions.length]);

  if (!opened || typeof document === 'undefined') {
    return null;
  }

  const runAction = (action: CommandPaletteAction) => {
    action.onSelect();
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, visibleActions.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const action = visibleActions[activeIndex];

      if (action) {
        runAction(action);
      }
    }
  };

  return createPortal(
    <div className={cx(classes.root, className)}>
      <button
        type="button"
        className={cx(classes.backdrop)}
        aria-label={t('commandPalette.close', 'Close command palette')}
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        className={cx(classes.panel)}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !event.defaultPrevented) {
            event.preventDefault();
            onClose();
          }
        }}
      >
        <div className={cx(classes.search)}>
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              setActiveIndex(0);
              onSearch?.(nextQuery);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label={ariaLabel}
            role="combobox"
            aria-expanded="true"
            aria-controls="nebular-command-palette-list"
            aria-activedescendant={
              visibleActions[activeIndex]
                ? `nebular-command-${visibleActions[activeIndex].id}`
                : undefined
            }
          />
        </div>
        <div
          id="nebular-command-palette-list"
          role="listbox"
          aria-label={ariaLabel}
          aria-busy={loading || undefined}
          className={cx(classes.list)}
        >
          {loading && (
            <div className={cx(classes.status)} role="status">
              {loadingMessage}
            </div>
          )}
          {visibleActions.length === 0 && !loading ? (
            <div className={cx(classes.empty)}>{nothingFoundMessage}</div>
          ) : (
            groups.map((group, groupIndex) => (
              <div
                key={`${typeof group.label === 'string' ? group.label : 'group'}-${groupIndex}`}
                role={typeof group.label === 'string' ? 'group' : 'presentation'}
                aria-label={typeof group.label === 'string' ? group.label : undefined}
                className={cx(classes.group)}
              >
                {group.label != null && (
                  <div className={cx(classes.groupLabel)} aria-hidden="true">
                    {group.label}
                  </div>
                )}
                {group.actions.map((action) => {
                  const index = indexById.get(action.id) ?? 0;

                  return (
                    <button
                      key={action.id}
                      id={`nebular-command-${action.id}`}
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      className={cx(classes.item, {
                        [classes.itemActive]: index === activeIndex
                      })}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => runAction(action)}
                    >
                      {action.icon && <span className={cx(classes.icon)}>{action.icon}</span>}
                      <span className={cx(classes.text)}>
                        <span className={cx(classes.label)}>{action.label}</span>
                        {action.description && (
                          <span className={cx(classes.description)}>{action.description}</span>
                        )}
                      </span>
                      {index === activeIndex && (
                        <Icon
                          icon="corner-down-left-outline"
                          pack="nebular-essentials"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

CommandPaletteComponent.displayName = 'CommandPalette';

export { CommandPaletteComponent as CommandPalette };
