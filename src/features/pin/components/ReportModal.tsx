import { useState } from 'react';

import { Dialog } from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';
import { REPORT_REASONS, type ReportReason } from '@/features/pin/constants/reportReasons';
import CloseIcon from '@/assets/icons/close.svg?react';
import RadioDefaultIcon from '@/assets/icons/radio-default.svg?react';
import RadioSelectedIcon from '@/assets/icons/radio-selected.svg?react';

type ReportModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (reason: ReportReason, detail?: string) => void;
};

type Step = 'select' | 'complete';

export function ReportModal({ open, onClose, onSubmit }: ReportModalProps) {
  const [step, setStep] = useState<Step>('select');
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');
  const [prevOpen, setPrevOpen] = useState(open);

  // 스와이프/뒤로가기 등 onClick을 거치지 않는 닫힘까지 포함해 다음에 열 때 처음 상태로 리셋한다.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setStep('select');
      setReason(null);
      setDetail('');
    }
  }

  const isOtherSelected = reason === 'OTHER';
  const canSubmit = reason !== null && (!isOtherSelected || detail.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit || !reason) return;
    onSubmit?.(reason, isOtherSelected ? detail.trim() : undefined);
    setStep('complete');
  };

  if (step === 'complete') {
    return (
      <Dialog open={open} onClose={onClose} className="w-[288px]">
        <div className="px-7 pb-5 pt-7 text-center">
          <Dialog.Title className="body-17-m text-grayscale-200">신고 완료</Dialog.Title>
        </div>

        <p className="whitespace-pre-line break-keep px-7 pb-6 text-center body-15-r text-grayscale-300">
          {
            '신고가 정상적으로 접수되었어요.\n보내주신 의견은 서비스 운영 정책에 따라 검토될 예정이에요.'
          }
        </p>

        <div className="flex flex-col items-center pb-7">
          <button
            type="button"
            onClick={onClose}
            className="w-60 rounded-lg bg-red px-2.5 py-4 body-17-m text-grayscale-100"
          >
            확인
          </button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} className="w-[332px]">
      <div className="flex items-center justify-between px-7 pb-5 pt-7">
        <Dialog.Title className="body-17-m text-grayscale-300">신고 사유</Dialog.Title>
        <button type="button" onClick={onClose} aria-label="닫기">
          <CloseIcon className="size-6 text-grayscale-300" />
        </button>
      </div>

      <div className="flex flex-col gap-4 px-7 pb-6">
        <div className="grid grid-cols-2 gap-x-7 gap-y-4">
          {REPORT_REASONS.map(({ value, label }) => {
            const isSelected = reason === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setReason(value)}
                aria-pressed={isSelected}
                className="flex items-center gap-3 body-15-r text-grayscale-300"
              >
                {isSelected ? (
                  <RadioSelectedIcon className="size-6 shrink-0" />
                ) : (
                  <RadioDefaultIcon className="size-6 shrink-0" />
                )}
                {label}
              </button>
            );
          })}
        </div>

        {isOtherSelected && (
          <textarea
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="내용을 입력하세요"
            rows={3}
            className="h-[100px] w-full resize-none rounded-lg border border-grayscale-1000 px-4 py-3 body-15-r text-grayscale-200 outline-none placeholder:text-grayscale-700"
          />
        )}
      </div>

      <div className="flex flex-col items-center pb-7">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={cn(
            'w-[276px] rounded-lg px-2.5 py-4 body-17-m text-grayscale-100',
            canSubmit ? 'bg-red' : 'bg-pli-black-10',
          )}
        >
          신고하기
        </button>
      </div>
    </Dialog>
  );
}
