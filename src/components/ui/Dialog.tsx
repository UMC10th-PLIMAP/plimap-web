import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

/** 중앙 정렬 다이얼로그. 딤드 오버레이 + 카드 셸만 제공하는 범용 프리미티브. */
function Dialog({ open, onClose, children, className }: DialogProps) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/[.85]" />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'flex flex-col items-stretch rounded-xl bg-grayscale-1200 outline-none',
            className,
          )}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

Dialog.Title = DialogPrimitive.Title;

export { Dialog };
