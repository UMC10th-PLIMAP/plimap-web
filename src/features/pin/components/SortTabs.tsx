import { cn } from '@/lib/utils';
import type { PinSort } from '@/features/pin/types';

type SortTabsProps = {
  value: PinSort;
  onChange: (value: PinSort) => void;
};

const OPTIONS: { value: PinSort; label: string }[] = [
  { value: 'POPULAR', label: '인기순' },
  { value: 'LATEST', label: '최신순' },
];

export function SortTabs({ value, onChange }: SortTabsProps) {
  return (
    <div
      role="group"
      aria-label="PIN 정렬"
      className="flex h-10 w-full gap-[3px] rounded-xl bg-pli-black-75 px-[4.5px] py-1"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-1 items-center justify-center rounded-[10px] body-15-m cursor-pointer',
              selected
                ? 'bg-grayscale-200 text-grayscale-1300'
                : 'bg-pli-black-75 text-grayscale-700',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
