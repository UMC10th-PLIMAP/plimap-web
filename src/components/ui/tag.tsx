import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const tagVariants = cva(
  'inline-flex w-full max-w-[63px] h-[41px] items-center justify-center rounded-[50px] border transition-colors outline-none body-15-r',
  {
    variants: {
      selected: {
        true: 'border-grayscale-1100 text-grayscale-800',
        false: 'bg-tag-fill border-tag-stroke text-grayscale-100',
      },
    },
    defaultVariants: {
      selected: true,
    },
  },
);

type TagProps = React.ComponentProps<'button'> &
  VariantProps<typeof tagVariants> & {
    selected?: boolean;
  };

function Tag({ className, selected = true, type = 'button', ...props }: TagProps) {
  return (
    <button
      type={type}
      data-slot="tag"
      aria-pressed={selected}
      className={cn(tagVariants({ selected }), className)}
      {...props}
    />
  );
}

export { Tag };
