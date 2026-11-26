import React from 'react';
import { InfiniteScroll } from './InfiniteScroll';

export default { title: 'InfiniteScroll', component: InfiniteScroll };

const PAGE_SIZE = 10;

function createPage(from: number): number[] {
  return Array.from({ length: PAGE_SIZE }, (_, index) => from + index);
}

export function Basic() {
  const [items, setItems] = React.useState<number[]>(createPage(0));
  const [hasMore, setHasMore] = React.useState(true);
  const pagesRef = React.useRef(1);

  const loadMore = () =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        const nextPage = pagesRef.current;

        pagesRef.current += 1;
        setItems((current) => [...current, ...createPage(current.length)]);
        setHasMore(nextPage < 4);
        resolve();
      }, 600);
    });

  return (
    <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {items.map((item) => (
          <li
            key={item}
            style={{
              padding: '0.5rem 0.75rem',
              borderBottom: '1px solid #e4e9f2'
            }}
          >
            {`Activity item ${item + 1}`}
          </li>
        ))}
      </ul>
    </InfiniteScroll>
  );
}

export function WithCustomLoader() {
  const [hasMore, setHasMore] = React.useState(true);

  const loadMore = () =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        setHasMore(false);
        resolve();
      }, 800);
    });

  return (
    <InfiniteScroll
      loadMore={loadMore}
      hasMore={hasMore}
      loader={<span>Fetching more activity…</span>}
      endMessage={<span>You are all caught up.</span>}
      ariaLabel="Activity feed"
    >
      <div style={{ padding: '0.75rem' }}>Scroll down to load more.</div>
    </InfiniteScroll>
  );
}

export function EndOfList() {
  return (
    <InfiniteScroll loadMore={() => {}} hasMore={false} ariaLabel="Finished feed">
      <div style={{ padding: '0.75rem' }}>Only one item is available.</div>
    </InfiniteScroll>
  );
}
