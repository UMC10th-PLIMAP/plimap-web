import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import PlayIcon from '@/assets/icons/play.svg?react';
import PencilIcon from '@/assets/icons/pencil.svg?react';
import rectangleBg from '@/assets/Rectangle.png';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import { Tag } from '@/components/ui/tag';
import { SongSelectSheet } from '@/features/pin/components/SongSelectSheet';
import {
  DEFAULT_TRIM_END_INDEX,
  DEFAULT_TRIM_START_INDEX,
  MOCK_PREVIEW_DURATION,
  MOCK_WAVEFORM_PEAKS,
  peaksToTrimRange,
  TAG_OPTIONS,
  timeToPercent,
} from '@/features/pin/data/songPreview';
import { useCreatePin } from '@/features/pin/queries/useCreatePin';
import { useGetPlaybackPreparations } from '@/features/pin/queries/useGetPlaybackPreparations';
import { useAudioPreview } from '@/hooks/useAudioPreview';
import { cn } from '@/lib/utils';
import { usePinCreationStore } from '@/store/pinCreationStore';

const INTRO_MAX_LENGTH = 100;
const MAX_TAG_COUNT = 4;
const CREATION_TOAST_DURATION_MS = 2_000;

type CreationToast = {
  attempt: number;
  message: string;
};

type TrimBarProps = {
  trimStartPercent: number;
  trimEndPercent: number;
};

function TrimBar({ trimStartPercent, trimEndPercent }: TrimBarProps) {
  return (
    <div className="relative h-1.5 w-[244px] rounded-full bg-pli-black-50">
      <div
        className="absolute inset-y-0 rounded-full bg-neon"
        style={{
          left: `${trimStartPercent}%`,
          right: `${100 - trimEndPercent}%`,
        }}
      />

      <span
        aria-hidden
        className="absolute top-1/2 z-10 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-grayscale-0"
        style={{ left: `${trimStartPercent}%` }}
      />
      <span
        aria-hidden
        className="absolute top-1/2 z-10 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-grayscale-0"
        style={{ left: `${trimEndPercent}%` }}
      />
    </div>
  );
}
type SongWaveformProps = {
  peaks: readonly number[];
  trimStartIndex: number;
  trimEndIndex: number;
};

function SongWaveform({ peaks, trimStartIndex, trimEndIndex }: SongWaveformProps) {
  return (
    <div className="flex h-[72px] items-center gap-1.5 px-1.5" aria-hidden>
      {peaks.map((height, index) => {
        const isSelected = index >= trimStartIndex && index <= trimEndIndex;

        return (
          <span
            key={index}
            className={cn(
              'w-[3px] rounded-full',
              isSelected ? 'bg-gradient-neon' : 'bg-pli-black-50',
            )}
            style={{ height: `${height * 70}%` }}
          />
        );
      })}
    </div>
  );
}

type SongPreviewSectionProps = {
  waveformPeaks: readonly number[];
  durationSec: number;
  previewUrl?: string | null;
};

function SongPreviewSection({ waveformPeaks, durationSec, previewUrl }: SongPreviewSectionProps) {
  const trim = peaksToTrimRange(
    DEFAULT_TRIM_START_INDEX,
    DEFAULT_TRIM_END_INDEX,
    waveformPeaks,
    durationSec,
  );
  const { isPlaying, toggle, canPlay } = useAudioPreview({ src: previewUrl });

  const trimStartPercent = timeToPercent(trim.start, durationSec);
  const trimEndPercent = timeToPercent(trim.end, durationSec);

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto flex h-11 w-[297px] items-center gap-[25px]">
        <TrimBar trimStartPercent={trimStartPercent} trimEndPercent={trimEndPercent} />

        <button
          type="button"
          aria-label={isPlaying ? '일시정지' : '재생'}
          aria-pressed={isPlaying}
          disabled={!canPlay}
          onClick={() => {
            void toggle();
          }}
          className="flex size-7 items-center justify-center rounded-full bg-grayscale-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPlaying ? (
            <span className="flex items-center gap-[3px]" aria-hidden>
              <span className="h-3.5 w-[3px] rounded-full bg-grayscale-1200" />
              <span className="h-3.5 w-[3px] rounded-full bg-grayscale-1200" />
            </span>
          ) : (
            <PlayIcon className="size-4.5 text-grayscale-1200" aria-hidden />
          )}
        </button>
      </div>

      <SongWaveform
        peaks={waveformPeaks}
        trimStartIndex={DEFAULT_TRIM_START_INDEX}
        trimEndIndex={DEFAULT_TRIM_END_INDEX}
      />
    </div>
  );
}

function FeedVisibilityToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 rounded-full transition-colors',
        checked ? 'bg-neon' : 'bg-pli-black-50',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-0.5 left-0.5 size-6 rounded-full bg-grayscale-0 transition-transform',
          checked && 'translate-x-5',
        )}
      />
    </button>
  );
}

export default function SongDetailPage() {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();
  const place = usePinCreationStore((state) => state.place);
  const currentLocation = usePinCreationStore((state) => state.currentLocation);
  const resetPinCreation = usePinCreationStore((state) => state.reset);
  const parsedTrackId = Number(songId);
  const itunesTrackId =
    Number.isSafeInteger(parsedTrackId) && parsedTrackId > 0 ? parsedTrackId : null;
  const playbackPreparationQuery = useGetPlaybackPreparations({
    itunesTrackId: itunesTrackId?.toString(),
    enabled: Boolean(place && currentLocation && itunesTrackId),
  });
  const createPinMutation = useCreatePin();

  const [introduction, setIntroduction] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFeedPublic, setIsFeedPublic] = useState(true);
  const [isSongSelectOpen, setIsSongSelectOpen] = useState(false);
  const [creationToast, setCreationToast] = useState<CreationToast | null>(null);

  const preparedTrack = playbackPreparationQuery.data;
  const coverUrl = preparedTrack?.albumImageUrl || rectangleBg;
  const waveformPeaks = MOCK_WAVEFORM_PEAKS;
  const durationSec = Math.max(
    (preparedTrack?.durationMs ?? MOCK_PREVIEW_DURATION * 1_000) / 1_000,
    1,
  );
  const clipStartMs = Math.round(
    peaksToTrimRange(DEFAULT_TRIM_START_INDEX, DEFAULT_TRIM_END_INDEX, waveformPeaks, durationSec)
      .start * 1_000,
  );

  const showCreationToast = (message: string) => {
    setCreationToast((currentToast) => ({
      attempt: (currentToast?.attempt ?? 0) + 1,
      message,
    }));
  };

  const handleCreatePin = () => {
    if (createPinMutation.isPending) return;

    if (!place || !currentLocation || itunesTrackId === null) {
      showCreationToast('핀 생성 정보를 확인할 수 없어요. 노래를 다시 선택해 주세요.');
      return;
    }

    if (!preparedTrack) {
      void playbackPreparationQuery.refetch();
      return;
    }

    const normalizedIntroduction = introduction.trim();
    if (!normalizedIntroduction) {
      showCreationToast('소개를 입력해 주세요.');
      return;
    }

    createPinMutation.mutate(
      {
        userLatitude: currentLocation.lat,
        userLongitude: currentLocation.lng,
        placeId: place.placeId,
        itunesTrackId,
        clipStartMs,
        introduction: normalizedIntroduction,
        tags: selectedTags,
        feedOpen: isFeedPublic,
      },
      {
        onSuccess: () => {
          resetPinCreation();
          navigate('/app', { replace: true });
        },
        onError: (error) => {
          showCreationToast(
            error instanceof Error ? error.message : '핀을 생성하지 못했어요. 다시 시도해 주세요.',
          );
        },
      },
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      }

      if (prev.length >= MAX_TAG_COUNT) {
        return prev;
      }

      return [...prev, tag];
    });
  };

  if (!place || !currentLocation) {
    return <Navigate to="/app/pin/register/place" replace />;
  }

  return (
    <ToastProvider duration={CREATION_TOAST_DURATION_MS}>
      <div className="relative flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <section className="relative w-full overflow-hidden pb-4">
            <img
              src={coverUrl}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-12 blur-[4px]"
            />

            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-pli-black-100/0 to-pli-black-100"
            />

            <div className="relative z-10 flex h-full flex-col">
              <div className="flex h-[64px] items-center justify-between px-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={createPinMutation.isPending}
                  className="cursor-pointer body-17-r text-grayscale-400 disabled:cursor-not-allowed disabled:text-grayscale-700"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleCreatePin}
                  disabled={
                    createPinMutation.isPending ||
                    playbackPreparationQuery.isPending ||
                    playbackPreparationQuery.isFetching
                  }
                  aria-busy={
                    createPinMutation.isPending || playbackPreparationQuery.isFetching || undefined
                  }
                  className="cursor-pointer body-17-m text-grayscale-0 disabled:cursor-not-allowed disabled:text-grayscale-700"
                >
                  {createPinMutation.isPending
                    ? '등록 중'
                    : playbackPreparationQuery.isFetching
                      ? '준비 중'
                      : playbackPreparationQuery.isError
                        ? '다시 시도'
                        : '등록'}
                </button>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative">
                  <img src={coverUrl} alt="" className="size-16 rounded-md object-cover" />

                  <button
                    type="button"
                    aria-label="노래 변경"
                    onClick={() => setIsSongSelectOpen(true)}
                    className="absolute -bottom-3 -right-4 flex cursor-pointer items-center justify-center rounded-[50px] border-4 border-transparent bg-origin-border [background-clip:padding-box,border-box] [background-image:linear-gradient(#777777,#777777),linear-gradient(135deg,#1C1D21_0%,#1C1D21_100%)]"
                  >
                    <div className="size-6">
                      <PencilIcon aria-hidden />
                    </div>
                  </button>
                </div>

                <div className="mt-3.5 text-center">
                  <h2 className="body-17-m text-grayscale-0">
                    {preparedTrack?.title ??
                      (playbackPreparationQuery.isError
                        ? '노래 정보를 불러오지 못했어요.'
                        : '노래 정보를 불러오고 있어요.')}
                  </h2>
                  <p className="body-15-r text-grayscale-500">{preparedTrack?.artistName}</p>
                </div>

                <SongPreviewSection
                  key={preparedTrack?.previewUrl ?? 'preview-loading'}
                  waveformPeaks={waveformPeaks}
                  durationSec={durationSec}
                  previewUrl={preparedTrack?.previewUrl}
                />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3 px-[15px]">
            <h3 className="body-15-r text-grayscale-300">소개</h3>
            <div className="relative rounded-xl bg-pli-black-85 p-5 h-[156px]">
              <label htmlFor="song-intro" className="sr-only">
                소개
              </label>
              <textarea
                id="song-intro"
                value={introduction}
                onChange={(event) => setIntroduction(event.target.value.slice(0, INTRO_MAX_LENGTH))}
                placeholder="이 음악을 들었을 때 나의 기분은?"
                className="body-17-r min-h-[156px] w-full resize-none text-grayscale-300 outline-none placeholder:text-grayscale-1100"
              />
              <span className="absolute bottom-3 right-4 etc-13-r text-grayscale-600">
                {introduction.length}/{INTRO_MAX_LENGTH}
              </span>
            </div>
          </section>

          <section className="px-4 pt-6">
            <h3 className="body-15-r text-grayscale-300">
              태그 <span className="etc-13-r text-grayscale-700">(최대 4개)</span>
            </h3>
            <div className="grid grid-cols-5 justify-items-center gap-x-2 gap-y-3 pt-3">
              {TAG_OPTIONS.map((tag) => {
                const isSelected = selectedTags.includes(tag);

                return (
                  <Tag
                    key={tag}
                    variant={isSelected ? 'selected' : 'default'}
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag}
                  </Tag>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-3 px-4 pt-6">
            <span className="body-15-r text-grayscale-300">피드 공개</span>
            <FeedVisibilityToggle checked={isFeedPublic} onChange={setIsFeedPublic} />
          </section>

          <SongSelectSheet
            open={isSongSelectOpen}
            onClose={() => setIsSongSelectOpen(false)}
            onSelect={(selected) => {
              navigate(`/app/song/detail/${selected.itunesTrackId}`, { replace: true });
            }}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+23px)] z-50 flex justify-center">
          {creationToast ? (
            <Toast key={`${creationToast.message}:${creationToast.attempt}`} defaultOpen>
              {creationToast.message}
            </Toast>
          ) : null}
          <ToastViewport />
        </div>
      </div>
    </ToastProvider>
  );
}
