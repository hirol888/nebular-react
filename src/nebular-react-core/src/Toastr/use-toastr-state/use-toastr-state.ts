import { useQueue } from '@nebular-react/hooks';
import { Toast } from '../types';

export default function useToastrState({ limit }: { limit: number }) {
  const { state, queue, update, cleanQueue } = useQueue<Toast>({
    initialValues: [],
    limit
  });

  const showToast = (toast: Toast) => {
    update((toasts) => {
      if (toast.config.id && toasts.some((t) => t.config.id === toast.config.id)) {
        return toasts;
      }

      return [...toasts, toast];
    });

    return toast.config.id;
  };

  const updateToast = (toast: Toast) =>
    update((toasts) => {
      const index = toasts.findIndex((t) => t.config.id === toast.config.id);

      if (index === -1) {
        return toasts;
      }

      const newToasts = [...toasts];
      toasts[index] = toast;

      return newToasts;
    });

  const hideToast = (id: string) =>
    update((toasts) =>
      toasts.filter((t) => {
        if (t.config.id === id) {
          typeof t.onClose === 'function' && t.onClose(t);
          return false;
        }

        return true;
      })
    );

  const clean = () => update(() => []);

  return {
    toasts: state,
    queue,
    show: showToast,
    update: updateToast,
    hide: hideToast,
    cleanQueue,
    clean
  };
}
