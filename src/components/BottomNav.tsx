import { useState } from 'react';

import HomeIcon from '@/assets/icons/home.svg?react';
import PlimapPinIcon from '@/assets/icons/plimap-pin.svg?react';
import UserIcon from '@/assets/icons/user.svg?react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'home', label: 'HOME', icon: HomeIcon },
  { id: 'plimap', label: 'PLIMAP', icon: PlimapPinIcon },
  { id: 'my', label: 'MY', icon: UserIcon },
] as const;

type BottomNavItemId = (typeof NAV_ITEMS)[number]['id'];

type BottomNavProps = {
  activeId?: BottomNavItemId;
  defaultActiveId?: BottomNavItemId;
  onChange?: (id: BottomNavItemId) => void;
};

export function BottomNav({
  activeId: activeIdProp,
  defaultActiveId = 'plimap',
  onChange,
}: BottomNavProps) {
  const [activeId, setActiveId] = useState<BottomNavItemId>(defaultActiveId);
  const currentActiveId = activeIdProp ?? activeId;

  const handleSelect = (id: BottomNavItemId) => {
    if (activeIdProp === undefined) {
      setActiveId(id);
    }

    onChange?.(id);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <nav
        aria-label="하단 내비게이션"
        className="pointer-events-auto flex w-full max-w-[360px] h-[84px] items-center justify-between rounded-[32px] px-2.5 bg-pli-black-100/80   border border-grayscale-700 backdrop-blur-[4px]"
      >
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = currentActiveId === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleSelect(id)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex w-[120px] flex-col items-center justify-center gap-1 rounded-[24px] py-2.5 ',
                isActive ? 'bg-pli-black-50 text-grayscale-100' : 'text-grayscale-600',
              )}
            >
              <Icon className="size-6 " aria-hidden />
              <span className="text-[10px] leading-[140%] font-semibold tracking-[0.02em]">
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
