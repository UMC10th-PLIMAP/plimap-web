import { cn } from '@/lib/utils';
import type { MyPlimapTab } from '@/features/profile/types';

type MyPlimapTabsProps = {
  value: MyPlimapTab;
  onChange: (value: MyPlimapTab) => void;
};

const OPTIONS: { value: MyPlimapTab; label: string }[] = [
  { value: 'liked', label: '찜한 노래' },
  { value: 'all', label: '내 모든 핀' },
];

export function MyPlimapTabs({ value, onChange }: MyPlimapTabsProps) {
  return (
    <div
      role="group"
      aria-label="내 PLIMAP 탭"
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
