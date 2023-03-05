import React, { useState } from 'react';
import { createStyles } from '@nebular-react/styles';
import { Input } from '../Input';
import { Button } from '../Button';
import { Card } from '../Card';
import { Checkbox } from '../Checkbox';
import { showWindow } from './events';

export default { title: 'Window' };

const createStoryStyles = createStyles(() => ({
  form: {
    display: 'flex',
    flexDirection: 'column',

    '.text-label': {
      marginTop: '1.5rem'
    }
  }
}));

export function Showcase() {
  const { classes, cx } = createStoryStyles();
  return (
    <>
      <Button
        onClick={() =>
          showWindow({
            title: 'Window',
            content: (
              <form className={cx(classes.form)}>
                <label htmlFor="subject">Subject:</label>
                <Input id="subject" type="text" fullWidth />
                <label htmlFor="text" className="text-label">
                  Text:
                </label>
                <Input component="textarea" id="text" fullWidth />
              </form>
            )
          })
        }
      >
        Open window
      </Button>
    </>
  );
}

export function WindowControls() {
  const { classes, cx } = createStoryStyles();
  const [hasMinimize, setHasMinimize] = useState<boolean>(true);
  const [hasMaximize, setHasMaximize] = useState<boolean>(true);
  const [hasFullScreen, setHasFullScreen] = useState<boolean>(true);
  const [hasClose, setHasClose] = useState<boolean>(true);

  return (
    <Card>
      <Card.Body>
        <p className="">Buttons config:</p>
        <Checkbox onCheck={(value) => setHasMinimize(value)} checked={hasMinimize}>
          Minimize
        </Checkbox>
        <Checkbox onCheck={(value) => setHasMaximize(value)} checked={hasMaximize}>
          Maximize
        </Checkbox>
        <Checkbox onCheck={(value) => setHasFullScreen(value)} checked={hasFullScreen}>
          Full Screen
        </Checkbox>
        <Checkbox onCheck={(value) => setHasClose(value)} checked={hasClose}>
          Close
        </Checkbox>
        <Button
          onClick={() =>
            showWindow({
              title: 'Window',
              hasMinimizeButton: hasMinimize,
              hasMaximizeButton: hasMaximize,
              hasFullScreenButton: hasFullScreen,
              hasCloseButton: hasClose,
              content: (
                <form className={cx(classes.form)}>
                  <label htmlFor="subject">Subject:</label>
                  <Input id="subject" type="text" fullWidth />
                  <label htmlFor="text" className="text-label">
                    Text:
                  </label>
                  <Input component="textarea" id="text" fullWidth />
                </form>
              )
            })
          }
        >
          Open window
        </Button>
      </Card.Body>
    </Card>
  );
}

export function Backdrop() {
  const { classes, cx } = createStoryStyles();
  const content = (
    <form className={cx(classes.form)}>
      <label htmlFor="subject">Subject:</label>
      <Input id="subject" type="text" fullWidth />
      <label htmlFor="text" className="text-label">
        Text:
      </label>
      <Input component="textarea" id="text" fullWidth />
    </form>
  );

  return (
    <>
      <Button
        onClick={() => showWindow({ title: 'Window', content })}
        style={{ marginRight: '1rem' }}
      >
        Open window with backdrop
      </Button>
      <Button onClick={() => showWindow({ title: 'Window', content, hasBackdrop: false })}>
        Open window without backdrop
      </Button>
    </>
  );
}
