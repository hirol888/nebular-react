import React, { forwardRef, useState } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { Input } from '../Input';
import { Icon } from '../Icon';

export interface TransferItem {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface TransferLabels {
  search: string;
  moveToSelected: string;
  moveToAvailable: string;
}

export interface TransferProps
  extends
    DefaultProps<TransferStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  data: TransferItem[];
  value?: string[];
  defaultValue?: string[];
  onChange?(value: string[]): void;
  titles?: [React.ReactNode, React.ReactNode];
  searchable?: boolean;
  nothingFoundMessage?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  labels?: Partial<TransferLabels>;
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '0.75rem',
    width: '100%',
    fontFamily: 'inherit'
  },

  panel: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0',
    minWidth: 0,
    minHeight: 'var(--transfer-panel-min-height, 16rem)',
    border: '1px solid var(--transfer-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--transfer-border-radius, 0.5rem)',
    overflow: 'hidden'
  },

  header: {
    padding: '0.5rem 0.75rem',
    borderBottom: '1px solid var(--transfer-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--transfer-header-background-color, var(--background-basic-color-2, #f7f9fc))',
    color: 'var(--transfer-header-color, var(--text-basic-color, #222b45))',
    fontSize: '0.8125rem',
    fontWeight: 600
  },

  search: {
    padding: '0.5rem'
  },

  list: {
    flex: 1,
    margin: 0,
    padding: '0.25rem',
    listStyle: 'none',
    overflow: 'auto'
  },

  item: {
    padding: '0.3rem 0.4rem',
    borderRadius: '0.25rem'
  },

  empty: {
    padding: '1rem',
    color: 'var(--transfer-empty-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.75rem',
    textAlign: 'center'
  },

  actions: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '0.35rem'
  },

  actionButton: {
    minWidth: '2.25rem'
  }
}));

export type TransferStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<TransferProps> = {
  defaultValue: [],
  titles: ['Available', 'Selected'],
  searchable: true,
  nothingFoundMessage: 'No items',
  disabled: false,
  ariaLabel: 'Transfer'
};

const _Transfer = forwardRef<HTMLDivElement, TransferProps>((props, ref) => {
  const {
    data,
    value,
    defaultValue,
    onChange,
    titles,
    searchable,
    nothingFoundMessage,
    disabled,
    ariaLabel,
    labels,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'transfer',
    classNames,
    styles,
    unstyled
  });
  const { t } = useNebularLocale();
  const resolvedLabels: TransferLabels = {
    search: t('transfer.search', 'Search'),
    moveToSelected: t('transfer.moveToSelected', 'Move selected to the right'),
    moveToAvailable: t('transfer.moveToAvailable', 'Move selected to the left'),
    ...labels
  };
  const [selectedValues, setSelectedValues] = useUncontrolled<string[]>({
    value,
    defaultValue,
    finalValue: [],
    onChange
  });
  const [sourceChecked, setSourceChecked] = useState<string[]>([]);
  const [targetChecked, setTargetChecked] = useState<string[]>([]);
  const [sourceQuery, setSourceQuery] = useState('');
  const [targetQuery, setTargetQuery] = useState('');

  const getSearchText = (item: TransferItem) =>
    `${typeof item.label === 'string' ? item.label : ''} ${item.value}`.toLowerCase();

  const sourceItems = data.filter(
    (item) =>
      !selectedValues.includes(item.value) &&
      getSearchText(item).includes(sourceQuery.trim().toLowerCase())
  );
  const targetItems = data.filter(
    (item) =>
      selectedValues.includes(item.value) &&
      getSearchText(item).includes(targetQuery.trim().toLowerCase())
  );

  const toggle = (list: string[], itemValue: string, checked: boolean) =>
    checked ? [...list, itemValue] : list.filter((valueItem) => valueItem !== itemValue);

  const moveToTarget = () => {
    setSelectedValues(Array.from(new Set([...selectedValues, ...sourceChecked])));
    setSourceChecked([]);
  };

  const moveToSource = () => {
    setSelectedValues(selectedValues.filter((item) => !targetChecked.includes(item)));
    setTargetChecked([]);
  };

  const renderPanel = (
    title: React.ReactNode,
    items: TransferItem[],
    checked: string[],
    query: string,
    setQuery: (query: string) => void,
    setChecked: (values: string[]) => void
  ) => (
    <div className={cx(classes.panel)}>
      <div className={cx(classes.header)}>{title}</div>
      {searchable && (
        <div className={cx(classes.search)}>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={resolvedLabels.search}
            aria-label={
              typeof title === 'string'
                ? `${resolvedLabels.search} ${title}`
                : resolvedLabels.search
            }
            disabled={disabled}
          />
        </div>
      )}
      <ul className={cx(classes.list)}>
        {items.length === 0 ? (
          <li className={cx(classes.empty)}>{nothingFoundMessage}</li>
        ) : (
          items.map((item) => (
            <li key={item.value} className={cx(classes.item)}>
              <Checkbox
                checked={checked.includes(item.value)}
                disabled={disabled || item.disabled}
                onCheck={(isChecked) => setChecked(toggle(checked, item.value, isChecked))}
              >
                {item.label}
              </Checkbox>
            </li>
          ))
        )}
      </ul>
    </div>
  );

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)} aria-label={ariaLabel}>
      {renderPanel(
        titles[0],
        sourceItems,
        sourceChecked,
        sourceQuery,
        setSourceQuery,
        setSourceChecked
      )}
      <div className={cx(classes.actions)}>
        <Button
          className={cx(classes.actionButton)}
          size="small"
          disabled={disabled || sourceChecked.length === 0}
          onClick={moveToTarget}
          aria-label={resolvedLabels.moveToSelected}
        >
          <Icon icon="arrow-forward-outline" pack="nebular-essentials" aria-hidden="true" />
        </Button>
        <Button
          className={cx(classes.actionButton)}
          size="small"
          disabled={disabled || targetChecked.length === 0}
          onClick={moveToSource}
          aria-label={resolvedLabels.moveToAvailable}
        >
          <Icon icon="arrow-back-outline" pack="nebular-essentials" aria-hidden="true" />
        </Button>
      </div>
      {renderPanel(
        titles[1],
        targetItems,
        targetChecked,
        targetQuery,
        setTargetQuery,
        setTargetChecked
      )}
    </div>
  );
});

_Transfer.displayName = 'Transfer';

export { _Transfer as Transfer };
