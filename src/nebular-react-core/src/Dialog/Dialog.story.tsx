import { createStyles } from '@nebular-react/styles';
import React, { useEffect } from 'react';
import { Button } from '../Button';
import { Card } from '../Card';
import { closeDialog, showDialog } from './events';

export default { title: 'Dialog' };

const createDialogStyles = createStyles(() => ({
  container: {
    '.nebular-button-wrapper + .nebular-button-wrapper': {
      marginLeft: '1rem'
    }
  },

  dialogCard: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '90%',
    '@media (min-width: 40rem)': {
      width: '38rem'
    }
  }
}));

export function Showcase() {
  const { classes, cx } = createDialogStyles();

  return (
    <div className={cx(classes.container)}>
      <Button
        onClick={() =>
          showDialog({
            id: 'dialog-example',
            content: (
              <Card className={cx(classes.dialogCard)}>
                <Card.Header>Title</Card.Header>
                <Card.Body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras convallis tincidunt
                  tincidunt. Vestibulum vulputate maximus massa vel tristique. Suspendisse potenti.
                  Duis aliquet purus sed dictum dictum. Donec fringilla, purus at fermentum
                  imperdiet, velit enim malesuada turpis, quis luctus arcu arcu nec orci. Duis eu
                  mattis felis. Quisque sollicitudin elementum nunc vel tincidunt. Vestibulum
                  egestas mi nec iaculis varius. Morbi in risus sed sapien ultricies feugiat.
                  Quisque pulvinar mattis purus, in aliquet massa aliquet et.
                </Card.Body>
                <Card.Footer>
                  <Button status="primary" onClick={() => closeDialog('dialog-example')}>
                    Dismiss Dialog
                  </Button>
                </Card.Footer>
              </Card>
            )
          })
        }
      >
        Open Dialog
      </Button>
    </div>
  );
}

export function AutoFocus() {
  const { classes, cx } = createDialogStyles();

  return (
    <div className={cx(classes.container)}>
      <Button
        onClick={() =>
          showDialog({
            id: 'dialog-autofocus',
            autoFocus: true,
            content: (
              <Card className={cx(classes.dialogCard)}>
                <Card.Header>Title</Card.Header>
                <Card.Body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras convallis tincidunt
                  tincidunt. Vestibulum vulputate maximus massa vel tristique. Suspendisse potenti.
                  Duis aliquet purus sed dictum dictum. Donec fringilla, purus at fermentum
                  imperdiet, velit enim malesuada turpis, quis luctus arcu arcu nec orci. Duis eu
                  mattis felis. Quisque sollicitudin elementum nunc vel tincidunt. Vestibulum
                  egestas mi nec iaculis varius. Morbi in risus sed sapien ultricies feugiat.
                  Quisque pulvinar mattis purus, in aliquet massa aliquet et.
                </Card.Body>
                <Card.Footer>
                  <Button status="primary" onClick={() => closeDialog('dialog-autofocus')}>
                    Dismiss Dialog
                  </Button>
                </Card.Footer>
              </Card>
            )
          })
        }
      >
        With Auto Focus
      </Button>
      <Button
        onClick={() =>
          showDialog({
            id: 'dialog-no-autofocus',
            autoFocus: false,
            content: (
              <Card className={cx(classes.dialogCard)}>
                <Card.Header>Title</Card.Header>
                <Card.Body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras convallis tincidunt
                  tincidunt. Vestibulum vulputate maximus massa vel tristique. Suspendisse potenti.
                  Duis aliquet purus sed dictum dictum. Donec fringilla, purus at fermentum
                  imperdiet, velit enim malesuada turpis, quis luctus arcu arcu nec orci. Duis eu
                  mattis felis. Quisque sollicitudin elementum nunc vel tincidunt. Vestibulum
                  egestas mi nec iaculis varius. Morbi in risus sed sapien ultricies feugiat.
                  Quisque pulvinar mattis purus, in aliquet massa aliquet et.
                </Card.Body>
                <Card.Footer>
                  <Button status="primary" onClick={() => closeDialog('dialog-no-autofocus')}>
                    Dismiss Dialog
                  </Button>
                </Card.Footer>
              </Card>
            )
          })
        }
      >
        Without Auto Focus
      </Button>
    </div>
  );
}

