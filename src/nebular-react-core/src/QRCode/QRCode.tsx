/* eslint-disable no-bitwise */
import React, { forwardRef, useMemo } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type QRCodeErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface EncodeQRCodeOptions {
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
}

const MIN_VERSION = 1;
const MAX_VERSION = 10;
const BYTE_MODE_INDICATOR = 0b0100;

/** Format bits and table index for each error correction level. */
const ERROR_CORRECTION_LEVELS: Record<
  QRCodeErrorCorrectionLevel,
  { formatBits: number; tableIndex: number }
> = {
  L: { formatBits: 1, tableIndex: 0 },
  M: { formatBits: 0, tableIndex: 1 },
  Q: { formatBits: 3, tableIndex: 2 },
  H: { formatBits: 2, tableIndex: 3 }
};

// Indexed by [tableIndex][version]. Version 0 is a padding slot.
const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  // L
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18],
  // M
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26],
  // Q
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24],
  // H
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28]
];

const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
  // L
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4],
  // M
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5],
  // Q
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8],
  // H
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8]
];

function toUtf8Bytes(value: string): number[] {
  const bytes: number[] = [];

  for (let i = 0; i < value.length; i += 1) {
    let code = value.charCodeAt(i);

    if (code >= 0xd800 && code <= 0xdbff && i + 1 < value.length) {
      const low = value.charCodeAt(i + 1);

      if (low >= 0xdc00 && low <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
        i += 1;
      }
    }

    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }

  return bytes;
}

function getNumRawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64;

  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;

    if (version >= 7) {
      result -= 36;
    }
  }

  return result;
}

function getNumDataCodewords(version: number, level: QRCodeErrorCorrectionLevel): number {
  const { tableIndex } = ERROR_CORRECTION_LEVELS[level];

  return (
    Math.floor(getNumRawDataModules(version) / 8) -
    ECC_CODEWORDS_PER_BLOCK[tableIndex][version] * NUM_ERROR_CORRECTION_BLOCKS[tableIndex][version]
  );
}

function getAlignmentPatternPositions(version: number): number[] {
  if (version === 1) {
    return [];
  }

  const numAlign = Math.floor(version / 7) + 2;
  const step = Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const positions = [6];

  for (let position = version * 4 + 10; positions.length < numAlign; position -= step) {
    positions.splice(1, 0, position);
  }

  return positions;
}

function getBit(value: number, index: number): boolean {
  return ((value >>> index) & 1) !== 0;
}

function reedSolomonMultiply(x: number, y: number): number {
  let z = 0;

  for (let i = 7; i >= 0; i -= 1) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }

  return z & 0xff;
}

function computeReedSolomonDivisor(degree: number): number[] {
  const result: number[] = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;

  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < degree; j += 1) {
      result[j] = reedSolomonMultiply(result[j], root);

      if (j + 1 < degree) {
        result[j] ^= result[j + 1];
      }
    }

    root = reedSolomonMultiply(root, 0x02);
  }

  return result;
}

function computeReedSolomonRemainder(data: number[], divisor: number[]): number[] {
  const result: number[] = new Array(divisor.length).fill(0);

  data.forEach((byte) => {
    const factor = byte ^ result[0];
    result.shift();
    result.push(0);

    for (let i = 0; i < result.length; i += 1) {
      result[i] ^= reedSolomonMultiply(divisor[i], factor);
    }
  });

  return result;
}

