import { NbCard, NbCardHeader, NbInfiniteList, NbListItem } from '@nebular-react';
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef, useState } from 'react';
import { NewsPost } from './components/NewsPost';
import { NewsPostPlaceholder } from './components/NewsPostPlacehholder';
import { uniqueId } from 'lodash';
import './infinite-news-list.scoped.scss';
import './infinite-list-scroll-modes.scoped.scss';
import { NewsPostModel } from './model';

interface CardNewsState {
  news: NewsPostModel[];
  placeholders: string[];
}

interface CardState {
  loading: boolean;
  pageToLoadNext: number;
}

export function InfiniteListScrollModes() {
  const [firstCardNewsState, setFirstCardNewsState] = useState<CardNewsState>({
    news: [],
    placeholders: []
  });
  const [secondCardNewsState, setSecondCardNewsState] = useState<CardNewsState>({
    news: [],
    placeholders: []
  });
  const firstCardState = useRef<CardState>({
    loading: false,
    pageToLoadNext: 1
  });
  const secondCardState = useRef<CardState>({
    loading: false,
    pageToLoadNext: 1
  });

  const pageSize = 10;
  const totalPages = 7;

  const loadNext = (
    setCardNewsState: Dispatch<SetStateAction<CardNewsState>>,
    cardState: MutableRefObject<CardState>
  ) => {
    if (cardState.current.loading) {
      return;
    }

    cardState.current.loading = true;
    const startIndex = ((cardState.current.pageToLoadNext - 1) % totalPages) * pageSize;

    setCardNewsState((newsState) => ({
      ...newsState,
      news: [...newsState.news],
      placeholders: Array(pageSize).fill('')
    }));
    fetch('assets/data/news.json')
      .then((response) => response.json())
      .then((data) => {
        const _news = data.splice(startIndex, pageSize);
        setTimeout(() => {
          setCardNewsState((newsState) => ({ ...newsState, news: [...newsState.news, ..._news], placeholders: [] }));
          cardState.current.pageToLoadNext++;
          cardState.current.loading = false;
        }, 1500);
      });
  };

  useEffect(() => {
    loadNext(setFirstCardNewsState, firstCardState);
    loadNext(setSecondCardNewsState, secondCardState);
  }, []);

  return (
    <div className="infinite-list">
      <NbCard className="own-scroll">
        <NbCardHeader>Own scroll</NbCardHeader>
        <NbInfiniteList threshold={500} bottomThreshold={() => loadNext(setFirstCardNewsState, firstCardState)}>
          {firstCardNewsState.news.map((np) => {
            return (
              <NbListItem key={uniqueId('news-post-')}>
                <NewsPost newsPost={np}></NewsPost>
              </NbListItem>
            );
          })}
          {firstCardNewsState.placeholders.map(() => {
            return (
              <NbListItem key={uniqueId('news-post-placeholder-')}>
                <NewsPostPlaceholder></NewsPostPlaceholder>
              </NbListItem>
            );
          })}
        </NbInfiniteList>
      </NbCard>
      <NbCard>
        <NbCardHeader>Window scroll</NbCardHeader>
        <NbInfiniteList
          listenWindowScroll
          threshold={500}
          bottomThreshold={() => loadNext(setSecondCardNewsState, secondCardState)}
        >
          {secondCardNewsState.news.map((np) => {
            return (
              <NbListItem key={uniqueId('news-post-')}>
                <NewsPost newsPost={np}></NewsPost>
              </NbListItem>
            );
          })}
          {secondCardNewsState.placeholders.map(() => {
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
