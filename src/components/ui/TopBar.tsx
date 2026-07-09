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
  className?: string;
};

export function TopBar({
  title,
  titleWeight = 'regular',
  onBack,
  onClose,
  className,
}: TopBarProps) {
  return (
    <div className={`grid h-[60px] grid-cols-[28px_1fr_28px] items-center px-4 ${className ?? ''}`}>
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

      {title && (
        <p className={`${TITLE_CLASS_BY_WEIGHT[titleWeight]} truncate text-center`}>{title}</p>
      )}

      <div className="flex items-center justify-end">
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
