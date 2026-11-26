import React, { useState } from 'react';
import { createStyles } from '@nebular-react/styles';
import { Card } from '../Card';
import { Timepicker } from './Timepicker';

export default { title: 'Timepicker', component: Timepicker };

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

export function TimeZone() {
  const { classes, cx } = createStoryStyles();
  const [newYorkValue, setNewYorkValue] = useState<Date>(new Date('2024-01-15T12:00:00Z'));
  const [tokyoValue, setTokyoValue] = useState<Date>(new Date('2024-01-15T12:00:00Z'));

  return (
    <div
      className={cx(classes.timepickerContainer)}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}
    >
      <div style={{ flex: '1 1 320px' }}>
        <Card size="large">
          <Card.Body>
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <strong>America/New_York</strong>
              <Timepicker<Date>
                timeZone="America/New_York"
                date={newYorkValue}
                onDateChange={setNewYorkValue}
                inputProps={{ 'aria-label': 'New York time' }}
              />
              <span>Absolute value: {newYorkValue.toISOString()}</span>
            </div>
          </Card.Body>
        </Card>
      </div>
      <div style={{ flex: '1 1 320px' }}>
        <Card size="large">
          <Card.Body>
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <strong>Asia/Tokyo</strong>
              <Timepicker<Date>
                timeZone="Asia/Tokyo"
                date={tokyoValue}
                onDateChange={setTokyoValue}
                inputProps={{ 'aria-label': 'Tokyo time' }}
              />
              <span>Absolute value: {tokyoValue.toISOString()}</span>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export function InputMaskAndKeyboard() {
  const { classes, cx } = createStoryStyles();
  const [value, setValue] = useState<Date>(new Date('2024-01-15T12:00:00Z'));

  return (
    <div className={cx(classes.timepickerContainer)}>
      <Card size="large">
        <Card.Body>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            <span>
              Type the time or use the arrow keys (↑/↓) to change the hour or minute under the
              caret.
            </span>
            <Timepicker<Date>
              date={value}
              onDateChange={setValue}
              withInputMask
              withKeyboardEdit
              inputProps={{ 'aria-label': 'Time with input mask and keyboard edit' }}
            />
            <span>Absolute value: {value.toISOString()}</span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
