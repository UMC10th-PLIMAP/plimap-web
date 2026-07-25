import { useState } from 'react';

import { ReportModal } from '@/features/pin/components/ReportModal';

export default function ReportModalPreviewPage() {
  const [open, setOpen] = useState(false);

  return (
    <main className="min-h-dvh bg-[#151518] px-4 py-4 text-grayscale-200 lg:flex lg:items-center lg:justify-center lg:gap-6">
      <div
        className="relative mx-auto shrink-0 overflow-hidden bg-pli-black-100 shadow-2xl lg:mx-0"
        style={{
          width: 'min(402px, calc(100vw - 32px))',
          height: 'min(874px, calc(100dvh - 32px))',
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#151518] to-[#151518]/0">
          <h1 className="text-2xl font-bold">신고 모달 프리뷰 페이지</h1>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="m-4 rounded-full bg-neon px-6 py-3 text-grayscale-1250 cursor-pointer"
          >
            신고 모달 실행
          </button>
        </div>

        <ReportModal
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={(reason, detail) =>
            console.log(`onSubmit: reason=${reason}${detail ? `, detail=${detail}` : ''}`)
          }
        />
      </div>
    </main>
  );
}
