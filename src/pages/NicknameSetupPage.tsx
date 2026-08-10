import { type ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/ui/TopBar';
import { checkNicknameAvailability } from '@/api/member';
import {
  NICKNAME_MAX_LENGTH,
  NICKNAME_MIN_LENGTH,
  NICKNAME_UNAVAILABLE_MESSAGE,
  validateNickname,
} from '@/features/profile/utils/validateNickname';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useOnboardingStore } from '@/store/onboardingStore';

type NicknameMessageTone = 'neutral' | 'success' | 'error';

const NICKNAME_MESSAGE_TONE_CLASS: Record<NicknameMessageTone, string> = {
  neutral: 'text-grayscale-400',
  success: 'text-green',
  error: 'text-red',
};

const NICKNAME_CHECK_DEBOUNCE_MS = 400;

export default function NicknameSetupPage() {
  const navigate = useNavigate();
  const setOnboardingNickname = useOnboardingStore((state) => state.setNickname);
  const [nickname, setNickname] = useState('');
  const [touched, setTouched] = useState(false);

  const formatError = validateNickname(nickname);
  const debouncedNickname = useDebouncedValue(nickname, NICKNAME_CHECK_DEBOUNCE_MS);
  const isNicknameSynced = debouncedNickname === nickname;

  const {
    data: checkResult,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['nickname-check', debouncedNickname],
    queryFn: () => checkNicknameAvailability(debouncedNickname),
    enabled: touched && validateNickname(debouncedNickname) === null,
  });

  const isAvailable = isNicknameSynced && !isFetching && checkResult?.available === true;
  const isValid = formatError === null && isAvailable;

  const message = (() => {
    if (!touched) {
      return {
        text: `한글, 영어, 숫자 포함 ${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자까지 가능해요.`,
        tone: 'neutral' as const,
      };
    }
    if (formatError) {
      return { text: formatError, tone: 'error' as const };
    }
    if (!isNicknameSynced || isFetching) {
      return { text: '', tone: 'neutral' as const };
    }
    if (isError) {
      return { text: '닉네임 확인에 실패했어요. 다시 시도해주세요.', tone: 'error' as const };
    }
    if (!checkResult) {
      return { text: '', tone: 'neutral' as const };
    }
    if (checkResult.available) {
      return { text: '사용 가능한 닉네임이에요.', tone: 'success' as const };
    }
    return {
      text: NICKNAME_UNAVAILABLE_MESSAGE[checkResult.reason],
      tone: 'error' as const,
    };
  })();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNickname(event.target.value);
    setTouched(true);
  };

  const handleSubmit = () => {
    setOnboardingNickname(nickname);
    navigate('/app/onboarding/profile-image');
  };

  return (
    <form
      className="flex h-full min-h-screen flex-col pt-[env(safe-area-inset-top)]"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
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
              aria-describedby="nickname-message"
              className="body-18-r w-full bg-transparent text-grayscale-100 outline-none placeholder:text-grayscale-700"
            />
            <span
              className={`body-15-r shrink-0 ${
                nickname.length > NICKNAME_MAX_LENGTH
                  ? 'text-red'
                  : nickname.length > 0
                    ? 'text-grayscale-300'
                    : 'text-grayscale-500'
              }`}
            >
              {nickname.length}/{NICKNAME_MAX_LENGTH}
            </span>
          </div>
          <p
            id="nickname-message"
            aria-live="polite"
            className={`body-15-r ${NICKNAME_MESSAGE_TONE_CLASS[message.tone]}`}
          >
            {message.text}
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center px-[10px] pb-[52px]">
        <Button type="submit" variant={'cta'} size={'cta'} className="w-full" disabled={!isValid}>
          다음
        </Button>
      </div>
    </form>
  );
}
