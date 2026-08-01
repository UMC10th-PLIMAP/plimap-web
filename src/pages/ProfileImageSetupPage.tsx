import { type ChangeEvent, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper, { type Area, type Point } from 'react-easy-crop';

import { ApiError } from '@/api/client';
import CameraIcon from '@/assets/icons/camera.svg?react';
import UserPlaceholderIcon from '@/assets/icons/user-placeholder.svg?react';
import { TopBar } from '@/components/ui/TopBar';
import { Button } from '@/components/ui/button';
import { uploadProfileImage } from '@/api/member';
import { getCroppedImageBlob } from '@/features/profile/utils/cropImage';
import { useOnboardingStore } from '@/store/onboardingStore';

type Step = 'select' | 'crop' | 'done';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const INVALID_FORMAT_MESSAGE =
  '올릴 수 없는 파일 형식이에요. JPG, PNG 또는 WebP 파일로 선택해 주세요.';
const UPLOAD_FAILED_MESSAGE = '파일 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.';
const IMAGE_PROCESSING_FAILED_MESSAGE = '이미지 처리에 실패했어요. 다시 시도해 주세요.';

export default function ProfileImageSetupPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setOnboardingProfileImage = useOnboardingStore((state) => state.setProfileImage);

  const [step, setStep] = useState<Step>('select');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    setStep('crop');
  };

  const handleCropComplete = (_croppedArea: Area, cropAreaPixels: Area) => {
    setCroppedAreaPixels(cropAreaPixels);
  };

  const handleConfirmCrop = async () => {
    if (!imageSrc || !croppedAreaPixels || isProcessing) return;
    setIsProcessing(true);

    try {
      const file = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      URL.revokeObjectURL(imageSrc);
      setImageSrc(null);

      if (croppedImageUrl) {
        URL.revokeObjectURL(croppedImageUrl);
      }
      setCroppedImageFile(file);
      setCroppedImageUrl(URL.createObjectURL(file));
      setStep('done');
    } catch (error) {
      console.error('크롭 실패:', error);
      alert(IMAGE_PROCESSING_FAILED_MESSAGE);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCropBack = () => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc(null);
    setStep(croppedImageUrl ? 'done' : 'select');
  };

  const handleNext = async () => {
    if (!croppedImageFile || isUploading) return;
    setIsUploading(true);

    try {
      const { imageUrl } = await uploadProfileImage(croppedImageFile);
      setOnboardingProfileImage(croppedImageFile, imageUrl);
      // 다음 페이지에서 이미지 로딩 시간을 줄이기 위해 브라우저 캐시에 미리 올려둠
      new Image().src = imageUrl;
      navigate('/app/onboarding/welcome');
    } catch (error) {
      alert(error instanceof ApiError ? error.message : UPLOAD_FAILED_MESSAGE);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    navigate('/app/onboarding/welcome');
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

  if (step === 'crop' && imageSrc) {
    return (
      <div className="relative h-screen w-full bg-pli-black-100">
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
            disabled={isProcessing}
          >
            완료
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen flex-col">
      <TopBar onBack={() => navigate(-1)} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-[52px] px-4 pt-[44px]">
        <h1 className="head-28-m w-full whitespace-pre-line text-grayscale-0">
          {'프로필 사진을 \n등록해주세요.'}
        </h1>

        <button
          type="button"
          onClick={handlePickImage}
          aria-label="프로필 사진 선택"
          className="relative size-[236px] shrink-0"
        >
          <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-pli-black-75">
            {step === 'done' && croppedImageUrl ? (
              <img src={croppedImageUrl} alt="" className="size-full object-cover" />
            ) : (
              <UserPlaceholderIcon className="size-[140px] text-pli-black-50" />
            )}
          </div>
          <span className="absolute right-0 bottom-0 flex size-[72px] items-center justify-center rounded-full bg-grayscale-300">
            <CameraIcon className="size-10 text-grayscale-1250" />
          </span>
        </button>
      </div>

      <div className="mt-auto flex flex-col items-center gap-4 px-[10px] pb-[52px]">
        <button
          type="button"
          onClick={handleSkip}
          className="body-17-r text-grayscale-300 underline"
        >
          지금은 건너뛸래요
        </button>
        <Button
          variant="cta"
          size="cta"
          className="w-full"
          disabled={step !== 'done' || isUploading}
          onClick={handleNext}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
