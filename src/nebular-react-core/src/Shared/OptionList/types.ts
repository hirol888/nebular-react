import { ListOption } from '@nebular-react/hooks';

export interface OptionInternal extends Omit<ListOption, 'label'> {
  type: 'option';
  label?: string;
  /** Identity of the option; consumed as a plain string by Select/Autocomplete. */
  value: string;
  selected?: boolean;
  active?: boolean;
}
export type Option = Omit<OptionInternal, 'selected' | 'active'>;

export interface OptionGroup {
  type: 'group';
  options?: OptionInternal[];
  disabled?: boolean;
  label?: string;
}

export interface DropdownComponentState {
  options: OptionInternal[];
  optionsAndGroups: (OptionInternal | OptionGroup)[];
  opened: boolean;
}
