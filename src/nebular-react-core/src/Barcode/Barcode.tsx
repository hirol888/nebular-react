/* eslint-disable no-bitwise */
import React, { forwardRef, useMemo } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type BarcodeFormat = 'EAN13' | 'EAN8' | 'CODE128' | 'CODE39';

export interface BarcodeBar {
  /** Horizontal start of the bar, in module units. */
  x: number;
  /** Width of the bar, in module units. */
  width: number;
}

export interface BarcodeEncoding {
  bars: BarcodeBar[];
  text?: string;
}

/** EAN left hand (odd parity) digit patterns. */
const EAN_L = [
  '0001101',
  '0011001',
  '0010011',
  '0111101',
  '0100011',
  '0110001',
  '0101111',
  '0111011',
  '0110111',
  '0001011'
];

/** EAN left hand (even parity) digit patterns. */
const EAN_G = [
  '0100111',
  '0110011',
  '0011011',
  '0100001',
  '0011101',
  '0111001',
  '0000101',
  '0010001',
  '0001001',
  '0010111'
];

/** EAN right hand digit patterns. */
const EAN_R = [
  '1110010',
  '1100110',
  '1101100',
  '1000010',
  '1011100',
  '1001110',
  '1010000',
  '1000100',
  '1001000',
  '1110100'
];

/** Parity of the six left hand digits, indexed by the leading EAN13 digit. */
const EAN13_PARITY = [
  'LLLLLL',
  'LLGLGG',
  'LLGGLG',
  'LLGGGL',
  'LGLLGG',
  'LGGLLG',
  'LGGGLL',
  'LGLGLG',
  'LGLGGL',
  'LGGLGL'
];

/** Code 128 binary patterns: 103 data symbols, 3 start symbols and the stop symbol. */
const CODE128_PATTERNS = [
  '11011001100',
  '11001101100',
  '11001100110',
  '10010011000',
  '10010001100',
  '10001001100',
  '10011001000',
  '10011000100',
  '10001100100',
  '11001001000',
  '11001000100',
  '11000100100',
  '10110011100',
  '10011011100',
  '10011001110',
  '10111001100',
  '10011101100',
  '10011100110',
  '11001110010',
  '11001011100',
  '11001001110',
  '11011100100',
  '11001110100',
  '11101101110',
  '11101001100',
  '11100101100',
  '11100100110',
  '11101100100',
  '11100110100',
  '11100110010',
  '11011011000',
  '11011000110',
  '11000110110',
  '10100011000',
  '10001011000',
  '10001000110',
  '10110001000',
  '10001101000',
  '10001100010',
  '11010001000',
  '11000101000',
  '11000100010',
  '10110111000',
  '10110001110',
  '10001101110',
  '10111011000',
  '10111000110',
  '10001110110',
  '11101110110',
  '11010001110',
  '11000101110',
  '11011101000',
  '11011100010',
  '11011101110',
  '11101011000',
  '11101000110',
  '11100010110',
  '11101101000',
  '11101100010',
  '11100011010',
  '11101111010',
  '11001000010',
  '11110001010',
  '10100110000',
  '10100001100',
  '10010110000',
  '10010000110',
  '10000101100',
  '10000100110',
  '10110010000',
  '10110000100',
  '10011010000',
  '10011000010',
  '10000110100',
  '10000110010',
  '11000010010',
  '11001010000',
  '11110111010',
  '11000010100',
  '10001111010',
  '10100111100',
  '10010111100',
  '10010011110',
  '10111100100',
  '10011110100',
  '10011110010',
  '11110100100',
  '11110010100',
  '11110010010',
  '11011011110',
  '11011110110',
  '11110110110',
  '10101111000',
  '10100011110',
  '10001011110',
  '10111101000',
  '10111100010',
  '11110101000',
  '11110100010',
  '10111011110',
  '10111101110',
  '11101011110',
  '11110101110',
  '11010000100',
  '11010010000',
  '11010011100',
  '1100011101011'
];

const CODE128_START_B = 104;
const CODE128_START_C = 105;
const CODE128_CODE_B = 100;
const CODE128_CODE_C = 99;
const CODE128_STOP = 106;
const CODE128_MODULO = 103;

/** Code 39 alphabet, ordered like the ZXing encoding table below. */
const CODE39_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';

/** Wide/narrow patterns: bit 8 is the first element, 1 means a wide element. */
const CODE39_ENCODINGS = [
  0x034, 0x121, 0x061, 0x160, 0x031, 0x130, 0x070, 0x025, 0x124, 0x064, 0x109, 0x049, 0x148, 0x019,
  0x118, 0x058, 0x00d, 0x10c, 0x04c, 0x01c, 0x103, 0x043, 0x142, 0x013, 0x112, 0x052, 0x007, 0x106,
  0x046, 0x016, 0x181, 0x0c1, 0x1c0, 0x091, 0x190, 0x0d0, 0x085, 0x184, 0x0c4, 0x0a8, 0x0a2, 0x08a,
  0x02a
];

