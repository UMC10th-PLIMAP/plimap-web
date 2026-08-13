import CloseIcon from '@/assets/icons/close.svg?react';
import { Dialog } from '@/components/ui/Dialog';
import { getAccountSanctionReasonLabel } from '@/features/auth/utils/accountSanctionReason';
import { formatSanctionDateTime } from '@/features/auth/utils/formatSanctionDateTime';
import { getSuspensionPeriodLabel } from '@/features/auth/utils/suspensionPeriod';
import type { AccountSanctionInfo } from '@/features/auth/types';

type AccountSanctionModalProps = {
  open: boolean;
  sanction: AccountSanctionInfo | null;
  onClose: () => void;
};

export function AccountSanctionModal({ open, sanction, onClose }: AccountSanctionModalProps) {
  if (!sanction) return null;

  const isPermanentlyBanned = sanction.status === 'WITHDRAWN';
  const reasonLabel = getAccountSanctionReasonLabel(sanction.reasonCategory);
  const suspendedUntilLabel = formatSanctionDateTime(sanction.suspendedUntil);
  const periodLabel = getSuspensionPeriodLabel(sanction.period);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="w-[calc(100%-32px)] max-w-[332px] items-end px-[22px] pb-7 pt-5"
    >
      <button type="button" onClick={onClose} aria-label="닫기" className="shrink-0">
        <CloseIcon className="size-6 text-grayscale-300" />
      </button>

      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex w-[248px] flex-col items-center gap-3 text-center text-grayscale-100">
            <Dialog.Title className="head-18-sb w-full break-keep">
              [서비스 이용 제한 안내]
            </Dialog.Title>
            <p className="body-17-m w-full break-keep">
              회원님의 계정은 커뮤니티 가이드라인 위반으로 이용이 제한되었습니다.
            </p>
          </div>

          <div className="flex h-[92px] w-full flex-col items-center justify-center gap-1.5">
            <ul className="flex flex-col break-keep body-15-m text-grayscale-300">
              {reasonLabel && (
                <li>
                  • 제재 사유: {reasonLabel}
                  {sanction.reasonDetail ? ` (${sanction.reasonDetail})` : ''}
                </li>
              )}
              <li>
                • 제재 상태:{' '}
                {isPermanentlyBanned
                  ? '영구 정지'
                  : `누적 ${sanction.penaltyPoint}회차${periodLabel ? ` (${periodLabel})` : ''}`}
              </li>
              {!isPermanentlyBanned && suspendedUntilLabel && (
                <li>• 정지 해제: {suspendedUntilLabel}까지</li>
              )}
            </ul>

            <p className="w-[250px] break-keep text-center etc-13-r text-grayscale-600">
              ※ 누적 4회 제재 시 계정이 자동 탈퇴 처리됩니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg bg-red px-[123px] py-3.5 body-17-m text-grayscale-100"
        >
          확인
        </button>
      </div>
    </Dialog>
  );
}
