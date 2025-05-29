import React, { useRef, useState } from 'react';
import { createStyles } from '@nebular-react/styles';
import { Card } from '../Card';
import { List } from '../List';
import { Button } from '../Button';
import { Popover, PopoverRef } from './Popover';
import { Input } from '../Input';

export default { title: 'Popover' };

const createPopoverStyles = createStyles(() => ({
  popoverContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8rem',

    '.nebular-button-root': {
      marginRight: '1rem',
      marginTop: '1rem'
    },

    '.nebular-card-root': {
      marginBottom: 0
    }
  },

  section: {
    marginBottom: '2rem'
  },

  popoverDynamic: {
    display: 'flex',
    flexDirection: 'column'
  }
}));

export function Showcase() {
  const { classes, cx } = createPopoverStyles();
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <div className={cx(classes.popoverContainer)}>
      <Button ref={triggerRef}>Open Popover</Button>
      <Popover triggerRef={triggerRef} position="bottom">
        Hi, I&quot;m popover
      </Popover>
    </div>
  );
}

export function RichContent() {
  const { classes, cx } = createPopoverStyles();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={cx(classes.popoverContainer)}>
      <Button ref={triggerRef} style={{ marginTop: '4rem' }}>
        Rich Content Popover
      </Button>
      <Popover triggerRef={triggerRef}>
        <div style={{ padding: '0.75rem 1rem' }}>
          <strong>Hello, popover!</strong>
        </div>
      </Popover>
    </div>
  );
}

export function Disabled() {
  const { classes, cx } = createPopoverStyles();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [disabled, setDisabled] = useState<boolean>(false);

  return (
    <div className={cx(classes.popoverDynamic)}>
      <div className={cx(classes.popoverContainer)}>
        <Button ref={triggerRef} disabled={disabled}>
          Click Mode
        </Button>
        <Popover triggerRef={triggerRef} position="bottom">
          Hi, I&quot;m popover!
        </Popover>
      </div>
      <div className={cx(classes.section)}>
        <Button size="small" status="warning" onClick={() => setDisabled(true)}>
          Disable
        </Button>
        <Button size="small" status="success" onClick={() => setDisabled(false)}>
          Enable
        </Button>
      </div>
    </div>
  );
}

export function Dynamic() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentTypes = ['list', 'tab', 'text'];

  const listContent = () => (
    <Card>
      <Card.Header>Shopping List</Card.Header>
      <List>
        <List.Item>Apple</List.Item>
        <List.Item>Orange</List.Item>
      </List>
    </Card>
  );

  const tabContent = () => (
    <Card>
      <Card.Header>Shopping List</Card.Header>
    </Card>
  );

  const [content, setContent] = useState<JSX.Element | string>(listContent());
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  const changeContent = (contentType: string) => {
    switch (contentType) {
      case 'list':
        setContent(listContent());
        break;
      case 'tab':
        setContent(tabContent());
        break;
      case 'text':
        setContent('Hello World!');
        break;
    }
  };

  const startRuntimeChange = () => {
    if (!timer) {
      const i = setInterval(() => {
        const random = contentTypes[Math.floor(Math.random() * contentTypes.length)];
        changeContent(random);
      }, 2000);
      setTimer(i);
    }
  };

  const stopRuntimeChange = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(undefined);
    }
  };

  const { classes, cx } = createPopoverStyles();

  return (
    <div className={cx(classes.popoverDynamic)}>
      <div className={cx(classes.popoverContainer)}>
        <Button ref={triggerRef}>Show Popover</Button>
        <Popover triggerRef={triggerRef} position="bottom">
          {content && <>{content}</>}
        </Popover>
      </div>
      <div className={cx(classes.section)}>
        <h6>Change Content</h6>
        <Button size="small" status="success" onClick={() => changeContent('list')}>
          Use List Component
        </Button>
        <Button size="small" status="success" onClick={() => changeContent('tab')}>
          Use Tab Component
        </Button>
        <Button size="small" status="success" onClick={() => changeContent('text')}>
          Use Text
        </Button>
        <Button size="small" status="warning" onClick={startRuntimeChange} disabled={!!timer}>
          Enable Runtime Change
        </Button>
        <Button size="small" status="warning" onClick={stopRuntimeChange} disabled={!timer}>
          Disable Runtime Change
        </Button>
        <div>
          <small>
            When &quot;Runtime Change&quot; is enabled, open the Popover to see a content change
            every 2 seconds.
          </small>
        </div>
      </div>
    </div>
  );
}

export function Modes() {
  const { classes, cx } = createPopoverStyles();
  const clickTriggerRef = useRef<HTMLButtonElement>(null);
  const hintTriggerRef = useRef<HTMLButtonElement>(null);
  const hoverTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={cx(classes.popoverContainer)}>
      <Button ref={clickTriggerRef}>Click Mode</Button>
      <Popover triggerRef={clickTriggerRef} position="bottom">
        Click Mode
      </Popover>
      <Button ref={hintTriggerRef}>Hint Mode</Button>
      <Popover triggerRef={hintTriggerRef} trigger="hint" position="bottom">
        Hint Mode
      </Popover>
      <Button ref={hoverTriggerRef}>Hover Mode</Button>
      <Popover triggerRef={hoverTriggerRef} trigger="hover" position="bottom">
        Hover Mode
      </Popover>
    </div>
  );
}

export function Manual() {
  const { classes, cx } = createPopoverStyles();
  const triggerRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<PopoverRef>(null);

  return (
    <>
      <div className={cx(classes.popoverContainer)}>
        <Input ref={triggerRef} placeholder="Enter your username" />
        <Popover ref={popoverRef} triggerRef={triggerRef} trigger="noop">
          Username is already taken
        </Popover>
      </div>
      <div>
        <Button size="small" status="success" onClick={() => popoverRef.current?.show()}>
          Open Popover
        </Button>
        <Button size="small" status="danger" onClick={() => popoverRef.current?.hide()}>
          Close Popover
        </Button>
      </div>
    </>
  );
}

export function Placements() {
  const { classes, cx } = createPopoverStyles();
  const bottomTriggerRef = useRef<HTMLButtonElement>(null);
  const rightTriggerRef = useRef<HTMLButtonElement>(null);
  const leftTriggerRef = useRef<HTMLButtonElement>(null);
  const endTriggerRef = useRef<HTMLButtonElement>(null);
  const startTriggerRef = useRef<HTMLButtonElement>(null);
  const topTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={cx(classes.popoverContainer)}>
      <Button ref={bottomTriggerRef}>Bottom</Button>
      <Popover triggerRef={bottomTriggerRef} position="bottom">
        Bottom Popover!
      </Popover>
      <Button ref={rightTriggerRef}>Right</Button>
      <Popover triggerRef={rightTriggerRef} position="right">
        Right Popover!
      </Popover>
      <Button ref={leftTriggerRef}>Left</Button>
      <Popover triggerRef={leftTriggerRef} position="left">
        Left Popover!
      </Popover>
      <Button ref={endTriggerRef}>End</Button>
      <Popover triggerRef={endTriggerRef} position="end">
        End Popover!
      </Popover>
      <Button ref={startTriggerRef}>Start</Button>
      <Popover triggerRef={startTriggerRef} position="start">
        Start Popover!
      </Popover>
      <Button ref={topTriggerRef}>Top</Button>
      <Popover triggerRef={topTriggerRef} position="top">
        Top Popover!
      </Popover>
    </div>
  );
}
