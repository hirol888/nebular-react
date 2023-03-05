import React, { useRef } from 'react';
import { createStyles } from '@nebular-react/styles';
import { Icon } from '../Icon';
import { Button } from '../Button';
import { Tooltip } from './Tooltip';

export default { title: 'Tooltip' };

const createStoryStyles = createStyles(() => ({
  tooltipContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8rem',

    '.nebular-button-root': {
      marginTop: '1rem',
      marginRight: '1rem'
    },

    '.nebular-card-root': {
      marginBottom: 0
    }
  }
}));

export function Showcase() {
  const { classes, cx } = createStoryStyles();

  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <div className={cx(classes.tooltipContainer)}>
      <Button ref={triggerRef} status="primary">
        Show Tooltip
      </Button>
      <Tooltip triggerRef={triggerRef} status="primary" content="This is a tooltip" />
    </div>
  );
}

export function Colors() {
  const { classes, cx } = createStoryStyles();
  const basicTriggerRef = useRef<HTMLButtonElement>(null);
  const primaryTriggerRef = useRef<HTMLButtonElement>(null);
  const successTriggerRef = useRef<HTMLButtonElement>(null);
  const infoTriggerRef = useRef<HTMLButtonElement>(null);
  const warningTriggerRef = useRef<HTMLButtonElement>(null);
  const dangerTriggerRef = useRef<HTMLButtonElement>(null);
  const controlTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={cx(classes.tooltipContainer)}>
      <Button ref={basicTriggerRef} status="basic">
        Basic
      </Button>
      <Tooltip triggerRef={basicTriggerRef} status="basic" content="This is a tooltip" />
      <Button ref={primaryTriggerRef} status="primary">
        Primary
      </Button>
      <Tooltip triggerRef={primaryTriggerRef} status="primary" content="This is a tooltip" />
      <Button ref={successTriggerRef} status="success">
        Success
      </Button>
      <Tooltip triggerRef={successTriggerRef} status="success" content="This is a tooltip" />
      <Button ref={infoTriggerRef} status="info">
        Info
      </Button>
      <Tooltip triggerRef={infoTriggerRef} status="info" content="This is a tooltip" />
      <Button ref={warningTriggerRef} status="warning">
        Warning
      </Button>
      <Tooltip triggerRef={warningTriggerRef} status="warning" content="This is a tooltip" />
      <Button ref={dangerTriggerRef} status="danger">
        Danger
      </Button>
      <Tooltip triggerRef={dangerTriggerRef} status="danger" content="This is a tooltip" />
      <Button ref={controlTriggerRef} status="control">
        Control
      </Button>
      <Tooltip triggerRef={controlTriggerRef} status="control" content="This is a tooltip" />
    </div>
  );
}

export function Placements() {
  const { classes, cx } = createStoryStyles();
  const topTriggerRef = useRef<HTMLButtonElement>(null);
  const rightTriggerRef = useRef<HTMLButtonElement>(null);
  const endTriggerRef = useRef<HTMLButtonElement>(null);
  const bottomTriggerRef = useRef<HTMLButtonElement>(null);
  const leftTriggerRef = useRef<HTMLButtonElement>(null);
  const startTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={cx(classes.tooltipContainer)}>
      <Button ref={topTriggerRef}>Top</Button>
      <Tooltip triggerRef={topTriggerRef} position="top" content="This is a tooltip" />
      <Button ref={rightTriggerRef}>Right</Button>
      <Tooltip triggerRef={rightTriggerRef} position="right" content="This is a tooltip" />
      <Button ref={endTriggerRef}>End</Button>
      <Tooltip triggerRef={endTriggerRef} position="end" content="This is a tooltip" />
      <Button ref={bottomTriggerRef}>Bottom</Button>
      <Tooltip triggerRef={bottomTriggerRef} position="bottom" content="This is a tooltip" />
      <Button ref={leftTriggerRef}>Left</Button>
      <Tooltip triggerRef={leftTriggerRef} position="left" content="This is a tooltip" />
      <Button ref={startTriggerRef}>Start</Button>
      <Tooltip triggerRef={startTriggerRef} position="start" content="This is a tooltip" />
    </div>
  );
}

export function WithIcon() {
  const { classes, cx } = createStoryStyles();
  const triggerRef1 = useRef<HTMLButtonElement>(null);
  const triggerRef2 = useRef<HTMLButtonElement>(null);
  const triggerRef3 = useRef<HTMLButtonElement>(null);

  return (
    <div className={cx(classes.tooltipContainer)}>
      <Button ref={triggerRef1}>Show tooltip</Button>
      <Tooltip
        triggerRef={triggerRef1}
        content="This is a tooltip"
        icon={<Icon icon="home-outline" pack="eva" />}
      />
      <Button ref={triggerRef2}>Show tooltip</Button>
      <Tooltip
        triggerRef={triggerRef2}
        content="This is a tooltip"
        icon={<Icon icon="alert-triangle-outline" />}
        status="danger"
      />
      <Button ref={triggerRef3}>Show tooltip</Button>
      <Tooltip
        triggerRef={triggerRef3}
        icon={<Icon icon="alert-triangle-outline" pack="eva" />}
        status="danger"
      />
    </div>
  );
}
