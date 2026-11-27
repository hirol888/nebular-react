import {
  createChartPngBlob,
  createChartSvgBlob,
  downloadBlob,
  exportChartSvg,
  findChartSvg,
  serializeChartSvg
} from '@nebular-react/core';

const originalImage = Object.getOwnPropertyDescriptor(window, 'Image');
const originalXmlSerializer = Object.getOwnPropertyDescriptor(window, 'XMLSerializer');
const originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
const originalGetContext = Object.getOwnPropertyDescriptor(
  HTMLCanvasElement.prototype,
  'getContext'
);
const originalToBlob = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'toBlob');
const originalToDataURL = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'toDataURL');

class LoadedImage {
  onload: (() => void) | null = null;

  onerror: ((error?: unknown) => void) | null = null;

  width = 200;

  height = 100;

  set src(_value: string) {
    this.onload?.();
  }
}

class BrokenImage {
  onload: (() => void) | null = null;

  onerror: ((error?: unknown) => void) | null = null;

  set src(_value: string) {
    this.onerror?.(new Error('decode failed'));
  }
}

function appendSvg(markup: string) {
  const host = document.createElement('div');

  host.innerHTML = `<div>${markup}</div>`;
  document.body.appendChild(host);

  return host;
}

function mockCanvas(options: {
  context?: CanvasRenderingContext2D | null;
  toBlob?: ((callback: BlobCallback) => void) | null;
  toDataURL?: ((type?: string) => string) | null;
}) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    writable: true,
    value: () => options.context
  });

  if (options.toBlob !== undefined) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
      configurable: true,
      writable: true,
      value: options.toBlob
    });
  }

  if (options.toDataURL !== undefined) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
      configurable: true,
      writable: true,
      value: options.toDataURL
    });
  }
}

const svg = '<svg width="200" height="100"><rect width="200" height="100" /></svg>';

