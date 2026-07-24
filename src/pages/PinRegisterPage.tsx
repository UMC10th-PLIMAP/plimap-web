import { useNavigate } from 'react-router-dom';
import BackIcon from '@/assets/icons/back.svg?react';

export default function PinRegisterPage() {
  const navigate = useNavigate();

  return (
    <main className="flex h-full flex-col bg-pli-black-85">
      <div className="flex shrink-0 items-center px-[15px] pt-[calc(env(safe-area-inset-top)+16px)]">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기">
          <BackIcon className="size-7 text-grayscale-400" />
        </button>
        <h1 className="ml-2 body-17-m text-grayscale-100">핀 등록</h1>
      </div>
    </main>
  );
}
