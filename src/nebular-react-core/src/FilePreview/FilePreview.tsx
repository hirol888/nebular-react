import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Button } from '../Button';
import { CodeBlock } from '../CodeBlock';
import { ImageViewer } from '../ImageViewer';
import { Input } from '../Input';

export interface FilePreviewItem {
  name: string;
  mimeType?: string;
  url?: string;
  alt?: string;
  /** Text already read by the application. It is displayed as literal text. */
  text?: string;
  /** Optional syntax highlighting language. */
  language?: string;
}

export interface FilePreviewRenderer {
  matches(file: FilePreviewItem): boolean;
  render(file: FilePreviewItem): React.ReactNode;
}

export interface FilePreviewPdfPage {
  file: FilePreviewItem;
  /** Page number starting at one. */
  page: number;
  /** Zoom scale, where 1 equals 100 percent. */
  zoom: number;
  /** Result selected by the user, for renderers that can highlight a match. */
  match?: FilePreviewPdfSearchMatch;
}

export interface FilePreviewPdfThumbnail {
  file: FilePreviewItem;
  page: number;
}

export interface FilePreviewPdfOutlineItem {
  title: string;
  page?: number;
  children?: readonly FilePreviewPdfOutlineItem[];
}

export interface FilePreviewPdfSearchMatch {
  page: number;
  /** Optional plain-text excerpt for the result list. */
  text?: string;
  /** Provider-defined identity for renderers that highlight an exact match. */
  id?: string;
}

export interface FilePreviewPdfSearchRequest {
  file: FilePreviewItem;
  query: string;
  signal: AbortSignal;
}

export interface FilePreviewPdfAdapter {
  /** Set when the underlying document reader knows the page count. */
  pageCount: number;
  renderPage(page: FilePreviewPdfPage): React.ReactNode;
  renderThumbnail?(page: FilePreviewPdfThumbnail): React.ReactNode;
  outline?: readonly FilePreviewPdfOutlineItem[];
  search?(
    request: FilePreviewPdfSearchRequest
  ): readonly FilePreviewPdfSearchMatch[] | Promise<readonly FilePreviewPdfSearchMatch[]>;
}

export interface FilePreviewLabels {
  empty: React.ReactNode;
  unavailable: React.ReactNode;
  truncated: React.ReactNode;
  pdfControls: string;
  previousPage: string;
  nextPage: string;
  pageStatus(page: number, count: number): React.ReactNode;
  zoomIn: string;
  zoomOut: string;
  zoomStatus(percent: number): React.ReactNode;
  thumbnails?: string;
  previousThumbnails?: string;
  nextThumbnails?: string;
  goToPage?(page: number): string;
  contents?: string;
  searchInput?: string;
  searchButton?: string;
  searching?: React.ReactNode;
  noMatches?: React.ReactNode;
  searchError?: React.ReactNode;
  resultCount?(count: number): React.ReactNode;
}

const useStyles = createStyles(() => ({
  root: {
    minWidth: 0,
    display: 'grid',
    gap: '0.75rem',
    color: 'var(--text-basic-color, #222b45)'
  },
  filename: {
    fontWeight: 600,
    overflowWrap: 'anywhere'
  },
  status: {
    margin: 0
  },
  pdf: {
    minWidth: 0,
    display: 'grid',
    gap: '0.75rem'
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.5rem',
    fontVariantNumeric: 'tabular-nums'
  },
  navigation: {
    display: 'grid',
    gap: '0.75rem',
    '& summary': { cursor: 'pointer', fontWeight: 600 }
  },
  thumbnails: {
    display: 'flex',
    overflowX: 'auto',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBlock: '0.5rem',
    padding: '0.25rem'
  },
  thumbnail: {
    display: 'grid',
    gap: '0.25rem',
    minWidth: '4rem',
    textAlign: 'center'
  },
  navigationList: {
    marginBlock: '0.5rem',
    paddingInlineStart: '1.25rem',
    overflowWrap: 'anywhere'
  },
  page: {
    maxWidth: '100%',
    overflow: 'auto',
    backgroundColor: 'var(--background-basic-color-2, #f7f9fc)',
    borderRadius: 'var(--file-preview-border-radius, 0.5rem)'
  }
}));

export type FilePreviewStylesNames = Selectors<typeof useStyles>;

export interface FilePreviewProps
  extends
    DefaultProps<FilePreviewStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  file?: FilePreviewItem | null;
  /** The first renderer whose matcher returns true takes precedence over the built-in preview. */
  renderers?: readonly FilePreviewRenderer[];
  pdf?: FilePreviewPdfAdapter;
  /** Maximum number of characters to preview from supplied text. */
  maxTextLength?: number;
  labels?: Partial<FilePreviewLabels>;
}

