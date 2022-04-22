/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { getSettings, NbIcon } from '.';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NbFontIcon, NbSvgIcon } from './_icon';
import { Provider } from 'inversify-react';
import { container } from '../../../ioc';

describe('NbIcon', () => {
  it('should set icon name when string passed as a config', () => {
    const settings = getSettings('some-icon');

    expect(settings.icon).toEqual('some-icon');
  });

  it('should set icon when object with icon passed as a config', () => {
    const settings = getSettings({ icon: 'some-icon' });

    expect(settings.icon).toEqual('some-icon');
  });

  it('should set pack when object with pack passed as a config', () => {
    const settings = getSettings({ icon: 'some-icon', pack: 'some-pack' });

    expect(settings.pack).toEqual('some-pack');
  });

  it('should set status when object with status passed as a config', () => {
    const settings = getSettings({ icon: 'some-icon', status: 'danger' });

    expect(settings.status).toEqual('danger');
  });

  it('should do nothing when falsy value passed as a config', () => {
    const settings = getSettings(undefined, 'some-icon');

    expect(settings.icon).toEqual('some-icon');
  });

  it('icon inner html not to be null or undefined', () => {
    const { unmount } = render(
      <Provider container={container}>
        <NbIcon
          data-testid="icon"
          config={{ icon: 'not-existing-icon' }}
        ></NbIcon>
      </Provider>
    );
    const icon = screen.getByTestId('icon');

    expect(icon?.innerHTML).not.toBeNull();
    expect(icon?.innerHTML).not.toBeUndefined();

    unmount();
  });
});

describe('icon', () => {
  let fontIcon: NbFontIcon;
  let svgIcon: NbSvgIcon;

  it('font icon renders', () => {
    fontIcon = new NbFontIcon('home', 'custom', {
      packClass: 'custom-pack',
      iconClassPrefix: 'cp'
    });

    expect(fontIcon.getContent()).toEqual('custom');
  });

  it('font icon getClasses return classes', () => {
    fontIcon = new NbFontIcon('home', '', {
      packClass: 'custom-pack'
    });

    expect(fontIcon.getClasses()).toEqual(['custom-pack', 'home']);
  });

  it('font icon getClasses return class with prefix', () => {
    fontIcon = new NbFontIcon('home', '', {
      packClass: 'custom-pack',
      iconClassPrefix: 'cp'
    });

    expect(fontIcon.getClasses()).toEqual(['custom-pack', 'cp-home']);
  });

  it('font icon getClasses return class with name only', () => {
    fontIcon = new NbFontIcon('home', '');

    expect(fontIcon.getClasses()).toEqual(['home']);
  });

  it('svg icon renders', () => {
    svgIcon = new NbSvgIcon('home', 'content', {
      packClass: 'custom-pack'
    });

    expect(svgIcon.getContent()).toEqual('content');
  });

  it('svg icon getClasses return class', () => {
    svgIcon = new NbSvgIcon('home', '', {
      packClass: 'custom-pack'
    });

    expect(svgIcon.getClasses()).toEqual(['custom-pack']);
  });

  it('svg icon getClasses return class without name', () => {
    svgIcon = new NbSvgIcon('home', '');

    expect(svgIcon.getClasses()).toEqual([]);
  });
});
