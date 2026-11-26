import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { GlobalLogicalPosition } from '@nebular-react/hooks';
import {
  ToastrProvider,
  controlToast,
  dangerToast,
  infoToast,
  primaryToast,
  showToast,
  successToast,
  warningToast
} from '@nebular-react/core';
// Internal units are imported directly because the public entry point does not expose them.
// eslint-disable-next-line import-x/no-relative-packages
import { ToastContainer } from '../../src/nebular-react-core/src/Toastr/ToastContainer';
// eslint-disable-next-line import-x/no-relative-packages
import { Toast, ToastrConfig } from '../../src/nebular-react-core/src/Toastr/types';
// eslint-disable-next-line import-x/no-relative-packages
import useToastrState from '../../src/nebular-react-core/src/Toastr/use-toastr-state/use-toastr-state';

type ToastDetails = {
  message: string;
  title?: string;
  userConfig?: Partial<ToastrConfig>;
};

type ToastFn = (details: ToastDetails) => void;

const statusToasts: Array<[string, ToastFn]> = [
  ['success', successToast],
  ['info', infoToast],
  ['warning', warningToast],
  ['danger', dangerToast],
  ['primary', primaryToast],
  ['control', controlToast]
];

const createToast = (config: Partial<ToastrConfig> = {}, overrides: Partial<Toast> = {}): Toast => {
  const toast = new Toast();
  toast.title = 'Title';
  toast.message = 'Message';
  toast.config = new ToastrConfig(config);
  return Object.assign(toast, overrides);
};

const toastRootFor = (text: string) =>
  screen.getByText(text).closest('.nebular-toast-root') as HTMLElement;

const cleanupOverlays = () => {
  document.querySelectorAll('.overlay-container').forEach((node) => node.remove());
};