const defaults: Partial<FilePreviewProps> = { maxTextLength: 32000 };
const defaultLabels: Required<FilePreviewLabels> = {
  empty: 'Select a file to preview.',
  unavailable: 'Preview unavailable for this file.',
  truncated: 'Only the beginning of this file is shown.',
  pdfControls: 'PDF page and zoom controls',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  pageStatus: (page, count) => `Page ${page} of ${count}`,
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  zoomStatus: (percent) => `${percent}%`,
  thumbnails: 'Thumbnails',
  previousThumbnails: 'Previous thumbnails',
  nextThumbnails: 'Next thumbnails',
  goToPage: (page) => `Go to page ${page}`,
  contents: 'Contents',
  searchInput: 'Find text in document',
  searchButton: 'Search document',
  searching: 'Searching the document…',
  noMatches: 'No matches found.',
  searchError: 'Could not search this document.',
  resultCount: (count) => `${count} ${count === 1 ? 'match' : 'matches'}`
};

const imageExtension = /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)$/i;
const thumbnailGroupSize = 8;

type SearchState =
  | { status: 'idle' | 'searching' | 'error' }
  | { status: 'completed'; matches: readonly FilePreviewPdfSearchMatch[] };

function isDocumentPage(page: number | undefined, count: number): page is number {
  return page != null && Number.isInteger(page) && page >= 1 && page <= count;
}