function addErrorCorrectionAndInterleave(
  version: number,
  level: QRCodeErrorCorrectionLevel,
  data: number[]
): number[] {
  const { tableIndex } = ERROR_CORRECTION_LEVELS[level];
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[tableIndex][version];
  const blockEccLength = ECC_CODEWORDS_PER_BLOCK[tableIndex][version];
  const rawCodewords = Math.floor(getNumRawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLength = Math.floor(rawCodewords / numBlocks);
  const divisor = computeReedSolomonDivisor(blockEccLength);
  const blocks: number[][] = [];

  for (let block = 0, offset = 0; block < numBlocks; block += 1) {
    const dataLength = shortBlockLength - blockEccLength + (block < numShortBlocks ? 0 : 1);
    const dataBlock = data.slice(offset, offset + dataLength);
    offset += dataLength;
    const ecc = computeReedSolomonRemainder(dataBlock, divisor);
    const blockData = dataBlock.slice();

    if (block < numShortBlocks) {
      blockData.push(0);
    }

    blocks.push(blockData.concat(ecc));
  }

  const result: number[] = [];

  for (let i = 0; i < blocks[0].length; i += 1) {
    blocks.forEach((block, blockIndex) => {
      if (i !== shortBlockLength - blockEccLength || blockIndex >= numShortBlocks) {
        result.push(block[i]);
      }
    });
  }

  return result;
}

interface QrCodeState {
  version: number;
  size: number;
  level: QRCodeErrorCorrectionLevel;
  modules: boolean[];
  isFunction: boolean[];
}

function createState(version: number, level: QRCodeErrorCorrectionLevel): QrCodeState {
  const size = version * 4 + 17;

  return {
    version,
    size,
    level,
    modules: new Array(size * size).fill(false),
    isFunction: new Array(size * size).fill(false)
  };
}

function setModule(state: QrCodeState, x: number, y: number, isDark: boolean) {
  state.modules[y * state.size + x] = isDark;
}

function setFunctionModule(state: QrCodeState, x: number, y: number, isDark: boolean) {
  setModule(state, x, y, isDark);
  state.isFunction[y * state.size + x] = true;
}

function drawFinderPattern(state: QrCodeState, centerX: number, centerY: number) {
  const { size } = state;

  for (let dy = -4; dy <= 4; dy += 1) {
    for (let dx = -4; dx <= 4; dx += 1) {
      const x = centerX + dx;
      const y = centerY + dy;

      if (x >= 0 && x < size && y >= 0 && y < size) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        setFunctionModule(state, x, y, distance !== 2 && distance !== 4);
      }
    }
  }
}

function drawAlignmentPattern(state: QrCodeState, centerX: number, centerY: number) {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      setFunctionModule(
        state,
        centerX + dx,
        centerY + dy,
        Math.max(Math.abs(dx), Math.abs(dy)) !== 1
      );
    }
  }
}

function drawFormatBits(state: QrCodeState, mask: number) {
  const { size } = state;
  const data = (ERROR_CORRECTION_LEVELS[state.level].formatBits << 3) | mask;
  let remainder = data;

  for (let i = 0; i < 10; i += 1) {
    remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537);
  }

  const bits = ((data << 10) | remainder) ^ 0x5412;

  for (let i = 0; i <= 5; i += 1) {
    setFunctionModule(state, 8, i, getBit(bits, i));
  }

  setFunctionModule(state, 8, 7, getBit(bits, 6));
  setFunctionModule(state, 8, 8, getBit(bits, 7));
  setFunctionModule(state, 7, 8, getBit(bits, 8));

  for (let i = 9; i < 15; i += 1) {
    setFunctionModule(state, 14 - i, 8, getBit(bits, i));
  }

  for (let i = 0; i < 8; i += 1) {
    setFunctionModule(state, size - 1 - i, 8, getBit(bits, i));
  }

  for (let i = 8; i < 15; i += 1) {
    setFunctionModule(state, 8, size - 15 + i, getBit(bits, i));
  }

  setFunctionModule(state, 8, size - 8, true);
}

function drawVersionBits(state: QrCodeState) {
  const { version, size } = state;

  if (version < 7) {
    return;
  }

  let remainder = version;

  for (let i = 0; i < 12; i += 1) {
    remainder = (remainder << 1) ^ ((remainder >>> 11) * 0x1f25);
  }

  const bits = (version << 12) | remainder;

  for (let i = 0; i < 18; i += 1) {
    const isDark = getBit(bits, i);
    const a = size - 11 + (i % 3);
    const b = Math.floor(i / 3);

    setFunctionModule(state, a, b, isDark);
    setFunctionModule(state, b, a, isDark);
  }
}

function drawFunctionPatterns(state: QrCodeState) {
  const { size } = state;

  for (let i = 0; i < size; i += 1) {
    setFunctionModule(state, 6, i, i % 2 === 0);
    setFunctionModule(state, i, 6, i % 2 === 0);
  }

  drawFinderPattern(state, 3, 3);
  drawFinderPattern(state, size - 4, 3);
  drawFinderPattern(state, 3, size - 4);

  const alignmentPositions = getAlignmentPatternPositions(state.version);
  const numAlign = alignmentPositions.length;

  for (let i = 0; i < numAlign; i += 1) {
    for (let j = 0; j < numAlign; j += 1) {
      const overlapsFinder =
        (i === 0 && j === 0) || (i === 0 && j === numAlign - 1) || (i === numAlign - 1 && j === 0);

      if (!overlapsFinder) {
        drawAlignmentPattern(state, alignmentPositions[i], alignmentPositions[j]);
      }
    }
  }

  drawFormatBits(state, 0);
  drawVersionBits(state);
}

