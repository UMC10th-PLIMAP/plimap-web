import { cn } from '@/lib/utils';
import type { PinSort } from '@/types/pin';

type SortTabsProps = {
  value: PinSort;
  onChange: (value: PinSort) => void;
  className?: string;
};

const OPTIONS: { value: PinSort; label: string }[] = [
  { value: 'popular', label: '인기순' },
  { value: 'latest', label: '최신순' },
];

export function SortTabs({ value, onChange }: SortTabsProps) {
  return (
    <div className="flex rounded-xl bg-pli-black-75 pl-[4.5px] py-1" role="tablist">
      {OPTIONS.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 bg-pli-black-75 rounded-[10px] py-2.5 body-15-m transition-colors',
              selected ? 'bg-grayscale-200 text-grayscale-1300' : 'text-grayscale-700',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
