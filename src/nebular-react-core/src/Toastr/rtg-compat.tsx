// rtg-compat.tsx
import * as React from 'react';

// Importa APENAS os valores; nada de tipos do RTG
import {
  Transition as _Transition,
  TransitionGroup as _TransitionGroup
} from 'react-transition-group';

/** Estados expostos p/ quem consome */
export type TransitionStatusT = 'entering' | 'entered' | 'exiting' | 'exited' | 'unmounted';

/** Props MÍNIMAS e compatíveis para uso comum */
export interface TransitionPropsT {
  in?: boolean;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
  appear?: boolean;
  timeout: number | { enter?: number; exit?: number; appear?: number };
  /** IMPORTANTÍSSIMO: use um RefObject estável do elemento renderizado */
  nodeRef?: React.RefObject<HTMLElement | null>;
  /** RTG usa render-prop c/ o estado da transição */
  children: (status: TransitionStatusT) => React.ReactNode;
  // Callbacks opcionais com a assinatura do react-transition-group:
  onEnter?: (node: HTMLElement, appearing: boolean) => void;
  onEntered?: (node: HTMLElement, appearing: boolean) => void;
  onEntering?: (node: HTMLElement, appearing: boolean) => void;
  onExit?: (node: HTMLElement, appearing: boolean) => void;
  onExited?: (node: HTMLElement, appearing: boolean) => void;
  onExiting?: (node: HTMLElement, appearing: boolean) => void;
}

export interface TransitionGroupPropsT {
  /** componente wrapper; null => Fragment */
  component?: React.ElementType | null;
  children?: React.ReactNode;
  appear?: boolean;
}

/** FC wrappers -> não deixam o constraint antigo “vazar” para o JSX */
export const Transition: React.FC<TransitionPropsT> = (props) =>
  React.createElement(_Transition as unknown as React.ComponentType<TransitionPropsT>, props);

export const TransitionGroup: React.FC<TransitionGroupPropsT> = (props) =>
  React.createElement(
    _TransitionGroup as unknown as React.ComponentType<TransitionGroupPropsT>,
    props
  );
