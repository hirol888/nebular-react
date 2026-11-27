import React, { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useUncontrolled } from '@nebular-react/hooks';
import { createStyles, useNebularIconPacks } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { NativeSelect } from '../NativeSelect';
import { Pagination } from '../Pagination';

export interface IconPickerValue {
  pack: string;
  name: string;
}

export interface IconPickerLabels {
  search: string;
  pack: string;
  allPacks: string;
  results: string;
  empty: string;
  clear: string;
  pagination: string;
  iconLabel(icon: IconPickerValue): string;
  pageLabel(page: number): string;
}

const defaultLabels: IconPickerLabels = {
  search: 'Search icons',
  pack: 'Icon pack',
  allPacks: 'All packs',
  results: 'Icon results',
  empty: 'No matching icons.',
  clear: 'Clear selection',
  pagination: 'Icon pages',
  iconLabel: ({ name, pack }) => `${name} (${pack})`,
  pageLabel: (page) => `Page ${page}`
};

const useStyles = createStyles(() => ({
  root: { display: 'grid', gap: '0.5rem', minWidth: 0 },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 11rem), 1fr))',
    gap: '0.5rem',
    alignItems: 'end'
  },
  listbox: {
    maxHeight: 'var(--icon-picker-list-max-height, 20rem)',
    overflowY: 'auto',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--border-radius, 0.25rem)',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    cursor: 'pointer',
    overflowWrap: 'anywhere',

    '&[data-active="true"]': {
      backgroundColor: 'var(--background-basic-color-2, #f7f9fc)'
    },

    '&[aria-selected="true"]': {
      color: 'var(--color-primary-700, #274bdb)',
      fontWeight: 600
    }
  },
  preview: { flex: '0 0 1.25rem', width: '1.25rem', height: '1.25rem' },
  packName: {
    marginInlineStart: 'auto',
    color: 'var(--text-basic-color, #222b45)',
    fontSize: '0.75rem'
  },
  empty: { margin: 0, color: 'var(--text-basic-color, #222b45)' },
  clear: { justifySelf: 'start' }
}));

export type IconPickerStylesNames = Selectors<typeof useStyles>;

export interface IconPickerProps
  extends
    DefaultProps<IconPickerStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue' | 'children'> {
  value?: IconPickerValue | null;
  defaultValue?: IconPickerValue | null;
  onChange?(value: IconPickerValue | null): void;
  /** Limit results to these registered pack names. */
  packs?: readonly string[];
  /** Names to enumerate in font packs, which otherwise only register CSS metadata. */
  fontIcons?: Readonly<Record<string, readonly string[]>>;
  pageSize?: number;
  clearable?: boolean;
  disabled?: boolean;
  labels?: Partial<IconPickerLabels>;
}

function iconKey({ pack, name }: IconPickerValue) {
  return JSON.stringify([pack, name]);
}