function maskMatches(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

function applyMask(state: QrCodeState, mask: number) {
  const { size, modules, isFunction } = state;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x;

      if (!isFunction[index] && maskMatches(mask, x, y)) {
        modules[index] = !modules[index];
      }
    }
  }
}

const PENALTY_RUN = 3;
const PENALTY_BLOCK = 3;
const PENALTY_FINDER_LIKE = 40;
const PENALTY_BALANCE = 10;

const FINDER_LIKE_PATTERNS: boolean[][] = [
  [true, false, true, true, true, false, true, false, false, false, false],
  [false, false, false, false, true, false, true, true, true, false, true]
];

function isFinderLikePattern(modules: boolean[], start: number, stride: number): boolean {
  return FINDER_LIKE_PATTERNS.some((pattern) => {
    for (let i = 0; i < pattern.length; i += 1) {
      if (modules[start + i * stride] !== pattern[i]) {
        return false;
      }
    }

    return true;
  });
}

function getPenaltyScore(state: QrCodeState): number {
  const { size, modules } = state;
  let result = 0;

  for (let y = 0; y < size; y += 1) {
    let runColor = false;
    let runLength = 0;

    for (let x = 0; x < size; x += 1) {
      const isDark = modules[y * size + x];

      if (isDark === runColor) {
        runLength += 1;

        if (runLength === 5) {
          result += PENALTY_RUN;
        } else if (runLength > 5) {
          result += 1;
        }
      } else {
        runColor = isDark;
        runLength = 1;
      }
    }
  }

  for (let x = 0; x < size; x += 1) {
    let runColor = false;
    let runLength = 0;

    for (let y = 0; y < size; y += 1) {
      const isDark = modules[y * size + x];

      if (isDark === runColor) {
        runLength += 1;

        if (runLength === 5) {
          result += PENALTY_RUN;
        } else if (runLength > 5) {
          result += 1;
        }
      } else {
        runColor = isDark;
        runLength = 1;
      }
    }
  }

  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const isDark = modules[y * size + x];

      if (
        isDark === modules[y * size + x + 1] &&
        isDark === modules[(y + 1) * size + x] &&
        isDark === modules[(y + 1) * size + x + 1]
      ) {
        result += PENALTY_BLOCK;
      }
    }
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x + 11 <= size; x += 1) {
      if (isFinderLikePattern(modules, y * size + x, 1)) {
        result += PENALTY_FINDER_LIKE;
      }
    }
  }

  for (let x = 0; x < size; x += 1) {
    for (let y = 0; y + 11 <= size; y += 1) {
      if (isFinderLikePattern(modules, y * size + x, size)) {
        result += PENALTY_FINDER_LIKE;
      }
    }
  }

  let darkModules = 0;

  modules.forEach((isDark) => {
    if (isDark) {
      darkModules += 1;
    }
  });

  const totalModules = size * size;
  const balance = Math.ceil(Math.abs(darkModules * 20 - totalModules * 10) / totalModules) - 1;

  result += balance * PENALTY_BALANCE;

  return result;
}

function drawCodewords(state: QrCodeState, codewords: number[]) {
  const { size, modules, isFunction } = state;
  let bitIndex = 0;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right = 5;
    }

    for (let vertical = 0; vertical < size; vertical += 1) {
      for (let offset = 0; offset < 2; offset += 1) {
        const x = right - offset;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vertical : vertical;
        const index = y * size + x;

        if (!isFunction[index] && bitIndex < codewords.length * 8) {
          modules[index] = getBit(codewords[bitIndex >>> 3], 7 - (bitIndex & 7));
          bitIndex += 1;
        }
      }
    }
  }
}

function buildDataCodewords(
  version: number,
  level: QRCodeErrorCorrectionLevel,
  bytes: number[]
): number[] {
  const capacityBits = getNumDataCodewords(version, level) * 8;
  const bits: number[] = [];

  const appendBits = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i -= 1) {
      bits.push((value >>> i) & 1);
    }
  };

  appendBits(BYTE_MODE_INDICATOR, 4);
  appendBits(bytes.length, version <= 9 ? 8 : 16);
  bytes.forEach((byte) => appendBits(byte, 8));

  appendBits(0, Math.min(4, capacityBits - bits.length));
  appendBits(0, (8 - (bits.length % 8)) % 8);

  for (let pad = 0xec; bits.length < capacityBits; pad ^= 0xec ^ 0x11) {
    appendBits(pad, 8);
  }

  const codewords: number[] = [];

  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;

    for (let j = 0; j < 8; j += 1) {
      byte = (byte << 1) | bits[i + j];
    }

    codewords.push(byte);
  }

  return codewords;
}

