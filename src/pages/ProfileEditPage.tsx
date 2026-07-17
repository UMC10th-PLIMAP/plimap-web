import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CameraIcon from '@/assets/icons/camera.svg?react';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/ui/TopBar';
// 닉네임 검증
import {
  NICKNAME_MAX_LENGTH,
  NICKNAME_MIN_LENGTH,
  validateNickname,
} from '@/features/auth/utils/validateNickname';
import { MOCK_MY_PROFILE } from '@/features/profile/constants/mockMyProfile';

import {
  BIO_MAX_LENGTH,
  NAME_MAX_LENGTH,
  validateBio,
  validateName,
} from '@/features/profile/utils/validateProfileEdit';
import { cn } from '@/lib/utils';

type FieldMessageTone = 'neutral' | 'error';

const MESSAGE_TONE_CLASS: Record<FieldMessageTone, string> = {
  neutral: 'text-grayscale-400',
  error: 'text-red',
};

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(MOCK_MY_PROFILE.nickname);
  const [name, setName] = useState(MOCK_MY_PROFILE.name);
  const [bio, setBio] = useState(MOCK_MY_PROFILE.bio);

  const [nicknameTouched, setNicknameTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [bioTouched, setBioTouched] = useState(false);

  const nicknameError = validateNickname(nickname);
  const nameError = validateName(name);
  const bioError = validateBio(bio);

  const isNicknameValid = nicknameError === null;
  const isNameValid = nameError === null;
  const isBioValid = bioError === null;
  const canSubmit = isNicknameValid && isNameValid && isBioValid;

  const nicknameMessage = !nicknameTouched
    ? {
        text: `한글, 영어, 숫자 포함 ${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자까지 가능해요.`,
        tone: 'neutral' as const,
      }
    : isNicknameValid
      ? {
          text: `한글, 영어, 숫자 포함 ${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자까지 가능해요.`,
          tone: 'neutral' as const,
        }
      : { text: nicknameError, tone: 'error' as const };

  const nameMessage = !nameTouched
    ? { text: `한글 ${NAME_MAX_LENGTH}자까지 가능해요.`, tone: 'neutral' as const }
    : isNameValid
      ? { text: `한글 ${NAME_MAX_LENGTH}자까지 가능해요.`, tone: 'neutral' as const }
      : { text: nameError, tone: 'error' as const };

  const bioMessage = !bioTouched
    ? {
        text: `한글, 영어, 숫자, 특수문자 포함 ${BIO_MAX_LENGTH}자까지 가능해요.`,
        tone: 'neutral' as const,
      }
    : isBioValid
      ? {
          text: `한글, 영어, 숫자, 특수문자 포함 ${BIO_MAX_LENGTH}자까지 가능해요.`,
          tone: 'neutral' as const,
        }
      : { text: bioError, tone: 'error' as const };

  const handleSubmit = () => {
    if (!canSubmit) return;
    // TODO: 프로필 수정 API 연동
    navigate(-1);
  };

  return (
    <div className="flex h-full min-h-screen flex-col">
      <TopBar title="프로필 편집" titleWeight="medium" onBack={() => navigate(-1)} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <div className="flex flex-col px-[16.5px]">
          <div className="flex justify-center pt-[37px]">
            <div className="relative size-22">
              <div className="size-full rounded-full">
                <img src={MOCK_MY_PROFILE.avatarUrl} alt="프로필 이미지" />
              </div>
              <button
                type="button"
                aria-label="프로필 사진 변경"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex size-[27px] items-center justify-center rounded-full bg-grayscale-300 cursor-pointer"
              >
                <CameraIcon className="px-[7px] py-[8px]  text-grayscale-1250" />
              </button>
            </div>
          </div>

          <div className="pt-[48px] flex flex-col gap-5">
            <div className="flex items-start gap-[41px]">
              <label htmlFor="edit-nickname" className="mt-3 w-12 body-15-r text-grayscale-300">
                닉네임
              </label>
              <div className="flex flex-col gap-2">
                <div
                  className={cn(
                    'flex w-[288px] h-[45px] items-center justify-between rounded-lg border border-grayscale-1000 px-3',
                  )}
                >
                  <input
                    id="edit-nickname"
                    type="text"
                    autoComplete="off"
                    value={nickname}
                    maxLength={NICKNAME_MAX_LENGTH}
                    onChange={(event) => {
                      setNickname(event.target.value);
                      setNicknameTouched(true);
                    }}
                    aria-invalid={nicknameMessage.tone === 'error'}
                    aria-describedby="edit-nickname-message"
                    className="body-15-r w-full text-grayscale-100 outline-none placeholder:text-grayscale-700"
                    placeholder="내용 입력"
                  />
                  {/* 숫자 부분은 오른쪽에 위치 */}
                  <span
                    className={`body-15-r text-right
                      ${nicknameMessage.tone === 'error' ? 'text-red' : 'text-grayscale-400'}`}
                  >
                    {nickname.length}/{NICKNAME_MAX_LENGTH}
                  </span>
                </div>
                <p
                  id="edit-nickname-message"
                  aria-live="polite"
                  className={`body-15-r ${MESSAGE_TONE_CLASS[nicknameMessage.tone]}`}
                >
                  {nicknameMessage.text}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <label
                htmlFor="edit-name"
                className="mt-3 w-12 shrink-0 body-15-r text-grayscale-300"
              >
                이름
              </label>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div
                  className={cn(
                    'flex h-11 items-center justify-between rounded-xl border px-4',
                    name.length > 0 ? 'border-grayscale-600' : 'border-grayscale-1000',
                  )}
                >
                  <input
                    id="edit-name"
                    type="text"
                    autoComplete="off"
                    value={name}
                    maxLength={NAME_MAX_LENGTH}
                    onChange={(event) => {
                      setName(event.target.value);
                      setNameTouched(true);
                    }}
                    aria-invalid={nameMessage.tone === 'error'}
                    aria-describedby="edit-name-message"
                    className="body-15-r w-full bg-transparent text-grayscale-100 outline-none placeholder:text-grayscale-700"
                    placeholder="내용 입력"
                  />
                  <span className="body-15-r shrink-0 text-grayscale-500">
                    {name.length}/{NAME_MAX_LENGTH}
                  </span>
                </div>
                <p
                  id="edit-name-message"
                  aria-live="polite"
                  className={`body-15-r ${MESSAGE_TONE_CLASS[nameMessage.tone]}`}
                >
                  {nameMessage.text}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <label htmlFor="edit-bio" className="mt-3 w-12 shrink-0 body-15-r text-grayscale-300">
                소개
              </label>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div
                  className={cn(
                    'relative rounded-xl border px-4 py-3',
                    bio.length > 0 ? 'border-grayscale-600' : 'border-grayscale-1000',
                  )}
                >
                  <textarea
                    id="edit-bio"
                    value={bio}
                    maxLength={BIO_MAX_LENGTH}
                    rows={4}
                    onChange={(event) => {
                      setBio(event.target.value);
                      setBioTouched(true);
                    }}
                    aria-invalid={bioMessage.tone === 'error'}
                    aria-describedby="edit-bio-message"
                    className="body-15-r w-full resize-none bg-transparent text-grayscale-100 outline-none placeholder:text-grayscale-700"
                    placeholder="내용 입력"
                  />
                  <span className="body-15-r absolute bottom-3 right-4 text-grayscale-500">
                    {bio.length}/{BIO_MAX_LENGTH}
                  </span>
                </div>
                <p
                  id="edit-bio-message"
                  aria-live="polite"
                  className={`body-15-r ${MESSAGE_TONE_CLASS[bioMessage.tone]}`}
                >
                  {bioMessage.text}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col items-center px-[10px] pb-[52px] pt-6">
          <Button type="submit" variant="cta" size="cta" disabled={canSubmit}>
            저장하기
          </Button>
        </div>
      </form>
    </div>
  );
}
