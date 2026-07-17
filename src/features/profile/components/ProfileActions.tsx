import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ProfileButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
};

export type ProfileActionItem = {
  label: ReactNode;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
};

type ProfileActionsProps = {
  actions: ProfileActionItem[];
};

function ProfileButton({
  children,
  onClick,
  className,
  'aria-label': ariaLabel,
}: ProfileButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'flex h-[37px] w-[158px] items-center justify-center rounded-lg bg-pli-black-50 body-15-m text-grayscale-100',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ProfileActions({ actions }: ProfileActionsProps) {
  return (
    <div className="flex items-center gap-2 px-[17px] pt-1 pb-[12px]">
      {actions.map((action, index) => (
        <ProfileButton
          key={action['aria-label'] ?? `profile-action-${index}`}
          onClick={action.onClick}
          className={action.className}
          aria-label={action['aria-label']}
        >
          {action.label}
        </ProfileButton>
      ))}
    </div>
  );
}
