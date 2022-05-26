import { NbButton, NbCard, NbCardBody, NbStep, NbStepHeader, NbStepper } from '@nebular-react';
import { NbStepperRef } from 'libs/nebular-react/src/theme/components/stepper/model';
import { useRef } from 'react';

export function StepperDisabledStepNav() {
  const stepperRef = useRef<NbStepperRef>(null);

  const next = () => {
    stepperRef.current?.next();
  };

  const previous = () => {
    stepperRef.current?.previous();
  };

  return (
    <NbCard>
      <NbCardBody>
        <NbStepper orientation="horizontal" disableStepNavigation ref={stepperRef}>
          <NbStep>
            <NbStepHeader>First Step</NbStepHeader>
            <h4>Step content #1</h4>
            <p className="lorem">
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle sapien velizzle, my
              shizz pimpin', shizzle my nizzle crocodizzle shut the shizzle up, gravida vizzle, dang.
            </p>
            <NbButton disabled>prev</NbButton>
            <NbButton onClick={next}>next</NbButton>
          </NbStep>
          <NbStep>
            <NbStepHeader>Second Step</NbStepHeader>
            <h4>Step content #2</h4>
            <p className="lorem">
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle sapien velizzle, my
              shizz pimpin', shizzle my nizzle crocodizzle shut the shizzle up, gravida vizzle, dang.
            </p>
            <NbButton onClick={previous}>prev</NbButton>
            <NbButton onClick={next}>next</NbButton>
          </NbStep>
          <NbStep>
            <NbStepHeader>Third Step</NbStepHeader>
            <h4>Step content #3</h4>
            <p className="lorem">
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle sapien velizzle, my
              shizz pimpin', shizzle my nizzle crocodizzle shut the shizzle up, gravida vizzle, dang.
            </p>
            <NbButton onClick={previous}>prev</NbButton>
            <NbButton onClick={next}>next</NbButton>
          </NbStep>
          <NbStep>
            <NbStepHeader>Fourth Step</NbStepHeader>
            <h4>Step content #4</h4>
            <p className="lorem">
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle sapien velizzle, my
              shizz pimpin', shizzle my nizzle crocodizzle shut the shizzle up, gravida vizzle, dang.
            </p>
            <NbButton onClick={previous}>prev</NbButton>
            <NbButton disabled>next</NbButton>
          </NbStep>
        </NbStepper>
      </NbCardBody>
    </NbCard>
  );
}
