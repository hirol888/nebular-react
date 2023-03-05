import { NebularThemeVariables } from '../types/nebular-theme';

const palette = {
  primary: '#a16eff',
  success: '#00d68f',
  info: '#0095ff',
  warning: '#ffaa00',
  danger: '#ff3d71'
};

export const CosmicThemeVariables: NebularThemeVariables = {
  variables: {
    fontMain: 'Open Sans, sans-serif',
    fontSecondary: 'Raleway, sans-serif',

    bg: '#323259',
    bg2: '#252547',
    bg3: '#1b1b38',
    bg4: '#13132b',

    borderColor: '#323259',
    borderColor2: '#252547',
    borderColor3: '#1b1b38',
    borderColor4: '#13132b',
    borderColor5: '#13132b',

    fg: '#b4b4db',
    fgHeading: '#ffffff',
    fgText: '#ffffff',
    fgHighlight: palette.primary,
    layoutBg: '#151a30',
    separator: '#151a30',

    primary: palette.primary,
    success: palette.success,
    info: palette.info,
    warning: palette.warning,
    danger: palette.danger,

    primaryLight: '#b18aff',
    successLight: '#2ce69b',
    infoLight: '#42aaff',
    warningLight: '#ffc94d',
    dangerLight: '#ff708d'
  }
};
