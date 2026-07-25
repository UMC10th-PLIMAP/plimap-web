import { type ChangeEvent, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper, { type Area, type Point } from 'react-easy-crop';

import CameraIcon from '@/assets/icons/camera.svg?react';
import UserPlaceholderIcon from '@/assets/icons/user-placeholder.svg?react';
import { TopBar } from '@/components/ui/TopBar';
import { Button } from '@/components/ui/button';
import { getCroppedImageBlob } from '@/features/auth/utils/cropImage';

type Step = 'select' | 'crop' | 'done';

export default function ProfileImageSetupPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('select');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

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
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      URL.revokeObjectURL(imageSrc);
      setImageSrc(null);

      if (croppedImageUrl) {
        URL.revokeObjectURL(croppedImageUrl);
      }
      setCroppedImageUrl(URL.createObjectURL(blob));
      setStep('done');
    } catch (error) {
      console.error('크롭 실패:', error);
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

  const handleNext = () => {
    // TODO: 프로필 사진 등록 API 연동 후 다음 화면으로 이동
    navigate('/app/onboarding/welcome');
  };

  const handleSkip = () => {
    // TODO: 프로필 사진 등록 건너뛰고 다음 화면으로 이동
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
        accept="image/*"
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
          disabled={step !== 'done'}
          onClick={handleNext}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
