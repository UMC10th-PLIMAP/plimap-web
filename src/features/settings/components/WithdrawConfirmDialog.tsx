import { useState } from 'react';

import { Dialog } from '@/components/ui/Dialog';
import AlertIcon from '@/assets/icons/alert.svg?react';
import CheckboxDefaultIcon from '@/assets/icons/checkbox-default.svg?react';
import CheckboxCheckedIcon from '@/assets/icons/checkbox-checked.svg?react';
import { cn } from '@/lib/utils';

const WITHDRAW_NOTICE_ITEMS = [
  '프로필 사진, 자기소개, 팔로워·팔로잉 등 계정 정보는 모두 삭제되며 복구할 수 없어요.',
  "지도에 남긴 음악 핀과 좋아요 기록은 삭제되지 않고 '플리맵사용자' 라는 이름으로 유지돼요.",
  '같은 계정으로 다시 가입할 수 있지만, 이전 데이터와는 연결되지 않아요.',
];

type WithdrawConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
};

export function WithdrawConfirmDialog({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
}: WithdrawConfirmDialogProps) {
  const [agreed, setAgreed] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setAgreed(false);
  }

  return (
    <Dialog open={open} onClose={onClose} className="w-[336px] px-[22px] py-[25px]">
      <div className="flex flex-col items-center gap-6 w-[292px]">
        <div className="flex flex-col items-center gap-2">
          <AlertIcon className="size-9" />
          <div className="flex flex-col items-center gap-1 text-center">
            <Dialog.Title className="body-17-m text-grayscale-100">
              정말 PLIMAP을 떠나시겠어요?
            </Dialog.Title>
            <p className="body-15-r text-grayscale-400">탈퇴 전 아래 변경 사항을 확인해 주세요.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 self-stretch">
          <ul className="flex flex-col gap-3 rounded-xl bg-grayscale-1100 px-4 py-3">
            {WITHDRAW_NOTICE_ITEMS.map((item) => (
              <li key={item} className="etc-13-r text-grayscale-300">
                • {item}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setAgreed((current) => !current)}
            aria-pressed={agreed}
            className="flex items-center gap-1 self-stretch"
          >
            {agreed ? (
              <CheckboxCheckedIcon className="size-7 shrink-0" />
            ) : (
              <CheckboxDefaultIcon className="size-7 shrink-0" />
            )}
            <span className="w-[260px] text-left body-15-m text-grayscale-300">
              위 내용을 확인하였으며, 탈퇴에 동의합니다.
            </span>
          </button>
        </div>

        <div className="flex h-12 items-center gap-4">
          <button
            type="button"
            disabled={!agreed || isSubmitting}
            onClick={onConfirm}
            className={cn(
              'flex h-full w-[138px] items-center justify-center rounded-lg body-17-m text-white disabled:cursor-not-allowed',
              agreed && !isSubmitting ? 'bg-red' : 'bg-[#D29FA0]',
            )}
          >
            {isSubmitting ? '탈퇴 중...' : '탈퇴하기'}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex h-full w-[138px] items-center justify-center rounded-lg bg-grayscale-700 body-17-m text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            취소
          </button>
        </div>
      </div>
    </Dialog>
  );
}
