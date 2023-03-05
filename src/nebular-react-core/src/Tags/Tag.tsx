import React, { forwardRef } from 'react';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import { Icon } from '../Icon';
import { TagAppearance } from './types';
import useStyles, { TagStylesParams } from './Tag.style';
import { useTagsContext } from './Tags.context';

export type TagStylesNames = Selectors<typeof useStyles>;

export interface TagProps
  extends DefaultProps<TagStylesNames, TagStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  text?: string;
  removable?: boolean;
  appearance?: TagAppearance;
  status?: ComponentOrCustomStatus;
  active?: boolean;
}

const defaultProps: Partial<TagProps> = {
  removable: false,
  appearance: 'filled',
  status: 'basic',
  active: false
};

const _Tag = forwardRef<HTMLDivElement, TagProps>((props, ref) => {
  const {
    text,
    removable,
    appearance,
    status,
    active,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { isItemSelected, size, handleTagSelected, handleTagRemove } = useTagsContext();
  const { classes, cx } = useStyles(
    { size, status, appearance },
    { name: 'tag', classNames, styles, unstyled }
  );

  return (
    <div
      className={cx(
        classes.root,
        className,
        `appearance-${appearance}`,
        `size-${size}`,
        `status-${status}`,
        {
          [classes.selected]: isItemSelected(text),
          [classes.active]: active
        }
      )}
      role="option"
      tabIndex={0}
      onClick={() => handleTagSelected(text)}
      aria-selected={isItemSelected(text)}
      ref={ref}
      {...others}
    >
      {text}
      {removable && (
        <Icon
          onClick={() => handleTagRemove(text)}
          className={cx(classes.tagRemove, `size-${size}`)}
          icon="close-outline"
          pack="nebular-essentials"
          aria-hidden="true"
        />
      )}
    </div>
  );
});

_Tag.displayName = '@nebular-react/core/Tag';

export const Tag = createPolymorphicComponent<'div', TagProps>(_Tag);