const CODE39_ASTERISK = 0x094;

function bitsToBars(bits: string): BarcodeBar[] {
  const bars: BarcodeBar[] = [];
  let index = 0;

  while (index < bits.length) {
    if (bits[index] === '1') {
      let width = 1;

      while (index + width < bits.length && bits[index + width] === '1') {
        width += 1;
      }

      bars.push({ x: index, width });
      index += width;
    } else {
      index += 1;
    }
  }

  return bars;
}

function assertDigits(value: string, format: BarcodeFormat): string {
  const digits = value.trim();

  if (digits.length === 0 || !/^\d+$/.test(digits)) {
    throw new Error(`Barcode: ${format} expects only digits`);
  }

  return digits;
}

function ean13CheckDigit(digits: string): string {
  let sum = 0;

  for (let index = 0; index < digits.length; index += 1) {
    sum += Number(digits[index]) * (index % 2 === 0 ? 1 : 3);
  }

  return String((10 - (sum % 10)) % 10);
}

function normalizeEan13(value: string): string {
  const digits = assertDigits(value, 'EAN13');

  if (digits.length === 12) {
    return `${digits}${ean13CheckDigit(digits)}`;
  }

  if (digits.length === 13) {
    if (ean13CheckDigit(digits.slice(0, 12)) !== digits[12]) {
      throw new Error(`Barcode: EAN13 checksum mismatch for "${digits}"`);
    }

    return digits;
  }

  throw new Error('Barcode: EAN13 expects 12 or 13 digits');
}

function ean8CheckDigit(digits: string): string {
  let sum = 0;

  for (let index = 0; index < digits.length; index += 1) {
    sum += Number(digits[index]) * (index % 2 === 0 ? 3 : 1);
  }

  return String((10 - (sum % 10)) % 10);
}

function normalizeEan8(value: string): string {
  const digits = assertDigits(value, 'EAN8');

  if (digits.length === 7) {
    return `${digits}${ean8CheckDigit(digits)}`;
  }

  if (digits.length === 8) {
    if (ean8CheckDigit(digits.slice(0, 7)) !== digits[7]) {
      throw new Error(`Barcode: EAN8 checksum mismatch for "${digits}"`);
    }

    return digits;
  }

  throw new Error('Barcode: EAN8 expects 7 or 8 digits');
}

function encodeEan13Bits(digits: string): string {
  const parity = EAN13_PARITY[Number(digits[0])];
  let bits = '101';

  for (let index = 1; index <= 6; index += 1) {
    bits += parity[index - 1] === 'L' ? EAN_L[Number(digits[index])] : EAN_G[Number(digits[index])];
  }

  bits += '01010';

  for (let index = 7; index <= 12; index += 1) {
    bits += EAN_R[Number(digits[index])];
  }

  return `${bits}101`;
}

function encodeEan8Bits(digits: string): string {
  let bits = '101';

  for (let index = 0; index < 4; index += 1) {
    bits += EAN_L[Number(digits[index])];
  }

  bits += '01010';

  for (let index = 4; index < 8; index += 1) {
    bits += EAN_R[Number(digits[index])];
  }

  return `${bits}101`;
}

function countDigits(value: string, start: number): number {
  let count = 0;

  while (
    start + count < value.length &&
    value[start + count] >= '0' &&
    value[start + count] <= '9'
  ) {
    count += 1;
  }

  return count;
}

function encodeCode128Bits(value: string): string {
  if (value.length === 0) {
    throw new Error('Barcode: CODE128 requires a non empty value');
  }

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (code < 32 || code > 126) {
      throw new Error(`Barcode: CODE128 does not support the character "${value[index]}"`);
    }
  }

  const symbols: number[] = [];
  let currentSet: 'B' | 'C' | null = null;
  let index = 0;

  while (index < value.length) {
    const digitRun = countDigits(value, index);
    const useCodeC = digitRun >= 2 && digitRun >= (index === 0 ? 4 : 6);

    if (useCodeC) {
      if (currentSet === null) {
        symbols.push(CODE128_START_C);
      } else if (currentSet !== 'C') {
        symbols.push(CODE128_CODE_C);
      }

      currentSet = 'C';

      let remaining = digitRun;

      while (remaining >= 2) {
        symbols.push(Number(value.slice(index, index + 2)));
        index += 2;
        remaining -= 2;
      }
    } else {
      if (currentSet === null) {
        symbols.push(CODE128_START_B);
      } else if (currentSet !== 'B') {
        symbols.push(CODE128_CODE_B);
      }

      currentSet = 'B';
      symbols.push(value.charCodeAt(index) - 32);
      index += 1;
    }
  }

  let checksum = symbols[0];

  for (let position = 1; position < symbols.length; position += 1) {
    checksum += symbols[position] * position;
  }

  const encoded = [...symbols, checksum % CODE128_MODULO, CODE128_STOP];

  return encoded.map((symbol) => CODE128_PATTERNS[symbol]).join('');
}

