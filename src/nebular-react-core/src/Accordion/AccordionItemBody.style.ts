import { createStyles } from '@nebular-react/styles';

export interface AccordionItemBodyStylesParams {
  collapsed: boolean;
}

export default createStyles((_theme, _params: AccordionItemBodyStylesParams) => ({
  root: {
    overflow: 'hidden',
    visibility: 'visible'
  },

  itemBody: {
    flex: 1,
    msFlex: '1 1 auto',
    overflow: 'auto',
    padding: 'var(--accordion-padding)',
    position: 'relative'
  }
}));
