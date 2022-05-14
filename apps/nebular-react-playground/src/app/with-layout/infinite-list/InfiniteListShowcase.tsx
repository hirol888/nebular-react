import { NbCard, NbInfiniteList, NbListItem } from '@nebular-react';
import { useEffect, useRef, useState } from 'react';
import { NewsPost } from './components/NewsPost';
import { NewsPostPlaceholder } from './components/NewsPostPlacehholder';
import { uniqueId } from 'lodash';
import './infinite-news-list.scoped.scss';
import { NewsPostModel } from './model';

interface InfiniteListShowcaseState {
  news: NewsPostModel[];
  placeholders: string[];
}

export function InfiniteListShowcase() {
  const [newsState, setNewsState] = useState<InfiniteListShowcaseState>({
    news: [],
    placeholders: []
  });
  const loading = useRef<boolean>(false);

  const pageSize = 10;
  const totalPages = 7;
  const pageToLoadNext = useRef<number>(1);

  const loadNext = () => {
    if (loading.current) {
      return;
    }

    loading.current = true;
    const startIndex = ((pageToLoadNext.current - 1) % totalPages) * pageSize;

    setNewsState((newsState) => ({
      ...newsState,
      news: [...newsState.news],
      placeholders: Array(pageSize).fill('')
    }));
    fetch('assets/data/news.json')
      .then((response) => response.json())
      .then((data) => {
        const _news = data.splice(startIndex, pageSize);
        setTimeout(() => {
          setNewsState((newsState) => ({ ...newsState, news: [...newsState.news, ..._news], placeholders: [] }));
          pageToLoadNext.current++;
          loading.current = false;
        }, 1500);
      });
  };

  useEffect(() => {
    loadNext();
  }, []);

  return (
    <div className="infinite-list">
      <NbCard>
        <NbInfiniteList listenWindowScroll threshold={500} bottomThreshold={loadNext}>
          {newsState.news.map((np) => {
            return (
              <NbListItem key={uniqueId('news-post-')}>
                <NewsPost newsPost={np}></NewsPost>
              </NbListItem>
            );
          })}
          {newsState.placeholders.map(() => {
            return (
              <NbListItem key={uniqueId('news-post-placeholder-')}>
                <NewsPostPlaceholder></NewsPostPlaceholder>
              </NbListItem>
            );
          })}
        </NbInfiniteList>
      </NbCard>
    </div>
  );
}
