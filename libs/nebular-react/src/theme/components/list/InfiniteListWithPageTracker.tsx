// import { ComponentType, useEffect, useRef } from 'react';
// import { NbInfiniteList, NbInfiniteListProps } from './InfiniteList';

// export type NbInfiniteListWithPageTrackerProps = {
//   pageSize?: number;
//   startPage?: number;
//   pageChange?: (currentPage: number) => void;
// } & NbInfiniteListProps;

// function InfiniteListWithPageTracker(
//   InfiniteList: ComponentType<NbInfiniteListProps>,
//   {
//     pageSize = 10,
//     startPage = 1,
//     pageChange,
//     threshold = 0,
//     listenWindowScroll = false,
//     bottomThreshold,
//     topThreshold,
//     children
//   }: React.PropsWithChildren<NbInfiniteListWithPageTrackerProps>
// ) {
//   const listRef = useRef<HTMLDivElement>(null);
//   const observer = useRef<IntersectionObserver>(
//     new IntersectionObserver((entries) => checkForPageChange(entries), { threshold: 0.5 })
//   );
//   const currentPage = useRef<number>();

//   const checkForPageChange = (entries: IntersectionObserverEntry[]) => {
//     const mostVisiblePage = findMostVisiblePage(entries);

//     if (mostVisiblePage && currentPage.current !== mostVisiblePage) {
//       currentPage.current = mostVisiblePage;
//       pageChange && pageChange(currentPage.current);
//     }
//   };

//   const elementIndex = (element: Element): number => {
//     return element.parentElement && element.parentElement.children
//       ? Array.from(element.parentElement.children).indexOf(element)
//       : -1;
//   };

//   const findMostVisiblePage = (entries: IntersectionObserverEntry[]): number | null => {
//     const intersectionRatioByPage = new Map<number, number>();

//     for (const entry of entries) {
//       if (entry.intersectionRatio < 0.5) {
//         continue;
//       }

//       const eIndex = elementIndex(entry.target);
//       if (eIndex === -1) {
//         continue;
//       }
//       const page = startPage + Math.floor(eIndex / pageSize);

//       let ratio = entry.intersectionRatio;
//       if (intersectionRatioByPage.has(page)) {
//         ratio += intersectionRatioByPage.get(page)!;
//       }
//       intersectionRatioByPage.set(page, ratio);
//     }

//     let maxRatio = 0;
//     let mostVisiblePage: number | null = null;
//     intersectionRatioByPage.forEach((ratio, page) => {
//       if (ratio > maxRatio) {
//         maxRatio = ratio;
//         mostVisiblePage = page;
//       }
//     });

//     return mostVisiblePage;
//   };

//   useEffect(() => {
//     const items = listRef.current?.querySelectorAll(':scope > *');
//     items?.forEach((i) => observer.current.observe(i));
//   }, [children]);

//   useEffect(() => {
//     return () => {
//       observer.current.disconnect();
//     };
//   }, []);

//   return <InfiniteList {...{ threshold, listenWindowScroll, bottomThreshold, topThreshold, children, ref: listRef }} />;
// }

// export function NbInfiniteListWithPageTracker(props: React.PropsWithChildren<NbInfiniteListWithPageTrackerProps>) {
//   return InfiniteListWithPageTracker(NbInfiniteList, props);
// }
