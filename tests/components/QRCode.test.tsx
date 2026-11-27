/* eslint-disable no-bitwise */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { QRCode, encodeQRCodeMatrix } from '@nebular-react/core';

function isFinderModule(x: number, y: number, originX: number, originY: number) {
  const distance = Math.max(Math.abs(x - (originX + 3)), Math.abs(y - (originY + 3)));
  return distance !== 2 && distance !== 4;
}

function expectFinderPattern(matrix: boolean[][], originX: number, originY: number) {
  for (let y = 0; y < 7; y += 1) {
    for (let x = 0; x < 7; x += 1) {
      const actual = matrix[originY + y][originX + x];
      expect(actual).toBe(isFinderModule(originX + x, originY + y, originX, originY));
    }
  }
}

/** Published byte mode capacities for versions 1 to 10. */
const BYTE_CAPACITIES: Record<string, number[]> = {
  L: [17, 32, 53, 78, 106, 134, 154, 192, 230, 271],
  M: [14, 26, 42, 62, 84, 106, 122, 152, 180, 213],
  Q: [11, 20, 32, 46, 60, 74, 86, 108, 130, 151],
  H: [7, 14, 24, 34, 44, 58, 64, 84, 98, 119]
};

const FORMAT_BITS_PER_LEVEL: Record<string, number> = { L: 1, M: 0, Q: 3, H: 2 };

function readFormatBits(matrix: boolean[][], secondCopy = false) {
  const size = matrix.length;
  let bits = 0;

  if (secondCopy) {
    for (let i = 0; i < 15; i += 1) {
      const isDark = i < 8 ? matrix[8][size - 1 - i] : matrix[size - 15 + i][8];

      bits |= (isDark ? 1 : 0) << i;
    }

    return bits;
  }

  const positions: [number, number][] = [];

  for (let i = 0; i <= 5; i += 1) {
    positions.push([8, i]);
  }

  positions.push([8, 7], [8, 8], [7, 8]);

  for (let i = 9; i < 15; i += 1) {
    positions.push([14 - i, 8]);
  }

  positions.forEach(([x, y], index) => {
    bits |= (matrix[y][x] ? 1 : 0) << index;
  });

  return bits;
}

function bchRemainder(codeword: number) {
  let value = codeword;

  for (let i = 14; i >= 10; i -= 1) {
    if ((value >>> i) & 1) {
      value ^= 0x537 << (i - 10);
    }
  }

  return value & 0x3ff;
}

