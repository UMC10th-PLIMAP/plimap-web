import { Dialog } from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';

type ConfirmAlertAction = {
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
};

type ConfirmAlertDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  /** 왼쪽부터 순서대로 렌더링된다 (로그아웃/회원탈퇴 모달의 버튼 순서가 서로 다름) */
  actions: [ConfirmAlertAction, ConfirmAlertAction];
};

/** iOS 스타일 확인 얼럿. 로그아웃/회원탈퇴 확인에 공용으로 쓴다. */
export function ConfirmAlertDialog({
  open,
  onClose,
  title,
  message,
  actions,
}: ConfirmAlertDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="w-[280px] !bg-[rgba(246,246,246,0.9)]">
      <div className="flex flex-col items-stretch gap-2 px-4 py-4">
        <p className="text-center head-18-sb text-grayscale-1200">{title}</p>
        <p className="whitespace-pre-line text-center body-15-r text-grayscale-1200">{message}</p>
      </div>

      <div className="h-px bg-black/15" />

      <div className="flex h-11 items-stretch">
        {actions.map((action, index) => (
          <div key={action.label} className="flex flex-1 items-stretch">
            {index > 0 && <div className="w-px bg-black/15" />}
            <button
              type="button"
              onClick={action.onClick}
              className={cn(
                'flex-1 text-center head-18-sb',
                action.tone === 'danger' ? 'text-red' : 'text-grayscale-1200',
              )}
            >
              {action.label}
            </button>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
