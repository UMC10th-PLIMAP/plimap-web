import { useCallback, useMemo, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Toast as ToastPrimitive } from 'radix-ui';

import { AppToastContext, type AppToastPlacement, type ToastApi } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

export type ToastProviderProps = ComponentProps<typeof ToastPrimitive.Provider>;

export function ToastProvider({ label = '알림', ...props }: ToastProviderProps) {
  return <ToastPrimitive.Provider label={label} {...props} />;
}

export function ToastPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}

export type ToastProps = ComponentProps<typeof ToastPrimitive.Root>;

export function Toast({ children, className, ...props }: ToastProps) {
  return (
    <ToastPrimitive.Root
      className={cn(
        'toast-root w-fit max-w-full rounded-2xl border border-grayscale-1100 bg-pli-black-50 px-6 py-4 text-center body-17-m text-grayscale-300',
        className,
      )}
      {...props}
    >
      <ToastPrimitive.Description asChild>
        <div className="whitespace-pre-line break-words">{children}</div>
      </ToastPrimitive.Description>
    </ToastPrimitive.Root>
  );
}

export type ToastViewportProps = ComponentProps<typeof ToastPrimitive.Viewport>;

export function ToastViewport({
  className,
  label = '알림 ({hotkey})',
  ...props
}: ToastViewportProps) {
  return (
    <ToastPrimitive.Viewport
      label={label}
      className={cn('m-0 flex w-full list-none justify-center p-0 outline-none', className)}
      {...props}
    />
  );
}

type AppToast = {
  id: number;
  message: ReactNode;
  duration?: number;
  placement: AppToastPlacement;
};

export function AppToastProvider({ children }: { children: ReactNode }) {
  const nextToastId = useRef(0);
  const [activeToast, setActiveToast] = useState<AppToast | null>(null);

  const show = useCallback<ToastApi['show']>((message, options = {}) => {
    nextToastId.current += 1;
    setActiveToast({
      id: nextToastId.current,
      message,
      duration: options.duration,
      placement: options.placement ?? 'screen',
    });
  }, []);

  const toast = useMemo<ToastApi>(
    () => ({
      show,
      error: show,
      success: show,
    }),
    [show],
  );

  return (
    <AppToastContext.Provider value={toast}>
      <ToastProvider duration={2_000}>
        {children}
        <div
          className={cn(
            'pointer-events-none fixed inset-x-0 z-[100] mx-auto flex w-full max-w-[402px] justify-center px-[15px]',
            activeToast?.placement === 'above-navigation'
              ? 'bottom-[calc(env(safe-area-inset-bottom)+108px)]'
              : 'bottom-[calc(env(safe-area-inset-bottom)+23px)]',
          )}
        >
          {activeToast ? (
            <Toast
              key={activeToast.id}
              defaultOpen
              duration={activeToast.duration}
              onOpenChange={(open) => {
                if (!open) {
                  setActiveToast((currentToast) =>
                    currentToast?.id === activeToast.id ? null : currentToast,
                  );
                }
              }}
            >
              {activeToast.message}
            </Toast>
          ) : null}
          <ToastViewport />
        </div>
      </ToastProvider>
    </AppToastContext.Provider>
  );
}
