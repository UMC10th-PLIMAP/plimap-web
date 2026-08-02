import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { getMyProfile } from '@/api/member';
import { ApiError } from '@/api/client';
import CameraIcon from '@/assets/icons/camera.svg?react';
import UserPlaceholderIcon from '@/assets/icons/user-placeholder.svg?react';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/ui/TopBar';
import { ProfileTextAreaField } from '@/features/profile/components/ProfileTextAreaField';
import { ProfileTextField } from '@/features/profile/components/ProfileTextField';
import { useProfileEditForm } from '@/features/profile/hooks/useProfileEditForm';
import { useUpdateMyProfile } from '@/features/profile/queries/useUpdateMyProfile';
import { INTRODUCTION_MAX_LENGTH } from '@/features/profile/utils/validateIntroduction';
import { NAME_MAX_LENGTH } from '@/features/profile/utils/validateName';
import { NICKNAME_MAX_LENGTH } from '@/features/profile/utils/validateNickname';
import type { MyProfileResponse } from '@/types/member.type';

const PROFILE_UPDATE_FAILED_MESSAGE = '프로필 수정에 실패했어요. 다시 시도해주세요.';
const PROFILE_LOAD_FAILED_MESSAGE = '프로필을 불러오지 못했어요.';

export default function ProfileEditPage() {
  const navigate = useNavigate();

  const { data: profile, isError } = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
    staleTime: Infinity,
  });

  return (
    <div className="flex h-full min-h-screen flex-col">
      <TopBar title="프로필 편집" titleWeight="medium" onBack={() => navigate(-1)} />
      {isError && (
        <p className="mt-8 text-center body-15-r text-grayscale-600">
          {PROFILE_LOAD_FAILED_MESSAGE}
        </p>
      )}
      {profile && <ProfileEditForm profile={profile} />}
    </div>
  );
}

function ProfileEditForm({ profile }: { profile: MyProfileResponse }) {
  const navigate = useNavigate();

  const { nicknameField, nameField, introductionField, canSubmit, buildPayload } =
    useProfileEditForm({
      nickname: profile.nickname,
      name: profile.name ?? '',
      introduction: profile.introduction ?? '',
    });

  const { mutate: saveProfile, isPending } = useUpdateMyProfile();

  const handleSubmit = () => {
    saveProfile(buildPayload(), {
      onSuccess: () => navigate('/app/my', { replace: true }),
      onError: (error) => {
        alert(error instanceof ApiError ? error.message : PROFILE_UPDATE_FAILED_MESSAGE);
      },
    });
  };

  return (
    <form
      className="flex flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <div className="mt-[37px] flex flex-col items-center">
        <button
          type="button"
          onClick={() => {
            // TODO: 프로필 사진 변경 연동
          }}
          aria-label="프로필 사진 변경"
          className="relative size-22 shrink-0"
        >
          <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-pli-black-75">
            <UserPlaceholderIcon className="size-[52px] text-pli-black-50" />
          </div>
          <span className="absolute right-0 bottom-0 flex size-[27px] items-center justify-center rounded-full bg-grayscale-300">
            <CameraIcon className="size-[15px] text-grayscale-1250" />
          </span>
        </button>
      </div>

      <div className="mt-12 flex flex-col gap-5 px-4">
        <ProfileTextField
          id="nickname"
          label="닉네임"
          placeholder="내용 입력"
          countLimit={NICKNAME_MAX_LENGTH}
          maxLength={NICKNAME_MAX_LENGTH}
          {...nicknameField}
        />
        <ProfileTextField
          id="name"
          label="이름"
          placeholder="내용 입력"
          countLimit={NAME_MAX_LENGTH}
          maxLength={NAME_MAX_LENGTH}
          {...nameField}
        />
        <ProfileTextAreaField
          id="introduction"
          label="소개"
          placeholder="내용 입력"
          countLimit={INTRODUCTION_MAX_LENGTH}
          maxLength={INTRODUCTION_MAX_LENGTH}
          {...introductionField}
        />
      </div>

      <div className="mt-auto flex flex-col items-center px-[10px] pb-[52px]">
        <Button
          type="submit"
          variant="cta"
          size="cta"
          className="w-full"
          disabled={!canSubmit || isPending}
        >
          저장하기
        </Button>
      </div>
    </form>
  );
}
