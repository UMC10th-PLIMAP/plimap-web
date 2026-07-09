import { type ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import {
  NICKNAME_MAX_LENGTH,
  NICKNAME_MIN_LENGTH,
  validateNickname,
} from '@/features/auth/utils/validateNickname';
import { Button } from '@/components/ui/button';

type NicknameMessageTone = 'neutral' | 'success' | 'error';

const NICKNAME_MESSAGE_TONE_CLASS: Record<NicknameMessageTone, string> = {
  neutral: 'text-grayscale-400',
  success: 'text-green',
  error: 'text-red',
};

export default function NicknameSetupPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [touched, setTouched] = useState(false);

  const errorMessage = validateNickname(nickname);
  const isValid = errorMessage === null;

  const message = !touched
    ? {
        text: `한글, 영어, 숫자 포함 ${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자까지 가능해요.`,
        tone: 'neutral' as const,
      }
    : isValid
      ? { text: '사용 가능한 닉네임이에요.', tone: 'success' as const }
      : { text: errorMessage, tone: 'error' as const };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNickname(event.target.value);
    setTouched(true);
  };

  const handleSubmit = () => {
    // TODO: 백엔드 닉네임 중복 확인/필터링 API 연동 후 프로필 사진 등록 페이지로 이동
  };

  return (
    <div className="flex h-full min-h-screen flex-col">
      <TopBar onBack={() => navigate(-1)} />

      <div className="flex flex-col gap-8 px-4 pt-[44px]">
        <h1 className="head-28-m whitespace-pre-line text-grayscale-0">
          {'사용할 닉네임을 \n입력해주세요.'}
        </h1>

        <div className="flex flex-col gap-3">
          <div
            className={`flex h-[68px] items-center justify-between rounded-xl border px-5 py-2 ${
              nickname.length > 0 ? 'border-grayscale-600' : 'border-grayscale-1000'
            }`}
          >
            <label htmlFor="nickname" className="sr-only">
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              autoComplete="off"
              value={nickname}
              onChange={handleChange}
              maxLength={NICKNAME_MAX_LENGTH}
              placeholder="닉네임 입력"
              aria-invalid={message.tone === 'error'}
              className="body-18-r w-full bg-transparent text-grayscale-100 outline-none placeholder:text-grayscale-700"
            />
            <span
              className={`body-15-r shrink-0 ${
                nickname.length > 0 ? 'text-grayscale-300' : 'text-grayscale-500'
              }`}
            >
              {nickname.length}/{NICKNAME_MAX_LENGTH}
            </span>
          </div>
          <p className={`body-15-r ${NICKNAME_MESSAGE_TONE_CLASS[message.tone]}`}>{message.text}</p>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center px-[10px] pb-[52px]">
        <Button variant={'cta'} size={'cta'} disabled={!isValid} onClick={handleSubmit}>
          다음
        </Button>
      </div>
    </div>
  );
}
