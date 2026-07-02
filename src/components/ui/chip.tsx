import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const chipVariants = cva(
  'inline-flex w-full max-w-[61px] h-[41px] items-center justify-center rounded-[50px] transition-colors outline-none body-15-r',
  {
    variants: {
      selected: {
        true: 'bg-pli-black-50 text-grayscale-200',
        false: 'border border-grayscale-900 text-grayscale-600',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

type ChipProps = React.ComponentProps<'button'> &
  VariantProps<typeof chipVariants> & {
    selected?: boolean;
  };

function Chip({ className, selected = false, type = 'button', ...props }: ChipProps) {
  return (
    <button
      type={type}
      data-slot="chip"
      aria-pressed={selected}
      className={cn(chipVariants({ selected }), className)}
      {...props}
    />
  );
}

export { Chip };