export function BackdropClick() {
  const { classes, cx } = createDialogStyles();

  return (
    <div className={cx(classes.container)}>
      <Button
        onClick={() =>
          showDialog({
            id: 'dialog-close-on-backdrop-click',
            closeOnBackdropClick: true,
            content: (
              <Card className={cx(classes.dialogCard)}>
                <Card.Header>Title</Card.Header>
                <Card.Body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras convallis tincidunt
                  tincidunt. Vestibulum vulputate maximus massa vel tristique. Suspendisse potenti.
                  Duis aliquet purus sed dictum dictum. Donec fringilla, purus at fermentum
                  imperdiet, velit enim malesuada turpis, quis luctus arcu arcu nec orci. Duis eu
                  mattis felis. Quisque sollicitudin elementum nunc vel tincidunt. Vestibulum
                  egestas mi nec iaculis varius. Morbi in risus sed sapien ultricies feugiat.
                  Quisque pulvinar mattis purus, in aliquet massa aliquet et.
                </Card.Body>
                <Card.Footer>
                  <Button
                    status="primary"
                    onClick={() => closeDialog('dialog-close-on-backdrop-click')}
                  >
                    Dismiss Dialog
                  </Button>
                </Card.Footer>
              </Card>
            )
          })
        }
      >
        With backdrop click close
      </Button>
      <Button
        onClick={() =>
          showDialog({
            id: 'dialog-no-close-on-backdrop-click',
            closeOnBackdropClick: false,
            content: (
              <Card className={cx(classes.dialogCard)}>
                <Card.Header>Title</Card.Header>
                <Card.Body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras convallis tincidunt
                  tincidunt. Vestibulum vulputate maximus massa vel tristique. Suspendisse potenti.
                  Duis aliquet purus sed dictum dictum. Donec fringilla, purus at fermentum
                  imperdiet, velit enim malesuada turpis, quis luctus arcu arcu nec orci. Duis eu
                  mattis felis. Quisque sollicitudin elementum nunc vel tincidunt. Vestibulum
                  egestas mi nec iaculis varius. Morbi in risus sed sapien ultricies feugiat.
                  Quisque pulvinar mattis purus, in aliquet massa aliquet et.
                </Card.Body>
                <Card.Footer>
                  <Button
                    status="primary"
                    onClick={() => closeDialog('dialog-no-close-on-backdrop-click')}
                  >
                    Dismiss Dialog
                  </Button>
                </Card.Footer>
              </Card>
            )
          })
        }
      >
        Without backdrop click close
      </Button>
    </div>
  );
}

export function Escape() {
  const { classes, cx } = createDialogStyles();

  return (
    <div className={cx(classes.container)}>
      <Button
        onClick={() =>
          showDialog({
            id: 'dialog-close-on-esc',
            closeOnEsc: true,
            content: (
              <Card className={cx(classes.dialogCard)}>
                <Card.Header>Title</Card.Header>
                <Card.Body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras convallis tincidunt
                  tincidunt. Vestibulum vulputate maximus massa vel tristique. Suspendisse potenti.
                  Duis aliquet purus sed dictum dictum. Donec fringilla, purus at fermentum
                  imperdiet, velit enim malesuada turpis, quis luctus arcu arcu nec orci. Duis eu
                  mattis felis. Quisque sollicitudin elementum nunc vel tincidunt. Vestibulum
                  egestas mi nec iaculis varius. Morbi in risus sed sapien ultricies feugiat.
                  Quisque pulvinar mattis purus, in aliquet massa aliquet et.
                </Card.Body>
                <Card.Footer>
                  <Button status="primary" onClick={() => closeDialog('dialog-close-on-esc')}>
                    Dismiss Dialog
                  </Button>
                </Card.Footer>
              </Card>
            )
          })
        }
      >
        Open with escape close
      </Button>
      <Button
        onClick={() =>
          showDialog({
            id: 'dialog-no-close-on-esc',
            closeOnEsc: false,
            content: (
              <Card className={cx(classes.dialogCard)}>
                <Card.Header>Title</Card.Header>
                <Card.Body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras convallis tincidunt
                  tincidunt. Vestibulum vulputate maximus massa vel tristique. Suspendisse potenti.
                  Duis aliquet purus sed dictum dictum. Donec fringilla, purus at fermentum
                  imperdiet, velit enim malesuada turpis, quis luctus arcu arcu nec orci. Duis eu
                  mattis felis. Quisque sollicitudin elementum nunc vel tincidunt. Vestibulum
                  egestas mi nec iaculis varius. Morbi in risus sed sapien ultricies feugiat.
                  Quisque pulvinar mattis purus, in aliquet massa aliquet et.
                </Card.Body>
                <Card.Footer>
                  <Button status="primary" onClick={() => closeDialog('dialog-no-close-on-esc')}>
                    Dismiss Dialog
                  </Button>
                </Card.Footer>
              </Card>
            )
          })
        }
      >
        Open without escape close
      </Button>
    </div>
  );
}

