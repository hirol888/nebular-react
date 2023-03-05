import { ComponentOrCustomStatus, createStyles } from '@nebular-react/styles';

export interface IconStylesParams {
  status: ComponentOrCustomStatus;
}

export default createStyles((theme, { status }: IconStylesParams) => ({
  root: {
    display: 'inline-block',
    fontSize: 'var(--icon-font-size)',
    lineHeight: 'var(--icon-line-height)',
    width: 'var(--icon-width)',
    height: 'var(--icon-height)',
    color: `var(--icon-${status}-color)`,

    '& svg': {
      verticalAlign: 'var(--icon-svg-vertical-align)'
    }
  }
}));
