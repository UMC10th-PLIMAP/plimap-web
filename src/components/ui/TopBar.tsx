import type { ReactNode } from 'react';

import BackIcon from '@/assets/icons/back.svg?react';
import CloseIcon from '@/assets/icons/close.svg?react';

type TopBarTitleWeight = 'regular' | 'medium' | 'semibold';

const TITLE_CLASS_BY_WEIGHT: Record<TopBarTitleWeight, string> = {
  regular: 'body-17-r text-grayscale-300',
  medium: 'head-20-m text-grayscale-300',
  semibold: 'head-24-sb text-grayscale-100',
};

type TopBarProps = {
  title?: string;
  titleWeight?: TopBarTitleWeight;
  onBack?: () => void;
  onClose?: () => void;
  /** 닫기 버튼 왼쪽에 추가로 넣을 액션(예: 북마크 버튼). */
  trailing?: ReactNode;
  className?: string;
};

export function TopBar({
  title,
  titleWeight = 'regular',
  onBack,
  onClose,
  trailing,
  className,
}: TopBarProps) {
  return (
    <div className={`grid min-h-15 grid-cols-[28px_1fr_28px] items-center px-4 ${className ?? ''}`}>
      <div className="flex items-center">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로가기"
            className="flex size-7 shrink-0 items-center justify-center text-grayscale-100"
          >
            <BackIcon />
          </button>
        )}
      </div>

      {/* title이 없어도 그리드 3칸(back/title/close)을 항상 채워야, close 버튼이
          가운데(1fr) 칸으로 auto-placement 되어 왼쪽으로 밀리지 않는다. */}
      <p className={`${TITLE_CLASS_BY_WEIGHT[titleWeight]} truncate text-center`}>{title}</p>

      <div className="flex items-center justify-end gap-3">
        {trailing}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex size-6 shrink-0 items-center justify-center text-grayscale-100"
          >
            <CloseIcon />
          </button>
        )}
      </div>
    </div>
  );
}
