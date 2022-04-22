import { container } from '@nebular-react';
import { render } from '@testing-library/react';
import { Provider } from 'inversify-react';
import {
  NbLayoutDirectionService,
  NbLayoutScrollService
} from 'libs/nebular-react/src/core/services';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { BrowserRouter } from 'react-router-dom';
import { NbLayout } from './Layout';
import { NbLayoutColumn } from './LayoutColumn';
import '@testing-library/jest-dom';
import { NbLayoutDirection } from 'libs/nebular-react/src/core/cdk';

describe('NbLayout', () => {
  describe('withScroll mode - scroll block', () => {
    let scrollService: NbLayoutScrollService;
    let unmount: () => void;

    beforeEach(() => {
      ({ unmount } = render(
        <Provider container={container}>
          <BrowserRouter>
            <NbLayout withScroll>
              <NbLayoutColumn>
                <div
                  style={{ height: '200vh', backgroundColor: 'lightcoral' }}
                ></div>
              </NbLayoutColumn>
            </NbLayout>
          </BrowserRouter>
        </Provider>
      ));

      scrollService = container.get<NbLayoutScrollService>(
        TYPES.NbLayoutScrollService
      );
    });

    it('should hide overflow when scroll blocked', async () => {
      scrollService.scrollable(false);
      const layoutComponent = document.querySelector('.nb-layout');

      expect(layoutComponent).toHaveStyle({ overflow: 'hidden' });
      unmount();
    });

    it('should restore previous overflow value when enabling scroll', async () => {
      const layoutComponent = document.querySelector(
        '.nb-layout'
      ) as HTMLDivElement;
      layoutComponent.style.overflow = 'auto';

      scrollService.scrollable(false);
      scrollService.scrollable(true);

      expect(layoutComponent).toHaveStyle({ overflow: 'auto' });
      unmount();
    });

    it('should restore previous padding left value when enabling scroll in LTR mode', async () => {
      const layoutComponent = document.querySelector(
        '.nb-layout'
      ) as HTMLDivElement;
      layoutComponent.style.paddingLeft = '1px';

      scrollService.scrollable(false);
      scrollService.scrollable(true);

      expect(layoutComponent).toHaveStyle({ paddingLeft: '1px' });
      unmount();
    });

    it('should restore previous padding right value when enabling scroll in RTL mode', async () => {
      const layoutDirection = container.get<NbLayoutDirectionService>(
        TYPES.NbLayoutDirectionService
      );
      layoutDirection.setDirection(NbLayoutDirection.RTL);

      const layoutComponent = document.querySelector(
        '.nb-layout'
      ) as HTMLDivElement;
      layoutComponent.style.paddingRight = '1px';

      scrollService.scrollable(false);
      scrollService.scrollable(true);

      expect(layoutComponent).toHaveStyle({ paddingRight: '1px' });
      unmount();
    });
  });
});
