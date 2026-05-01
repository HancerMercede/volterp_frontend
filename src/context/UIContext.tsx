import { useState, type ReactNode } from 'react';
import { UIContext, type Toast, type ToastType } from './UIContext';

export function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <UIContext.Provider value={{ toasts, isLoading, addToast, removeToast, setLoading: setIsLoading }}>
      {children}
    </UIContext.Provider>
  );
}