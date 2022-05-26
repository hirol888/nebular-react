import React from 'react';

export type NbStepperOrientation = 'vertical' | 'horizontal';

export type NbStepperProps = {
  selectedIndex?: number;
  disableStepNavigation?: boolean;
  orientation?: NbStepperOrientation;
  linear?: boolean;
  stepChange?: (index: number, previousSelectedIndex: number) => void;
};

export type NbStepperRef = {
  previous: () => void;
  next: () => void;
};

export type NbStepProps = {
  hidden?: boolean;
  formRef?: React.RefObject<HTMLFormElement>;
};

export type NbStepRef = {
  isValid: () => boolean;
  markInteracted: () => void;
  isComplete: () => boolean;
};

export const StepperContext = React.createContext<{
  stepRendered?(): void;
}>({});
