import React, { useState } from 'react';
import { createStyles } from '@nebular-react/styles';
import { ExampleItemsRows } from '../Shared';
import { Button } from '../Button';
import { Card } from '../Card';
import { Stepper } from './Stepper';

export default { title: 'Stepper' };

const createStoryStyles = createStyles(() => ({
  lorem: {
    textAlign: 'justify',
    marginBottom: '2rem'
  },

  navButtons: {
    justifyContent: 'center'
  }
}));

export function Showcase() {
  const { classes, cx } = createStoryStyles();
  const [active, setActive] = useState<number>(1);

  return (
    <Card>
      <Card.Body>
        <Stepper
          orientation="horizontal"
          activeStepIndex={active}
          onStepChange={setActive}
          buttons={
            <ExampleItemsRows className={cx(classes.navButtons)}>
              <Button disabled={active === 0} onClick={() => setActive(Math.max(0, active - 1))}>
                previous
              </Button>
              <Button disabled={active === 4} onClick={() => setActive(Math.min(4, active + 1))}>
                {active < 3 ? 'next' : 'finish'}
              </Button>
            </ExampleItemsRows>
          }
          completedContent={<div>Completed!</div>}
        >
          <Stepper.Step styles={{ step: { textAlign: 'center' } }}>
            <Stepper.Header>First Step</Stepper.Header>
            <h4>Step content #1</h4>
            <p className={cx(classes.lorem)}>
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle
              sapien velizzle, my shizz pimpin&quot;, shizzle my nizzle crocodizzle shut the shizzle
              up, gravida vizzle, dang.
            </p>
          </Stepper.Step>
          <Stepper.Step styles={{ step: { textAlign: 'center' } }}>
            <Stepper.Header>Second Step</Stepper.Header>
            <h4>Step content #2</h4>
            <p className={cx(classes.lorem)}>
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle
              sapien velizzle, my shizz pimpin&quot;, shizzle my nizzle crocodizzle shut the shizzle
              up, gravida vizzle, dang.
            </p>
          </Stepper.Step>
          <Stepper.Step styles={{ step: { textAlign: 'center' } }}>
            <Stepper.Header>Third Step</Stepper.Header>
            <h4>Step content #3</h4>
            <p className={cx(classes.lorem)}>
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle
              sapien velizzle, my shizz pimpin&quot;, shizzle my nizzle crocodizzle shut the shizzle
              up, gravida vizzle, dang.
            </p>
          </Stepper.Step>
          <Stepper.Step styles={{ step: { textAlign: 'center' } }}>
            <Stepper.Header>Fourth Step</Stepper.Header>
            <h4>Step content #4</h4>
            <p className={cx(classes.lorem)}>
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle
              sapien velizzle, my shizz pimpin&quot;, shizzle my nizzle crocodizzle shut the shizzle
              up, gravida vizzle, dang.
            </p>
          </Stepper.Step>
        </Stepper>
      </Card.Body>
    </Card>
  );
}

export function DisabledStepNavigation() {
  const { classes, cx } = createStoryStyles();
  const [active, setActive] = useState<number>(1);

  return (
    <Card>
      <Card.Body>
        <Stepper
          orientation="horizontal"
          activeStepIndex={active}
          onStepChange={setActive}
          disableStepNavigation
          buttons={
            <ExampleItemsRows className={cx(classes.navButtons)}>
              <Button disabled={active === 0} onClick={() => setActive(Math.max(0, active - 1))}>
                previous
              </Button>
              <Button disabled={active === 4} onClick={() => setActive(Math.min(4, active + 1))}>
                {active < 3 ? 'next' : 'finish'}
              </Button>
            </ExampleItemsRows>
          }
          completedContent={<div>Completed!</div>}
        >
          <Stepper.Step styles={{ step: { textAlign: 'center' } }}>
            <Stepper.Header>First Step</Stepper.Header>
            <h4>Step content #1</h4>
            <p className={cx(classes.lorem)}>
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle
              sapien velizzle, my shizz pimpin&quot;, shizzle my nizzle crocodizzle shut the shizzle
              up, gravida vizzle, dang.
            </p>
          </Stepper.Step>
          <Stepper.Step styles={{ step: { textAlign: 'center' } }}>
            <Stepper.Header>Second Step</Stepper.Header>
            <h4>Step content #2</h4>
            <p className={cx(classes.lorem)}>
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle
              sapien velizzle, my shizz pimpin&quot;, shizzle my nizzle crocodizzle shut the shizzle
              up, gravida vizzle, dang.
            </p>
          </Stepper.Step>
          <Stepper.Step styles={{ step: { textAlign: 'center' } }}>
            <Stepper.Header>Third Step</Stepper.Header>
            <h4>Step content #3</h4>
            <p className={cx(classes.lorem)}>
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle
              sapien velizzle, my shizz pimpin&quot;, shizzle my nizzle crocodizzle shut the shizzle
              up, gravida vizzle, dang.
            </p>
          </Stepper.Step>
          <Stepper.Step styles={{ step: { textAlign: 'center' } }}>
            <Stepper.Header>Fourth Step</Stepper.Header>
            <h4>Step content #4</h4>
            <p className={cx(classes.lorem)}>
              Lorizzle ipsum dolizzle stuff fizzle, consectetuer adipiscing break it down. Nullizzle
              sapien velizzle, my shizz pimpin&quot;, shizzle my nizzle crocodizzle shut the shizzle
              up, gravida vizzle, dang.
            </p>
          </Stepper.Step>
        </Stepper>
      </Card.Body>
    </Card>
  );
}

