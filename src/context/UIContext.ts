import { createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface UIContextType {
  toasts: Toast[];
  isLoading: boolean;
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
}