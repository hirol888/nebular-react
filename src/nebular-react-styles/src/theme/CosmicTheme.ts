import {
  CosmicThemeAccordin,
  CosmicThemeActions,
  CosmicThemeAlert,
  CosmicThemeBadge,
  CosmicThemeButton,
  CosmicThemeCalendar,
  CosmicThemeCard,
  CosmicThemeChat,
  CosmicThemeCheckbox,
  CosmicThemeContextMenu,
  CosmicThemeCore,
  CosmicThemeDateTimePicker,
  CosmicThemeFormField,
  CosmicThemeIcon,
  CosmicThemeInput,
  CosmicThemeLayout,
  CosmicThemeListItem,
  CosmicThemeMenu,
  CosmicThemeOption,
  CosmicThemePopover,
  CosmicThemeProgressBar,
  CosmicThemeRadio,
  CosmicThemeSearch,
  CosmicThemeSelect,
  CosmicThemeSidebar,
  CosmicThemeLoader,
  CosmicThemeStepper,
  CosmicThemeTabset,
  CosmicThemeTag,
  CosmicThemeToastr,
  CosmicThemeToggle,
  CosmicThemeTooltip,
  CosmicThemeUser,
  CosmicThemeVariables
} from './cosmic-theme';
import { attachFunctions } from './functions/attach-functions';
import { NebularThemeBase } from './types';

const _COSMIC_THEME: NebularThemeBase = {
  ...CosmicThemeCore,
  ...CosmicThemeAccordin,
  ...CosmicThemeActions,
  ...CosmicThemeAlert,
  ...CosmicThemeBadge,
  ...CosmicThemeButton,
  ...CosmicThemeCalendar,
  ...CosmicThemeCard,
  ...CosmicThemeChat,
  ...CosmicThemeCheckbox,
  ...CosmicThemeContextMenu,
  ...CosmicThemeDateTimePicker,
  ...CosmicThemeFormField,
  ...CosmicThemeIcon,
  ...CosmicThemeInput,
  ...CosmicThemeLayout,
  ...CosmicThemeListItem,
  ...CosmicThemeMenu,
  ...CosmicThemeOption,
  ...CosmicThemePopover,
  ...CosmicThemeProgressBar,
  ...CosmicThemeRadio,
  ...CosmicThemeSearch,
  ...CosmicThemeSelect,
  ...CosmicThemeSidebar,
  ...CosmicThemeLoader,
  ...CosmicThemeStepper,
  ...CosmicThemeTabset,
  ...CosmicThemeTag,
  ...CosmicThemeToastr,
  ...CosmicThemeToggle,
  ...CosmicThemeTooltip,
  ...CosmicThemeUser,
  ...CosmicThemeVariables
};

export const COSMIC_THEME = attachFunctions(_COSMIC_THEME);
