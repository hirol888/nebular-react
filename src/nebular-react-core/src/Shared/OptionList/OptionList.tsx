import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ComponentSize,
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  ForwardRefWithStaticComponents
} from '@nebular-react/styles';
import { Position, useId, KeyManagerType } from '@nebular-react/hooks';
import useStyles, { OptionListStylesParams } from './OptionList.style';
import { OptionListContext } from './OptionList.context';
import { OptionComponent } from './Option/OptionComponent';
import { OptionGroupComponent } from './OptionGroup/OptionGroupComponent';
import { OptionGroup, OptionInternal } from './types';

export type OptionListStylesNames = Selectors<typeof useStyles>;

export interface OptionListProps extends DefaultProps<
  OptionListStylesNames,
  OptionListStylesParams
> {
  data: (OptionInternal | OptionGroup)[];
  size?: ComponentSize;
  multiple?: boolean;
  position?: Position;
  keyManagerType?: KeyManagerType;
  onOptionSelected?: (option: { label?: string; value?: string; selected?: boolean }) => void;
  ariaLabel?: string;
  listId?: string;
  getOptionProps?: React.ComponentProps<typeof OptionGroupComponent>['getOptionProps'];
  virtualized?: boolean;
  virtualizedItemHeight?: number;
  virtualizedMaxHeight?: number;
  overscan?: number;
  renderOption?: (option: OptionInternal) => React.ReactNode;
}

type OptionListComponent = ForwardRefWithStaticComponents<
  OptionListProps,
  { OptionGroup: typeof OptionGroupComponent; Option: typeof OptionComponent }
>;

type FlatRow =
  | { kind: 'group'; group: OptionGroup }
  | {
      kind: 'option';
      option: OptionInternal;
      group?: OptionGroup;
      optionIndex: number;
    };

interface VisibleSegment {
  group?: OptionGroup;
  firstRowIndex: number;
  rows: { row: FlatRow; rowIndex: number }[];
}

const defaultProps: Partial<OptionListProps> = {
  data: [],
  size: 'medium',
  multiple: false,
  keyManagerType: 'focus',
  ariaLabel: 'Options',
  virtualized: false,
  virtualizedItemHeight: 36,
  virtualizedMaxHeight: 300,
  overscan: 3
};

