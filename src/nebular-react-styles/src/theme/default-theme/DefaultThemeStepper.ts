import { NebularThemeStepper } from '../types/nebular-theme';

export const DefaultThemeStepper: NebularThemeStepper = {
  stepper_step_text_color: 'var(--text-hint-color)',
  stepper_step_text_font_family: 'var(--text-paragraph-font-family)',
  stepper_step_text_font_size: 'var(--text-paragraph-font-size)',
  stepper_step_text_font_weight: 'var(--text-paragraph-font-weight)',
  stepper_step_text_line_height: 'var(--text-paragraph-line-height)',
  stepper_step_active_text_color: 'var(--text-primary-active-color)',
  stepper_step_completed_text_color: 'var(--text-primary-color)',

  stepper_step_index_border_color: 'var(--border-basic-color-4)',
  stepper_step_index_border_style: 'solid',
  stepper_step_index_border_width: '1px',
  stepper_step_index_border_radius: '50%',
  stepper_step_index_width: '2rem',
  stepper_step_index_active_border_color: 'var(--color-primary-active)',
  stepper_step_index_completed_background_color: 'var(--color-primary-default)',
  stepper_step_index_completed_border_color: 'var(--color-primary-default)',
  stepper_step_index_completed_text_color: 'var(--text-control-color)',

  stepper_connector_background_color: 'var(--background-basic-color-3)',
  stepper_connector_completed_background_color: 'var(--color-primary-default)',
  stepper_horizontal_connector_margin: '1rem',
  stepper_vertical_connector_margin: '1rem',

  stepper_step_content_padding: '1.25rem'
};
