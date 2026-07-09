import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const chipVariants = cva(
  'inline-flex w-fit min-w-[61px] h-[41px] px-4 py-2.5 items-center justify-center rounded-[50px] transition-colors outline-none body-15-r',
  {
    variants: {
      variant: {
        default: 'border border-grayscale-900 text-grayscale-600',
        selected: 'bg-pli-black-50 text-grayscale-200 ',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type ChipProps = React.ComponentProps<'button'> &
  VariantProps<typeof chipVariants> & {
    variant?: 'default' | 'selected';
  };

function Chip({ className, variant = 'default', type = 'button', ...props }: ChipProps) {
  return (
    <button
      type={type}
      data-slot="chip"
      aria-pressed={variant === 'selected'}
      className={cn(chipVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Chip };
