import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'w-full inline-flex items-center justify-center transition-all outline-none',
  {
    variants: {
      variant: {
        cta: 'bg-grayscale-300 disabled:bg-grayscale-900 text-grayscale-1250',
        pin: 'bg-gradient-neon text-grayscale-1200 disabled:bg-none disabled:bg-pli-black-75 disabled:text-grayscale-600',
        confirm: 'bg-grayscale-100 text-grayscale-1250',
        cancel: 'bg-pli-black-50 text-grayscale-400',
        kakao: 'bg-kakao text-kakao-text',
        google: 'bg-grayscale-0 text-grayscale-1300',
        apple: 'border border-grayscale-700 text-grayscale-200',
      },
      size: {
        cta: 'max-w-92 h-16 rounded-2xl head-20-sb',
        pin: 'max-w-23 h-13 rounded-[50px] body-15-sb',
        bt: 'max-w-[77px] h-11 rounded-[50px] body-17-m', // cancel, cta
        social: 'max-w-81 h-16 rounded-xl body-17-m', // kakao, google, apple
      },
    },
    defaultVariants: {
      variant: 'cta',
      size: 'cta',
    },
  },
);

function Button({
  className,
  variant = 'cta',
  size = 'cta',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
