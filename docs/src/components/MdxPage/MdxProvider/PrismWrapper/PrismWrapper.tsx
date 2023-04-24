import React, { useRef } from 'react';
import { Button, Icon, Tooltip } from '@nebular-react/core';
import { useClipboard } from '@mantine/hooks';
import { Prism } from '@mantine/prism';
import { Language, PrismTheme } from 'prism-react-renderer';
import useStyles from './PrismWrapper.styles';

interface PrismWrapperProps {
  language: Language;
  children?: any;
}

const getPrismTheme = (): PrismTheme => ({
  plain: {
    color: '#f8f8f2',
    background: 'linear-gradient(225deg,#333c66 0%,#1d2447 100%)'
  },

  styles: [
    {
      types: ['comment'],
      style: {
        color: '#6272a4'
      }
    },
    {
      types: ['string', 'inserted', 'selector', 'atrule'],
      style: {
        color: '#f1fa8c'
      }
    },
    {
      types: ['number'],
      style: {
        color: '#4dabf7'
      }
    },
    {
      types: ['builtin', 'char', 'constant', 'function'],
      style: {
        color: '#ff922b'
      }
    },
    {
      types: ['punctuation'],
      style: {
        color: '#adb5bd'
      }
    },
    {
      types: ['variable'],
      style: {
        color: '#adb5bd'
      }
    },
    {
      types: ['class-name', 'attr-name'],
      style: {
        color: '#fcc419'
      }
    },
    {
      types: ['tag', 'deleted'],
      style: {
        color: '#f8f8f2'
      }
    },
    {
      types: ['operator'],
      style: {
        color: '#adb5bd'
      }
    },
    {
      types: ['boolean'],
      style: {
        color: '#fa5252'
      }
    },
    {
      types: ['keyword'],
      style: {
        color: '#8be9fd'
      }
    },
    {
      types: ['doctype'],
      style: {
        color: '#adb5bd'
      }
    },
    {
      types: ['url'],
      style: {
        color: '#adb5bd'
      }
    }
  ]
});

export function PrismWrapper(props: PrismWrapperProps) {
  const { language, children } = props;
  const { classes, cx } = useStyles();
  const code = typeof children === 'string' ? children.trim() : children;
  const clipboard = useClipboard();
  const tooltipTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={cx(classes.root)}>
      <Button
        prefixIcon={
          <Icon icon={clipboard.copied ? 'checkmark-outline' : 'clipboard-outline'} pack="eva" />
        }
        onClick={() => clipboard.copy(code)}
        wrapperClassName="prism-tooltip-button-wrapper"
        className="prism-tooltip-button"
        ref={tooltipTriggerRef}
      />
      <Tooltip
        triggerRef={tooltipTriggerRef}
        status={clipboard.copied ? 'success' : 'basic'}
        content={clipboard.copied ? 'Copied' : 'Copy code'}
        position="left"
      />
      <Prism
        language={language}
        colorScheme="dark"
        className="code-block"
        getPrismTheme={getPrismTheme}
        noCopy
        withLineNumbers
      >
        {children}
      </Prism>
    </div>
  );
}