export function HasBackdrop() {
  const { classes, cx } = createDialogStyles();

  return (
    <div className={cx(classes.container)}>
      <Button
        onClick={() =>
          showDialog({
            id: 'dialog-with-backdrop',
            hasBackdrop: true,
            content: (
              <Card className={cx(classes.dialogCard)}>
                <Card.Header>Title</Card.Header>
                <Card.Body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras convallis tincidunt
                  tincidunt. Vestibulum vulputate maximus massa vel tristique. Suspendisse potenti.
                  Duis aliquet purus sed dictum dictum. Donec fringilla, purus at fermentum
                  imperdiet, velit enim malesuada turpis, quis luctus arcu arcu nec orci. Duis eu
                  mattis felis. Quisque sollicitudin elementum nunc vel tincidunt. Vestibulum
                  egestas mi nec iaculis varius. Morbi in risus sed sapien ultricies feugiat.
                  Quisque pulvinar mattis purus, in aliquet massa aliquet et.
                </Card.Body>
                <Card.Footer>
                  <Button status="primary" onClick={() => closeDialog('dialog-with-backdrop')}>
                    Dismiss Dialog
                  </Button>
                </Card.Footer>
              </Card>
            )
          })
        }
      >
        With backdrop
      </Button>
      <Button
        onClick={() =>
          showDialog({
            id: 'dialog-without-backdrop',
            hasBackdrop: false,
            content: (
              <Card className={cx(classes.dialogCard)}>
                <Card.Header>Title</Card.Header>
                <Card.Body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras convallis tincidunt
                  tincidunt. Vestibulum vulputate maximus massa vel tristique. Suspendisse potenti.
                  Duis aliquet purus sed dictum dictum. Donec fringilla, purus at fermentum
                  imperdiet, velit enim malesuada turpis, quis luctus arcu arcu nec orci. Duis eu
                  mattis felis. Quisque sollicitudin elementum nunc vel tincidunt. Vestibulum
                  egestas mi nec iaculis varius. Morbi in risus sed sapien ultricies feugiat.
                  Quisque pulvinar mattis purus, in aliquet massa aliquet et.
                </Card.Body>
                <Card.Footer>
                  <Button status="primary" onClick={() => closeDialog('dialog-without-backdrop')}>
                    Dismiss Dialog
                  </Button>
                </Card.Footer>
              </Card>
            )
          })
        }
      >
        Without backdrop
      </Button>
    </div>
  );
}

export function Scroll() {
  const { classes, cx } = createDialogStyles();

  useEffect(() => {
    document.body.style.height = '120vh';

    return () => {
      document.body.style.height = '100vh';
    };
  }, []);

  return (
    <div className={cx(classes.container)}>
      <Button
        onClick={() =>
          showDialog({
            id: 'dialog-with-scroll',
            hasScroll: true,
            content: (
              <Card className={cx(classes.dialogCard)}>
                <Card.Header>Title</Card.Header>
                <Card.Body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras convallis tincidunt
                  tincidunt. Vestibulum vulputate maximus massa vel tristique. Suspendisse potenti.
                  Duis aliquet purus sed dictum dictum. Donec fringilla, purus at fermentum
                  imperdiet, velit enim malesuada turpis, quis luctus arcu arcu nec orci. Duis eu
                  mattis felis. Quisque sollicitudin elementum nunc vel tincidunt. Vestibulum
                  egestas mi nec iaculis varius. Morbi in risus sed sapien ultricies feugiat.
                  Quisque pulvinar mattis purus, in aliquet massa aliquet et.
                </Card.Body>
                <Card.Footer>
                  <Button status="primary" onClick={() => closeDialog('dialog-with-scroll')}>
                    Dismiss Dialog
                  </Button>
                </Card.Footer>
              </Card>
            )
          })
        }
      >
        With scroll
      </Button>
      <Button
        onClick={() =>
          showDialog({
            id: 'dialog-without-scroll',
            hasScroll: false,
            content: (
              <Card className={cx(classes.dialogCard)}>
                <Card.Header>Title</Card.Header>
                <Card.Body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras convallis tincidunt
                  tincidunt. Vestibulum vulputate maximus massa vel tristique. Suspendisse potenti.
                  Duis aliquet purus sed dictum dictum. Donec fringilla, purus at fermentum
                  imperdiet, velit enim malesuada turpis, quis luctus arcu arcu nec orci. Duis eu
                  mattis felis. Quisque sollicitudin elementum nunc vel tincidunt. Vestibulum
                  egestas mi nec iaculis varius. Morbi in risus sed sapien ultricies feugiat.
                  Quisque pulvinar mattis purus, in aliquet massa aliquet et.
                </Card.Body>
                <Card.Footer>
                  <Button status="primary" onClick={() => closeDialog('dialog-without-scroll')}>
                    Dismiss Dialog
                  </Button>
                </Card.Footer>
              </Card>
            )
          })
        }
      >
        Without scroll
      </Button>
    </div>
  );
}
