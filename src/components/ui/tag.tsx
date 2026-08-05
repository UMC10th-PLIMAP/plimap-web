import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const tagVariants = cva(
  'inline-flex w-fit min-w-[63px] h-[41px] px-[12px] py-2 items-center justify-center rounded-[50px] border transition-colors outline-none body-15-r',
  {
    variants: {
      variant: {
        default: 'border-grayscale-1100 text-grayscale-800',
        selected: 'bg-tag-fill border-tag-stroke text-grayscale-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type TagProps = React.ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof tagVariants> & {
    variant?: 'default' | 'selected';
  };

function Tag({ className, variant = 'default', type = 'button', ...props }: TagProps) {
  return (
    <button
      type={type}
      data-slot="tag"
      aria-pressed={variant === 'selected'}
      className={cn(tagVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Tag };