export const IconPicker = forwardRef<HTMLDivElement, IconPickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    packs,
    fontIcons,
    pageSize = 40,
    clearable,
    disabled,
    labels,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = props;
  const text = { ...defaultLabels, ...labels };
  const { classes, cx } = useStyles(null, {
    name: 'icon-picker',
    classNames,
    styles,
    unstyled
  });
  const [selected, setSelected] = useUncontrolled({
    value,
    defaultValue,
    finalValue: null,
    onChange
  });
  const [query, setQuery] = useState('');
  const [pack, setPack] = useState('');
  const [page, setPage] = useState(1);
  const [activeKey, setActiveKey] = useState<string>();
  const { svgIconPacks, fontIconPacks } = useNebularIconPacks();
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const catalog = useMemo(() => {
    const packNames = new Set<string>(svgIconPacks?.keys());
    fontIconPacks?.forEach((_, name) => {
      if (fontIcons?.[name]?.length) packNames.add(name);
    });

    return Array.from(packNames)
      .filter((name) => !packs || packs.includes(name))
      .sort()
      .map((name) => {
        const names = new Set(svgIconPacks?.get(name)?.keys());
        if (fontIconPacks?.has(name)) fontIcons?.[name]?.forEach((icon) => names.add(icon));
        return { pack: name, names: Array.from(names).sort() };
      });
  }, [svgIconPacks, fontIconPacks, fontIcons, packs]);
  const filterPack = catalog.some((entry) => entry.pack === pack) ? pack : '';
  const normalizedQuery = query.trim().toLowerCase();
  const matches = catalog
    .filter((entry) => !filterPack || entry.pack === filterPack)
    .flatMap((entry) =>
      entry.names
        .filter((name) => name.toLowerCase().includes(normalizedQuery))
        .map((name) => ({ pack: entry.pack, name }))
    );
  const limit = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 40;
  const lastPage = Math.max(1, Math.ceil(matches.length / limit));
  const visiblePage = Math.min(page, lastPage);
  const options = matches.slice((visiblePage - 1) * limit, visiblePage * limit);
  const selectedKey = selected ? iconKey(selected) : undefined;
  const activeIndex = options.findIndex((icon) => iconKey(icon) === (activeKey ?? selectedKey));
  const index = Math.max(0, activeIndex);
  const activeId = options.length ? `${listId}-${index}` : undefined;

  useEffect(() => {
    if (listRef.current === document.activeElement) {
      activeRef.current?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [activeId]);

  const resetResults = () => {
    setPage(1);
    setActiveKey(undefined);
  };

  const onListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || !options.length) return;
    const { key } = event;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      setSelected(options[index]);
      return;
    }

    const nextByKey: Record<string, number> = {
      ArrowDown: Math.min(index + 1, options.length - 1),
      ArrowUp: Math.max(index - 1, 0),
      Home: 0,
      End: options.length - 1
    };
    const next = nextByKey[key];
    if (typeof next === 'number') {
      event.preventDefault();
      setActiveKey(iconKey(options[next]));
    }
  };

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      <div className={classes.filters}>
        <Input
          type="search"
          fullWidth
          aria-label={text.search}
          placeholder={text.search}
          disabled={disabled}
          aria-controls={options.length ? listId : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            resetResults();
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' && options.length) {
              event.preventDefault();
              listRef.current?.focus();
            }
          }}
        />
        {catalog.length > 1 && (
          <NativeSelect
            label={text.pack}
            data={[
              { value: '', label: text.allPacks },
              ...catalog.map((entry) => ({ value: entry.pack, label: entry.pack }))
            ]}
            disabled={disabled}
            value={filterPack}
            onChange={(next) => {
              setPack(next);
              resetResults();
            }}
          />
        )}
      </div>

      {options.length ? (
        <div
          id={listId}
          ref={listRef}
          role="listbox"
          aria-label={text.results}
          aria-disabled={disabled || undefined}
          aria-activedescendant={activeId}
          tabIndex={disabled ? -1 : 0}
          className={classes.listbox}
          onFocus={() => activeRef.current?.scrollIntoView?.({ block: 'nearest' })}
          onKeyDown={onListKeyDown}
        >
          {options.map((icon, position) => {
            const key = iconKey(icon);
            return (
              <div
                id={`${listId}-${position}`}
                key={key}
                ref={position === index ? activeRef : undefined}
                role="option"
                tabIndex={-1}
                aria-label={text.iconLabel(icon)}
                aria-selected={selectedKey === key}
                data-active={position === index}
                className={classes.option}
                onClick={() => {
                  if (!disabled) {
                    setActiveKey(key);
                    setSelected(icon);
                    listRef.current?.focus();
                  }
                }}
              >
                <Icon className={classes.preview} pack={icon.pack} icon={icon.name} />
                <span>{icon.name}</span>
                {catalog.length > 1 && !filterPack && (
                  <span className={classes.packName}>{icon.pack}</span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className={classes.empty} role="status">
          {text.empty}
        </p>
      )}
      {lastPage > 1 && (
        <Pagination
          ariaLabel={text.pagination}
          getItemA11yLabel={text.pageLabel}
          total={lastPage}
          page={visiblePage}
          disabled={disabled}
          onChange={(next) => {
            setPage(next);
            setActiveKey(undefined);
          }}
        />
      )}
      {clearable && selected && (
        <Button
          type="button"
          appearance="ghost"
          className={classes.clear}
          disabled={disabled}
          onClick={() => setSelected(null)}
        >
          {text.clear}
        </Button>
      )}
    </div>
  );
});

IconPicker.displayName = 'IconPicker';
