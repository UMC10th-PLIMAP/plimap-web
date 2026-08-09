import NextIcon from '@/assets/icons/next.svg?react';
import { TermCheckbox } from '@/features/auth/components/TermCheckbox';

type TermRowProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  onViewDetail: () => void;
};

export function TermRow({ label, checked, onToggle, onViewDetail }: TermRowProps) {
  return (
    <div className="flex w-full items-center gap-3">
      <TermCheckbox checked={checked} onToggle={onToggle} label={label} />
      <span onClick={onToggle} className="body-17-r flex-1 cursor-pointer text-grayscale-300">
        {label}
      </span>
      <button
        type="button"
        onClick={onViewDetail}
        aria-label={`${label} 전문 보기`}
        className="flex size-7 shrink-0 items-center justify-center text-grayscale-100"
      >
        <NextIcon />
      </button>
    </div>
  );
}
