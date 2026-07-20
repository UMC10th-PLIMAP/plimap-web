import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import SearchIcon from '@/assets/icons/search.svg?react';
import BackIcon from '@/assets/icons/back.svg?react';
import CloseIcon from '@/assets/icons/close.svg?react';

import { cn } from '@/lib/utils';

const searchInputVariants = cva('flex w-full items-center rounded-[50px] transition-colors', {
  variants: {
    variant: {
      map: 'h-12 gap-3 bg-pli-black-100 px-5 py-2.5 backdrop-blur-[1.95px]',
      song: 'h-10 gap-2 bg-pli-black-75 px-4 body-15-r',
    },
  },
  defaultVariants: {
    variant: 'map',
  },
});

const searchInputFieldVariants = cva(
  'flex-1 outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-ms-clear]:hidden',
  {
    variants: {
      variant: {
        map: 'body-17-m text-grayscale-300 placeholder:text-grayscale-700 placeholder-shown:body-17-r placeholder-shown:text-grayscale-700',
        song: '',
      },
    },
    defaultVariants: {
      variant: 'map',
    },
  },
);

type SearchInputProps = Omit<React.ComponentProps<'input'>, 'type' | 'size'> &
  VariantProps<typeof searchInputVariants> & {
    containerClassName?: string;
    onClear?: () => void;
    onBack?: () => void;
    leadingIcon?: 'search' | 'back';
  };

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      containerClassName,
      variant = 'map',
      value,
      defaultValue,
      onClear,
      onBack,
      leadingIcon = 'search',
      onChange,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue?.toString() ?? '');
    const isControlled = value !== undefined;
    const currentValue = isControlled ? String(value) : internalValue;
    const showBackArrow = variant === 'map' && leadingIcon === 'back';
    const showClearButton = currentValue.length > 0;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(event.target.value);
      }
      onChange?.(event);
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue('');
      }
      onClear?.();
    };

    const handleBack = () => {
      handleClear();
      onBack?.();
    };

    return (
      <div
        data-slot="search-input"
        data-variant={variant}
        className={cn(searchInputVariants({ variant }), containerClassName)}
      >
        {showBackArrow ? (
          <button type="button" onClick={handleBack} aria-label="뒤로 가기">
            <BackIcon className="size-7 text-grayscale-400" />
          </button>
        ) : (
          <SearchIcon
            className={cn(
              variant === 'map' ? 'size-7 text-grayscale-400' : 'size-6 text-grayscale-600',
            )}
            aria-hidden
          />
        )}
        <input
          ref={ref}
          type="search"
          value={currentValue}
          onChange={handleChange}
          className={cn(searchInputFieldVariants({ variant }), className)}
          {...props}
        />
        {showClearButton ? (
          <button type="button" onClick={handleClear} aria-label="검색어 지우기">
            <CloseIcon className="size-6 text-grayscale-400" />
          </button>
        ) : null}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
