import NextIcon from '@/assets/icons/next.svg?react';
import { cn } from '@/lib/utils';

type SettingsRowProps = {
  label: string;
  onClick?: () => void;
  /** 다음 화면으로 이동하는 행인지 여부. false면 화살표 없이 즉시 실행되는 액션(로그아웃 등)으로 표시한다. */
  chevron?: boolean;
  tone?: 'default' | 'danger';
  /** 아직 연결되지 않은 placeholder 행(예: 준비 중인 기능)에 사용한다. */
  disabled?: boolean;
};

export function SettingsRow({
  label,
  onClick,
  chevron = true,
  tone = 'default',
  disabled = false,
}: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-between rounded-xl py-2 pl-3 pr-2 text-left transition-colors focus-visible:bg-pli-black-75 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className={cn('body-15-m', tone === 'danger' ? 'text-red' : 'text-grayscale-300')}>
        {label}
      </span>

      {chevron && (
        <span
          className="flex size-6 shrink-0 items-center justify-center text-grayscale-100"
          aria-hidden
        >
          <NextIcon className="size-6" />
        </span>
      )}
    </button>
  );
}
