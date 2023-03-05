import { createStyles } from '@nebular-react/styles';

export interface AccordionItemBodyStylesParams {
  collapsed: boolean;
}

export default createStyles((theme, { collapsed }: AccordionItemBodyStylesParams) => ({
  root: {
    overflow: 'hidden',
    visibility: 'visible'
  },

  itemBody: {
    display: collapsed ? 'none' : 'block',
    flex: 1,
    msFlex: '1 1 auto',
    overflow: 'auto',
    padding: 'var(--accordion-padding)',
    position: 'relative'
  }
}));
