import { createContext, useContext, type ReactNode } from 'react';

export type AppToastPlacement = 'screen' | 'above-navigation';

export type ShowToastOptions = {
  duration?: number;
  placement?: AppToastPlacement;
};

export type ToastApi = {
  show: (message: ReactNode, options?: ShowToastOptions) => void;
  error: (message: ReactNode, options?: ShowToastOptions) => void;
  success: (message: ReactNode, options?: ShowToastOptions) => void;
};

export const AppToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const toast = useContext(AppToastContext);

  if (!toast) {
    throw new Error('useToast must be used within AppToastProvider.');
  }

  return toast;
}
