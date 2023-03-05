import React, { forwardRef, useState } from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import useStyles from './FlipCard.style';
import { Icon } from '../../Icon';

export type FlipCardStylesNames = Selectors<typeof useStyles>;

export interface FlipCardProps
  extends DefaultProps<FlipCardStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {
  customToggleButton?: React.ReactNode;
  front: React.ReactNode;
  back: React.ReactNode;
}

const _FlipCard = forwardRef<HTMLDivElement, FlipCardProps>((props, ref) => {
  const { customToggleButton, front, back, className, classNames, styles, unstyled, ...others } =
    props;
  const { classes, cx } = useStyles(null, { name: 'flipcard', classNames, styles, unstyled });
  const [flipped, setFlipped] = useState<boolean>(false);

  return (
    <div
      ref={ref}
      className={cx(classes.root, className, {
        [classes.flipped]: flipped
      })}
      {...others}
    >
      <div className={cx(classes.flipcardBody)}>
        <div className={cx(classes.frontContainer)}>
          {front}
          <a className={cx(classes.flipButton)} onClick={() => setFlipped(!flipped)}>
            {!customToggleButton && (
              <Icon icon="chevron-left-outline" pack="nebular-essentials" aria-hidden="true" />
            )}
            {!!customToggleButton && <>{customToggleButton}</>}
          </a>
        </div>
        <div className={cx(classes.backContainer)}>
          {back}
          <a className={cx(classes.flipButton)} onClick={() => setFlipped(!flipped)}>
            {!customToggleButton && (
              <Icon icon="chevron-left-outline" pack="nebular-essentials" aria-hidden="true" />
            )}
            {!!customToggleButton && <>{customToggleButton}</>}
          </a>
        </div>
      </div>
    </div>
  );
});

_FlipCard.displayName = '@nebular-react/core/FlipCard';

export const FlipCard = createPolymorphicComponent<'div', FlipCardProps>(_FlipCard);
