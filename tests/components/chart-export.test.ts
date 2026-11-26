import {
  exportChartPng,
  exportChartSvg,
  resolveChartFileName,
  serializeChartSvg
} from '@nebular-react/core';

const originalImage = window.Image;
const originalGetContext = Object.getOwnPropertyDescriptor(
  HTMLCanvasElement.prototype,
  'getContext'
);
const originalToBlob = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'toBlob');

class FakeImage {
  onload: (() => void) | null = null;

  onerror: ((error?: unknown) => void) | null = null;

  width = 200;

  height = 100;

  private currentSrc = '';

  get src() {
    return this.currentSrc;
  }

  set src(value: string) {
    this.currentSrc = value;
    this.onload?.();
  }
}

function appendChart(markup: string) {
  const host = document.createElement('div');

  host.innerHTML = markup;
  document.body.appendChild(host);

  return host;
}

const svgMarkup =
  '<svg width="200" height="100" viewBox="0 0 200 100"><rect width="200" height="100" /></svg>';

describe('chart-export', () => {
  const downloads: string[] = [];

  beforeEach(() => {
    downloads.length = 0;
    URL.createObjectURL = jest.fn(() => 'blob:mock');
    URL.revokeObjectURL = jest.fn();
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function capture(
      this: HTMLAnchorElement
    ) {
      downloads.push(this.download);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(window, 'Image', {
      configurable: true,
      writable: true,
      value: originalImage
    });
    if (originalGetContext) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', originalGetContext);
    }
    if (originalToBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', originalToBlob);
    }
    document.body.innerHTML = '';
  });

  it('serializes an svg element and adds the xmlns namespace', () => {
    const host = appendChart(svgMarkup);
    const svg = host.querySelector('svg') as SVGSVGElement;
    const markup = serializeChartSvg(svg);

    expect(markup).not.toBeNull();
    expect(markup).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(markup).toContain('viewBox="0 0 200 100"');
  });

  it('finds the first svg inside a container element', () => {
    const host = appendChart(`<div><span>Chart</span>${svgMarkup}</div>`);
    const markup = serializeChartSvg(host);

    expect(markup).toContain('<svg');
    expect(markup).toContain('<rect');
  });

  it('returns null when the element does not contain an svg', () => {
    const host = appendChart('<div><span>No chart here</span></div>');

    expect(serializeChartSvg(host)).toBeNull();
  });

  it('resolves download file names without duplicating the extension', () => {
    expect(resolveChartFileName(undefined, 'svg')).toBe('chart.svg');
    expect(resolveChartFileName('revenue', 'png')).toBe('revenue.png');
    expect(resolveChartFileName('revenue.svg', 'svg')).toBe('revenue.svg');
    expect(resolveChartFileName('  ', 'png')).toBe('chart.png');
  });

  it('downloads the chart as an svg file', () => {
    const host = appendChart(svgMarkup);

    exportChartSvg(host, 'revenue');

    expect(downloads).toContain('revenue.svg');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });

  it('reports the generated svg blob through onBlob', () => {
    const host = appendChart(svgMarkup);
    const onBlob = jest.fn();

    exportChartSvg(host, 'revenue', { onBlob });

    expect(onBlob).toHaveBeenCalledWith(expect.any(Blob));
    expect((onBlob.mock.calls[0][0] as Blob).type).toContain('image/svg+xml');
  });

  it('rasterizes and downloads the chart as a png with scale and background', async () => {
    const host = appendChart(svgMarkup);
    const canvases: Array<{ width: number; height: number }> = [];
    const context = {
      fillStyle: '',
      fillRect: jest.fn(),
      drawImage: jest.fn()
    } as unknown as CanvasRenderingContext2D;

    Object.defineProperty(window, 'Image', {
      configurable: true,
      writable: true,
      value: FakeImage
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      writable: true,
      value: () => context
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
      configurable: true,
      writable: true,
      value: function toBlob(this: HTMLCanvasElement, callback: BlobCallback) {
        canvases.push({ width: this.width, height: this.height });
        callback(new Blob(['png'], { type: 'image/png' }));
      }
    });

    await exportChartPng(host, 'revenue', { scale: 3, background: '#ffffff' });

    expect(downloads).toContain('revenue.png');
    expect(canvases).toEqual([{ width: 600, height: 300 }]);
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 600, 300);
    expect(context.drawImage).toHaveBeenCalled();
  });

  it('reports the generated png blob through onBlob', async () => {
    const host = appendChart(svgMarkup);
    const onBlob = jest.fn();
    const context = {
      fillRect: jest.fn(),
      drawImage: jest.fn()
    } as unknown as CanvasRenderingContext2D;

    Object.defineProperty(window, 'Image', {
      configurable: true,
      writable: true,
      value: FakeImage
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      writable: true,
      value: () => context
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
      configurable: true,
      writable: true,
      value: (callback: BlobCallback) => callback(new Blob(['png'], { type: 'image/png' }))
    });

    await exportChartPng(host, 'revenue', { onBlob });

    expect(onBlob).toHaveBeenCalledWith(expect.any(Blob));
    expect((onBlob.mock.calls[0][0] as Blob).type).toBe('image/png');
  });

  it('rejects when the element does not contain an svg', async () => {
    const host = appendChart('<div>No chart here</div>');

    await expect(exportChartPng(host)).rejects.toThrow(/no <svg>/i);
  });
});