function code39Bits(encoding: number): string {
  let bits = '';
  let isBar = true;

  for (let bit = 8; bit >= 0; bit -= 1) {
    const width = (encoding >> bit) & 1 ? 2 : 1;

    bits += (isBar ? '1' : '0').repeat(width);
    isBar = !isBar;
  }

  return bits;
}

function encodeCode39Bits(value: string): string {
  if (value.length === 0) {
    throw new Error('Barcode: CODE39 requires a non empty value');
  }

  const characters = value.split('');

  characters.forEach((character) => {
    if (CODE39_ALPHABET.indexOf(character) === -1) {
      throw new Error(`Barcode: CODE39 does not support the character "${character}"`);
    }
  });

  const encodings = [
    CODE39_ASTERISK,
    ...characters.map((character) => CODE39_ENCODINGS[CODE39_ALPHABET.indexOf(character)]),
    CODE39_ASTERISK
  ];

  return encodings.map((encoding) => code39Bits(encoding)).join('0');
}

/**
 * Encodes `value` into module based bars for the requested symbology.
 * Throws a descriptive error when the value is not valid for the format.
 */
export function encodeBarcode(value: string, format: BarcodeFormat = 'EAN13'): BarcodeEncoding {
  switch (format) {
    case 'EAN13': {
      const digits = normalizeEan13(value);

      return { bars: bitsToBars(encodeEan13Bits(digits)), text: digits };
    }
    case 'EAN8': {
      const digits = normalizeEan8(value);

      return { bars: bitsToBars(encodeEan8Bits(digits)), text: digits };
    }
    case 'CODE128':
      return { bars: bitsToBars(encodeCode128Bits(value)), text: value };
    case 'CODE39':
      return { bars: bitsToBars(encodeCode39Bits(value)), text: value };
    default:
      throw new Error(`Barcode: unsupported format "${format}"`);
  }
}

const QUIET_ZONE = 10;
const TOP_PADDING = 4;
const LABEL_HEIGHT = 14;

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'inline-block',
    maxWidth: '100%',
    lineHeight: 0
  },

  svg: {
    display: 'block',
    maxWidth: '100%',
    height: 'auto'
  },

  bar: {
    shapeRendering: 'crispEdges'
  },

  label: {
    fontFamily: 'var(--barcode-font-family, monospace)',
    fontVariantNumeric: 'tabular-nums'
  },

  error: {
    padding: '0.75rem',
    borderRadius: '0.25rem',
    backgroundColor: 'var(--barcode-error-background-color, #ffe7e7)',
    color: 'var(--barcode-error-color, #ff3d71)',
    fontFamily: 'inherit',
    fontSize: '0.75rem',
    lineHeight: 1.4
  }
}));

export type BarcodeStylesNames = Selectors<typeof useStyles>;

export interface BarcodeProps
  extends DefaultProps<BarcodeStylesNames>, Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  value: string;
  format?: BarcodeFormat;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  ariaLabel?: string;
}

const defaultProps: Partial<BarcodeProps> = {
  format: 'EAN13',
  width: 240,
  height: 80,
  color: '#000',
  backgroundColor: '#fff',
  showValue: true
};

const _Barcode = forwardRef<HTMLDivElement, BarcodeProps>((props, ref) => {
  const {
    value,
    format,
    width,
    height,
    color,
    backgroundColor,
    showValue,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'barcode', classNames, styles, unstyled });
  const encoding = useMemo(() => {
    try {
      return { ok: true as const, result: encodeBarcode(value, format) };
    } catch (error) {
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }, [value, format]);

  if (!encoding.ok) {
    return (
      <div
        {...others}
        ref={ref}
        className={cx(classes.root, className)}
        role="alert"
        style={{ lineHeight: 1.4 }}
      >
        <div className={cx(classes.error)}>{encoding.error}</div>
      </div>
    );
  }

  const { bars, text } = encoding.result;
  const label = text ?? value;
  const modules = bars.reduce((max, bar) => Math.max(max, bar.x + bar.width), 0) + QUIET_ZONE * 2;
  const labelHeight = showValue ? LABEL_HEIGHT : 0;
  const barHeight = Math.max(8, height - TOP_PADDING * 2 - labelHeight);

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      <svg
        className={cx(classes.svg)}
        width={width}
        height={height}
        viewBox={`0 0 ${modules} ${height}`}
        role="img"
        aria-label={ariaLabel ?? `Barcode ${label}`}
      >
        <rect x={0} y={0} width={modules} height={height} fill={backgroundColor} />
        {bars.map((bar) => (
          <rect
            key={`${bar.x}-${bar.width}`}
            className={cx(classes.bar)}
            x={bar.x + QUIET_ZONE}
            y={TOP_PADDING}
            width={bar.width}
            height={barHeight}
            fill={color}
          />
        ))}
        {showValue && (
          <text
            className={cx(classes.label)}
            x={modules / 2}
            y={TOP_PADDING + barHeight + 11}
            textAnchor="middle"
            fill={color}
            fontSize={11}
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
});

_Barcode.displayName = 'Barcode';

export { _Barcode as Barcode };
