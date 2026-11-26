import React, { useId, useRef } from 'react';
import { useIsomorphicEffect } from '@nebular-react/hooks';
import { DefaultProps, Selectors, createStyles } from '@nebular-react/styles';
import { Button } from '../Button';
import { Fieldset } from '../Fieldset';

export interface RepeatableFieldsetItemContext<T> {
  item: T;
  index: number;
  itemKey: React.Key;
  /** Stable across reordering. Use as an input ID or as a prefix for multiple fields. */
  inputId: string;
  disabled: boolean;
  /** Replace the item while retaining its key. */
  onChange(item: T): void;
}

/** Position arguments passed to label functions are one-based. */
export interface RepeatableFieldsetLabels {
  add: string;
  empty: string;
  item(position: number): string;
  remove(position: number): string;
  moveUp(position: number): string;
  moveDown(position: number): string;
  up: string;
  down: string;
  removeVisible: string;
}

const defaultLabels: RepeatableFieldsetLabels = {
  add: 'Add item',
  empty: 'No items',
  item: (position) => `Item ${position}`,
  remove: (position) => `Remove item ${position}`,
  moveUp: (position) => `Move up, item ${position}`,
  moveDown: (position) => `Move down, item ${position}`,
  up: 'Move up',
  down: 'Move down',
  removeVisible: 'Remove'
};

const useStyles = createStyles(() => ({
  root: { minWidth: 0 },
  list: {
    display: 'grid',
    gap: 'var(--repeatable-fieldset-gap, 0.75rem)',
    padding: 0,
    margin: 0,
    listStyle: 'none'
  },
  item: { minWidth: 0 },
  fields: { minWidth: 0 },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: '0.5rem',
    rowGap: '0.25rem'
  },
  empty: {
    margin: 0,
    color: 'var(--repeatable-fieldset-empty-color, var(--text-basic-color, #222b45))'
  },
  add: { alignSelf: 'flex-start' }
}));

export type RepeatableFieldsetStylesNames = Selectors<typeof useStyles>;

export interface RepeatableFieldsetProps<T> extends DefaultProps<RepeatableFieldsetStylesNames> {
  legend?: React.ReactNode;
  description?: React.ReactNode;
  ariaLabel?: string;
  items: readonly T[];
  /** Return a unique key for each row that stays the same when its contents change. */
  getItemKey(item: T): React.Key;
  createItem(): T;
  onChange(items: T[]): void;
  renderItem(context: RepeatableFieldsetItemContext<T>): React.ReactNode;
  minItems?: number;
  maxItems?: number;
  disabled?: boolean;
  labels?: Partial<RepeatableFieldsetLabels>;
  ref?: React.Ref<HTMLFieldSetElement>;
}

type Move = 'up' | 'down';
type FocusTarget = { key: React.Key; control?: Move } | null;
type PendingFocus = { keys: React.Key[]; target: FocusTarget; previous: Element | null };

const focusableField =
  'input:not([type="hidden"]), select, textarea, button, a[href], [tabindex="0"]';

function focusItem(row: HTMLLIElement | undefined, control?: Move) {
  const move =
    control &&
    (row?.querySelector<HTMLButtonElement>(`[data-move="${control}"]:not(:disabled)`) ??
      row?.querySelector<HTMLButtonElement>('[data-move]:not(:disabled)'));
  const fields = row?.querySelector('[data-repeatable-fields]');
  const field =
    fields &&
    Array.from(fields.querySelectorAll<HTMLElement>(focusableField)).find(
      (candidate) =>
        candidate.tabIndex >= 0 &&
        !candidate.matches(':disabled') &&
        !candidate.closest('[hidden], [inert], [aria-hidden="true"]')
    );
  (move || field || row)?.focus();
}

function ItemFields<T>({
  context,
  renderItem,
  className
}: {
  context: Omit<RepeatableFieldsetItemContext<T>, 'inputId'>;
  renderItem: RepeatableFieldsetProps<T>['renderItem'];
  className: string;
}) {
  const inputId = useId();
  return (
    <div data-repeatable-fields="" className={className}>
      {renderItem({ ...context, inputId })}
    </div>
  );
}

