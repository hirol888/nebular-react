import { NebularThemeVariables } from '../types/nebular-theme';

const palette = {
  primary: '#73a1ff',
  success: '#5dcfe3',
  info: '#ba7fec',
  warning: '#ffa36b',
  danger: '#ff6b83'
};

export const CorporateThemeVariables: NebularThemeVariables = {
  variables: {
    fontMain: 'Open Sans, sans-serif',
    fontSecondary: 'Raleway, sans-serif',

    bg: '#ffffff',
    bg2: '#f7f9fc',
    bg3: '#edf1f7',
    bg4: '#e4e9f2',

    borderColor: '#ffffff',
    borderColor2: '#f7f9fc',
    borderColor3: '#edf1f7',
    borderColor4: '#e4e9f2',
    borderColor5: '#c5cee0',

    fg: '#8f9bb3',
    fgHeading: '#1a2138',
    fgText: '#1a2138',
    fgHighlight: palette.primary,
    layoutBg: '#f7f9fc',
    separator: '#edf1f7',

    primary: palette.primary,
    success: palette.success,
    info: palette.info,
    warning: palette.warning,
    danger: palette.danger,

    primaryLight: '#598bff',
    successLight: '#2ce69b',
    infoLight: '#42aaff',
    warningLight: '#ffc94d',
    dangerLight: '#ff708d'
  }
};
