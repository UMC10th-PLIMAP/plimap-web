import { cn } from '@/lib/utils';
import type { PinSort } from '@/types/pin';

type SortTabsProps = {
  value: PinSort;
  onChange: (value: PinSort) => void;
};

const OPTIONS: { value: PinSort; label: string }[] = [
  { value: 'popular', label: '인기순' },
  { value: 'latest', label: '최신순' },
];

export function SortTabs({ value, onChange }: SortTabsProps) {
  return (
    <div className="flex w-full h-10 rounded-xl bg-pli-black-75 px-[4.5px] py-1 gap-[3px]">
      {OPTIONS.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-1 items-center justify-center rounded-[10px] bg-pli-black-75 body-15-m',
              selected ? 'bg-grayscale-200 text-grayscale-1300' : 'text-grayscale-700 ',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