/**
 * Encodes `value` (byte mode) into a boolean QR matrix where `true` means a dark module.
 * Versions 1 to 10 are supported and the output is fully deterministic.
 */
export function encodeQRCodeMatrix(value: string, options: EncodeQRCodeOptions = {}): boolean[][] {
  const level = options.errorCorrectionLevel ?? 'M';
  const bytes = toUtf8Bytes(value);
  let version = 0;

  for (let candidate = MIN_VERSION; candidate <= MAX_VERSION; candidate += 1) {
    const countBits = candidate <= 9 ? 8 : 16;
    const capacityBits = getNumDataCodewords(candidate, level) * 8;

    if (4 + countBits + bytes.length * 8 <= capacityBits) {
      version = candidate;
      break;
    }
  }

  if (version === 0) {
    throw new Error(
      `QRCode: value is too long for version ${MAX_VERSION} with error correction level ${level}`
    );
  }

  const dataCodewords = buildDataCodewords(version, level, bytes);
  const codewords = addErrorCorrectionAndInterleave(version, level, dataCodewords);
  const state = createState(version, level);

  drawFunctionPatterns(state);
  drawCodewords(state, codewords);

  let bestMask = 0;
  let bestPenalty = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask += 1) {
    applyMask(state, mask);
    drawFormatBits(state, mask);

    const penalty = getPenaltyScore(state);

    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
    }

    applyMask(state, mask);
  }

  applyMask(state, bestMask);
  drawFormatBits(state, bestMask);

  const matrix: boolean[][] = [];

  for (let y = 0; y < state.size; y += 1) {
    matrix.push(state.modules.slice(y * state.size, (y + 1) * state.size));
  }

  return matrix;
}

const useStyles = createStyles(() => ({
  root: {
    display: 'inline-block',
    maxWidth: '100%',
    lineHeight: 0
  }
}));

export type QRCodeStylesNames = Selectors<typeof useStyles>;

export interface QRCodeProps
  extends DefaultProps<QRCodeStylesNames>, Omit<React.ComponentPropsWithoutRef<'svg'>, 'color'> {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  margin?: number;
  ariaLabel?: string;
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
}

const defaultProps: Partial<QRCodeProps> = {
  size: 160,
  color: '#000',
  backgroundColor: '#fff',
  margin: 4,
  errorCorrectionLevel: 'M'
};

const _QRCode = forwardRef<SVGSVGElement, QRCodeProps>((props, ref) => {
  const {
    value,
    size,
    color,
    backgroundColor,
    margin,
    ariaLabel,
    errorCorrectionLevel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(undefined, {
    name: 'qrcode',
    classNames,
    styles,
    unstyled
  });

  const matrix = useMemo(
    () => encodeQRCodeMatrix(value, { errorCorrectionLevel }),
    [value, errorCorrectionLevel]
  );
  const modules = matrix.length;
  const total = modules + Math.max(0, margin) * 2;
  const path = useMemo(() => {
    const parts: string[] = [];

    for (let y = 0; y < modules; y += 1) {
      let x = 0;

      while (x < modules) {
        if (matrix[y][x]) {
          let run = 1;

          while (x + run < modules && matrix[y][x + run]) {
            run += 1;
          }

          parts.push(`M${x + margin} ${y + margin}h${run}v1h-${run}z`);
          x += run;
        } else {
          x += 1;
        }
      }
    }

    return parts.join('');
  }, [matrix, margin, modules]);

  return (
    <svg
      {...others}
      ref={ref}
      role="img"
      aria-label={ariaLabel ?? 'QR code'}
      width={size}
      height={size}
      viewBox={`0 0 ${total} ${total}`}
      className={cx(classes.root, className)}
    >
      <rect x={0} y={0} width={total} height={total} fill={backgroundColor} />
      <path d={path} fill={color} shapeRendering="crispEdges" />
    </svg>
  );
});

_QRCode.displayName = 'QRCode';

export { _QRCode as QRCode };
