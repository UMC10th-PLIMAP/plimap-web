import { useState } from 'react';

import { reportMember } from '@/api/report';
import { ReportModal } from '@/features/pin/components/ReportModal';

const MEMBER_ID_ERROR_MESSAGE = '1 이상의 정수 memberId를 입력하세요.';

function parseMemberId(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;

  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return null;

  return parsed;
}

export default function ReportModalPreviewPage() {
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState('1');
  const [memberIdError, setMemberIdError] = useState<string | null>(null);

  return (
    <main className="min-h-dvh bg-[#151518] px-4 py-4 text-grayscale-200 lg:flex lg:items-center lg:justify-center lg:gap-6">
      <div
        className="relative mx-auto shrink-0 overflow-hidden bg-pli-black-100 shadow-2xl lg:mx-0"
        style={{
          width: 'min(402px, calc(100vw - 32px))',
          height: 'min(874px, calc(100dvh - 32px))',
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#151518] to-[#151518]/0">
          <h1 className="text-2xl font-bold">신고 모달 프리뷰 페이지</h1>
          <label className="flex items-center gap-2 text-sm">
            신고 대상 memberId
            <input
              value={memberId}
              onChange={(event) => {
                setMemberId(event.target.value);
                setMemberIdError(null);
              }}
              className="w-16 rounded bg-white/10 px-2 py-1 text-center"
            />
          </label>
          {memberIdError && <p className="text-sm text-red-400">{memberIdError}</p>}
          <button
            type="button"
            onClick={() => {
              if (parseMemberId(memberId) === null) {
                setMemberIdError(MEMBER_ID_ERROR_MESSAGE);
                return;
              }
              setOpen(true);
            }}
            className="m-4 rounded-full bg-neon px-6 py-3 text-grayscale-1250 cursor-pointer"
          >
            신고 모달 실행 (실제 API 호출)
          </button>
        </div>

        <ReportModal
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={async (reason, detail) => {
            const parsedMemberId = parseMemberId(memberId);
            if (parsedMemberId === null) {
              throw new Error(MEMBER_ID_ERROR_MESSAGE);
            }
            await reportMember(parsedMemberId, reason, detail);
          }}
        />
      </div>
    </main>
  );
}
