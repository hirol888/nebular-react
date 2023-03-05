import { createUseExternalEvents } from '@mantine/utils';
import { Direction, LayoutDimensions, NebularTheme, ScrollPosition } from './types';

export type NebularThemeEvent = {
  changeTheme: (theme: NebularTheme) => void;
  changeDirection: (dir: Direction) => void;
  changeDimensions: (dimentions: LayoutDimensions) => void;
  changeScrollPosition: (scrollPosition: ScrollPosition) => void;
  appendLayoutClass: (className: string) => void;
  removeLayoutClass: (ClassName: string) => void;
  changeScrollable: (scrollable: boolean) => void;
};

export const [useNebularThemeEvents, createNebularThemeEvents] =
  createUseExternalEvents<NebularThemeEvent>('nebular-theme');

export const changeTheme = createNebularThemeEvents('changeTheme');
export const changeDirection = createNebularThemeEvents('changeDirection');
export const changeDimensions = createNebularThemeEvents('changeDimensions');
export const changeScrollPosition = createNebularThemeEvents('changeScrollPosition');
export const appendLayoutClass = createNebularThemeEvents('appendLayoutClass');
export const removeLayoutClass = createNebularThemeEvents('removeLayoutClass');
export const changeScrollable = createNebularThemeEvents('changeScrollable');
