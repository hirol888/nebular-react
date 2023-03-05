import { NebularThemeVariables } from '../types/nebular-theme';

const palette = {
  primary: '#3366ff',
  success: '#00d68f',
  info: '#0095ff',
  warning: '#ffaa00',
  danger: '#ff3d71'
};

export const DarkThemeVariables: NebularThemeVariables = {
  variables: {
    fontMain: 'Open Sans, sans-serif',
    fontSecondary: 'Raleway, sans-serif',

    bg: '#222b45',
    bg2: '#1a2138',
    bg3: '#151a30',
    bg4: '#101426',

    borderColor: '#222b45',
    borderColor2: '#1a2138',
    borderColor3: '#151a30',
    borderColor4: '#101426',
    borderColor5: '#101426',

    fg: '#8f9bb3',
    fgHeading: '#ffffff',
    fgText: '#ffffff',
    fgHighlight: palette.primary,
    layoutBg: '#1b1b38',
    separator: '#1b1b38',

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