describe('chart-export edge cases', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: jest.fn(() => 'blob:test')
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: jest.fn()
    });
    Object.defineProperty(window, 'Image', {
      configurable: true,
      writable: true,
      value: LoadedImage
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
    Reflect.deleteProperty(globalThis, 'webkitURL');

    if (originalImage) Object.defineProperty(window, 'Image', originalImage);
    if (originalXmlSerializer) {
      Object.defineProperty(window, 'XMLSerializer', originalXmlSerializer);
    }
    if (originalCreateObjectURL) URL.createObjectURL = originalCreateObjectURL.value;
    else Reflect.deleteProperty(URL, 'createObjectURL');
    if (originalRevokeObjectURL) URL.revokeObjectURL = originalRevokeObjectURL.value;
    else Reflect.deleteProperty(URL, 'revokeObjectURL');

    if (originalGetContext) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', originalGetContext);
    }
    if (originalToBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', originalToBlob);
    } else {
      Reflect.deleteProperty(HTMLCanvasElement.prototype, 'toBlob');
    }
    if (originalToDataURL) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', originalToDataURL);
    } else {
      Reflect.deleteProperty(HTMLCanvasElement.prototype, 'toDataURL');
    }
  });

  it('finds svgs defensively', () => {
    expect(findChartSvg(null as unknown as HTMLElement)).toBeNull();
    expect(findChartSvg({ tagName: 'DIV' } as unknown as HTMLElement)).toBeNull();
  });

  it('returns null when XMLSerializer is unavailable', () => {
    Object.defineProperty(window, 'XMLSerializer', { configurable: true, value: undefined });
    const host = appendSvg(svg);

    expect(serializeChartSvg(host)).toBeNull();
  });

  it('falls back to the viewBox, bounding rect and defaults when measuring', () => {
    const fromViewBox = appendSvg('<svg viewBox="0 0 300 150"><rect /></svg>');
    expect(serializeChartSvg(fromViewBox)).toContain('width="300"');

    const percentage = appendSvg('<svg width="50%" height="25%" viewBox="0 0 120 80" />');
    expect(serializeChartSvg(percentage)).toContain('width="120"');

    const rectSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    Object.defineProperty(rectSvg, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 222.4, height: 111.6 })
    });
    document.body.appendChild(rectSvg);
    expect(serializeChartSvg(rectSvg)).toContain('width="222"');

    const defaults = appendSvg('<svg><rect /></svg>');
    const markup = serializeChartSvg(defaults) as string;
    expect(markup).toContain('width="640"');
    expect(markup).toContain('height="480"');
  });

  it('preserves an existing namespace and explicit dimensions', () => {
    const host = appendSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20"><rect /></svg>'
    );

    const markup = serializeChartSvg(host) as string;
    expect(markup).toContain('width="10"');
    expect(markup).toContain('height="20"');
  });

  it('creates svg blobs only when the chart can be serialized', () => {
    const host = appendSvg(svg);

    expect(createChartSvgBlob(host)).toBeInstanceOf(Blob);
    expect(createChartSvgBlob(appendSvg('<div />'))).toBeNull();
  });

  it('skips downloads when object URLs are unavailable or throwing', () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: undefined
    });

    downloadBlob(new Blob(['x']), 'chart.svg');
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: () => {
        throw new Error('blocked');
      }
    });

    downloadBlob(new Blob(['x']), 'chart.svg');
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
  });

  it('falls back to webkitURL and tolerates revoke failures', () => {
    const createObjectURL = jest.fn(() => 'blob:webkit');
    const revokeObjectURL = jest.fn(() => {
      throw new Error('revoke failed');
    });

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: undefined
    });
    Object.defineProperty(globalThis, 'webkitURL', {
      configurable: true,
      value: { createObjectURL, revokeObjectURL }
    });

    downloadBlob(new Blob(['x']), 'chart.svg');

    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:webkit');
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  it('does not download an svg when there is no chart', () => {
    exportChartSvg(appendSvg('<div />'), 'chart');

    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
  });

  it('rejects when serialization is unavailable', async () => {
    Object.defineProperty(window, 'XMLSerializer', { configurable: true, value: undefined });

    await expect(createChartPngBlob(appendSvg(svg))).rejects.toThrow(/unable to serialize/);
  });

  it('rejects when object URLs are unavailable', async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: undefined
    });

    await expect(createChartPngBlob(appendSvg(svg))).rejects.toThrow(/object URLs/);
  });

  it('rejects when images are not supported', async () => {
    Object.defineProperty(window, 'Image', { configurable: true, value: undefined });

    await expect(createChartPngBlob(appendSvg(svg))).rejects.toThrow(/images are not supported/);
  });

  it('rejects when the image cannot be decoded', async () => {
    Object.defineProperty(window, 'Image', {
      configurable: true,
      writable: true,
      value: BrokenImage
    });
    mockCanvas({ context: {} as CanvasRenderingContext2D });

    await expect(createChartPngBlob(appendSvg(svg))).rejects.toThrow(/failed to rasterize/);
  });

  it('rejects when the canvas context is unavailable', async () => {
    mockCanvas({ context: null });

    await expect(createChartPngBlob(appendSvg(svg))).rejects.toThrow(/2d context/);
  });

  it('rejects when the canvas cannot produce a blob', async () => {
    mockCanvas({
      context: { drawImage: jest.fn() } as unknown as CanvasRenderingContext2D,
      toBlob: null,
      toDataURL: null
    });

    await expect(createChartPngBlob(appendSvg(svg))).rejects.toThrow(/unable to create/);
  });

  it('uses the default scale and skips the background fill', async () => {
    const dimensions: Array<{ width: number; height: number }> = [];
    const context = {
      fillRect: jest.fn(),
      drawImage: jest.fn()
    } as unknown as CanvasRenderingContext2D;

    mockCanvas({
      context,
      toBlob: function toBlob(this: HTMLCanvasElement, callback: BlobCallback) {
        dimensions.push({ width: this.width, height: this.height });
        callback(new Blob(['png'], { type: 'image/png' }));
      }
    });

    await createChartPngBlob(appendSvg(svg), { scale: 0 });

    expect(dimensions).toEqual([{ width: 400, height: 200 }]);
    expect(context.fillRect).not.toHaveBeenCalled();
    expect(context.drawImage).toHaveBeenCalled();
  });

  it('falls back to toDataURL with base64 data', async () => {
    const context = {
      fillRect: jest.fn(),
      drawImage: jest.fn()
    } as unknown as CanvasRenderingContext2D;

    mockCanvas({
      context,
      toBlob: null,
      toDataURL: () => 'data:image/png;base64,cG5n'
    });

    const blob = await createChartPngBlob(appendSvg(svg));

    expect(blob.type).toBe('image/png');
    expect(blob.size).toBe(3);
  });

  it('falls back to toDataURL with encoded text data', async () => {
    const context = {
      fillRect: jest.fn(),
      drawImage: jest.fn()
    } as unknown as CanvasRenderingContext2D;

    mockCanvas({
      context,
      toBlob: null,
      toDataURL: () => 'data:image/svg+xml,hello%20world'
    });

    const blob = await createChartPngBlob(appendSvg(svg));

    expect(blob.type).toBe('image/svg+xml');
    expect(blob.size).toBe('hello world'.length);
  });

  it('rejects invalid data URLs and invalid base64 payloads', async () => {
    const context = {
      fillRect: jest.fn(),
      drawImage: jest.fn()
    } as unknown as CanvasRenderingContext2D;

    mockCanvas({ context, toBlob: null, toDataURL: () => 'not-a-data-url' });
    await expect(createChartPngBlob(appendSvg(svg))).rejects.toThrow(/unable to create/);

    mockCanvas({ context, toBlob: null, toDataURL: () => 'data:image/png;base64,***' });
    await expect(createChartPngBlob(appendSvg(svg))).rejects.toThrow(/unable to create/);
  });
});
