import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Selectors, createStyles, useComponentDefaultProps } from '@nebular-react/styles';
import { Button, ButtonProps } from '../Button';

export interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  /** Text that is written to the clipboard. */
  value: string;
  /** Label rendered while idle. */
  label?: React.ReactNode;
  /** Label rendered right after a successful copy. */
  copiedLabel?: React.ReactNode;
  /** Time in milliseconds the copied state stays visible. */
  timeout?: number;
  /** Called with the copied value after a successful copy. */
  onCopied?(value: string): void;
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    maxWidth: '100%'
  },

  feedback: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
  }
}));

export type CopyButtonStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<CopyButtonProps> = {
  label: 'Copiar',
  copiedLabel: 'Copiado!',
  timeout: 1500
};

async function copyToClipboard(value: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Clipboard API is present but unavailable (permissions, insecure context...).
    }
  }

  if (typeof document === 'undefined') {
    return false;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let succeeded = false;

  try {
    succeeded = document.execCommand('copy');
  } catch {
    succeeded = false;
  }

  document.body.removeChild(textarea);

  return succeeded;
}

function getFeedbackText(node: React.ReactNode): string {
  if (typeof node === 'string') {
    return node;
  }

  if (typeof node === 'number') {
    return String(node);
  }

  return 'Copiado!';
}

const _CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>((props, ref) => {
  const { value, label, copiedLabel, timeout, onCopied, className, status, ...others } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'copy-button' });
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const handleClick = async () => {
    const succeeded = await copyToClipboard(value);

    if (!succeeded) {
      return;
    }

    setCopied(true);
    onCopied?.(value);
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setCopied(false);
    }, timeout);
  };

  return (
    <div className={cx(classes.root)}>
      <Button
        {...others}
        ref={ref}
        className={className}
        status={copied ? 'success' : status}
        onClick={handleClick}
      >
        {copied ? copiedLabel : label}
      </Button>
      <span role="status" aria-live="polite" className={cx(classes.feedback)}>
        {copied ? getFeedbackText(copiedLabel) : ''}
      </span>
    </div>
  );
});

_CopyButton.displayName = 'CopyButton';

export { _CopyButton as CopyButton };
