import React from 'react';
import { render, screen } from '@testing-library/react';
// Internal unit is imported directly because the public entry point does not expose it.
/* eslint-disable import-x/no-relative-packages */
import {
  createDesktopAppRegistry,
  DESKTOP_APP_MAX_COUNT,
  type DesktopAppManifest
} from '../../src/nebular-react-core/src/Desktop/Desktop.apps';
/* eslint-enable import-x/no-relative-packages */

const NotesApp = () => React.createElement('div', null, 'Notes content');

function createManifest(overrides: Partial<DesktopAppManifest> = {}): DesktopAppManifest {
  return {
    id: 'notes',
    title: 'Notes',
    ...overrides
  };
}

function ids(manifests: DesktopAppManifest[]): string[] {
  return manifests.map((manifest) => manifest.id);
}

describe('Desktop app registry', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('registers, replaces and unregisters manifests with validation', () => {
    const registry = createDesktopAppRegistry();

    expect(registry.register(createManifest({ icon: 'notes-icon' }))).toBe(true);
    expect(registry.has('notes')).toBe(true);
    expect(registry.get('notes')?.icon).toBe('notes-icon');

    expect(registry.register(createManifest({ title: 'Notes 2' }))).toBe(true);
    expect(registry.list()).toHaveLength(1);
    expect(registry.get('notes')?.title).toBe('Notes 2');

    expect(registry.register(createManifest({ id: 'Bad Id' }))).toBe(false);
    expect(registry.register(createManifest({ id: 'valid', title: '   ' }))).toBe(false);
    expect(registry.has('valid')).toBe(false);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain('invalid id');

    expect(registry.unregister('notes')).toBe(true);
    expect(registry.unregister('notes')).toBe(false);
    expect(registry.get('notes')).toBeUndefined();
    expect(registry.list()).toEqual([]);
  });

  it('ignores invalid seed manifests and hides hidden apps from list', () => {
    const registry = createDesktopAppRegistry([
      createManifest(),
      createManifest({ id: 'hidden-app', title: 'Hidden', hidden: true }),
      { id: 'INVALID', title: 'Invalid' }
    ]);

    expect(ids(registry.list())).toEqual(['notes']);
    expect(ids(registry.list({ includeHidden: true }))).toEqual(['notes', 'hidden-app']);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('enforces the maximum number of registered apps', () => {
    const registry = createDesktopAppRegistry();
    let registered = 0;

    for (let index = 0; index < DESKTOP_APP_MAX_COUNT; index++) {
      if (registry.register({ id: `app${index}`, title: `App ${index}` })) {
        registered++;
      }
    }

    expect(registered).toBe(DESKTOP_APP_MAX_COUNT);
    expect(registry.register({ id: 'overflow', title: 'Overflow' })).toBe(false);
    expect(registry.list({ includeHidden: true })).toHaveLength(DESKTOP_APP_MAX_COUNT);
    expect(warn.mock.calls[0][0]).toContain('app limit');
  });

  it('finds apps by normalized extension and permission', () => {
    const registry = createDesktopAppRegistry([
      createManifest({ fileExtensions: ['md', '.TXT'], permissions: ['files', 'clipboard'] }),
      createManifest({
        id: 'code',
        title: 'Code',
        fileExtensions: ['ts', 'tsx'],
        permissions: ['network']
      }),
      createManifest({ id: 'empty', title: 'Empty' })
    ]);

    expect(registry.get('notes')?.fileExtensions).toEqual(['.md', '.txt']);
    expect(ids(registry.findByExtension('MD'))).toEqual(['notes']);
    expect(ids(registry.findByExtension('.md'))).toEqual(['notes']);
    expect(ids(registry.findByExtension('tsx'))).toEqual(['code']);
    expect(registry.findByExtension('')).toEqual([]);
    expect(registry.findByExtension('js')).toEqual([]);

    expect(ids(registry.filterByPermission('files'))).toEqual(['notes']);
    expect(ids(registry.filterByPermission('network'))).toEqual(['code']);
    expect(registry.filterByPermission('notifications')).toEqual([]);
  });

  it('resolves and creates deep links with encoding', () => {
    const registry = createDesktopAppRegistry([
      createManifest(),
      createManifest({ id: 'mail', title: 'Mail', deepLinkScheme: 'nebular' })
    ]);

    expect(registry.resolveDeepLink('app://notes/docs/read me?a=1&b=two')).toEqual({
      appId: 'notes',
      path: 'docs/read me',
      query: { a: '1', b: 'two' }
    });
    expect(registry.resolveDeepLink('nebular://notes/inbox?x=1')).toEqual({
      appId: 'notes',
      path: 'inbox',
      query: { x: '1' }
    });
    expect(registry.resolveDeepLink('app://mail/')).toEqual({
      appId: 'mail',
      path: '',
      query: {}
    });
    expect(registry.resolveDeepLink('other://notes/docs')).toBeNull();
    expect(registry.resolveDeepLink('app://unknown/docs')).toBeNull();
    expect(registry.resolveDeepLink('app://BAD ID/docs')).toBeNull();
    expect(registry.resolveDeepLink('not a url')).toBeNull();

    const link = registry.createDeepLink('notes', 'docs/read me', {
      q: 'a b',
      tag: 'x&y'
    });

    expect(link).toBe('app://notes/docs/read%20me?q=a+b&tag=x%26y');
    expect(registry.resolveDeepLink(link)).toEqual({
      appId: 'notes',
      path: 'docs/read me',
      query: { q: 'a b', tag: 'x&y' }
    });

    const custom = registry.createDeepLink('mail', '/inbox/', { page: '2' });

    expect(custom).toBe('nebular://mail/inbox?page=2');
    expect(registry.resolveDeepLink(custom)).toEqual({
      appId: 'mail',
      path: 'inbox',
      query: { page: '2' }
    });
    expect(() => registry.createDeepLink('Bad Id')).toThrow(/Invalid app id/);
  });

  it('caches loader promises and retries after a rejection', async () => {
    const loader = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ default: NotesApp });
    const registry = createDesktopAppRegistry([
      createManifest({ load: loader as unknown as DesktopAppManifest['load'] })
    ]);

    const first = registry.loadComponent('notes');
    const second = registry.loadComponent('notes');

    expect(first).toBe(second);
    await expect(first).rejects.toThrow('boom');
    expect(loader).toHaveBeenCalledTimes(1);
    expect(registry.loadComponent('notes')).not.toBe(first);

    await expect(registry.loadComponent('notes')).resolves.toBe(NotesApp);
    expect(loader).toHaveBeenCalledTimes(2);

    await expect(registry.loadComponent('notes')).resolves.toBe(NotesApp);
    expect(loader).toHaveBeenCalledTimes(2);
    await expect(registry.loadComponent('missing')).resolves.toBeNull();
  });

  it('resolves static components directly', async () => {
    // eslint-disable-next-line react/prefer-stateless-function
    class ClassApp extends React.Component {
      render() {
        return null;
      }
    }

    const registry = createDesktopAppRegistry([
      createManifest({ load: NotesApp }),
      createManifest({ id: 'class-app', title: 'Class app', load: ClassApp })
    ]);

    await expect(registry.loadComponent('notes')).resolves.toBe(NotesApp);
    await expect(registry.loadComponent('class-app')).resolves.toBe(ClassApp);
  });

  it('converts visible manifests into DesktopApp entries', async () => {
    const lazyLoader = jest.fn(async () => ({ default: NotesApp }));
    const registry = createDesktopAppRegistry([
      createManifest({
        icon: 'notes-icon',
        fileExtensions: ['md'],
        singleton: true,
        defaultBounds: { width: 640, height: 480 },
        content: 'Static notes content'
      }),
      createManifest({ id: 'hidden-app', title: 'Hidden', hidden: true, content: 'Hidden' }),
      createManifest({ id: 'lazy-app', title: 'Lazy', load: lazyLoader }),
      createManifest({ id: 'component-app', title: 'Component', content: NotesApp })
    ]);

    const apps = registry.toDesktopApps({ defaults: { minWidth: 320 } });

    expect(apps.map((app) => app.id)).toEqual(['notes', 'lazy-app', 'component-app']);
    expect(apps[0]).toMatchObject({
      id: 'notes',
      title: 'Notes',
      content: 'Static notes content',
      icon: 'notes-icon',
      fileExtensions: ['.md'],
      singleInstance: true,
      defaultWidth: 640,
      defaultHeight: 480,
      minWidth: 320
    });

    const lazyApp = apps.find((app) => app.id === 'lazy-app');
    const componentApp = apps.find((app) => app.id === 'component-app');

    expect(lazyApp?.content).toBeTruthy();
    expect(React.isValidElement(componentApp?.content)).toBe(true);

    render(React.createElement(React.Fragment, null, lazyApp?.content as React.ReactNode));

    expect(await screen.findByText('Notes content')).toBeInTheDocument();
    expect(lazyLoader).toHaveBeenCalledTimes(1);
  });
});