describe('encodeQRCodeMatrix', () => {
  it('builds a non empty square matrix sized for version 1', () => {
    const matrix = encodeQRCodeMatrix('Nebular');

    expect(matrix.length).toBe(21);
    matrix.forEach((row) => expect(row).toHaveLength(21));
    expect(matrix.flat().some(Boolean)).toBe(true);
  });

  it('is deterministic for the same input', () => {
    const first = encodeQRCodeMatrix('https://nebular.dev/?a=1&b=2');
    const second = encodeQRCodeMatrix('https://nebular.dev/?a=1&b=2');

    expect(first).toEqual(second);
  });

  it('grows to a larger version for longer payloads', () => {
    const small = encodeQRCodeMatrix('hi');
    const large = encodeQRCodeMatrix('x'.repeat(120));

    expect(small.length).toBe(21);
    expect(large.length).toBeGreaterThan(small.length);
    expect((large.length - 17) % 4).toBe(0);
    expect(large.length).toBeLessThanOrEqual(57);
  });

  it('draws finder patterns on three corners and a timing pattern', () => {
    const matrix = encodeQRCodeMatrix('Nebular', { errorCorrectionLevel: 'Q' });
    const size = matrix.length;

    expectFinderPattern(matrix, 0, 0);
    expectFinderPattern(matrix, size - 7, 0);
    expectFinderPattern(matrix, 0, size - 7);

    expect(matrix[6][8]).toBe(true);
    expect(matrix[6][9]).toBe(false);
    expect(matrix[8][6]).toBe(true);
    expect(matrix[9][6]).toBe(false);
  });

  it('supports every error correction level', () => {
    (['L', 'M', 'Q', 'H'] as const).forEach((level) => {
      const matrix = encodeQRCodeMatrix('Nebular', { errorCorrectionLevel: level });

      expect(matrix.length).toBe(21);
      expect(matrix.flat().filter(Boolean).length).toBeGreaterThan(0);
      expectFinderPattern(matrix, 0, 0);
    });
  });

  it('changes the matrix when the value changes', () => {
    expect(encodeQRCodeMatrix('alpha')).not.toEqual(encodeQRCodeMatrix('beta'));
  });

  it('picks the version that matches the published byte capacity for every level', () => {
    (['L', 'M', 'Q', 'H'] as const).forEach((level) => {
      BYTE_CAPACITIES[level].forEach((capacity, index) => {
        const version = index + 1;
        const matrix = encodeQRCodeMatrix('a'.repeat(capacity), {
          errorCorrectionLevel: level
        });

        expect(matrix).toHaveLength(version * 4 + 17);

        if (version < 10) {
          const nextVersion = encodeQRCodeMatrix('a'.repeat(capacity + 1), {
            errorCorrectionLevel: level
          });

          expect(nextVersion).toHaveLength((version + 1) * 4 + 17);
        }
      });
    });
  });

  it('writes valid and duplicated format information', () => {
    (['L', 'M', 'Q', 'H'] as const).forEach((level) => {
      const matrix = encodeQRCodeMatrix('Nebular', { errorCorrectionLevel: level });
      const size = matrix.length;
      const primary = readFormatBits(matrix);
      const secondary = readFormatBits(matrix, true);

      expect(secondary).toBe(primary);

      const unmasked = primary ^ 0x5412;
      const mask = (unmasked >>> 10) & 0b111;

      expect(bchRemainder(unmasked)).toBe(0);
      expect(mask).toBeGreaterThanOrEqual(0);
      expect(mask).toBeLessThanOrEqual(7);
      expect(unmasked >>> 13).toBe(FORMAT_BITS_PER_LEVEL[level]);
      expect(matrix[size - 8][8]).toBe(true);
    });
  });

  it('draws alignment patterns for versions that need them', () => {
    const matrix = encodeQRCodeMatrix('x'.repeat(120));
    const size = matrix.length;

    expect(size).toBe(45);

    [22, 38].forEach((center) => {
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          const expected = Math.max(Math.abs(dx), Math.abs(dy)) !== 1;

          expect(matrix[center + dy][center + dx]).toBe(expected);
        }
      }
    });
  });
});

describe('QRCode', () => {
  it('renders an accessible svg with the default label', () => {
    render(<QRCode value="Nebular" />);

    const svg = screen.getByRole('img', { name: 'QR code' });

    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg).toHaveAttribute('width', '160');
    expect(svg).toHaveAttribute('height', '160');
  });

  it('accepts a custom aria label and size', () => {
    render(<QRCode value="Nebular" size={200} ariaLabel="QR code do site" />);

    const svg = screen.getByRole('img', { name: 'QR code do site' });

    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '200');
  });

  it('applies custom colors and margin to the drawing', () => {
    const { container } = render(
      <QRCode value="Nebular" color="#112233" backgroundColor="#fafafa" margin={2} size={160} />
    );

    const path = container.querySelector('path');
    const background = container.querySelector('rect');

    expect(path).toHaveAttribute('fill', '#112233');
    expect(background).toHaveAttribute('fill', '#fafafa');
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 25 25');
  });

  it('renders the exact same drawing for the same value', () => {
    const { container } = render(<QRCode value="deterministic" />);
    const firstPath = container.querySelector('path')?.getAttribute('d');

    const { container: secondContainer } = render(<QRCode value="deterministic" />);
    const secondPath = secondContainer.querySelector('path')?.getAttribute('d');

    expect(firstPath).toBeTruthy();
    expect(firstPath).toBe(secondPath);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <QRCode value="https://nebular.dev" ariaLabel="Site do Nebular" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
