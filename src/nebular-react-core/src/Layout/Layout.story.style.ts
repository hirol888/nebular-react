import { createStyles } from '@nebular-react/styles';

export default createStyles((theme) => ({
  coloredColumnPrimary: {
    background: theme.color_primary_300,
    color: theme.color_basic_800
  },

  coloredColumnSuccess: {
    background: theme.color_success_300,
    color: theme.color_basic_800
  },

  coloredColumnInfo: {
    background: theme.color_info_300,
    color: theme.color_basic_800
  },

  coloredColumnWarning: {
    background: theme.color_warning_300,
    color: theme.color_basic_800
  },

  coloredColumnDanger: {
    background: theme.color_danger_300,
    color: theme.color_basic_800
  }
}));
