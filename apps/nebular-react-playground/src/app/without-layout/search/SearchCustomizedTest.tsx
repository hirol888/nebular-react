import {
  NbCard,
  NbCardBody,
  NbCardFooter,
  NbCardHeader,
  NbLayout,
  NbLayoutColumn,
  NbLayoutHeader,
  NbSearch,
  NbSearchService
} from '@nebular-react';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { useObservable, useSubscription } from 'observable-hooks';

export function SearchCustomizedTest() {
  const searchService = useInjection<NbSearchService>(TYPES.NbSearchService);
  const onSearchSubmit$ = useObservable(() => searchService.onSearchSubmit());
  useSubscription(onSearchSubmit$, (data: { term: string; tag?: string }) => {
    console.log(`term: ${data.term}, from search: ${data.tag}`);
  });

  return (
    <NbLayout>
      <NbLayoutHeader fixed>
        <NbSearch
          type="rotate-layout"
          tag="header-search-customized"
          hint="Custom hint"
          placeholder="Type here."
        ></NbSearch>
      </NbLayoutHeader>
      <NbLayoutColumn>
        <NbCard>
          <NbCardHeader>
            <span>Header</span>
          </NbCardHeader>
          <NbCardBody>
            <span>Body</span>
          </NbCardBody>
          <NbCardFooter>
            <span>Footer</span>
          </NbCardFooter>
        </NbCard>
        <NbCard size="small">
          <NbCardHeader>
            <span>Header</span>
          </NbCardHeader>
          <NbCardBody>
            <span>Body</span>
          </NbCardBody>
          <NbCardFooter>
            <span>Footer</span>
          </NbCardFooter>
        </NbCard>
        <NbCard size="medium">
          <NbCardHeader>
            <span>Header</span>
          </NbCardHeader>
          <NbCardBody>
            <span>Body</span>
          </NbCardBody>
          <NbCardFooter>
            <span>Footer</span>
          </NbCardFooter>
        </NbCard>
        <NbCard size="large">
          <NbCardHeader>
            <span>Header</span>
          </NbCardHeader>
          <NbCardBody>
            <span>Body</span>
          </NbCardBody>
          <NbCardFooter>
            <span>Footer</span>
          </NbCardFooter>
        </NbCard>
      </NbLayoutColumn>
    </NbLayout>
  );
}
