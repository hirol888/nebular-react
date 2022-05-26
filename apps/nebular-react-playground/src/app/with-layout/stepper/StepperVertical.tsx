import { NbButton, NbCard, NbCardBody, NbStep, NbStepHeader, NbStepper } from '@nebular-react';
import { NbStepperRef } from 'libs/nebular-react/src/theme/components/stepper/model';
import { useRef } from 'react';

export function StepperVertical() {
  const stepperRef = useRef<NbStepperRef>(null);

  const next = () => {
    stepperRef.current?.next();
  };

  const previous = () => {
    stepperRef.current?.previous();
  };

  return (
    <NbCard size="medium">
      <NbCardBody>
        <NbStepper orientation="vertical" ref={stepperRef}>
          <NbStep>
            <NbStepHeader>First step</NbStepHeader>
            <h4>Step content #1</h4>
            <p className="lorem">
              Proin varius accumsan semper. Praesent consequat tincidunt sagittis. Curabitur egestas sem a ipsum
              bibendum, sit amet fringilla orci efficitur. Nam bibendum lectus ut viverra tristique. Fusce eu pulvinar
              magna, quis viverra ex. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent metus turpis,
              commodo vel placerat quis, lobortis in ligula.
            </p>
            <p className="lorem">
              Curabitur luctus mattis risus nec condimentum. Donec at dui turpis. Sed vehicula fringilla rutrum. Nullam
              sed ornare magna. Mauris vitae laoreet diam. Mauris fermentum ligula at lacinia semper. Nulla placerat dui
              eu sapien pellentesque, eu placerat leo luctus. Cras pharetra blandit fermentum.
            </p>
            <NbButton disabled>prev</NbButton>
            <NbButton onClick={next}>next</NbButton>
          </NbStep>
          <NbStep>
            <NbStepHeader>Second step</NbStepHeader>
            <h4>Step content #2</h4>
            <p className="lorem">
              Proin varius accumsan semper. Praesent consequat tincidunt sagittis. Curabitur egestas sem a ipsum
              bibendum, sit amet fringilla orci efficitur. Nam bibendum lectus ut viverra tristique. Fusce eu pulvinar
              magna, quis viverra ex. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent metus turpis,
              commodo vel placerat quis, lobortis in ligula.
            </p>
            <p className="lorem">
              Curabitur luctus mattis risus nec condimentum. Donec at dui turpis. Sed vehicula fringilla rutrum. Nullam
              sed ornare magna. Mauris vitae laoreet diam. Mauris fermentum ligula at lacinia semper. Nulla placerat dui
              eu sapien pellentesque, eu placerat leo luctus. Cras pharetra blandit fermentum.
            </p>
            <NbButton onClick={previous}>prev</NbButton>
            <NbButton onClick={next}>next</NbButton>
          </NbStep>
          <NbStep>
            <NbStepHeader>Third step</NbStepHeader>
            <h4>Step content #3</h4>
            <p className="lorem">
              Proin varius accumsan semper. Praesent consequat tincidunt sagittis. Curabitur egestas sem a ipsum
              bibendum, sit amet fringilla orci efficitur. Nam bibendum lectus ut viverra tristique. Fusce eu pulvinar
              magna, quis viverra ex. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent metus turpis,
              commodo vel placerat quis, lobortis in ligula.
            </p>
            <p className="lorem">
              Curabitur luctus mattis risus nec condimentum. Donec at dui turpis. Sed vehicula fringilla rutrum. Nullam
              sed ornare magna. Mauris vitae laoreet diam. Mauris fermentum ligula at lacinia semper. Nulla placerat dui
              eu sapien pellentesque, eu placerat leo luctus. Cras pharetra blandit fermentum.
            </p>
            <NbButton onClick={previous}>prev</NbButton>
            <NbButton onClick={next}>next</NbButton>
          </NbStep>
          <NbStep>
            <NbStepHeader>Fourth step</NbStepHeader>
            <h4>Step content #4</h4>
            <p className="lorem">
              Proin varius accumsan semper. Praesent consequat tincidunt sagittis. Curabitur egestas sem a ipsum
              bibendum, sit amet fringilla orci efficitur. Nam bibendum lectus ut viverra tristique. Fusce eu pulvinar
              magna, quis viverra ex. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent metus turpis,
              commodo vel placerat quis, lobortis in ligula.
            </p>
            <p className="lorem">
              Curabitur luctus mattis risus nec condimentum. Donec at dui turpis. Sed vehicula fringilla rutrum. Nullam
              sed ornare magna. Mauris vitae laoreet diam. Mauris fermentum ligula at lacinia semper. Nulla placerat dui
              eu sapien pellentesque, eu placerat leo luctus. Cras pharetra blandit fermentum.
            </p>
            <NbButton onClick={previous}>prev</NbButton>
            <NbButton disabled>next</NbButton>
          </NbStep>
        </NbStepper>
      </NbCardBody>
    </NbCard>
  );
}
