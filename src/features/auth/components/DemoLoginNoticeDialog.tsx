import { Dialog } from '@/components/ui/Dialog';

type DemoLoginNoticeDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function DemoLoginNoticeDialog({ open, onClose }: DemoLoginNoticeDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="w-[280px] !bg-[rgba(246,246,246,0.9)]">
      <div className="flex flex-col items-stretch gap-2 px-4 py-4">
        <Dialog.Title className="text-center head-18-sb text-grayscale-1200">
          로그인 없이 사용해보기
        </Dialog.Title>
        <p className="break-keep text-center body-15-r text-grayscale-1200">
          해당 계정은 공용 체험 계정으로, 체험 기록이 다른 이용자와 공유됩니다.
        </p>
      </div>

      <div className="h-px bg-black/15" />

      <button
        type="button"
        onClick={onClose}
        className="h-11 text-center head-18-sb text-grayscale-1200"
      >
        확인
      </button>
    </Dialog>
  );
}