export function RepeatableFieldset<T>({
  legend,
  description,
  ariaLabel,
  items,
  getItemKey,
  createItem,
  onChange,
  renderItem,
  minItems = 0,
  maxItems = Infinity,
  disabled = false,
  labels,
  className,
  classNames,
  styles,
  unstyled,
  ref
}: RepeatableFieldsetProps<T>) {
  const { classes, cx } = useStyles(null, {
    name: 'repeatable-fieldset',
    classNames,
    styles,
    unstyled
  });
  const text = { ...defaultLabels, ...labels };
  const itemNodes = useRef(new Map<React.Key, HTMLLIElement>());
  const addButton = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<PendingFocus | null>(null);
  const canAdd = !disabled && items.length < maxItems;
  const canRemove = !disabled && items.length > minItems;

  useIsomorphicEffect(() => {
    const pending = pendingFocus.current;
    if (
      !pending ||
      pending.keys.length !== items.length ||
      !items.every((item, index) => getItemKey(item) === pending.keys[index])
    )
      return;

    pendingFocus.current = null;
    const document = addButton.current?.ownerDocument;
    const active = document?.activeElement;
    if (active && active !== pending.previous && active !== document?.body) return;

    if (pending.target) {
      focusItem(itemNodes.current.get(pending.target.key), pending.target.control);
    } else {
      addButton.current?.focus();
    }
  }, [items, getItemKey]);

  const changeStructure = (next: T[], target: FocusTarget) => {
    pendingFocus.current = {
      keys: next.map((item) => getItemKey(item)),
      target,
      previous: addButton.current?.ownerDocument.activeElement ?? null
    };
    onChange(next);
  };

  const addItem = () => {
    const item = createItem();
    const key = getItemKey(item);
    if (!items.some((current) => getItemKey(current) === key)) {
      changeStructure([...items, item], { key });
    }
  };

  const removeItem = (index: number) => {
    const remaining = items.filter((_, itemIndex) => itemIndex !== index);
    const nextIndex = Math.min(index, remaining.length - 1);
    changeStructure(remaining, nextIndex < 0 ? null : { key: getItemKey(remaining[nextIndex]) });
  };

  const moveItem = (index: number, to: number, control: Move) => {
    const reordered = [...items];
    [reordered[index], reordered[to]] = [reordered[to], reordered[index]];
    changeStructure(reordered, { key: getItemKey(items[index]), control });
  };

  const editItem = (index: number, item: T) => {
    if (!disabled && getItemKey(item) === getItemKey(items[index])) {
      onChange(items.map((current, itemIndex) => (itemIndex === index ? item : current)));
    }
  };

  return (
    <Fieldset
      ref={ref}
      legend={legend}
      description={description}
      ariaLabel={ariaLabel ?? (legend == null ? 'Repeatable fields' : undefined)}
      disabled={disabled}
      unstyled={unstyled}
      className={cx(classes.root, className)}
    >
      {items.length ? (
        <ol className={classes.list}>
          {items.map((item, index) => {
            const key = getItemKey(item);
            const position = index + 1;

            return (
              <li
                key={key}
                ref={(node) => {
                  if (node) itemNodes.current.set(key, node);
                  else itemNodes.current.delete(key);
                }}
                tabIndex={-1}
                className={classes.item}
              >
                <Fieldset legend={text.item(position)} unstyled={unstyled}>
                  <ItemFields
                    className={classes.fields}
                    renderItem={renderItem}
                    context={{
                      item,
                      index,
                      itemKey: key,
                      disabled,
                      onChange: (next) => editItem(index, next)
                    }}
                  />
                  <div className={classes.actions}>
                    <Button
                      type="button"
                      size="small"
                      appearance="ghost"
                      data-move="up"
                      aria-label={text.moveUp(position)}
                      disabled={disabled || index === 0}
                      onClick={() => moveItem(index, index - 1, 'up')}
                    >
                      {text.up}
                    </Button>
                    <Button
                      type="button"
                      size="small"
                      appearance="ghost"
                      data-move="down"
                      aria-label={text.moveDown(position)}
                      disabled={disabled || position === items.length}
                      onClick={() => moveItem(index, index + 1, 'down')}
                    >
                      {text.down}
                    </Button>
                    <Button
                      type="button"
                      size="small"
                      appearance="ghost"
                      aria-label={text.remove(position)}
                      disabled={!canRemove}
                      onClick={() => removeItem(index)}
                    >
                      {text.removeVisible}
                    </Button>
                  </div>
                </Fieldset>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className={classes.empty}>{text.empty}</p>
      )}
      <Button
        ref={addButton}
        type="button"
        size="small"
        appearance="outline"
        className={classes.add}
        disabled={!canAdd}
        onClick={addItem}
      >
        {text.add}
      </Button>
    </Fieldset>
  );
}
