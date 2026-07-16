import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import ShareIcon from '@/assets/icons/share.svg?react';

type ProfileButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

type ProfileActionsProps = {
  onEditProfile?: () => void;
  onMyPlimap?: () => void;
  onShare?: () => void;
};

function ProfileButton({ children, onClick, className }: ProfileButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-[37px] w-[158px] items-center justify-center rounded-lg bg-pli-black-50 body-15-m text-grayscale-100',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ProfileActions({ onEditProfile, onMyPlimap, onShare }: ProfileActionsProps) {
  return (
    <div className="flex items-center gap-2 px-[17px] pt-1 pb-[12px]">
      <ProfileButton onClick={onEditProfile}>프로필 편집</ProfileButton>
      <ProfileButton onClick={onMyPlimap}>내 PLIMAP</ProfileButton>
      <ProfileButton onClick={onShare} className="size-9 ">
        <ShareIcon className="size-5" />
      </ProfileButton>
    </div>
  );
}