describe('Toastr', () => {
  beforeEach(() => {
    cleanupOverlays();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    cleanupOverlays();
  });

  it('Toastr_ShowToast_ShouldRenderTitleAndMessageAtDefaultPosition', () => {
    render(<ToastrProvider />);

    act(() => {
      showToast({ message: 'Profile saved', title: 'Success' });
    });

    const toast = toastRootFor('Profile saved');

    expect(toast).toHaveTextContent('Success');
    expect(document.querySelector('.toastr-container-top-end')).toContainElement(toast);
  });

  it.each(statusToasts)('Toastr_Status_%s_ShouldApplyClassAndIcon', (status, toastFn) => {
    render(<ToastrProvider />);

    act(() => {
      toastFn({ message: `Message ${status}` });
    });

    const toast = toastRootFor(`Message ${status}`);

    expect(toast).toHaveClass(`status-${status}`);
    expect(toast.querySelector('.nebular-toast-iconContainer')).not.toBeNull();
  });

  it('Toastr_AutoClose_ShouldRemoveToastAfterDelay', () => {
    render(<ToastrProvider />);

    act(() => {
      successToast({ message: 'Auto hide', userConfig: { autoClose: 1000 } });
    });

    expect(screen.getByText('Auto hide')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(screen.getByText('Auto hide')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.queryByText('Auto hide')).not.toBeInTheDocument();
  });

  it('Toastr_AutoClose_ShouldKeepToastWhenDisabled', () => {
    render(<ToastrProvider />);

    act(() => {
      successToast({ message: 'Sticky toast', userConfig: { autoClose: false } });
    });

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(screen.getByText('Sticky toast')).toBeInTheDocument();
  });

  it('Toastr_Stacking_ShouldRenderEveryToast', () => {
    render(<ToastrProvider />);

    act(() => {
      successToast({ message: 'First toast' });
      infoToast({ message: 'Second toast' });
      warningToast({ message: 'Third toast' });
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    const container = document.querySelector('.toastr-container-top-end') as HTMLElement;

    expect(container.querySelectorAll('.nebular-toast-root')).toHaveLength(3);
  });

  it('Toastr_Limit_ShouldRenderAtMostLimitToasts', () => {
    render(<ToastrProvider limit={2} />);

    act(() => {
      successToast({ message: 'Toast one' });
      successToast({ message: 'Toast two' });
      successToast({ message: 'Toast three' });
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(document.querySelectorAll('.toastr-container-top-end .nebular-toast-root')).toHaveLength(
      2
    );
  });

  it('Toastr_DestroyByClick_ShouldRemoveToastOnClick', () => {
    render(<ToastrProvider />);

    act(() => {
      showToast({ message: 'Click me' });
    });

    const toast = toastRootFor('Click me');

    expect(toast).toHaveClass('nebular-toast-destroyByClick');

    fireEvent.click(toast);

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.queryByText('Click me')).not.toBeInTheDocument();
  });

  it('Toastr_DestroyByClick_ShouldKeepToastWhenDisabled', () => {
    render(<ToastrProvider />);

    act(() => {
      showToast({ message: 'Do not click', userConfig: { destroyByClick: false } });
    });

    const toast = toastRootFor('Do not click');

    expect(toast).not.toHaveClass('nebular-toast-destroyByClick');

    fireEvent.click(toast);

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByText('Do not click')).toBeInTheDocument();
  });

  it('Toastr_Position_ShouldRenderToastInRequestedContainer', () => {
    render(<ToastrProvider />);

    act(() => {
      successToast({
        message: 'Bottom toast',
        userConfig: { position: GlobalLogicalPosition.BOTTOM_START }
      });
    });

    const toast = toastRootFor('Bottom toast');
    const bottomContainer = document.querySelector('.toastr-container-bottom-start') as HTMLElement;

    expect(bottomContainer).toContainElement(toast);
    expect(document.querySelector('.toastr-container-top-end')).not.toContainElement(toast);
  });

  it('Toastr_Provider_ShouldRemoveEventListenersOnUnmount', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const eventName = 'nebular-toastr:successToast';

    const { unmount } = render(<ToastrProvider />);

    expect(addSpy.mock.calls.some(([type]) => type === eventName)).toBe(true);

    unmount();

    expect(removeSpy.mock.calls.some(([type]) => type === eventName)).toBe(true);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});

describe('Toastr accessibility', () => {
  beforeEach(() => {
    cleanupOverlays();
  });

  afterEach(() => {
    cleanupOverlays();
  });

  const flushToastTransitions = async () => {
    // Let the enter transition and the overlay force-update run inside act.
    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 250);
      });
    });
  };

  it('Toastr_A11y_ShouldAnnounceToastAsStatus', async () => {
    render(<ToastrProvider />);

    act(() => {
      successToast({ message: 'Saved successfully' });
    });
    await flushToastTransitions();

    const toast = toastRootFor('Saved successfully');

    expect(toast).toHaveAttribute('role', 'status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });

  it('Toastr_A11y_ShouldAnnounceDangerToastAsAlert', async () => {
    render(<ToastrProvider />);

    act(() => {
      dangerToast({ message: 'Could not save' });
    });
    await flushToastTransitions();

    const toast = toastRootFor('Could not save');

    expect(toast).toHaveAttribute('role', 'alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
  });

  it('Toastr_A11y_ShouldHaveNoViolations', async () => {
    render(<ToastrProvider />);

    act(() => {
      successToast({ message: 'Saved successfully' });
    });
    await flushToastTransitions();

    expect(await axe(toastRootFor('Saved successfully'))).toHaveNoViolations();
  });
});

describe('ToastrConfig', () => {
  it('ToastrConfig_Constructor_ShouldAssignDefaults', () => {
    const config = new ToastrConfig({});

    expect(config.autoClose).toBe(3000);
    expect(config.destroyByClick).toBe(true);
    expect(config.hasIcon).toBe(true);
    expect(config.position).toBe(GlobalLogicalPosition.TOP_END);
    expect(config.status).toBe('basic');
    expect(config.icon).toBe('email-outline');
    expect(config.iconPack).toBe('nebular-essentials');
    expect(config.id).toMatch(/^nebular-toastr-/);
  });

  it('ToastrConfig_Constructor_ShouldPickIconByStatus', () => {
    expect(new ToastrConfig({ status: 'success' }).icon).toBe('checkmark-outline');
    expect(new ToastrConfig({ status: 'danger' }).icon).toBe('flash-outline');
    expect(new ToastrConfig({ status: 'warning' }).icon).toBe('alert-triangle-outline');
    expect(new ToastrConfig({ status: 'info' }).icon).toBe('question-mark-outline');
  });

  it('ToastrConfig_Constructor_ShouldKeepCustomIcon', () => {
    const config = new ToastrConfig({
      status: 'success',
      icon: 'star-outline',
      iconPack: 'custom-pack'
    });

    expect(config.icon).toBe('star-outline');
    expect(config.iconPack).toBe('custom-pack');
  });

  it('ToastrConfig_Constructor_ShouldGenerateUniqueIds', () => {
    expect(new ToastrConfig({}).id).not.toBe(new ToastrConfig({}).id);
  });
});

describe('useToastrState', () => {
  it('useToastrState_Show_ShouldAppendToastAndReturnId', () => {
    const { result } = renderHook(() => useToastrState({ limit: 5 }));
    const toast = createToast();
    let id = '';

    act(() => {
      id = result.current.show(toast);
    });

    expect(id).toBe(toast.config.id);
    expect(result.current.toasts).toEqual([toast]);
  });

  it('useToastrState_Show_ShouldIgnoreDuplicatedToast', () => {
    const { result } = renderHook(() => useToastrState({ limit: 5 }));
    const toast = createToast();

    act(() => {
      result.current.show(toast);
      result.current.show(toast);
    });

    expect(result.current.toasts).toHaveLength(1);
  });

  it('useToastrState_Hide_ShouldRemoveToastAndCallOnClose', () => {
    const onClose = jest.fn();
    const toast = createToast({}, { onClose });
    const { result } = renderHook(() => useToastrState({ limit: 5 }));

    act(() => {
      result.current.show(toast);
    });
    act(() => {
      result.current.hide(toast.config.id);
    });

    expect(result.current.toasts).toHaveLength(0);
    expect(onClose).toHaveBeenCalledWith(toast);
  });

  it('useToastrState_Hide_ShouldIgnoreUnknownIds', () => {
    const toast = createToast();
    const { result } = renderHook(() => useToastrState({ limit: 5 }));

    act(() => {
      result.current.show(toast);
    });
    act(() => {
      result.current.hide('unknown-id');
    });

    expect(result.current.toasts).toEqual([toast]);
  });

  it('useToastrState_Update_ShouldReplaceToastContent', () => {
    const toast = createToast();
    const { result } = renderHook(() => useToastrState({ limit: 5 }));

    act(() => {
      result.current.show(toast);
    });
    act(() => {
      result.current.update({ ...toast, message: 'Updated message' });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Updated message');
  });

  it('useToastrState_Update_ShouldIgnoreUnknownToasts', () => {
    const toast = createToast();
    const { result } = renderHook(() => useToastrState({ limit: 5 }));

    act(() => {
      result.current.show(toast);
    });
    act(() => {
      result.current.update(createToast());
    });

    expect(result.current.toasts).toEqual([toast]);
  });

  it('useToastrState_Limit_ShouldKeepAtMostLimitToasts', () => {
    const { result } = renderHook(() => useToastrState({ limit: 2 }));

    act(() => {
      result.current.show(createToast());
      result.current.show(createToast());
      result.current.show(createToast());
    });

    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.queue).toHaveLength(1);
  });

  it('useToastrState_Clean_ShouldRemoveEveryToast', () => {
    const { result } = renderHook(() => useToastrState({ limit: 5 }));

    act(() => {
      result.current.show(createToast());
    });
    act(() => {
      result.current.clean();
    });

    expect(result.current.toasts).toHaveLength(0);
  });
});

describe('ToastContainer', () => {
  const containerProps = (toast: Toast, onHide: (id: string) => void = jest.fn()) => ({
    toast,
    onHide,
    innerRef: React.createRef<HTMLDivElement>(),
    apply: jest.fn(),
    paneRef: React.createRef<HTMLDivElement>(),
    globalWrapperRef: React.createRef<HTMLDivElement>()
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ToastContainer_Render_ShouldRenderTitleAndMessage', () => {
    render(<ToastContainer {...containerProps(createToast())} />);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
    expect(document.querySelector('.nebular-toast-iconContainer')).not.toBeNull();
  });

  it('ToastContainer_Render_ShouldHideIconWhenHasIconIsFalse', () => {
    render(<ToastContainer {...containerProps(createToast({ hasIcon: false }))} />);

    expect(document.querySelector('.nebular-toast-iconContainer')).toBeNull();
  });

  it('ToastContainer_Mount_ShouldCallOnOpenOnce', () => {
    const onOpen = jest.fn();
    const toast = createToast({}, { onOpen });
    const { rerender } = render(<ToastContainer {...containerProps(toast)} />);

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(toast);

    rerender(<ToastContainer {...containerProps(toast)} />);

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('ToastContainer_AutoClose_ShouldCallOnHideWithToastId', () => {
    const toast = createToast({ autoClose: 500 });
    const onHide = jest.fn();

    render(<ToastContainer {...containerProps(toast, onHide)} />);

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(onHide).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onHide).toHaveBeenCalledWith(toast.config.id);
  });

  it('ToastContainer_AutoClose_ShouldNotScheduleTimerWhenDisabled', () => {
    const onHide = jest.fn();

    render(<ToastContainer {...containerProps(createToast({ autoClose: false }), onHide)} />);

    expect(jest.getTimerCount()).toBe(0);

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(onHide).not.toHaveBeenCalled();
  });

  it('ToastContainer_AutoClose_ShouldRestartTimerWhenDelayChanges', () => {
    const onHide = jest.fn();
    const toast = createToast({ autoClose: 1000 });
    const { rerender } = render(<ToastContainer {...containerProps(toast, onHide)} />);

    act(() => {
      jest.advanceTimersByTime(600);
    });

    const shorterToast = createToast({ autoClose: 300 });
    rerender(<ToastContainer {...containerProps(shorterToast, onHide)} />);

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(onHide).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onHide).toHaveBeenCalledWith(shorterToast.config.id);
  });

  it('ToastContainer_Unmount_ShouldClearPendingAutoCloseTimer', () => {
    const onHide = jest.fn();
    const { unmount } = render(
      <ToastContainer {...containerProps(createToast({ autoClose: 1000 }), onHide)} />
    );

    expect(jest.getTimerCount()).toBeGreaterThan(0);

    unmount();

    expect(jest.getTimerCount()).toBe(0);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onHide).not.toHaveBeenCalled();
  });

  it('ToastContainer_Click_ShouldHideToastWhenDestroyByClick', () => {
    const toast = createToast({ destroyByClick: true });
    const onHide = jest.fn();

    render(<ToastContainer {...containerProps(toast, onHide)} />);

    fireEvent.click(screen.getByText('Message'));

    expect(onHide).toHaveBeenCalledWith(toast.config.id);
  });
});