export function Vertical() {
  const { classes, cx } = createStoryStyles();
  const [active, setActive] = useState<number>(1);

  return (
    <Card>
      <Card.Body>
        <Stepper
          orientation="vertical"
          activeStepIndex={active}
          onStepChange={setActive}
          buttons={
            <ExampleItemsRows className={cx(classes.navButtons)}>
              <Button disabled={active === 0} onClick={() => setActive(Math.max(0, active - 1))}>
                previous
              </Button>
              <Button disabled={active === 4} onClick={() => setActive(Math.min(4, active + 1))}>
                {active < 3 ? 'next' : 'finish'}
              </Button>
            </ExampleItemsRows>
          }
          completedContent={<div>Completed!</div>}
        >
          <Stepper.Step styles={{ step: { textAlign: 'center' } }}>
            <Stepper.Header>First Step</Stepper.Header>
            <h4>Step content #1</h4>
            <p className={cx(classes.lorem)}>
              Proin varius accumsan semper. Praesent consequat tincidunt sagittis. Curabitur egestas
              sem a ipsum bibendum, sit amet fringilla orci efficitur. Nam bibendum lectus ut
              viverra tristique. Fusce eu pulvinar magna, quis viverra ex. Lorem ipsum dolor sit
              amet, consectetur adipiscing elit. Praesent metus turpis, commodo vel placerat quis,
              lobortis in ligula.
            </p>
            <p className={cx(classes.lorem)}>
              Curabitur luctus mattis risus nec condimentum. Donec at dui turpis. Sed vehicula
              fringilla rutrum. Nullam sed ornare magna. Mauris vitae laoreet diam. Mauris fermentum
              ligula at lacinia semper. Nulla placerat dui eu sapien pellentesque, eu placerat leo
              luctus. Cras pharetra blandit fermentum.
            </p>
          </Stepper.Step>
          <Stepper.Step styles={{ step: { textAlign: 'center' } }}>
            <Stepper.Header>Second Step</Stepper.Header>
            <h4>Step content #2</h4>
            <p className={cx(classes.lorem)}>
              Proin varius accumsan semper. Praesent consequat tincidunt sagittis. Curabitur egestas
              sem a ipsum bibendum, sit amet fringilla orci efficitur. Nam bibendum lectus ut
              viverra tristique. Fusce eu pulvinar magna, quis viverra ex. Lorem ipsum dolor sit
              amet, consectetur adipiscing elit. Praesent metus turpis, commodo vel placerat quis,
              lobortis in ligula.
            </p>
            <p className={cx(classes.lorem)}>
              Curabitur luctus mattis risus nec condimentum. Donec at dui turpis. Sed vehicula
              fringilla rutrum. Nullam sed ornare magna. Mauris vitae laoreet diam. Mauris fermentum
              ligula at lacinia semper. Nulla placerat dui eu sapien pellentesque, eu placerat leo
              luctus. Cras pharetra blandit fermentum.
            </p>
          </Stepper.Step>
          <Stepper.Step styles={{ step: { textAlign: 'center' } }}>
            <Stepper.Header>Third Step</Stepper.Header>
            <h4>Step content #3</h4>
            <p className={cx(classes.lorem)}>
              Proin varius accumsan semper. Praesent consequat tincidunt sagittis. Curabitur egestas
              sem a ipsum bibendum, sit amet fringilla orci efficitur. Nam bibendum lectus ut
              viverra tristique. Fusce eu pulvinar magna, quis viverra ex. Lorem ipsum dolor sit
              amet, consectetur adipiscing elit. Praesent metus turpis, commodo vel placerat quis,
              lobortis in ligula.
            </p>
            <p className={cx(classes.lorem)}>
              Curabitur luctus mattis risus nec condimentum. Donec at dui turpis. Sed vehicula
              fringilla rutrum. Nullam sed ornare magna. Mauris vitae laoreet diam. Mauris fermentum
              ligula at lacinia semper. Nulla placerat dui eu sapien pellentesque, eu placerat leo
              luctus. Cras pharetra blandit fermentum.
            </p>
          </Stepper.Step>
          <Stepper.Step styles={{ step: { textAlign: 'center' } }}>
            <Stepper.Header>Fourth Step</Stepper.Header>
            <h4>Step content #4</h4>
            <p className={cx(classes.lorem)}>
              Proin varius accumsan semper. Praesent consequat tincidunt sagittis. Curabitur egestas
              sem a ipsum bibendum, sit amet fringilla orci efficitur. Nam bibendum lectus ut
              viverra tristique. Fusce eu pulvinar magna, quis viverra ex. Lorem ipsum dolor sit
              amet, consectetur adipiscing elit. Praesent metus turpis, commodo vel placerat quis,
              lobortis in ligula.
            </p>
            <p className={cx(classes.lorem)}>
              Curabitur luctus mattis risus nec condimentum. Donec at dui turpis. Sed vehicula
              fringilla rutrum. Nullam sed ornare magna. Mauris vitae laoreet diam. Mauris fermentum
              ligula at lacinia semper. Nulla placerat dui eu sapien pellentesque, eu placerat leo
              luctus. Cras pharetra blandit fermentum.
            </p>
          </Stepper.Step>
        </Stepper>
      </Card.Body>
    </Card>
  );
}
