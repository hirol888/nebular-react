import { Property } from 'csstype';

export interface NebularThemeVariables {
  variables: {
    fontMain: Property.FontFamily;
    fontSecondary: Property.FontFamily;

    bg: Property.BackgroundColor;
    bg2: Property.BackgroundColor;
    bg3: Property.BackgroundColor;
    bg4: Property.BackgroundColor;

    borderColor: Property.BorderColor;
    borderColor2: Property.BorderColor;
    borderColor3: Property.BorderColor;
    borderColor4: Property.BorderColor;
    borderColor5: Property.BorderColor;

    fg: Property.Color;
    fgHeading: Property.Color;
    fgText: Property.Color;
    fgHighlight: Property.Color;
    layoutBg: Property.BackgroundColor;
    separator: Property.Color;

    primary: Property.Color;
    success: Property.Color;
    info: Property.Color;
    warning: Property.Color;
    danger: Property.Color;

    primaryLight: Property.Color;
    successLight: Property.Color;
    infoLight: Property.Color;
    warningLight: Property.Color;
    dangerLight: Property.Color;
  };
}
