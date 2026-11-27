/* eslint-disable import-x/no-relative-packages */
import {
  isDisabled,
  isFocusable,
  isTabbable,
  isVisible
} from '../../src/nebular-react-hooks/src/use-focus-trap/utils/interactivity-check';

function withGeometry<T extends HTMLElement>(element: T): T {
  Object.defineProperty(element, 'offsetWidth', { configurable: true, value: 16 });
  return element;
}

function setFrameElement(value: HTMLElement | null) {
  Object.defineProperty(window, 'frameElement', { configurable: true, value });
}

describe('interactivity-check', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'frameElement');
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    });
  });

  it('detects the disabled attribute', () => {
    expect(isDisabled(document.createElement('button'))).toBe(false);

    const button = document.createElement('button');
    button.setAttribute('disabled', '');
    expect(isDisabled(button)).toBe(true);
  });

  it('checks geometry and computed visibility', () => {
    const hidden = document.createElement('div');
    expect(isVisible(hidden)).toBe(false);

    const visible = withGeometry(document.createElement('div'));
    document.body.appendChild(visible);
    visible.style.visibility = 'visible';
    expect(isVisible(visible)).toBe(true);

    visible.style.visibility = 'hidden';
    expect(isVisible(visible)).toBe(false);
    visible.remove();
  });

  it('considers native focusable elements and tabindex', () => {
    expect(isTabbable(withGeometry(document.createElement('button')))).toBe(true);
    expect(isTabbable(withGeometry(document.createElement('div')))).toBe(false);

    const withTabIndex = withGeometry(document.createElement('div'));
    withTabIndex.setAttribute('tabindex', '0');
    expect(isTabbable(withTabIndex)).toBe(true);

    const negativeTabIndex = withGeometry(document.createElement('div'));
    negativeTabIndex.setAttribute('tabindex', '-1');
    expect(isTabbable(negativeTabIndex)).toBe(false);

    const invalidTabIndex = withGeometry(document.createElement('div'));
    invalidTabIndex.setAttribute('tabindex', 'not-a-number');
    expect(typeof isTabbable(invalidTabIndex)).toBe('boolean');
  });

  it('handles contenteditable, iframe and object elements', () => {
    const editable = withGeometry(document.createElement('div'));
    editable.setAttribute('contenteditable', 'true');
    expect(isTabbable(editable)).toBe(true);

    const editableDisabled = withGeometry(document.createElement('div'));
    editableDisabled.setAttribute('contenteditable', 'true');
    editableDisabled.setAttribute('tabindex', '-1');
    expect(isTabbable(editableDisabled)).toBe(false);

    expect(isTabbable(withGeometry(document.createElement('iframe')))).toBe(false);
    expect(isTabbable(withGeometry(document.createElement('object')))).toBe(false);
  });

  it('handles audio and video tabbing rules', () => {
    expect(isTabbable(withGeometry(document.createElement('audio')))).toBe(false);

    const audioWithControls = withGeometry(document.createElement('audio'));
    audioWithControls.setAttribute('controls', '');
    expect(isTabbable(audioWithControls)).toBe(true);

    const audioExplicitlyDisabled = withGeometry(document.createElement('audio'));
    audioExplicitlyDisabled.setAttribute('controls', '');
    audioExplicitlyDisabled.setAttribute('tabindex', '-1');
    expect(isTabbable(audioExplicitlyDisabled)).toBe(false);

    const videoExplicitlyDisabled = withGeometry(document.createElement('video'));
    videoExplicitlyDisabled.setAttribute('tabindex', '-1');
    expect(isTabbable(videoExplicitlyDisabled)).toBe(false);

    const videoWithTabIndex = withGeometry(document.createElement('video'));
    videoWithTabIndex.setAttribute('tabindex', '0');
    expect(isTabbable(videoWithTabIndex)).toBe(true);

    const videoWithoutControls = withGeometry(document.createElement('video'));
    expect(isTabbable(videoWithoutControls)).toBe(false);

    const videoWithControls = withGeometry(document.createElement('video'));
    videoWithControls.setAttribute('controls', '');
    expect(isTabbable(videoWithControls)).toBe(true);
  });

  it('follows the frame element tabindex and visibility', () => {
    const frame = document.createElement('div');
    frame.setAttribute('tabindex', '-1');
    setFrameElement(frame);
    expect(isTabbable(withGeometry(document.createElement('button')))).toBe(false);

    frame.setAttribute('tabindex', '0');
    setFrameElement(frame);
    expect(isTabbable(withGeometry(document.createElement('button')))).toBe(false);

    Object.defineProperty(frame, 'offsetWidth', { configurable: true, value: 16 });
    expect(isTabbable(withGeometry(document.createElement('button')))).toBe(true);
  });

  it('ignores a frame element that cannot be read', () => {
    Object.defineProperty(window, 'frameElement', {
      configurable: true,
      get() {
        throw new Error('cross-origin frame');
      }
    });

    expect(isTabbable(withGeometry(document.createElement('button')))).toBe(true);
  });

  it('restricts iOS tabbing to form controls', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    });

    const input = withGeometry(document.createElement('input'));
    input.type = 'text';
    expect(isTabbable(input)).toBe(true);

    const password = withGeometry(document.createElement('input'));
    password.type = 'password';
    expect(isTabbable(password)).toBe(true);

    const select = withGeometry(document.createElement('select'));
    expect(isTabbable(select)).toBe(true);

    const textarea = withGeometry(document.createElement('textarea'));
    expect(isTabbable(textarea)).toBe(true);

    const button = withGeometry(document.createElement('button'));
    expect(isTabbable(button)).toBe(false);
  });

  it('checks potential focusability without requiring visibility', () => {
    expect(isFocusable(document.createElement('button'))).toBe(false);
    expect(isFocusable(withGeometry(document.createElement('button')))).toBe(true);
    expect(isFocusable(document.createElement('button'), true)).toBe(true);

    const hiddenInput = withGeometry(document.createElement('input'));
    hiddenInput.type = 'hidden';
    expect(isFocusable(hiddenInput, true)).toBe(false);

    const link = withGeometry(document.createElement('a'));
    link.setAttribute('href', '#section');
    expect(isFocusable(link)).toBe(true);

    const linkWithoutHref = withGeometry(document.createElement('a'));
    expect(isFocusable(linkWithoutHref)).toBe(false);

    const disabledButton = withGeometry(document.createElement('button'));
    disabledButton.setAttribute('disabled', '');
    expect(isFocusable(disabledButton, true)).toBe(false);
  });
});
