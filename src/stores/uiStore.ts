import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'confirm' | 'alert';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  actions?: NotificationAction[];
  dismissible?: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  actions?: NotificationAction[];
  duration: number | null;
  dismissible: boolean;
}

interface UIStore {
  toasts: Toast[];
  modals: Notification[];
  isLoading: boolean;
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
  setLoading: (loading: boolean) => void;
  notify: (config: {
    type?: NotificationType;
    title?: string;
    message: string;
    actions?: NotificationAction[];
    duration?: number | null;
    dismissible?: boolean;
  }) => string;
  dismissNotification: (id: string) => void;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString() + Math.random().toString(36).slice(2, 11);
}

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],
  modals: [],
  isLoading: false,

  addToast: (message: string, type: ToastType) => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  notify: (config) => {
    const id = generateId();
    const duration = config.duration === undefined ? 4000 : config.duration;

    if (config.actions && config.actions.length > 0) {
      set((state) => ({
        modals: [
          ...state.modals,
          {
            id,
            type: config.type ?? 'confirm',
            title: config.title,
            message: config.message,
            actions: config.actions,
            duration: null,
            dismissible: config.dismissible ?? true,
          },
        ],
      }));
    } else {
      set((state) => ({
        toasts: [
          ...state.toasts,
          {
            id,
            message: config.message,
            type: (config.type as ToastType) ?? 'info',
            title: config.title,
            dismissible: config.dismissible ?? true,
          },
        ],
      }));
      if (duration !== null) {
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, duration);
      }
    }

    return id;
  },

  dismissNotification: (id: string) => {
    set((state) => ({
      modals: state.modals.filter((m) => m.id !== id),
    }));
  },
}));
