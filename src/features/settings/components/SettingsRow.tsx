import ChevronRightIcon from '@/assets/icons/chevron-right.svg?react';
import { cn } from '@/lib/utils';

type SettingsRowProps = {
  label: string;
  onClick?: () => void;
  /** 다음 화면으로 이동하는 행인지 여부. false면 화살표 없이 즉시 실행되는 액션(로그아웃 등)으로 표시한다. */
  chevron?: boolean;
  tone?: 'default' | 'danger';
};

export function SettingsRow({
  label,
  onClick,
  chevron = true,
  tone = 'default',
}: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl py-2 pl-3 pr-2 text-left transition-colors focus-visible:bg-pli-black-75 focus-visible:outline-none"
    >
      <span className={cn('body-15-m', tone === 'danger' ? 'text-red' : 'text-grayscale-300')}>
        {label}
      </span>

      {chevron && (
        <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden>
          <ChevronRightIcon />
        </span>
      )}
    </button>
  );
}
