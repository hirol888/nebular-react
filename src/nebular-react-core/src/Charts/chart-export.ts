export type ChartExportFormat = 'svg' | 'png';

export interface ChartExportPngOptions {
  /** Pixel ratio used by the raster canvas. Defaults to 2. */
  scale?: number;
  /** Background color painted before the chart. Defaults to transparent. */
  background?: string;
  /** Receives the generated blob right before the download starts. */
  onBlob?(blob: Blob): void;
}

export interface ChartExportSvgOptions {
  /** Receives the generated blob right before the download starts. */
  onBlob?(blob: Blob): void;
}

const DEFAULT_PIXEL_RATIO = 2;
const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

function getUrlApi(): typeof URL | undefined {
  if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    return URL;
  }

  if (typeof globalThis !== 'undefined') {
    const webkitUrl = (globalThis as { webkitURL?: typeof URL }).webkitURL;

    if (webkitUrl && typeof webkitUrl.createObjectURL === 'function') {
      return webkitUrl;
    }
  }

  return undefined;
}

function createObjectUrl(blob: Blob): string | null {
  const urlApi = getUrlApi();

  if (!urlApi) {
    return null;
  }

  try {
    return urlApi.createObjectURL(blob);
  } catch {
    return null;
  }
}

function revokeObjectUrl(url: string) {
  const urlApi = getUrlApi();

  if (!urlApi || typeof urlApi.revokeObjectURL !== 'function') {
    return;
  }

  try {
    urlApi.revokeObjectURL(url);
  } catch {
    // Revoking is best-effort and must never break the export flow.
  }
}

/**
 * Finds the chart svg itself or the first svg inside the given element.
 */
export function findChartSvg(element: SVGElement | HTMLElement): SVGSVGElement | null {
  if (!element) {
    return null;
  }

  if (element.tagName && element.tagName.toLowerCase() === 'svg') {
    return element as SVGSVGElement;
  }

  if (typeof element.querySelector !== 'function') {
    return null;
  }

  return element.querySelector('svg');
}

