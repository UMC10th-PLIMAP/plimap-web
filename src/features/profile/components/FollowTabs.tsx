import type { FollowTab } from '@/features/profile/types';

type FollowTabsProps = {
  value: FollowTab;
  onChange: (value: FollowTab) => void;
};

const OPTIONS: { value: FollowTab; label: string }[] = [
  { value: 'following', label: '팔로잉' },
  { value: 'follower', label: '팔로워' },
  { value: 'friend', label: '친구 찾기' },
];

export function FollowTabs({ value, onChange }: FollowTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="팔로우 목록"
      className="flex w-full border-b border-pli-black-75"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={`relative flex h-[45px] flex-1 items-center justify-center body-15-r cursor-pointer ${selected ? 'text-grayscale-300' : 'text-grayscale-800'}`}
          >
            {option.label}
            {selected ? (
              <span className="absolute inset-x-0 bottom-0 h-[1px] bg-grayscale-300" aria-hidden />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
