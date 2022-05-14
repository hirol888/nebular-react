// import {
//   NbCard,
//   NbInfiniteListWithPageTracker,
//   NbInfiniteListWithPageTrackerProps,
//   NbLayoutDimensions,
//   NbLayoutRulerService,
//   NbLayoutScrollService,
//   NbListItem,
//   NbPlatform,
//   NbScrollPosition
// } from '@nebular-react';
// import { useEffect, useRef, useState } from 'react';
// import { NewsPost } from './components/NewsPost';
// import { NewsPostPlaceholder } from './components/NewsPostPlacehholder';
// import { uniqueId } from 'lodash';
// import './infinite-news-list.scoped.scss';
// import { createSearchParams, useNavigate, useParams } from 'react-router-dom';
// import { useInjection } from 'libs/nebular-react/src/ioc-provider';
// import { TYPES } from 'libs/nebular-react/src/ioc-types';
// import { concat, toArray } from 'rxjs';
// import { NewsPostModel } from './model';

// interface InfiniteListPlaceholdersState {
//   news: NewsPostModel[];
//   topPlaceholders: string[];
//   bottomPlaceholders: string[];
// }

// export function InfiniteListPlaceholders() {
//   const { page } = useParams();
//   const pageSize = 10;
//   const totalPages = 7;
//   const startPage = useRef<number>(page ? Number.parseInt(page, 10) : 100);
//   const pageToLoadNext = useRef<number>(startPage.current);
//   const loadingPrevious = useRef<boolean>(false);
//   const loadingNext = useRef<boolean>(false);
//   const [newsState, setNewsState] = useState<InfiniteListPlaceholdersState>({
//     news: [],
//     topPlaceholders: [],
//     bottomPlaceholders: []
//   });

//   const initialScrollRestoration = useRef<any>();

//   const platform = useInjection<NbPlatform>(TYPES.NbPlatform);
//   const layoutService = useInjection<NbLayoutRulerService>(TYPES.NbLayoutRulerService);
//   const scrollService = useInjection<NbLayoutScrollService>(TYPES.NbLayoutScrollService);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (platform.isBrowser && window.history.scrollRestoration) {
//       initialScrollRestoration.current = window.history.scrollRestoration;
//       // eslint-disable-next-line no-restricted-globals
//       history.scrollRestoration = 'manual';
//     }
//     loadPrevious();

//     return () => {
//       if (initialScrollRestoration.current) {
//         window.history.scrollRestoration = initialScrollRestoration.current;
//       }
//     };
//   }, []);

//   const loadPrevious = () => {
//     if (loadingPrevious.current || startPage.current === 1) {
//       return;
//     }

//     loadingPrevious.current = true;
//     const startIndex = ((startPage.current - 1) % totalPages) * pageSize;

//     setNewsState((newsState) => ({
//       ...newsState,
//       news: [...newsState.news],
//       topPlaceholders: Array(pageSize).fill(''),
//       bottomPlaceholders: [...newsState.bottomPlaceholders]
//     }));
//     restoreScrollPosition();
//     startPage.current--;

//     fetch('assets/data/news.json')
//       .then((response) => response.json())
//       .then((data) => {
//         const _news = data.splice(startIndex, pageSize);
//         setTimeout(() => {
//           const _newsClone = [...newsState.news];
//           _newsClone.unshift(..._news);
//           setNewsState((newsState) => ({
//             ...newsState,
//             news: _newsClone,
//             topPlaceholders: [],
//             bottomPlaceholders: []
//           }));
//           loadingPrevious.current = false;
//         }, 1500);
//       })
//       .catch(() => {
//         startPage.current++;
//       });
//   };

//   const loadNext = () => {
//     if (loadingNext.current) {
//       return;
//     }

//     loadingNext.current = true;
//     const startIndex = ((pageToLoadNext.current - 1) % totalPages) * pageSize;

//     setNewsState((newsState) => ({
//       ...newsState,
//       news: [...newsState.news],
//       topPlaceholders: [...newsState.topPlaceholders],
//       bottomPlaceholders: Array(pageSize).fill('')
//     }));

//     fetch('assets/data/news.json')
//       .then((response) => response.json())
//       .then((data) => {
//         const _news = data.splice(startIndex, pageSize);
//         setTimeout(() => {
//           const _newsClone = [...newsState.news];
//           _newsClone.push(..._news);
//           setNewsState((newsState) => ({
//             ...newsState,
//             news: _newsClone,
//             topPlaceholders: [],
//             bottomPlaceholders: []
//           }));
//           loadingNext.current = false;
//           pageToLoadNext.current++;
//         }, 1500);
//       });
//   };

//   const restoreScrollPosition = () => {
//     concat(
//       layoutService.getDimensions(),
//       scrollService.getPosition(),
//       layoutService.getDimensions(),
//       scrollService.getPosition()
//     )
//       .pipe(toArray())
//       .subscribe(([oldDimensions, oldScrollPosition, dimensions, scrollPosition]) => {
//         const oldHeight = (oldDimensions as NbLayoutDimensions).scrollHeight;
//         const oldScrollTop = (oldScrollPosition as NbScrollPosition).y;
//         const currentHeight = (dimensions as NbLayoutDimensions).scrollHeight;
//         const currentScrollTop = (scrollPosition as NbScrollPosition).y;
//         const heightDiff = currentHeight - oldHeight;

//         // chrome automatically changes scrollTop
//         if (oldScrollTop + heightDiff === currentScrollTop) {
//           return;
//         }

//         const newScrollTop = currentScrollTop + heightDiff;
//         console.log('newsc', newScrollTop);
//         scrollService.scrollTo((scrollPosition as NbScrollPosition).x, newScrollTop);
//       });
//   };

//   const updateUrl = (page: number) => {
//     console.log(page);
//     navigate({ pathname: '.', search: `?page=${page}` });
//   };

//   return (
//     <div className="infinite-list">
//       <NbCard>
//         <NbInfiniteListWithPageTracker
//           listenWindowScroll
//           threshold={500}
//           topThreshold={loadPrevious}
//           bottomThreshold={loadNext}
//           pageSize={pageSize}
//           startPage={startPage.current}
//           pageChange={updateUrl}
//         >
//           {newsState.topPlaceholders.map((p) => {
//             return (
//               <NbListItem key={uniqueId('top-news-post-placeholder-')}>
//                 <NewsPostPlaceholder></NewsPostPlaceholder>
//               </NbListItem>
//             );
//           })}
//           {newsState.news.map((np) => {
//             return (
//               <NbListItem key={uniqueId('news-post-')}>
//                 <NewsPost newsPost={np}></NewsPost>
//               </NbListItem>
//             );
//           })}
//           {newsState.bottomPlaceholders.map((p) => {
//             return (
//               <NbListItem key={uniqueId('bottom-news-post-placeholder-')}>
//                 <NewsPostPlaceholder></NewsPostPlaceholder>
//               </NbListItem>
//             );
//           })}
//         </NbInfiniteListWithPageTracker>
//       </NbCard>
//     </div>
//   );
// }
