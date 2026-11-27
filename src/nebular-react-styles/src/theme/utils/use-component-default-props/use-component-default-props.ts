import { filterProps } from '../filter-props/filter-props';

export function useComponentDefaultProps<T extends Record<string, any>>(
  defaultProps: Partial<T>,
  props: T
): Required<T> {
  return { ...defaultProps, ...filterProps(props) } as Required<T>;
}
