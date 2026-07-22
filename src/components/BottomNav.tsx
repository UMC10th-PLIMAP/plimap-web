import type { ReactNode } from 'react';
import HomeIcon from '@/assets/icons/home.svg?react';
import PlimapIcon from '@/assets/icons/plimap.svg?react';
import MyIcon from '@/assets/icons/user-placeholder.svg?react';

const NAV_ITEMS = [
  { id: 'home', label: 'HOME', icon: HomeIcon },
  { id: 'plimap', label: 'PLIMAP', icon: PlimapIcon },
  { id: 'my', label: 'MY', icon: MyIcon },
] as const;

export type NavItemId = (typeof NAV_ITEMS)[number]['id'];

export interface BottomNavProps {
  activeId: NavItemId;
  onTabChange: (id: NavItemId) => void;
  /** 내비게이션 바로 위에 띄울 콘텐츠 (예: 핀 등록 버튼). 간격은 이 컴포넌트가 관리한다. */
  children?: ReactNode;
}

export function BottomNav({ activeId, onTabChange, children }: BottomNavProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-5 px-4 pb-[calc(env(safe-area-inset-bottom)+24px)]">
      {children ? (
        <div className="pointer-events-auto flex w-full justify-end">{children}</div>
      ) : null}
      <nav
        aria-label="하단 내비게이션"
        className="pointer-events-auto flex w-full max-w-[360px] h-[84px] items-center justify-between rounded-[32px] px-2.5 bg-pli-black-100/80  backdrop-blur-[4px]"
      >
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeId === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex  flex-col w-[120px] items-center justify-center gap-1 rounded-[24px] py-2.5 ${
                isActive ? 'bg-pli-black-75 text-grayscale-100' : 'text-grayscale-800'
              }`}
            >
              <Icon className="size-6 " aria-hidden />
              <span
                className={`etc-13-r ${isActive ? 'text-grayscale-100' : 'text-grayscale-700'}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
