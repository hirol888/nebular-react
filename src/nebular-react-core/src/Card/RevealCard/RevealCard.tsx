import React, { cloneElement, forwardRef, ReactElement, useState } from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import useStyles from './RevealCard.style';
import { Icon } from '../../Icon';

export type RevealCardStylesNames = Selectors<typeof useStyles>;

export interface RevealCardProps
  extends DefaultProps<RevealCardStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {
  customToggleButton?: React.ReactNode;
  front: React.ReactNode;
  back: React.ReactNode;
}

const _RevealCard = forwardRef<HTMLDivElement, RevealCardProps>((props, ref) => {
  const { customToggleButton, front, back, className, classNames, styles, unstyled, ...others } =
    props;
  const { classes, cx } = useStyles(null, { name: 'revealcard', classNames, styles, unstyled });
  const [revealed, setRevealed] = useState<boolean>(false);
  const _front = cloneElement(front as ReactElement, { className: cx(classes.cardFront) });
  const _back = cloneElement(back as ReactElement, { className: cx(classes.cardBack) });

  return (
    <div
      ref={ref}
      className={cx(classes.root, className, {
        [classes.revealed]: revealed
      })}
      {...others}
    >
      {_front}
      <div className={cx(classes.secondContainer)}>{_back}</div>
      <a className={cx(classes.revealButton)} onClick={() => setRevealed(!revealed)}>
        {!customToggleButton && (
          <Icon icon="chevron-down-outline" pack="nebular-essentials" aira-hidden="true" />
        )}
        {!!customToggleButton && <>{customToggleButton}</>}
      </a>
    </div>
  );
});

_RevealCard.displayName = '@nebular-react/core/RevealCard';

export const RevealCard = createPolymorphicComponent<'div', RevealCardProps>(_RevealCard);
