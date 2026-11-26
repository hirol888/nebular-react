import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { FilePreview } from '@nebular-react/core';

describe('FilePreview', () => {
  it('uses the image viewer for an image and renders text without interpreting markup', async () => {
    const user = userEvent.setup();
    const { rerender, container } = render(
      <FilePreview file={{ name: 'photo.jpg', url: '/photo.jpg', alt: 'A forest path' }} />
    );

    await user.click(screen.getByRole('button', { name: 'Open image A forest path' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');

    rerender(<FilePreview file={{ name: 'notes.txt', text: '<strong>Notes</strong>' }} />);
    expect(screen.getByText('<strong>Notes</strong>')).toBeInTheDocument();
    expect(container.querySelector('strong')).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('restarts page and zoom for a new PDF and clamps available pages', async () => {
    const user = userEvent.setup();
    const pdf = {
      pageCount: 2,
      renderPage: ({ page, zoom }: { page: number; zoom: number }) => (
        <p>
          Rendered page {page} at {zoom}
        </p>
      )
    };
    const { rerender } = render(<FilePreview file={{ name: 'a.pdf', url: '/a.pdf' }} pdf={pdf} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(screen.getByText('Rendered page 2 at 1.25')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();

    rerender(<FilePreview file={{ name: 'b.pdf', url: '/b.pdf' }} pdf={pdf} />);
    expect(screen.getByText('Rendered page 1 at 1')).toBeInTheDocument();
  });

  it('lets a custom renderer supply a new format and has a fallback', () => {
    const file = { name: 'example.mp3', mimeType: 'audio/mpeg', url: '/example.mp3' };
    const { rerender } = render(<FilePreview file={file} />);
    expect(screen.getByText('Preview unavailable for this file.')).toBeInTheDocument();
    rerender(
      <FilePreview
        file={file}
        renderers={[
          { matches: (item) => item.mimeType === 'audio/mpeg', render: (item) => <p>{item.url}</p> }
        ]}
      />
    );
    expect(screen.getByText('/example.mp3')).toBeInTheDocument();
  });

  it('navigates PDF thumbnails, an outline and asynchronous search results', async () => {
    const user = userEvent.setup();
    const search = jest.fn(async () => [
      { page: 3, text: 'A literal <mark>finding</mark>' },
      { page: 8, text: 'A page beyond this document' }
    ]);
    const { container } = render(
      <FilePreview
        file={{ name: 'plan.pdf' }}
        pdf={{
          pageCount: 4,
          renderPage: ({ page, match }) => (
            <p>
              Rendered {page}
              {match ? ' with a match' : ''}
            </p>
          ),
          renderThumbnail: ({ page }) => <span>Thumbnail {page}</span>,
          outline: [{ title: 'Results', page: 2 }],
          search
        }}
      />
    );

    await user.click(screen.getByText('Thumbnails'));
    await user.click(screen.getByRole('button', { name: 'Go to page 4' }));
    expect(screen.getByText('Rendered 4')).toBeInTheDocument();
    await user.click(screen.getByText('Contents'));
    await user.click(screen.getByRole('button', { name: 'Results' }));
    expect(screen.getByText('Rendered 2')).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: 'Find text in document' }), 'finding');
    await user.click(screen.getByRole('button', { name: 'Search document' }));
    const result = await screen.findByRole('button', { name: /A literal <mark>finding<\/mark>/ });
    expect(search).toHaveBeenCalledWith(expect.objectContaining({ query: 'finding' }));
    expect(container.querySelector('mark')).toBeNull();
    expect(screen.queryByText('A page beyond this document')).toBeNull();
    await user.click(result);
    expect(screen.getByText('Rendered 3 with a match')).toBeInTheDocument();
  });

  it('cancels PDF search on file change and ignores a stale result', async () => {
    const user = userEvent.setup();
    let signal: AbortSignal;
    let finish!: (results: { page: number; text: string }[]) => void;
    const pdf = {
      pageCount: 2,
      renderPage: ({ page }: { page: number }) => <p>Page preview {page}</p>,
      search: ({ signal: requestSignal }: { signal: AbortSignal }) => {
        signal = requestSignal;
        return new Promise<{ page: number; text: string }[]>((resolve) => {
          finish = resolve;
        });
      }
    };
    const { rerender } = render(<FilePreview file={{ name: 'old.pdf' }} pdf={pdf} />);
    await user.type(screen.getByRole('searchbox'), 'old');
    await user.click(screen.getByRole('button', { name: 'Search document' }));
    rerender(<FilePreview file={{ name: 'new.pdf' }} pdf={pdf} />);
    expect(signal!.aborted).toBe(true);
    await act(async () => finish([{ page: 2, text: 'Stale result' }]));
    expect(screen.queryByText('Stale result')).toBeNull();
  });
});
