import MenuIcon from '@/assets/icons/menu.svg?react';

import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';
import { BottomNav } from '@/components/BottomNav';

export default function ProfileSkeletonPreviewPage() {
  return (
    <div className="flex min-h-full flex-col pb-[calc(env(safe-area-inset-bottom)+108px)]">
      <header className="grid h-[60px] grid-cols-[24px_1fr_24px] items-center px-4">
        <div />
        <h1 className="text-center head-24-sb text-grayscale-100">nickname</h1>
        <button
          type="button"
          aria-label="메뉴"
          className="flex size-6 items-center text-grayscale-100"
        >
          <MenuIcon className="size-6" />
        </button>
      </header>

      <div className="mt-[3px]">
        <ProfileSkeleton />
      </div>

      <BottomNav activeId="my" onTabChange={() => {}} />
    </div>
  );
}
