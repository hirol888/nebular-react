import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Barcode, encodeBarcode } from '@nebular-react/core';

function totalModules(bars: { x: number; width: number }[]) {
  return bars.reduce((max, bar) => Math.max(max, bar.x + bar.width), 0);
}

function toBits(bars: { x: number; width: number }[], total: number) {
  const modules = new Array(total).fill('0');

  bars.forEach((bar) => {
    for (let index = bar.x; index < bar.x + bar.width; index += 1) {
      modules[index] = '1';
    }
  });

  return modules.join('');
}

const EAN13_BITS = [
  '101',
  '0001011',
  '0100111',
  '0110011',
  '0010011',
  '0111101',
  '0011101',
  '01010',
  '1100110',
  '1101100',
  '1000010',
  '1011100',
  '1001110',
  '1000100',
  '101'
].join('');

const EAN8_BITS = [
  '101',
  '0001011',
  '0101111',
  '0111101',
  '0110111',
  '01010',
  '1001110',
  '1110010',
  '1000100',
  '1011100',
  '101'
].join('');

describe('encodeBarcode', () => {
  it('encodes a known EAN13 value with guards, parity patterns and checksum', () => {
    const result = encodeBarcode('5901234123457', 'EAN13');

    expect(result.text).toBe('5901234123457');
    expect(totalModules(result.bars)).toBe(95);
    expect(toBits(result.bars, 95)).toBe(EAN13_BITS);
  });

  it('computes and appends the EAN13 checksum when it is missing', () => {
    const complete = encodeBarcode('5901234123457', 'EAN13');
    const partial = encodeBarcode('590123412345', 'EAN13');

    expect(partial.text).toBe('5901234123457');
    expect(partial.bars).toEqual(complete.bars);
  });

  it('rejects an EAN13 value with a wrong checksum', () => {
    expect(() => encodeBarcode('5901234123450', 'EAN13')).toThrow(/checksum/i);
  });

  it('rejects an EAN13 value that is not 12 or 13 digits', () => {
    expect(() => encodeBarcode('12345', 'EAN13')).toThrow(/EAN13/);
    expect(() => encodeBarcode('59012A4123457', 'EAN13')).toThrow(/EAN13/);
  });

  it('encodes a known EAN8 value', () => {
    const result = encodeBarcode('96385074', 'EAN8');

    expect(result.text).toBe('96385074');
    expect(totalModules(result.bars)).toBe(67);
    expect(toBits(result.bars, 67)).toBe(EAN8_BITS);
  });

  it('computes and appends the EAN8 checksum when it is missing', () => {
    const result = encodeBarcode('9638507', 'EAN8');

    expect(result.text).toBe('96385074');
  });

  it('rejects an EAN8 value with a wrong checksum', () => {
    expect(() => encodeBarcode('96385070', 'EAN8')).toThrow(/checksum/i);
  });

  it('encodes numeric CODE128 payloads with code set C', () => {
    const result = encodeBarcode('123456', 'CODE128');

    expect(result.text).toBe('123456');
    expect(totalModules(result.bars)).toBe(68);
    expect(toBits(result.bars, 68).startsWith('11010011100')).toBe(true);
  });

  it('encodes textual CODE128 payloads with code set B', () => {
    const result = encodeBarcode('Hello', 'CODE128');

    expect(result.text).toBe('Hello');
    expect(totalModules(result.bars)).toBe(90);
  });

  it('rejects CODE128 values outside of the supported range', () => {
    expect(() => encodeBarcode('héllo', 'CODE128')).toThrow(/CODE128/);
    expect(() => encodeBarcode('', 'CODE128')).toThrow(/CODE128/);
  });

  it('encodes CODE39 with start and stop guards and a narrow gap between characters', () => {
    const result = encodeBarcode('ABC', 'CODE39');
    const modules = totalModules(result.bars);

    expect(result.text).toBe('ABC');
    expect(modules).toBe(64);
    expect(toBits(result.bars, modules).startsWith('100101101101')).toBe(true);
  });

  it('rejects unsupported CODE39 characters', () => {
    expect(() => encodeBarcode('abc', 'CODE39')).toThrow(/CODE39/);
    expect(() => encodeBarcode('A@B', 'CODE39')).toThrow(/CODE39/);
  });

  it('is deterministic for the same input', () => {
    expect(encodeBarcode('5901234123457', 'EAN13')).toEqual(
      encodeBarcode('5901234123457', 'EAN13')
    );
    expect(encodeBarcode('Nebular-1', 'CODE128')).toEqual(encodeBarcode('Nebular-1', 'CODE128'));
  });

  it('produces ordered, non overlapping bars', () => {
    const { bars } = encodeBarcode('5901234123457', 'EAN13');

    bars.forEach((bar, index) => {
      expect(bar.width).toBeGreaterThan(0);
      expect(bar.x).toBeGreaterThanOrEqual(0);

      if (index > 0) {
        expect(bar.x).toBeGreaterThanOrEqual(bars[index - 1].x + bars[index - 1].width);
      }
    });
  });
});

describe('Barcode', () => {
  it('renders an accessible svg with the default label and size', () => {
    const { container } = render(<Barcode value="5901234123457" />);
    const svg = screen.getByRole('img', { name: 'Barcode 5901234123457' });

    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg).toHaveAttribute('width', '240');
    expect(svg).toHaveAttribute('height', '80');
    expect(container.querySelectorAll('rect').length).toBeGreaterThan(1);
  });

  it('draws one rect per encoded bar plus the background', () => {
    const { container } = render(<Barcode value="96385074" format="EAN8" />);
    const { bars } = encodeBarcode('96385074', 'EAN8');

    expect(container.querySelectorAll('rect')).toHaveLength(bars.length + 1);
  });

  it('shows the normalized value below the bars by default', () => {
    render(<Barcode value="590123412345" format="EAN13" />);

    expect(screen.getByText('5901234123457')).toBeInTheDocument();
  });

  it('hides the value when showValue is false', () => {
    render(<Barcode value="5901234123457" showValue={false} />);

    expect(screen.queryByText('5901234123457')).not.toBeInTheDocument();
  });

  it('accepts a custom label, size and colors', () => {
    const { container } = render(
      <Barcode
        value="5901234123457"
        width={320}
        height={120}
        color="#112233"
        backgroundColor="#fafafa"
        ariaLabel="Código do produto"
      />
    );
    const svg = screen.getByRole('img', { name: 'Código do produto' });
    const rects = Array.from(container.querySelectorAll('rect'));

    expect(svg).toHaveAttribute('width', '320');
    expect(svg).toHaveAttribute('height', '120');
    expect(rects[0]).toHaveAttribute('fill', '#fafafa');
    expect(rects[1]).toHaveAttribute('fill', '#112233');
  });

  it('renders an accessible error instead of throwing on invalid values', () => {
    render(<Barcode value="not-a-barcode" />);

    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent(/EAN13/);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('supports every declared format', () => {
    render(
      <div>
        <Barcode value="5901234123457" format="EAN13" ariaLabel="EAN13" />
        <Barcode value="96385074" format="EAN8" ariaLabel="EAN8" />
        <Barcode value="Nebular 42" format="CODE128" ariaLabel="CODE128" />
        <Barcode value="ABC-123" format="CODE39" ariaLabel="CODE39" />
      </div>
    );

    ['EAN13', 'EAN8', 'CODE128', 'CODE39'].forEach((name) => {
      expect(screen.getByRole('img', { name })).toBeInTheDocument();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Barcode value="5901234123457" ariaLabel="Código de barras" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
