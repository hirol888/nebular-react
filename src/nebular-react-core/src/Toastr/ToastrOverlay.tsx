import { useForceUpdate } from '@mantine/hooks';
import React, { useContext, useRef } from 'react';
import { Transition, TransitionGroup, TransitionStatus } from 'react-transition-group';
import {
  usePositionHelper,
  GlobalLogicalPosition,
  GlobalPositionStrategy,
  useGlobalPositionStrategy,
  useDidUpdate
} from '@nebular-react/hooks';
import { transitions, useNebularDir } from '@nebular-react/styles';
import { Portal } from '../Portal';
import { useToastrEvents } from './events';
import { ToastContainer } from './ToastContainer';
import { ToastrContext } from './Toastr.context';
import { ToastrConfig } from './types';
import useToastrState from './use-toastr-state/use-toastr-state';

export interface ToastrOverlayProps {
  logicalPosition: GlobalLogicalPosition;
}

function ToastrOverlay({ logicalPosition }: ToastrOverlayProps) {
  const forceUpdate = useForceUpdate();
  const refs = useRef<Record<string, HTMLDivElement>>({});
  const previousLength = useRef<number>(0);
  const {
    limit,
    transition,
    transitionDuration = 150,
    transitionTimingFunction = 'cubic-bezier(.51,.3,0,1.21), cubic-bezier(.51,.3,0,1.21), linear'
  } = useContext(ToastrContext);
  const { toasts, show, hide } = useToastrState({ limit });
  const positionStrategy = useRef<GlobalPositionStrategy>(
    new GlobalPositionStrategy().position(logicalPosition)
  );

  const dir = useNebularDir();
  const positionHelper = usePositionHelper();
  const { apply, paneRef, globalWrapperRef } = useGlobalPositionStrategy(
    positionStrategy.current,
    dir
  );

  useDidUpdate(() => {
    if (toasts.length > previousLength.current) {
      setTimeout(() => forceUpdate(), 0);
    }
    previousLength.current = toasts.length;
  }, [toasts]);

  const getToastStateStyles = (state: TransitionStatus): React.CSSProperties => {
    let commonStyles: React.CSSProperties = {
      transitionDuration: `${transitionDuration}ms`,
      transitionTimingFunction
    };
    let inState: React.CSSProperties = {};
    let outState: React.CSSProperties = {};

    const _transition = transition ?? {
      in: { opacity: 1, transform: 'translateX(0)' },
      out: {
        opacity: 0,
        transform:
          dir === 'ltr'
            ? logicalPosition.includes('end')
              ? 'translateX(100%)'
              : 'translateX(-100%)'
            : logicalPosition.includes('start')
            ? 'translateX(100%)'
            : 'translateX(-100%)'
      },
      common: {
        opacity: 0,
        transform:
          dir === 'ltr'
            ? logicalPosition.includes('end')
              ? 'translateX(100%)'
              : 'translateX(-100%)'
            : logicalPosition.includes('start')
            ? 'translateX(100%)'
            : 'translateX(-100%)'
      },
      transitionProperty: 'opacity, transform'
    };

    if (typeof _transition === 'string') {
      if (_transition in transitions) {
        commonStyles = {
          ...commonStyles,
          transitionProperty: transitions[_transition].transitionProperty,
          ...transitions[_transition].common
        };
        inState = { ...inState, ...transitions[_transition].in };
        outState = { ...outState, ...transitions[_transition].out };
      }
    } else {
      commonStyles = {
        ...commonStyles,
        transitionProperty: _transition.transitionProperty,
        ..._transition.common
      };
      inState = { ...inState, ..._transition.in };
      outState = { ...outState, ..._transition.out };
    }

    const transitionStyles = {
      entering: inState,
      entered: inState,
      exiting: outState,
      exited: outState
    };

    return { ...commonStyles, ...transitionStyles[state] };
  };

  const showToast = (toastDetails: {
    message: string;
    title?: string;
    userConfig?: Partial<ToastrConfig>;
  }) => {
    const config = new ToastrConfig({ ...toastDetails.userConfig });
    const toastLogicalPosition = positionHelper.toLogicalPosition(config.position);
    if (logicalPosition !== toastLogicalPosition) {
      return;
    }

    const toast = {
      message: toastDetails.message,
      title: toastDetails.title,
      config
    };

    show(toast);
  };

  const successToast = (toastDetails: {
    message: string;
    title?: string;
    userConfig?: Partial<ToastrConfig>;
  }) => {
    showToast({ ...toastDetails, userConfig: { ...toastDetails.userConfig, status: 'success' } });
  };

  const infoToast = (toastDetails: {
    message: string;
    title?: string;
    userConfig?: Partial<ToastrConfig>;
  }) => {
    showToast({ ...toastDetails, userConfig: { ...toastDetails.userConfig, status: 'info' } });
  };

  const warningToast = (toastDetails: {
    message: string;
    title?: string;
    userConfig?: Partial<ToastrConfig>;
  }) => {
    showToast({ ...toastDetails, userConfig: { ...toastDetails.userConfig, status: 'warning' } });
  };

  const primaryToast = (toastDetails: {
    message: string;
    title?: string;
    userConfig?: Partial<ToastrConfig>;
  }) => {
    showToast({ ...toastDetails, userConfig: { ...toastDetails.userConfig, status: 'primary' } });
  };

  const dangerToast = (toastDetails: {
    message: string;
    title?: string;
    userConfig?: Partial<ToastrConfig>;
  }) => {
    showToast({ ...toastDetails, userConfig: { ...toastDetails.userConfig, status: 'danger' } });
  };

  const controlToast = (toastDetails: {
    message: string;
    title?: string;
    userConfig?: Partial<ToastrConfig>;
  }) => {
    showToast({ ...toastDetails, userConfig: { ...toastDetails.userConfig, status: 'control' } });
  };

  useToastrEvents({
    showToast,
    hideToast: hide,
    primaryToast,
    successToast,
    infoToast,
    warningToast,
    dangerToast,
    controlToast
  });

  const items = toasts.map((toast) => (
    <Transition
      key={toast.config.id}
      timeout={transitionDuration}
      nodeRef={{ current: refs.current[toast.config.id] }}
    >
      {(state) => (
        <ToastContainer
          style={{ ...getToastStateStyles(state) }}
          toast={toast}
          onHide={hide}
          innerRef={(node) => {
            refs.current[toast.config.id] = node;
          }}
          apply={apply}
          paneRef={paneRef}
          globalWrapperRef={globalWrapperRef}
        />
      )}
    </Transition>
  ));

  return (
    <Portal>
      <div
        className="global-overlay-wrapper toastr-overlay-container"
        ref={globalWrapperRef}
        dir={dir}
      >
        <div className="overlay-pane" ref={paneRef}>
          <div className={`toastr-container-${logicalPosition}`}>
            <TransitionGroup>{items}</TransitionGroup>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export { ToastrOverlay };
