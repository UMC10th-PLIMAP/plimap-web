import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import SearchIcon from '@/assets/icons/search.svg?react';
import BackIcon from '@/assets/icons/back.svg?react';
import CloseIcon from '@/assets/icons/close.svg?react';

import { cn } from '@/lib/utils';

const searchInputVariants = cva('flex w-full items-center rounded-[50px] transition-colors', {
  variants: {
    variant: {
      map: 'h-[60px] gap-2.5 bg-pli-black-100 px-5 py-2.5 backdrop-blur-[1.95px]',
      friend: 'h-[60px] gap-2 bg-pli-black-50 px-4 py-2',
      song: 'h-10 gap-2 bg-pli-black-75 px-4 body-15-r',
    },
  },
  defaultVariants: {
    variant: 'map',
  },
});

const searchInputFieldVariants = cva(
  'min-w-0 flex-1 outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-ms-clear]:hidden',
  {
    variants: {
      variant: {
        map: 'body-17-m text-grayscale-300 placeholder:text-grayscale-700 placeholder-shown:body-17-r placeholder-shown:text-grayscale-700',
        friend: 'body-17-m text-grayscale-300 placeholder:text-grayscale-700',
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

type SearchLauncherProps = Omit<React.ComponentProps<'button'>, 'children'> & {
  value?: string;
  placeholder?: string;
  /** 선택된 값(value)이 있을 때 X 버튼을 보여주고, 눌리면 이 콜백을 호출한다. */
  onClear?: () => void;
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

    // 검색어가 남아있으면 지우기만 하고, 이미 비어있을 때만 실제로 뒤로 나간다 -
    // 눌러서 지우고, 한 번 더 눌러야 나가는 2단계 뒤로가기.
    const handleBack = () => {
      if (currentValue.trim().length > 0) {
        handleClear();
        return;
      }
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
          <button
            type="button"
            onClick={handleClear}
            aria-label="검색어 지우기"
            className={cn(
              'flex size-6 shrink-0 items-center justify-center',
              variant !== 'friend' && 'rounded-full bg-pli-black-50',
            )}
          >
            <CloseIcon
              className={cn('text-grayscale-400', variant === 'friend' ? 'size-6' : 'size-4')}
            />
          </button>
        ) : null}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';

const SearchLauncher = React.forwardRef<HTMLButtonElement, SearchLauncherProps>(
  (
    {
      className,
      value,
      placeholder = '장소를 검색하세요',
      type = 'button',
      onClear,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const hasValue = Boolean(value?.trim());
    const showClearButton = hasValue && Boolean(onClear);

    return (
      <div
        data-slot="search-launcher"
        data-variant="map"
        className={cn(searchInputVariants({ variant: 'map' }), className)}
      >
        <button
          ref={ref}
          type={type}
          aria-label={ariaLabel}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
          {...props}
        >
          {hasValue ? (
            <BackIcon className="size-7 shrink-0 text-grayscale-400" aria-hidden />
          ) : (
            <SearchIcon className="size-7 shrink-0 text-grayscale-400" aria-hidden />
          )}
          <span
            className={cn(
              'min-w-0 flex-1 truncate',
              hasValue ? 'body-17-m text-grayscale-300' : 'body-17-r text-grayscale-700',
            )}
          >
            {hasValue ? value : placeholder}
          </span>
        </button>
        {showClearButton ? (
          <button
            type="button"
            aria-label="검색 결과 지우기"
            onClick={() => onClear?.()}
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-pli-black-50"
          >
            <CloseIcon className="size-4 text-grayscale-400" />
          </button>
        ) : null}
      </div>
    );
  },
);

SearchLauncher.displayName = 'SearchLauncher';

export { SearchInput, SearchLauncher };
