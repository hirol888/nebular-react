import { NbButton, NbCard, NbCardBody, NbStep, NbStepHeader, NbStepper } from '@nebular-react';
import { NbStepperRef } from 'libs/nebular-react/src/theme/components/stepper/model';
import { useRef, useState } from 'react';

export function StepperStepChangeEvent() {
  const stepperRef = useRef<NbStepperRef>(null);
  const [stepState, setStepState] = useState<{ index: number; previousSelectedIndex: number }>();

  const next = () => {
    stepperRef.current?.next();
  };

  const previous = () => {
    stepperRef.current?.previous();
  };

  const handleStepChange = (index: number, previousSelectedIndex: number) => {
    setStepState({ index, previousSelectedIndex });
  };

  return (
    <NbCard>
      <NbCardBody>
        <p>Previous step: {stepState?.previousSelectedIndex ?? '-'}</p>
        <p>Current step: {stepState?.index ?? '-'}</p>
        <NbStepper orientation="horizontal" ref={stepperRef} stepChange={handleStepChange}>
          <NbStep>
            <NbStepHeader>First step</NbStepHeader>
            <h4>Step content #1</h4>
            <p className="lorem">
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle sapien velizzle, my
              shizz pimpin', shizzle my nizzle crocodizzle shut the shizzle up, gravida vizzle, dang.
            </p>
            <NbButton onClick={previous} disabled>
              prev
            </NbButton>
            <NbButton onClick={next}>next</NbButton>
          </NbStep>
          <NbStep>
            <NbStepHeader>Second step</NbStepHeader>
            <h4>Step content #2</h4>
            <p className="lorem">
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle sapien velizzle, my
              shizz pimpin', shizzle my nizzle crocodizzle shut the shizzle up, gravida vizzle, dang.
            </p>
            <NbButton onClick={previous}>prev</NbButton>
            <NbButton onClick={next}>next</NbButton>
          </NbStep>
          <NbStep>
            <NbStepHeader>Third step</NbStepHeader>
            <h4>Step content #3</h4>
            <p className="lorem">
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle sapien velizzle, my
              shizz pimpin', shizzle my nizzle crocodizzle shut the shizzle up, gravida vizzle, dang.
            </p>
            <NbButton onClick={previous}>prev</NbButton>
            <NbButton onClick={next} disabled>
              next
            </NbButton>
          </NbStep>
        </NbStepper>
      </NbCardBody>
    </NbCard>
  );
}
