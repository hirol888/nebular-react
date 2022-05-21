import {
  NbCard,
  NbCardBody,
  NbCardHeader,
  NbLayout,
  NbLayoutColumn,
  NbLayoutHeader,
  NbSearch,
  NbSearchService,
  NbSidebar
} from '@nebular-react';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { useObservable, useSubscription } from 'observable-hooks';
import { useState } from 'react';

export function SearchEvent() {
  const [value, setValue] = useState<string>('-');
  const searchService = useInjection<NbSearchService>(TYPES.NbSearchService);
  const onSearchSubmit$ = useObservable(() => searchService.onSearchSubmit());
  useSubscription(onSearchSubmit$, (data: { term: string; tag?: string }) => {
    setValue(data.term);
  });

  return (
    <NbLayout>
      <NbLayoutHeader fixed>
        <NbSearch type="rotate-layout"></NbSearch>
      </NbLayoutHeader>
      <NbSidebar></NbSidebar>
      <NbLayoutColumn className="colored-column-basic">
        <NbCard accent="info">
          <NbCardHeader>You searched for:</NbCardHeader>
          <NbCardBody>
            <h3>{value || '-'}</h3>
          </NbCardBody>
        </NbCard>
      </NbLayoutColumn>
    </NbLayout>
  );
}