const OptionList: OptionListComponent = (props) => {
  const {
    className,
    size,
    multiple,
    position,
    onOptionSelected,
    keyManagerType,
    classNames,
    styles,
    unstyled,
    data,
    ariaLabel,
    listId,
    getOptionProps,
    virtualized,
    virtualizedItemHeight,
    virtualizedMaxHeight,
    overscan,
    renderOption,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { position, itemsCount: data.length },
    {
      name: 'option-list',
      unstyled,
      classNames,
      styles
    }
  );

  const uuid = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const { rows, totalOptions } = useMemo(() => {
    let optionIndex = 0;
    const nextRows: FlatRow[] = [];

    data.forEach((item) => {
      if (item.type === 'group') {
        nextRows.push({ kind: 'group', group: item });
        (item.options ?? []).forEach((option) => {
          nextRows.push({ kind: 'option', option, group: item, optionIndex });
          optionIndex += 1;
        });
        return;
      }

      nextRows.push({ kind: 'option', option: item, optionIndex });
      optionIndex += 1;
    });

    return { rows: nextRows, totalOptions: optionIndex };
  }, [data]);

  const canVirtualize = virtualized && rows.length > 0;
  const totalHeight = rows.length * virtualizedItemHeight;
  const startIndex = canVirtualize
    ? Math.max(0, Math.floor(scrollTop / virtualizedItemHeight) - overscan)
    : 0;
  const endIndex = canVirtualize
    ? Math.min(
        rows.length,
        Math.ceil((scrollTop + virtualizedMaxHeight) / virtualizedItemHeight) + overscan
      )
    : rows.length;
  const visibleRows = canVirtualize ? rows.slice(startIndex, endIndex) : rows;
  const activeRowIndex = canVirtualize
    ? rows.findIndex((row) => row.kind === 'option' && row.option.active)
    : -1;

  const segments = useMemo(() => {
    const nextSegments: VisibleSegment[] = [];

    visibleRows.forEach((row, offset) => {
      const rowIndex = startIndex + offset;
      const group = row.kind === 'group' ? row.group : row.group;
      const lastSegment = nextSegments[nextSegments.length - 1];

      if (lastSegment && lastSegment.group === group && group !== undefined) {
        lastSegment.rows.push({ row, rowIndex });
        return;
      }

      nextSegments.push({
        group,
        firstRowIndex: rowIndex,
        rows: [{ row, rowIndex }]
      });
    });

    return nextSegments;
  }, [startIndex, visibleRows]);

  useEffect(() => {
    if (!canVirtualize || activeRowIndex < 0 || !listRef.current) {
      return;
    }

    const itemTop = activeRowIndex * virtualizedItemHeight;
    const itemBottom = itemTop + virtualizedItemHeight;

    if (itemTop < listRef.current.scrollTop) {
      listRef.current.scrollTop = itemTop;
      setScrollTop(itemTop);
    } else if (itemBottom > listRef.current.scrollTop + virtualizedMaxHeight) {
      const nextScrollTop = itemBottom - virtualizedMaxHeight;
      listRef.current.scrollTop = nextScrollTop;
      setScrollTop(nextScrollTop);
    }
  }, [activeRowIndex, canVirtualize, virtualizedItemHeight, virtualizedMaxHeight]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  const renderOptionItem = (
    item: OptionInternal,
    key: string | number,
    optionIndex?: number,
    groupDisabled?: boolean
  ) => (
    <OptionList.Option
      {...getOptionProps?.(item)}
      {...(renderOption
        ? { children: renderOption(item), 'aria-label': item.label ?? item.value }
        : undefined)}
      label={item.label}
      value={item.value}
      disabled={item.disabled || groupDisabled}
      selected={item.selected}
      key={`${uuid}-option-${key}`}
      active={item.active}
      role="option"
      aria-setsize={canVirtualize ? totalOptions : undefined}
      aria-posinset={canVirtualize && optionIndex !== undefined ? optionIndex + 1 : undefined}
    />
  );

  return (
    <OptionListContext.Provider value={{ multiple, size, onOptionSelected, keyManagerType }}>
      <div className={cx(classes.root, className, size)} {...others}>
        <div
          ref={listRef}
          id={listId}
          className={cx(classes.optionList)}
          role="listbox"
          aria-label={ariaLabel}
          style={virtualized ? { maxHeight: virtualizedMaxHeight } : undefined}
          onScroll={canVirtualize ? handleScroll : undefined}
        >
          {canVirtualize ? (
            <div style={{ height: totalHeight, position: 'relative' }}>
              {segments.map((segment) => (
                <div
                  key={`${uuid}-segment-${segment.firstRowIndex}`}
                  role={segment.group ? 'group' : undefined}
                  aria-label={segment.group?.label}
                  style={{
                    position: 'absolute',
                    top: segment.firstRowIndex * virtualizedItemHeight,
                    left: 0,
                    right: 0,
                    height: segment.rows.length * virtualizedItemHeight
                  }}
                >
                  {segment.rows.map(({ row, rowIndex }) => (
                    <div
                      key={`${uuid}-row-${rowIndex}`}
                      style={{
                        position: 'absolute',
                        top: (rowIndex - segment.firstRowIndex) * virtualizedItemHeight,
                        left: 0,
                        right: 0,
                        height: virtualizedItemHeight
                      }}
                    >
                      {row.kind === 'group' ? (
                        <div className={cx(classes.groupHeader)} role="presentation">
                          {row.group.label}
                        </div>
                      ) : (
                        renderOptionItem(
                          row.option,
                          row.optionIndex,
                          row.optionIndex,
                          row.group?.disabled
                        )
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            data.map((item, index) => {
              if (item.type === 'option') {
                return renderOptionItem(item, index);
              }
              if (item.type === 'group') {
                return (
                  <OptionList.OptionGroup
                    options={item.options}
                    disabled={item.disabled}
                    label={item.label}
                    getOptionProps={getOptionProps}
                    renderOption={renderOption}
                    key={`${uuid}-group-${index}`}
                    role="group"
                    aria-label={item.label}
                  />
                );
              }
              return null;
            })
          )}
        </div>
      </div>
    </OptionListContext.Provider>
  );
};

OptionList.displayName = 'OptionList';
OptionList.OptionGroup = OptionGroupComponent;
OptionList.Option = OptionComponent;

export { OptionList };
