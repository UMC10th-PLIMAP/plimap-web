import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import CameraIcon from '@/assets/icons/camera.svg?react';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/ui/TopBar';
import { AI_RECOMMENDED_TRACK, analyzePlacePhoto } from '@/features/ai-mvp/mockAi';
import { usePinCreationStore } from '@/store/pinCreationStore';

type AnalysisState = 'idle' | 'analyzing' | 'done' | 'error';

export default function PinPhotoAnalysisPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const place = usePinCreationStore((state) => state.place);
  const currentLocation = usePinCreationStore((state) => state.currentLocation);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisState>('idle');

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!place || !currentLocation) {
    return <Navigate to="/app/pin/register/place" replace />;
  }

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus('error');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus('analyzing');
    try {
      await analyzePlacePhoto();
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="flex min-h-full flex-col bg-pli-black-100 pt-[env(safe-area-inset-top)]">
      <TopBar onBack={() => navigate(-1)} title="장소 분위기 분석" titleWeight="regular" />

      <div className="flex flex-1 flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <div className="mb-5 mt-3">
          <p className="body-15-r text-grayscale-500">{place.placeName}</p>
          <h1 className="mt-1 head-24-sb text-grayscale-100">이 장소는 어떤 음악일까요?</h1>
        </div>

        <button
          type="button"
          aria-label={previewUrl ? '장소 사진 다시 촬영 또는 선택' : '장소 사진 촬영 또는 선택'}
          onClick={() => inputRef.current?.click()}
          className="relative flex aspect-[3/4] w-full max-h-[520px] items-center justify-center overflow-hidden rounded-3xl border border-pli-black-50 bg-pli-black-85"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="분석할 장소" className="size-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-4 text-grayscale-400">
              <span className="flex size-16 items-center justify-center rounded-full bg-pli-black-75 text-neon-2">
                <CameraIcon className="size-8" aria-hidden />
              </span>
              <span className="body-17-m">사진 찍기 또는 앨범에서 선택</span>
            </span>
          )}

          {status === 'analyzing' ? (
            <span
              role="status"
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 text-center"
            >
              <span
                aria-hidden
                className="size-12 animate-spin rounded-full border-4 border-white/20 border-t-neon"
              />
              <span className="body-17-m text-grayscale-100">장소의 분위기를 분석하고 있어요</span>
            </span>
          ) : null}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(event) => void handlePhotoChange(event)}
        />

        {status === 'done' ? (
          <section
            aria-label="AI 추천 음악"
            className="relative -mt-28 mx-4 rounded-3xl border border-white/10 bg-pli-black-85/95 p-5 shadow-2xl backdrop-blur"
          >
            <p className="etc-13-sb text-neon-2">AI PICK</p>
            <p className="mt-2 head-20-sb text-grayscale-100">{AI_RECOMMENDED_TRACK.trackName}</p>
            <p className="body-15-r text-grayscale-400">{AI_RECOMMENDED_TRACK.artistName}</p>
            <p className="mt-3 body-15-r text-grayscale-300">
              밝은 색감과 열린 공간에 어울리는 힘찬 곡이에요.
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                variant="cancel"
                size="bt"
                className="flex-1"
                onClick={() => navigate('/app/song/list')}
              >
                건너뛰기
              </Button>
              <Button
                variant="confirm"
                size="bt"
                className="flex-1 bg-neon"
                onClick={() => navigate(`/app/song/detail/${AI_RECOMMENDED_TRACK.itunesTrackId}`)}
              >
                이 노래 선택
              </Button>
            </div>
          </section>
        ) : status === 'error' ? (
          <p role="alert" className="mt-4 text-center body-15-r text-red">
            사진을 분석하지 못했어요. 이미지 파일을 다시 선택해 주세요.
          </p>
        ) : (
          <p className="mt-4 text-center body-15-r text-grayscale-500">
            사진은 분석 화면에서만 사용되며 서버에 저장되지 않아요.
          </p>
        )}
      </div>
    </main>
  );
}
