import { ComponentOrCustomStatus, ComponentSize, createStyles } from '@nebular-react/styles';

export interface ProgressBarStylesParams {
  size: ComponentSize;
  status: ComponentOrCustomStatus;
}

export default createStyles((theme, { size, status }: ProgressBarStylesParams) => ({
  root: {
    display: 'block'
  },

  container: {
    overflow: 'hidden',

    borderRadius: 'var(--progress-bar-border-radius)',
    height: `var(--progress-bar-${size}-height)`,
    backgroundColor: `var(--progress-bar-${status}-background-color)`
  },

  value: {
    height: '100%',
    textAlign: 'center',
    overflow: 'hidden',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--progress-bar-text-font-family)',
    transitionDuration: 'var(--progress-bar-animation-duration)',
    transitionProperty: 'width, background-color',

    fontSize: `var(--progress-bar-${size}-text-font-size)`,
    fontWeight: `var(--progress-bar-${size}-text-font-weight)` as any,
    lineHeight: `var(--progress-bar-${size}-text-line-height)`,

    backgroundColor: `var(--progress-bar-${status}-filled-background-color)`,
    color: `var(--progress-bar-${status}-text-color)`
  }
}));