function PdfPreview({
  pdf,
  file,
  labels,
  classes
}: {
  pdf: FilePreviewPdfAdapter;
  file: FilePreviewItem;
  labels: Required<FilePreviewLabels>;
  classes: Record<FilePreviewStylesNames, string>;
}) {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [thumbnailStart, setThumbnailStart] = useState<number>();
  const [query, setQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>({ status: 'idle' });
  const [selection, setSelection] = useState<FilePreviewPdfSearchMatch>();
  const request = useRef<AbortController | null>(null);
  const count = Number.isFinite(pdf.pageCount) ? Math.max(0, Math.floor(pdf.pageCount)) : 0;
  const currentPage = Math.min(page, Math.max(1, count));
  const start = Math.min(
    thumbnailStart ?? Math.floor((currentPage - 1) / thumbnailGroupSize) * thumbnailGroupSize + 1,
    Math.max(1, Math.floor((count - 1) / thumbnailGroupSize) * thumbnailGroupSize + 1)
  );
  const thumbnailCount = Math.max(0, Math.min(thumbnailGroupSize, count - start + 1));
  const selectedMatch = count > 0 && selection?.page === currentPage ? selection : undefined;
  const { renderThumbnail } = pdf;

  useEffect(() => () => request.current?.abort(), []);

  const goToPage = (target: number, match?: FilePreviewPdfSearchMatch) => {
    if (isDocumentPage(target, count)) {
      setPage(target);
      setSelection(match);
      setThumbnailStart(undefined);
    }
  };

  const searchDocument = async () => {
    request.current?.abort();
    const term = query.trim();
    if (!pdf.search || !term) {
      setSearchState({ status: 'idle' });
      return;
    }

    const controller = new AbortController();
    request.current = controller;
    setSearchState({ status: 'searching' });
    setSelection(undefined);

    try {
      const matches = await pdf.search({ file, query: term, signal: controller.signal });
      if (!controller.signal.aborted) {
        setSearchState({ status: 'completed', matches });
      }
    } catch {
      if (!controller.signal.aborted) {
        setSearchState({ status: 'error' });
      }
    }
  };

  const renderOutline = (items: readonly FilePreviewPdfOutlineItem[]) => (
    <ul className={classes.navigationList}>
      {items.map((item, index) => {
        const target = item.page;
        return (
          <li key={`${item.title}-${index}`}>
            {isDocumentPage(target, count) ? (
              <Button
                type="button"
                size="small"
                appearance="ghost"
                onClick={() => goToPage(target)}
              >
                {item.title}
              </Button>
            ) : (
              item.title
            )}
            {!!item.children?.length && renderOutline(item.children)}
          </li>
        );
      })}
    </ul>
  );

  const matches =
    searchState.status === 'completed'
      ? searchState.matches.filter((match) => isDocumentPage(match.page, count))
      : [];

  return (
    <div className={classes.pdf}>
      <div role="group" aria-label={labels.pdfControls} className={classes.controls}>
        <Button
          type="button"
          size="small"
          appearance="outline"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          {labels.previousPage}
        </Button>
        <span role="status" aria-live="polite">
          {labels.pageStatus(count ? currentPage : 0, count)}
        </span>
        <Button
          type="button"
          size="small"
          appearance="outline"
          disabled={currentPage >= count}
          onClick={() => goToPage(currentPage + 1)}
        >
          {labels.nextPage}
        </Button>
        <Button
          type="button"
          size="small"
          appearance="outline"
          disabled={zoom <= 0.5}
          onClick={() => setZoom(zoom - 0.25)}
        >
          {labels.zoomOut}
        </Button>
        <span role="status" aria-live="polite">
          {labels.zoomStatus(Math.round(zoom * 100))}
        </span>
        <Button
          type="button"
          size="small"
          appearance="outline"
          disabled={zoom >= 3}
          onClick={() => setZoom(zoom + 0.25)}
        >
          {labels.zoomIn}
        </Button>
      </div>
      {(renderThumbnail || !!pdf.outline?.length || pdf.search) && (
        <div className={classes.navigation}>
          {renderThumbnail && count > 0 && (
            <details onToggle={(event) => setShowThumbnails(event.currentTarget.open)}>
              <summary>{labels.thumbnails}</summary>
              {showThumbnails && (
                <>
                  <div className={classes.thumbnails}>
                    {Array.from({ length: thumbnailCount }, (_, index) => start + index).map(
                      (target) => (
                        <Button
                          key={target}
                          type="button"
                          size="small"
                          appearance="outline"
                          aria-label={labels.goToPage(target)}
                          aria-current={target === currentPage ? 'page' : undefined}
                          onClick={() => goToPage(target)}
                        >
                          <span className={classes.thumbnail}>
                            {renderThumbnail({ file, page: target })}
                            <span>{target}</span>
                          </span>
                        </Button>
                      )
                    )}
                  </div>
                  {count > thumbnailGroupSize && (
                    <div className={classes.controls}>
                      <Button
                        type="button"
                        size="small"
                        appearance="ghost"
                        disabled={start === 1}
                        onClick={() => setThumbnailStart(start - thumbnailGroupSize)}
                      >
                        {labels.previousThumbnails}
                      </Button>
                      <Button
                        type="button"
                        size="small"
                        appearance="ghost"
                        disabled={start + thumbnailGroupSize > count}
                        onClick={() => setThumbnailStart(start + thumbnailGroupSize)}
                      >
                        {labels.nextThumbnails}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </details>
          )}
          {!!pdf.outline?.length && (
            <details>
              <summary>{labels.contents}</summary>
              {renderOutline(pdf.outline)}
            </details>
          )}
          {pdf.search && (
            <div role="search" aria-label={labels.searchInput}>
              <div className={classes.controls}>
                <Input
                  type="search"
                  value={query}
                  aria-label={labels.searchInput}
                  onChange={(event) => setQuery(event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      searchDocument();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="small"
                  appearance="outline"
                  disabled={!query.trim()}
                  onClick={searchDocument}
                >
                  {labels.searchButton}
                </Button>
              </div>
              <div role="status">
                {searchState.status === 'searching' && labels.searching}
                {searchState.status === 'completed' &&
                  (matches.length ? labels.resultCount(matches.length) : labels.noMatches)}
              </div>
              {searchState.status === 'error' && <div role="alert">{labels.searchError}</div>}
              {matches.length > 0 && (
                <ul className={classes.navigationList}>
                  {matches.map((match, index) => (
                    <li key={`${match.id ?? match.page}-${index}`}>
                      <Button
                        type="button"
                        size="small"
                        appearance="ghost"
                        aria-current={selectedMatch === match ? 'true' : undefined}
                        onClick={() => goToPage(match.page, match)}
                      >
                        {labels.pageStatus(match.page, count)}
                        {match.text && ` · ${match.text}`}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
      <div className={classes.page}>
        {pdf.renderPage({
          file,
          page: currentPage,
          zoom,
          ...(selectedMatch && { match: selectedMatch })
        })}
      </div>
    </div>
  );
}

export const FilePreview = forwardRef<HTMLDivElement, FilePreviewProps>((props, ref) => {
  const {
    file,
    renderers,
    pdf,
    maxTextLength,
    labels,
    className,
    classNames,
    styles,
    unstyled,
    ...otherProps
  } = useComponentDefaultProps(defaults, props);
  const { classes, cx } = useStyles(null, { name: 'file-preview', classNames, styles, unstyled });
  const text = { ...defaultLabels, ...labels };
  const length = Number.isFinite(maxTextLength) ? Math.max(0, Math.floor(maxTextLength)) : 32000;

  let preview: React.ReactNode = <p className={classes.status}>{text.empty}</p>;
  if (file) {
    const mimeType = file.mimeType?.split(';', 1)[0].trim().toLowerCase();
    const customRenderer = renderers?.find((renderer) => renderer.matches(file));
    if (customRenderer) {
      preview = customRenderer.render(file);
    } else if (
      pdf &&
      (mimeType === 'application/pdf' || (!mimeType && /\.pdf$/i.test(file.name)))
    ) {
      preview = (
        <PdfPreview
          key={JSON.stringify([file.name, file.url])}
          {...{ pdf, file, classes }}
          labels={text}
        />
      );
    } else if (
      file.url &&
      (mimeType?.startsWith('image/') || (!mimeType && imageExtension.test(file.name)))
    ) {
      preview = <ImageViewer key={file.url} src={file.url} alt={file.alt ?? file.name} />;
    } else if (file.text != null) {
      preview = (
        <>
          <CodeBlock code={file.text.slice(0, length)} language={file.language} copyable={false} />
          {file.text.length > length && (
            <p role="status" className={classes.status}>
              {text.truncated}
            </p>
          )}
        </>
      );
    } else {
      preview = <p className={classes.status}>{text.unavailable}</p>;
    }
  }

  return (
    <div {...otherProps} ref={ref} className={cx(classes.root, className)}>
      {file && <div className={classes.filename}>{file.name}</div>}
      {preview}
    </div>
  );
});

FilePreview.displayName = 'FilePreview';
