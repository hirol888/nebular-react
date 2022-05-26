import React, { Children, isValidElement, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { NbStepProps, NbStepRef, StepperContext } from './model';
import { NbStepHeader } from './StepHeader';

const NbStep = React.forwardRef<NbStepRef, NbStepProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ formRef, children }, ref) => {
    const interacted = useRef<boolean>(false);
    const { stepRendered } = useContext(StepperContext);

    useEffect(() => {
      stepRendered && stepRendered();
    }, []);

    useImperativeHandle(ref, () => ({
      isValid: () => {
        return formRef ? !!formRef.current?.checkValidity() : true;
      },
      markInteracted: () => {
        interacted.current = true;
      },
      isComplete: () => {
        return formRef ? !!formRef.current?.checkValidity() && interacted.current : interacted.current;
      }
    }));

    const stepContent = Children.toArray(children).filter(
      (child) => !(isValidElement(child) && child.type === NbStepHeader)
    );

    return <div className="nb-step">{stepContent}</div>;
  }
);

export { NbStep };
