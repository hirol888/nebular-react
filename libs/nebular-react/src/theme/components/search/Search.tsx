import classNames from 'classnames';
import { NbOverlayBuilder, Portal } from 'libs/nebular-react/src/core/cdk';
import { NbThemeService } from 'libs/nebular-react/src/core/services';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { uniqueId } from 'lodash';
import { useObservable, useSubscription } from 'observable-hooks';
import { useEffect, useRef, useState } from 'react';
import { delay, filter, of } from 'rxjs';
import { NbButton } from '../button';
import { NbIcon } from '../icon';
import { NbSearchService } from './search.service';
import { NbSearchField, NbSearchType } from './SearchFiled';
import './styles/search.scss';

export type NbSearchProps = {
  tag?: string;
  placeholder?: string;
  hint?: string;
  type: NbSearchType;
};

const NbSearch: React.FC<NbSearchProps> = ({ tag, placeholder = 'Search...', hint = 'Hit enter to search', type }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const paneRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLDivElement>(null);
  const [paneId] = useState<string>(uniqueId('cdk-overlay-'));

  const overlayBuilder = useInjection<NbOverlayBuilder>(TYPES.NbOverlayBuilder);
  const overlayRef = overlayBuilder.create();

  const searchService = useInjection<NbSearchService>(TYPES.NbSearchService);
  const themeService = useInjection<NbThemeService>(TYPES.NbThemeService);

  const onSearchActivate$ = useObservable(() =>
    searchService.onSearchActivate().pipe(filter((data) => !tag || data.tag === tag))
  );
  useSubscription(onSearchActivate$, () => openSearch());
  const onSearchDeactivate$ = useObservable(() =>
    searchService.onSearchDeactivate().pipe(filter((data) => !tag || data.tag === tag))
  );
  useSubscription(onSearchDeactivate$, () => hideSearch());

  useEffect(() => {
    return () => {
      removeLayoutClasses();
    };
  }, []);

  const openSearch = () => {
    setIsOpen(true);
    themeService.appendLayoutClass(type);
    of(null)
      .pipe(delay(0))
      .subscribe(() => {
        themeService.appendLayoutClass('with-search');
      });
  };

  const hideSearch = () => {
    setIsOpen(false);
    removeLayoutClasses();
    searchButtonRef.current?.focus();
  };

  const removeLayoutClasses = () => {
    themeService.removeLayoutClass('with-search');
    of(null)
      .pipe(delay(500))
      .subscribe(() => {
        themeService.removeLayoutClass(type);
      });
  };

  const search = (term: string) => {
    searchService.submitSearch(term, tag);
    hideSearch();
  };

  return (
    <div className={classNames('nb-search')}>
      <NbButton
        className="start-search"
        appearance="ghost"
        ref={searchButtonRef}
        onClick={() => searchService.activateSearch(type, tag)}
      >
        <NbIcon icon="search-outline" pack="nebular-essentials"></NbIcon>
      </NbButton>
      <Portal overlayRef={overlayRef} isOpen={isOpen} paneRef={paneRef} attachToLayout>
        <div ref={paneRef} id={paneId} className="cdk-overlay-pane">
          <NbSearchField
            type={type}
            placeholder={placeholder}
            hint={hint}
            search={(term) => search(term)}
            onSearchInput={(value) => searchService.searchInput(value!, tag)}
            onClose={() => searchService.deactivateSearch(type, tag)}
          />
        </div>
      </Portal>
    </div>
  );
};

export { NbSearch };
