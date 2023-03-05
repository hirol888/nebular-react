import React, { useEffect, useMemo, useState } from 'react';
import { ComponentOrCustomStatus, createStyles } from '@nebular-react/styles';
import { Card } from '../Card';
import { ProgressBar } from './ProgressBar';
import { Action, Actions } from '../Actions';
import { Icon } from '../Icon';
import { ControlStatusExample } from '../Shared';

export default { title: 'Progress Bar' };

const createProgressBarStyles = createStyles(() => ({
  interactiveContainer: {
    display: 'flex',
    alignItems: 'center',

    '.progress-bar': {
      flex: 1
    },

    '.progress-bar ~ .progress-bar': {
      marginTop: '1rem'
    }
  },

  container: {
    '.progress-bar': {
      flex: 1
    },

    '.progress-bar ~ .progress-bar': {
      marginTop: '1rem'
    }
  }
}));

export function Showcase() {
  return (
    <Card>
      <Card.Body>
        <ProgressBar value={40} />
      </Card.Body>
    </Card>
  );
}

export function Interactive() {
  const [value, setValue] = useState<number>(25);
  const getStatus = useMemo(() => {
    if (value <= 25) {
      return 'danger';
    }
    if (value <= 50) {
      return 'warning';
    }
    if (value <= 75) {
      return 'info';
    }
    return 'success';
  }, [value]);
  const [status, setStatus] = useState<ComponentOrCustomStatus>(getStatus);
  const { classes, cx } = createProgressBarStyles();

  const setNewValue = (newValue: number) => {
    setValue(Math.min(Math.max(newValue, 0), 100));
  };

  useEffect(() => {
    setStatus(getStatus);
  }, [value]);

  return (
    <Card>
      <Card.Body>
        <div className={cx(classes.interactiveContainer)}>
          <Actions size="medium">
            <Action onClick={() => setNewValue(value - 25)} icon={<Icon icon="minus-outline" />} />
          </Actions>
          <ProgressBar className="progress-bar" value={value} status={status} displayValue />
          <Actions size="medium">
            <Action onClick={() => setNewValue(value + 25)} icon={<Icon icon="plus-outline" />} />
          </Actions>
        </div>
      </Card.Body>
    </Card>
  );
}

export function Size() {
  const { classes, cx } = createProgressBarStyles();

  return (
    <Card>
      <Card.Body className={cx(classes.container)}>
        <ProgressBar className="progress-bar" value={20} size="tiny">
          tiny
        </ProgressBar>
        <ProgressBar className="progress-bar" value={40} size="small">
          small
        </ProgressBar>
        <ProgressBar className="progress-bar" value={60} size="medium">
          medium
        </ProgressBar>
        <ProgressBar className="progress-bar" value={80} size="large">
          large
        </ProgressBar>
        <ProgressBar className="progress-bar" value={100} size="giant">
          giant
        </ProgressBar>
      </Card.Body>
    </Card>
  );
}

export function Status() {
  const { classes, cx } = createProgressBarStyles();

  return (
    <Card>
      <Card.Body className={cx(classes.container)}>
        <ProgressBar className="progress-bar" value={20} status="basic">
          basic
        </ProgressBar>
        <ProgressBar className="progress-bar" value={30} status="primary">
          primary
        </ProgressBar>
        <ProgressBar className="progress-bar" value={50} status="info">
          info
        </ProgressBar>
        <ProgressBar className="progress-bar" value={60} status="success">
          success
        </ProgressBar>
        <ProgressBar className="progress-bar" value={70} status="warning">
          warning
        </ProgressBar>
        <ProgressBar className="progress-bar" value={80} status="danger">
          danger
        </ProgressBar>
        <ControlStatusExample style={{ marginTop: '1rem' }}>
          <ProgressBar className="progress-bar" value={90} status="control">
            control
          </ProgressBar>
        </ControlStatusExample>
      </Card.Body>
    </Card>
  );
}

export function Value() {
  const { classes, cx } = createProgressBarStyles();

  return (
    <Card>
      <Card.Body className={cx(classes.container)}>
        <ProgressBar className="progress-bar" value={40} status="primary" displayValue />
        <ProgressBar className="progress-bar" value={60} status="primary">
          Custom value
        </ProgressBar>
      </Card.Body>
    </Card>
  );
}
