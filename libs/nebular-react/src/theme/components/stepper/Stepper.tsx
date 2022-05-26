import classNames from 'classnames';
import React, { Children, isValidElement, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { NbIcon } from '../icon';
import { NbStepperProps, NbStepperRef, NbStepRef, StepperContext } from './model';
import { NbStep } from './Step';
import { NbStepHeader } from './StepHeader';
import './stepper.scoped.scss';

const NbStepper = React.forwardRef<NbStepperRef, NbStepperProps & React.HTMLAttributes<HTMLDivElement>>(
  (
    {
      selectedIndex = 0,
      disableStepNavigation = false,
      orientation = 'horizontal',
      linear = true,
      stepChange,
      className,
      children,
      ...otherProps
    },
    ref
  ) => {
    const [selectedIndexValue, setSelectedIndexValue] = useState<number>(selectedIndex);
    const stepRefs = useRef<React.RefObject<NbStepRef>[]>([]);
    const [steps, setSteps] = useState<
      React.ReactElement<any, string | React.JSXElementConstructor<any>>[] | null | undefined
    >();
    const stepRenderedCount = useRef<number>();
    stepRenderedCount.current = 0;

    useEffect(() => {
      stepRefs.current[selectedIndexValue]?.current?.markInteracted();
    }, [selectedIndexValue]);

    useEffect(() => {
      stepRefs.current = [];
      const _steps = Children.map(children, (child) => {
        if (isValidElement(child) && child.type === NbStep) {
          const stepRef = React.createRef<NbStepRef>();
          stepRefs.current.push(stepRef);

          return React.cloneElement(child, {
            ...child.props,
            ref: stepRef
          });
        }
        return null;
      });
      setSteps(_steps);
    }, [children]);

    const stepRendered = () => {
      stepRenderedCount.current = (stepRenderedCount.current ?? 0) + 1;
      if (stepRenderedCount.current === steps?.length) {
        stepRefs.current[selectedIndexValue].current?.markInteracted();
      }
    };

    const canBeSelected = (indexToCheck: number) => {
      const noSteps = !steps || steps.length === 0;
      if (noSteps || indexToCheck < 0 || indexToCheck > steps.length || indexToCheck === selectedIndexValue) {
        return false;
      }

      if (indexToCheck <= selectedIndexValue || !linear) {
        return true;
      }

      let isAllStepsValid = true;
      for (let i = selectedIndexValue; i < indexToCheck; i++) {
        if (!stepRefs.current[i].current?.isComplete()) {
          isAllStepsValid = false;
          break;
        }
      }
      return isAllStepsValid;
    };

    const changeStep = (index: number) => {
      if (canBeSelected(index)) {
        if (!disableStepNavigation) {
          stepChange && stepChange(index, selectedIndexValue);
          setSelectedIndexValue(index);
        }
      }
    };

    const getStepNumber = (step: React.ReactElement<any, string | React.JSXElementConstructor<any>>, index: number) => {
      const stepHeader = Children.toArray(step.props.children).find(
        (child) => isValidElement(child) && child.type === NbStepHeader
      );

      return (
        <React.Fragment key={`nb-step-header-${index}`}>
          {index !== 0 && !step.props.hidden && (
            <div className={classNames('connector', { 'connector-past': index <= selectedIndexValue })}></div>
          )}
          {!step.props.hidden && (
            <div
              className={classNames('step', {
                selected: selectedIndexValue === index,
                completed: selectedIndexValue !== index && stepRefs.current[index].current?.isComplete(),
                noninteractive: disableStepNavigation
              })}
              onClick={() => changeStep(index)}
            >
              <div className="label-index">
                {(!stepRefs.current[index].current?.isComplete() || selectedIndexValue === index) && (
                  <span>{index + 1}</span>
                )}
                {selectedIndexValue !== index && stepRefs.current[index].current?.isComplete() && (
                  <NbIcon icon="checkmark-outline" pack="nebular-essentials"></NbIcon>
                )}
              </div>
              <div className="label">{stepHeader}</div>
            </div>
          )}
        </React.Fragment>
      );
    };

    const previous = () => {
      if (canBeSelected(Math.max(selectedIndexValue - 1, 0))) {
        stepChange && stepChange(Math.max(selectedIndexValue - 1, 0), selectedIndexValue);
        setSelectedIndexValue((selectedIndex) => Math.max(selectedIndex - 1, 0));
      }
    };
    const next = () => {
      if (canBeSelected(Math.min(selectedIndexValue + 1, steps ? steps.length - 1 : 0))) {
        stepChange && stepChange(Math.min(selectedIndexValue + 1, steps ? steps.length - 1 : 0), selectedIndexValue);
        setSelectedIndexValue((selectedIndex) => Math.min(selectedIndex + 1, steps ? steps.length - 1 : 0));
      }
    };

    useImperativeHandle(ref, () => ({
      previous,
      next
    }));

    return (
      <StepperContext.Provider value={{ stepRendered }}>
        <div
          className={classNames('nb-stepper', className, {
            vertical: orientation === 'vertical',
            horizontal: orientation === 'horizontal'
          })}
          {...otherProps}
        >
          <div className="header">
            {steps?.map((step, index) => {
              return getStepNumber(step, index);
            })}
          </div>
          {steps &&
            steps.map((step, index) => {
              return (
                <div
                  key={`nb-step-${index}`}
                  className={classNames('step-content', {
                    selected: selectedIndexValue === index
                  })}
                >
                  {step}
                </div>
              );
            })}
        </div>
      </StepperContext.Provider>
    );
  }
);

export { NbStepper };
