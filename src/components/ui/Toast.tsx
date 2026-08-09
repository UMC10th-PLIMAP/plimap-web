import type { ComponentProps, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Toast as ToastPrimitive } from 'radix-ui';

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
        'toast-root w-fit max-w-[calc(100%-30px)] rounded-2xl border border-grayscale-1200 bg-grayscale-1300 px-6 py-4 text-center body-17-m text-grayscale-300',
        className,
      )}
      {...props}
    >
      <ToastPrimitive.Description asChild>
        <div>{children}</div>
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
