import React from 'react';
import { createStyles } from '@nebular-react/styles';
import { Card } from '../Card';
import { Timepicker } from './Timepicker';

export default { title: 'Timepicker' };

const createStoryStyles = createStyles(() => ({
  timepickerContainer: {
    '.nebular-card-body-root': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    },

    '.nebular-form-field-root, .nebular-form-field-container, .nebular-input-root': {
      width: '100%'
    }
  }
}));

export function Showcase() {
  const { classes, cx } = createStoryStyles();
  return (
    <div className={cx(classes.timepickerContainer)}>
      <Card size="large">
        <Card.Body>
          <Timepicker />
        </Card.Body>
      </Card>
    </div>
  );
}

export function SingleColumn() {
  const { classes, cx } = createStoryStyles();
  return (
    <div className={cx(classes.timepickerContainer)}>
      <Card size="large">
        <Card.Body>
          <Timepicker timeListProps={{ singleColumn: true, step: 10 }} />
        </Card.Body>
      </Card>
    </div>
  );
}

export function TwelveHoursFormat() {
  const { classes, cx } = createStoryStyles();
  return (
    <div className={cx(classes.timepickerContainer)}>
      <Card size="large">
        <Card.Body>
          <Timepicker timeListProps={{ twelveHoursFormat: true }} />
        </Card.Body>
      </Card>
    </div>
  );
}

export function WithSeconds() {
  const { classes, cx } = createStoryStyles();
  return (
    <div className={cx(classes.timepickerContainer)}>
      <Card size="large">
        <Card.Body>
          <Timepicker timeListProps={{ withSeconds: true }} />
        </Card.Body>
      </Card>
    </div>
  );
}
