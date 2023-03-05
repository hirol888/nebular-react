import React, { useRef } from 'react';
import { GlobalLogicalPosition, GlobalPhysicalPosition } from '@nebular-react/hooks';
import { Button } from '../Button';
import { ExampleItemsRows } from '../Shared';
import {
  controlToast,
  dangerToast,
  infoToast,
  primaryToast,
  showToast,
  successToast,
  warningToast
} from './events';

export default { title: 'Toastr' };

export function Showcase() {
  const index = useRef<number>(0);

  return (
    <ExampleItemsRows>
      <Button
        onClick={() => {
          index.current += 1;
          successToast({
            message: 'Success',
            title: `Toast ${index.current}`,
            userConfig: {
              position: GlobalPhysicalPosition.TOP_RIGHT
            }
          });
        }}
      >
        Top Right
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          infoToast({
            message: 'Info',
            title: `Toast ${index.current}`,
            userConfig: {
              position: GlobalPhysicalPosition.BOTTOM_LEFT
            }
          });
        }}
      >
        Bottom Left
      </Button>
    </ExampleItemsRows>
  );
}

export function DestroyByClick() {
  const index = useRef<number>(0);

  return (
    <ExampleItemsRows>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`,
            userConfig: {
              destroyByClick: true
            }
          });
        }}
      >
        Destroy by click
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`,
            userConfig: {
              destroyByClick: false
            }
          });
        }}
      >
        Destroy by timeout only
      </Button>
    </ExampleItemsRows>
  );
}

export function Duration() {
  const index = useRef<number>(0);

  return (
    <ExampleItemsRows>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`
          });
        }}
      >
        Default 3000ms
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`,
            userConfig: {
              autoClose: 1000
            }
          });
        }}
      >
        1000ms
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`,
            userConfig: {
              autoClose: false
            }
          });
        }}
      >
        Infinite
      </Button>
    </ExampleItemsRows>
  );
}

export function Icon() {
  const index = useRef<number>(0);

  return (
    <ExampleItemsRows>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`
          });
        }}
      >
        With Default Icon
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`,
            userConfig: {
              icon: ''
            }
          });
        }}
      >
        Without Icon
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`,
            userConfig: {
              icon: 'headphones-outline',
              iconPack: 'eva'
            }
          });
        }}
      >
        Custom icon
      </Button>
    </ExampleItemsRows>
  );
}

export function Positions() {
  const index = useRef<number>(0);

  return (
    <ExampleItemsRows>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`,
            userConfig: {
              position: GlobalPhysicalPosition.TOP_RIGHT
            }
          });
        }}
      >
        Top right
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`,
            userConfig: {
              position: GlobalPhysicalPosition.BOTTOM_RIGHT
            }
          });
        }}
      >
        Bottom right
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`,
            userConfig: {
              position: GlobalPhysicalPosition.TOP_LEFT
            }
          });
        }}
      >
        Top left
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`,
            userConfig: {
              position: GlobalPhysicalPosition.BOTTOM_LEFT
            }
          });
        }}
      >
        Bottom left
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`,
            userConfig: {
              position: GlobalLogicalPosition.TOP_END
            }
          });
        }}
      >
        Top end
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`,
            userConfig: {
              position: GlobalLogicalPosition.BOTTOM_END
            }
          });
        }}
      >
        Bottom end
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`,
            userConfig: {
              position: GlobalLogicalPosition.TOP_START
            }
          });
        }}
      >
        Top start
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'This is toast message',
            title: `This is toast number ${index.current}`,
            userConfig: {
              position: GlobalLogicalPosition.BOTTOM_START
            }
          });
        }}
      >
        Bottom start
      </Button>
    </ExampleItemsRows>
  );
}

export function Statuses() {
  const index = useRef<number>(0);

  return (
    <ExampleItemsRows>
      <Button
        onClick={() => {
          index.current += 1;
          showToast({
            message: 'Basic',
            title: `Toast ${index.current}`
          });
        }}
      >
        Basic
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          primaryToast({
            message: 'Primary',
            title: `Toast ${index.current}`
          });
        }}
      >
        Primary
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          successToast({
            message: 'Success',
            title: `Toast ${index.current}`
          });
        }}
      >
        Success
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          infoToast({
            message: 'Info',
            title: `Toast ${index.current}`
          });
        }}
      >
        Info
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          warningToast({
            message: 'Warning',
            title: `Toast ${index.current}`
          });
        }}
      >
        Warning
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          dangerToast({
            message: 'Danger',
            title: `Toast ${index.current}`
          });
        }}
      >
        Danger
      </Button>
      <Button
        onClick={() => {
          index.current += 1;
          controlToast({
            message: 'Control',
            title: `Toast ${index.current}`
          });
        }}
      >
        Control
      </Button>
    </ExampleItemsRows>
  );
}
