import CloseIcon from '@/assets/icons/close.svg?react';
import { Dialog } from '@/components/ui/Dialog';

type ProfileShareDialogProps = {
  open: boolean;
  onClose: () => void;
  onCopied: () => void;
  nickname: string;
  name?: string | null;
  profileImageUrl?: string | null;
};

export function ProfileShareDialog({
  open,
  onClose,
  onCopied,
  nickname,
  name,
  profileImageUrl,
}: ProfileShareDialogProps) {
  const handleCopyNickname = async () => {
    try {
      await navigator.clipboard.writeText(nickname);
      onClose();
      onCopied();
    } catch {
      // 복사 실패 시 모달은 유지
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="w-[300px] overflow-visible rounded-2xl bg-grayscale-100 px-5 pb-5 pt-12"
    >
      <div className="relative flex flex-col items-center">
        <div className="absolute left-1/2 top-[-25px] size-[88px] -translate-x-1/2 -translate-y-[70%] overflow-hidden rounded-full border-10 border-grayscale-100 ">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-pli-black-50" />
          )}
        </div>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute right-0 top-[-28px] flex size-6 items-center justify-center text-grayscale-700 cursor-pointer"
        >
          <CloseIcon className="size-6 cursor-pointer" />
        </button>
        <Dialog.Title className="head-18-sb text-grayscale-1250">{nickname}</Dialog.Title>
        {name ? <p className="body-17-r text-grayscale-1000">{name}</p> : null}
        <p className="mt-4 text-center body-15-r text-grayscale-700">
          아래 복사 버튼을 누른 뒤,
          <br />
          원하는 곳에 붙여넣어 전달해 보세요!
        </p>
        <button
          type="button"
          onClick={() => {
            void handleCopyNickname();
          }}
          className="mt-[18px] flex h-[56px] w-full items-center justify-center rounded-lg bg-pli-black-50 body-15-m text-grayscale-100 cursor-pointer"
        >
          <span className="text-neon-2 body-15-sb">{nickname}</span>
          <span>&nbsp;님의 닉네임 복사하기</span>
        </button>
      </div>
    </Dialog>
  );
}
