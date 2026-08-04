import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Cropper, { type Area, type Point } from 'react-easy-crop';

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
import { useUploadProfileImage } from '@/features/profile/queries/useUploadProfileImage';
import { getCroppedImageBlob } from '@/features/profile/utils/cropImage';
import { INTRODUCTION_MAX_LENGTH } from '@/features/profile/utils/validateIntroduction';
import { NAME_MAX_LENGTH } from '@/features/profile/utils/validateName';
import { NICKNAME_MAX_LENGTH } from '@/features/profile/utils/validateNickname';
import type { MyProfileResponse } from '@/types/member.type';

type ImageStep = 'idle' | 'crop';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const INVALID_FORMAT_MESSAGE =
  '올릴 수 없는 파일 형식이에요. JPG, PNG 또는 WebP 파일로 선택해 주세요.';
const IMAGE_PROCESSING_FAILED_MESSAGE = '이미지 처리에 실패했어요. 다시 시도해 주세요.';
const PROFILE_UPDATE_FAILED_MESSAGE = '프로필 수정에 실패했어요. 다시 시도해 주세요.';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageStep, setImageStep] = useState<ImageStep>('idle');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isCropProcessing, setIsCropProcessing] = useState(false);

  const { nicknameField, nameField, introductionField, isDirty, isValid, buildPayload } =
    useProfileEditForm({
      nickname: profile.nickname ?? '',
      name: profile.name ?? '',
      introduction: profile.introduction ?? '',
    });

  const { mutateAsync: saveProfile, isPending: isSavingProfile } = useUpdateMyProfile();
  const { mutateAsync: uploadImage, isPending: isUploadingImage } = useUploadProfileImage();
  const isSubmitting = isSavingProfile || isUploadingImage;

  const isImageChanged = croppedImageFile !== null;
  const canSubmit = (isDirty || isImageChanged) && isValid;
  const profileImageSrc = croppedImageUrl ?? profile.profileImageUrl;

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      alert(INVALID_FORMAT_MESSAGE);
      return;
    }

    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }

    setImageSrc(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setImageStep('crop');
  };

  const handleCropComplete = (_croppedArea: Area, cropAreaPixels: Area) => {
    setCroppedAreaPixels(cropAreaPixels);
  };

  const handleConfirmCrop = async () => {
    if (!imageSrc || !croppedAreaPixels || isCropProcessing) return;
    setIsCropProcessing(true);

    try {
      const file = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      URL.revokeObjectURL(imageSrc);
      setImageSrc(null);

      if (croppedImageUrl) {
        URL.revokeObjectURL(croppedImageUrl);
      }
      setCroppedImageFile(file);
      setCroppedImageUrl(URL.createObjectURL(file));
      setImageStep('idle');
    } catch (error) {
      console.error('크롭 실패:', error);
      alert(IMAGE_PROCESSING_FAILED_MESSAGE);
    } finally {
      setIsCropProcessing(false);
    }
  };

  const handleCropBack = () => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc(null);
    setImageStep('idle');
  };

  const handleSubmit = async () => {
    try {
      if (croppedImageFile) {
        await uploadImage(croppedImageFile);
        setCroppedImageFile(null);
      }

      const payload = buildPayload();
      if (Object.keys(payload).length > 0) {
        await saveProfile(payload);
      }

      navigate('/app/my', { replace: true });
    } catch (error) {
      alert(error instanceof ApiError ? error.message : PROFILE_UPDATE_FAILED_MESSAGE);
    }
  };

  // 컴포넌트 언마운트 시 메모리 누수 방지
  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  useEffect(() => {
    return () => {
      if (croppedImageUrl) URL.revokeObjectURL(croppedImageUrl);
    };
  }, [croppedImageUrl]);

  if (imageStep === 'crop' && imageSrc) {
    return (
      <div className="fixed inset-0 z-50 h-screen w-full bg-pli-black-100">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
        <TopBar onBack={handleCropBack} className="absolute top-[55px] left-0 z-10 w-full" />
        <div className="absolute bottom-0 left-1/2 z-10 flex w-full max-w-[402px] -translate-x-1/2 flex-col items-center px-[10px] pb-[52px]">
          <Button
            variant="cta"
            size="cta"
            className="w-full"
            onClick={handleConfirmCrop}
            disabled={isCropProcessing}
          >
            완료
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="flex flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="mt-[37px] flex flex-col items-center">
        <button
          type="button"
          onClick={handlePickImage}
          aria-label="프로필 사진 변경"
          className="relative size-22 shrink-0"
        >
          <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-pli-black-75">
            {profileImageSrc ? (
              <img src={profileImageSrc} alt="프로필 사진" className="size-full object-cover" />
            ) : (
              <UserPlaceholderIcon className="size-[52px] text-pli-black-50" />
            )}
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
          disabled={!canSubmit || isSubmitting}
        >
          저장하기
        </Button>
      </div>
    </form>
  );
}