function parseSvgLength(value: string | null): number | null {
  if (!value || value.includes('%')) {
    return null;
  }

  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function measureSvg(svg: SVGSVGElement): { width: number; height: number } {
  let width = parseSvgLength(svg.getAttribute('width'));
  let height = parseSvgLength(svg.getAttribute('height'));

  const viewBox = svg.getAttribute('viewBox');

  if ((!width || !height) && viewBox) {
    const parts = viewBox
      .trim()
      .split(/[\s,]+/)
      .map((part) => Number.parseFloat(part));

    if (parts.length === 4 && parts.every((part) => Number.isFinite(part))) {
      width = width ?? (parts[2] > 0 ? parts[2] : null);
      height = height ?? (parts[3] > 0 ? parts[3] : null);
    }
  }

  if (!width || !height) {
    const rect =
      typeof svg.getBoundingClientRect === 'function' ? svg.getBoundingClientRect() : null;

    width = width ?? (rect && rect.width > 0 ? rect.width : null);
    height = height ?? (rect && rect.height > 0 ? rect.height : null);
  }

  return {
    width: Math.round(width ?? DEFAULT_WIDTH),
    height: Math.round(height ?? DEFAULT_HEIGHT)
  };
}

/**
 * Serializes the chart svg into an standalone markup string.
 * Returns `null` when there is no svg or no serializer available (SSR).
 */
export function serializeChartSvg(element: SVGElement | HTMLElement): string | null {
  if (typeof XMLSerializer === 'undefined') {
    return null;
  }

  const svg = findChartSvg(element);

  if (!svg) {
    return null;
  }

  const clone = svg.cloneNode(true) as SVGSVGElement;
  const { width, height } = measureSvg(svg);

  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  if (!parseSvgLength(clone.getAttribute('width'))) {
    clone.setAttribute('width', String(width));
  }

  if (!parseSvgLength(clone.getAttribute('height'))) {
    clone.setAttribute('height', String(height));
  }

  try {
    return new XMLSerializer().serializeToString(clone);
  } catch {
    return null;
  }
}

/**
 * Resolves the download file name, adding the format extension once.
 */
export function resolveChartFileName(
  fileName: string | undefined,
  extension: ChartExportFormat
): string {
  const base = (fileName ?? '').trim() || 'chart';

  return base.toLowerCase().endsWith(`.${extension}`) ? base : `${base}.${extension}`;
}

/**
 * Creates a blob with the serialized svg markup.
 */
export function createChartSvgBlob(element: SVGElement | HTMLElement): Blob | null {
  const markup = serializeChartSvg(element);

  if (!markup) {
    return null;
  }

  return new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
}

/**
 * Triggers a browser download for a blob. No-ops during SSR.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const url = createObjectUrl(blob);

  if (!url) {
    return;
  }

  try {
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';

    const parent = document.body ?? document.documentElement;

    parent.appendChild(anchor);
    anchor.click();
    parent.removeChild(anchor);
  } finally {
    revokeObjectUrl(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof Image === 'undefined') {
      reject(new Error('chart-export: images are not supported in this environment'));
      return;
    }

    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('chart-export: failed to rasterize the chart'));
    image.src = url;
  });
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/.exec(dataUrl);

  if (!match || typeof atob === 'undefined') {
    return null;
  }

  const [, mime = 'image/png', base64, data] = match;

  if (!base64) {
    return new Blob([decodeURIComponent(data)], { type: mime });
  }

  try {
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  if (typeof canvas.toBlob === 'function') {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }

  if (typeof canvas.toDataURL === 'function') {
    return Promise.resolve(dataUrlToBlob(canvas.toDataURL('image/png')));
  }

  return Promise.resolve(null);
}

/**
 * Rasterizes the chart svg into a png blob.
 */
export async function createChartPngBlob(
  element: SVGElement | HTMLElement,
  options: Pick<ChartExportPngOptions, 'scale' | 'background'> = {}
): Promise<Blob> {
  if (typeof document === 'undefined') {
    throw new Error('chart-export: canvas is not available during server rendering');
  }

  const svg = findChartSvg(element);

  if (!svg) {
    throw new Error('chart-export: no <svg> element found');
  }

  const markup = serializeChartSvg(svg);

  if (!markup) {
    throw new Error('chart-export: unable to serialize the chart');
  }

  const { width, height } = measureSvg(svg);
  const scale = options.scale && options.scale > 0 ? options.scale : DEFAULT_PIXEL_RATIO;
  const canvas = document.createElement('canvas');

  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const imageUrl = createObjectUrl(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));

  if (!imageUrl) {
    throw new Error('chart-export: object URLs are not supported in this environment');
  }

  try {
    const image = await loadImage(imageUrl);
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('chart-export: canvas 2d context is not available');
    }

    if (options.background) {
      context.fillStyle = options.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(canvas);

    if (!blob) {
      throw new Error('chart-export: unable to create the png blob');
    }

    return blob;
  } finally {
    revokeObjectUrl(imageUrl);
  }
}

/**
 * Serializes and downloads the chart svg as a `.svg` file.
 */
export function exportChartSvg(
  element: SVGElement | HTMLElement,
  fileName?: string,
  options?: ChartExportSvgOptions
): void {
  const blob = createChartSvgBlob(element);

  if (!blob) {
    return;
  }

  downloadBlob(blob, resolveChartFileName(fileName, 'svg'));
  options?.onBlob?.(blob);
}

/**
 * Rasterizes and downloads the chart svg as a `.png` file.
 */
export async function exportChartPng(
  element: SVGElement | HTMLElement,
  fileName?: string,
  options?: ChartExportPngOptions
): Promise<void> {
  const blob = await createChartPngBlob(element, options);

  downloadBlob(blob, resolveChartFileName(fileName, 'png'));
  options?.onBlob?.(blob);
}
