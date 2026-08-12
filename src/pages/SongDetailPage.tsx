import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import PlayIcon from '@/assets/icons/play.svg?react';
import StopIcon from '@/assets/icons/stop.svg?react';
import PencilIcon from '@/assets/icons/pencil.svg?react';
import rectangleBg from '@/assets/Rectangle.png';
import { useToast } from '@/hooks/useToast';
import { Tag } from '@/components/ui/tag';
import { SongSelectSheet } from '@/features/pin/components/SongSelectSheet';
import {
  MOCK_PREVIEW_DURATION,
  MOCK_WAVEFORM_PEAKS,
  defaultTrimRange,
  percentToTime,
  TAG_OPTIONS,
  timeToPeakIndex,
  timeToPercent,
} from '@/features/pin/data/songPreview';
import { useCreatePin } from '@/features/pin/queries/useCreatePin';
import { useGetPlaybackPreparations } from '@/features/pin/queries/useGetPlaybackPreparations';
import { preloadYouTubeIframeApi, useYouTubeClipPlayer } from '@/hooks/useYouTubeClipPlayer';
import { cn } from '@/lib/utils';
import type { AppOutletContext } from '@/layouts/RootLayout';
import { usePinCreationStore } from '@/store/pinCreationStore';

const INTRO_MAX_LENGTH = 100;
const MIN_TAG_COUNT = 1;
const MAX_TAG_COUNT = 4;
const MIN_TAG_ERROR_MESSAGE = '태그를 최소 1개 선택해 주세요.';
const MAX_TAG_ERROR_MESSAGE = '태그는 최대 4개까지 선택 가능해요.';
const SONG_PREVIEW_PLAY_KEY = 'song-detail-preview';

type TrimRangeDrag = {
  originPercent: number;
  startPercent: number;
  endPercent: number;
};

function percentFromClientX(track: HTMLElement, clientX: number) {
  const rect = track.getBoundingClientRect();
  if (rect.width <= 0) return 0;
  return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
}

function moveFixedTrimRange(
  drag: TrimRangeDrag,
  nextPercent: number,
): { startPercent: number; endPercent: number } {
  const rangeWidth = drag.endPercent - drag.startPercent;
  const delta = nextPercent - drag.originPercent;
  let nextStart = drag.startPercent + delta;
  let nextEnd = drag.endPercent + delta;

  if (nextStart < 0) {
    nextStart = 0;
    nextEnd = rangeWidth;
  } else if (nextEnd > 100) {
    nextEnd = 100;
    nextStart = 100 - rangeWidth;
  }

  return { startPercent: nextStart, endPercent: nextEnd };
}

/** 고정 길이 트림 구간을 좌우로만 이동시키는 포인터/키보드 조작 */
function useFixedTrimDrag(
  trimStartPercent: number,
  trimEndPercent: number,
  onTrimChange: (startPercent: number, endPercent: number) => void,
  onDragEnd?: () => void,
) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<TrimRangeDrag | null>(null);
  const onDragEndRef = useRef(onDragEnd);
  const trimStartRef = useRef(trimStartPercent);
  const trimEndRef = useRef(trimEndPercent);
  const movedRef = useRef(false);

  useEffect(() => {
    onDragEndRef.current = onDragEnd;
  }, [onDragEnd]);

  useEffect(() => {
    trimStartRef.current = trimStartPercent;
    trimEndRef.current = trimEndPercent;
  }, [trimEndPercent, trimStartPercent]);

  const applyShift = (deltaPercent: number) => {
    const startPercent = trimStartRef.current;
    const endPercent = trimEndRef.current;
    const { startPercent: nextStart, endPercent: nextEnd } = moveFixedTrimRange(
      {
        originPercent: startPercent,
        startPercent,
        endPercent,
      },
      startPercent + deltaPercent,
    );
    onTrimChange(nextStart, nextEnd);
    onDragEndRef.current?.();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;

    movedRef.current = false;
    dragRef.current = {
      originPercent: percentFromClientX(track, event.clientX),
      startPercent: trimStartPercent,
      endPercent: trimEndPercent,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track) return;

    movedRef.current = true;
    const { startPercent, endPercent } = moveFixedTrimRange(
      drag,
      percentFromClientX(track, event.clientX),
    );
    onTrimChange(startPercent, endPercent);
  };

  const endDrag = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (movedRef.current) onDragEndRef.current?.();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 5 : 1;
    const rangeWidth = trimEndRef.current - trimStartRef.current;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        applyShift(-step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        applyShift(step);
        break;
      case 'Home':
        event.preventDefault();
        onTrimChange(0, rangeWidth);
        onDragEndRef.current?.();
        break;
      case 'End':
        event.preventDefault();
        onTrimChange(100 - rangeWidth, 100);
        onDragEndRef.current?.();
        break;
      default:
        break;
    }
  };

  return {
    trackRef,
    dragBind: {
      role: 'slider' as const,
      tabIndex: 0,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuenow': Math.round(trimStartPercent),
      'aria-valuetext': `${Math.round(trimStartPercent)}% ~ ${Math.round(trimEndPercent)}%`,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onKeyDown: handleKeyDown,
    },
  };
}

type TrimBarProps = {
  trimStartPercent: number;
  trimEndPercent: number;
  onTrimChange: (startPercent: number, endPercent: number) => void;
  onDragEnd?: () => void;
};

// 구간 선택 그래프 — 기본 길이 고정, 네온 막대만 드래그로 위치 이동
function TrimBar({ trimStartPercent, trimEndPercent, onTrimChange, onDragEnd }: TrimBarProps) {
  const { trackRef, dragBind } = useFixedTrimDrag(
    trimStartPercent,
    trimEndPercent,
    onTrimChange,
    onDragEnd,
  );

  return (
    <div className="relative flex h-11 w-[244px] items-center">
      <div ref={trackRef} className="relative h-1 w-full rounded-full bg-pli-black-50">
        <div
          className="absolute top-1/2 z-10 h-5 -translate-y-1/2 cursor-grab touch-pan-y rounded-full active:cursor-grabbing"
          style={{
            left: `${trimStartPercent}%`,
            width: `${Math.max(0, trimEndPercent - trimStartPercent)}%`,
          }}
          aria-label="미리듣기 구간 이동"
          {...dragBind}
        >
          <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-neon" />
          <span
            aria-hidden
            className="absolute top-1/2 left-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-grayscale-0"
          />
          <span
            aria-hidden
            className="absolute top-1/2 right-0 size-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-grayscale-0"
          />
        </div>
      </div>
    </div>
  );
}

type SongWaveformProps = {
  peaks: readonly number[];
  trimStartIndex: number;
  trimEndIndex: number;
  trimStartPercent: number;
  trimEndPercent: number;
  onTrimChange: (startPercent: number, endPercent: number) => void;
  onDragEnd?: () => void;
};

function SongWaveform({
  peaks,
  trimStartIndex,
  trimEndIndex,
  trimStartPercent,
  trimEndPercent,
  onTrimChange,
  onDragEnd,
}: SongWaveformProps) {
  const { trackRef, dragBind } = useFixedTrimDrag(
    trimStartPercent,
    trimEndPercent,
    onTrimChange,
    onDragEnd,
  );

  return (
    <div ref={trackRef} className="relative mt-1 flex h-[68px] w-full items-center justify-between">
      {peaks.map((height, index) => {
        const isSelected = index >= trimStartIndex && index <= trimEndIndex;

        return (
          <span
            key={index}
            className={cn(
              'w-[3px] shrink-0 rounded-full',
              isSelected ? 'bg-gradient-neon' : 'bg-pli-black-50',
            )}
            style={{ height: `${Math.max(14, height * 100)}%` }}
          />
        );
      })}

      {/* 선택된 웨이브 구간만 드래그 */}
      <div
        className="absolute inset-y-0 z-10 cursor-grab touch-pan-y active:cursor-grabbing"
        style={{
          left: `${trimStartPercent}%`,
          width: `${Math.max(0, trimEndPercent - trimStartPercent)}%`,
        }}
        aria-label="미리듣기 구간 이동"
        {...dragBind}
      />
    </div>
  );
}

type SongPreviewSectionProps = {
  waveformPeaks: readonly number[];
  /** playback-preparations의 durationMs (ms) — 타임라인·풀 재생 길이 */
  durationMs: number;
  youtubeVideoId?: string | null;
  onClipStartChange: (clipStartMs: number) => void;
};

function SongPreviewSection({
  waveformPeaks,
  durationMs,
  youtubeVideoId,
  onClipStartChange,
}: SongPreviewSectionProps) {
  const timelineDurationSec = Math.max(durationMs / 1_000, 1);
  const defaultTrim = defaultTrimRange(timelineDurationSec);
  const [trimStartSec, setTrimStartSec] = useState(defaultTrim.start);
  const [trimEndSec, setTrimEndSec] = useState(defaultTrim.end);
  const [hasSelectedTrim, setHasSelectedTrim] = useState(false);
  const trimRangeRef = useRef({ start: defaultTrim.start, end: defaultTrim.end });

  const { playingKey, toggle, stop } = useYouTubeClipPlayer();
  const isPlaying = playingKey === SONG_PREVIEW_PLAY_KEY;
  const canPlay = Boolean(youtubeVideoId);

  const trimStartPercent = timeToPercent(trimStartSec, timelineDurationSec);
  const trimEndPercent = timeToPercent(trimEndSec, timelineDurationSec);
  const trimStartIndex = timeToPeakIndex(trimStartSec, timelineDurationSec, waveformPeaks.length);
  const trimEndIndex = timeToPeakIndex(trimEndSec, timelineDurationSec, waveformPeaks.length);

  useEffect(() => {
    preloadYouTubeIframeApi();
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop, youtubeVideoId]);

  const playYoutubeClip = (startSec: number, endSec: number) => {
    if (!youtubeVideoId) return;
    toggle(SONG_PREVIEW_PLAY_KEY, {
      videoId: youtubeVideoId,
      clipStartMs: Math.round(startSec * 1_000),
      clipDurationMs: Math.max(1, Math.round((endSec - startSec) * 1_000)),
    });
  };

  const handleTrimChange = (startPercent: number, endPercent: number) => {
    const nextStart = percentToTime(startPercent, timelineDurationSec);
    const nextEnd = percentToTime(endPercent, timelineDurationSec);
    trimRangeRef.current = { start: nextStart, end: nextEnd };
    setTrimStartSec(nextStart);
    setTrimEndSec(nextEnd);
    onClipStartChange(Math.round(nextStart * 1_000));
    stop();
  };

  const handleTrimDragEnd = () => {
    setHasSelectedTrim(true);
    stop();
    playYoutubeClip(trimRangeRef.current.start, trimRangeRef.current.end);
  };

  const handlePlayClick = () => {
    if (!youtubeVideoId) return;

    if (hasSelectedTrim) {
      playYoutubeClip(trimStartSec, trimEndSec);
      return;
    }

    toggle(SONG_PREVIEW_PLAY_KEY, {
      videoId: youtubeVideoId,
      clipStartMs: 0,
      clipDurationMs: durationMs,
    });
  };

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto flex h-11 w-[297px] items-center gap-[25px]">
        <TrimBar
          trimStartPercent={trimStartPercent}
          trimEndPercent={trimEndPercent}
          onTrimChange={handleTrimChange}
          onDragEnd={handleTrimDragEnd}
        />

        <button
          type="button"
          aria-label={isPlaying ? '일시정지' : '재생'}
          aria-pressed={isPlaying}
          disabled={!canPlay}
          onClick={handlePlayClick}
          className="flex size-7 items-center justify-center rounded-full bg-grayscale-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPlaying ? (
            <StopIcon className="size-4.5 text-grayscale-1300" aria-hidden />
          ) : (
            <PlayIcon className="size-4.5 text-grayscale-1300" aria-hidden />
          )}
        </button>
      </div>

      <SongWaveform
        peaks={waveformPeaks}
        trimStartIndex={trimStartIndex}
        trimEndIndex={trimEndIndex}
        trimStartPercent={trimStartPercent}
        trimEndPercent={trimEndPercent}
        onTrimChange={handleTrimChange}
        onDragEnd={handleTrimDragEnd}
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
  const { selectMapPlace } = useOutletContext<AppOutletContext>();
  const toast = useToast();
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
  const [introductionError, setIntroductionError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hasTagLimitError, setHasTagLimitError] = useState(false);
  const [isFeedPublic, setIsFeedPublic] = useState(true);
  const [isSongSelectOpen, setIsSongSelectOpen] = useState(false);
  const [clipStartMs, setClipStartMs] = useState(0);
  const songChangeButtonRef = useRef<HTMLButtonElement>(null);

  const preparedTrack = playbackPreparationQuery.data;
  const coverUrl = preparedTrack?.albumImageUrl || rectangleBg;
  const waveformPeaks = MOCK_WAVEFORM_PEAKS;
  const durationMs = preparedTrack?.durationMs ?? MOCK_PREVIEW_DURATION * 1_000;
  const hasRequiredTags = selectedTags.length >= MIN_TAG_COUNT;
  const tagErrorMessage = hasTagLimitError ? MAX_TAG_ERROR_MESSAGE : null;

  const handleCreatePin = () => {
    if (createPinMutation.isPending) return;

    if (!place || !currentLocation || itunesTrackId === null) {
      toast.error('핀 생성 정보를 확인할 수 없어요.\n노래를 다시 선택해 주세요.');
      return;
    }

    if (!preparedTrack) {
      void playbackPreparationQuery.refetch();
      return;
    }

    const normalizedIntroduction = introduction.trim();
    if (!normalizedIntroduction) {
      setIntroductionError('소개는 필수로 작성해 주세요.');
      return;
    }
    setIntroductionError(null);

    if (!hasRequiredTags) {
      toast.error(MIN_TAG_ERROR_MESSAGE);
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
        onSuccess: (createdPin) => {
          const focusedPin = {
            pinId: createdPin.pinId,
            nickname: createdPin.writerNickname,
            avatarUrl: createdPin.writerProfileImage ?? undefined,
            albumImageUrl: preparedTrack.albumImageUrl,
            introduction: normalizedIntroduction,
            youtubeVideoId: createdPin.youtubeVideoId,
            clipStartMs: createdPin.clipStartMs,
          };
          selectMapPlace({
            id: `place:${createdPin.placeId}`,
            placeId: createdPin.placeId,
            placeName: place.placeName,
            category: '',
            address: place.address,
            distance: place.distanceMeters,
            creatorName: createdPin.writerNickname,
            isMine: true,
            allowTrackDetailAccess: true,
            selectionLocation: {
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
            },
            queryLocation: {
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
            },
            coordinates: place.coordinates,
            focusedFeedPin: focusedPin,
            mapFocusPin: focusedPin,
          });
          resetPinCreation();
          navigate('/app', { replace: true });
          toast.success('PIN 등록이 완료되었어요!');
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : '핀을 생성하지 못했어요. 다시 시도해 주세요.',
          );
        },
      },
    );
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((currentTags) => currentTags.filter((item) => item !== tag));
      setHasTagLimitError(false);
      return;
    }

    if (selectedTags.length >= MAX_TAG_COUNT) {
      setHasTagLimitError(true);
      return;
    }

    setSelectedTags((currentTags) => [...currentTags, tag]);
    setHasTagLimitError(false);
  };

  if (!place || !currentLocation) {
    return <Navigate to="/app/pin/register/place" replace />;
  }

  return (
    <>
      <div className="relative h-full min-h-0">
        <div className="h-full overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+24px)] scrollbar-hide">
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

            <div className="relative z-10 flex h-full flex-col pt-[env(safe-area-inset-top)]">
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
                    playbackPreparationQuery.isFetching ||
                    !hasRequiredTags
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

              <div className="flex w-full flex-col items-center">
                <div className="relative">
                  <img src={coverUrl} alt="" className="size-16 rounded-md object-cover" />

                  <button
                    ref={songChangeButtonRef}
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

                <div className="mt-3.5 w-full min-w-0 px-15 text-center">
                  <h2 className="body-17-m text-grayscale-0 line-clamp-2">
                    {preparedTrack?.title ??
                      (playbackPreparationQuery.isError
                        ? '노래 정보를 불러오지 못했어요.'
                        : '노래 정보를 불러오고 있어요.')}
                  </h2>
                  <p className="body-15-r text-grayscale-500">{preparedTrack?.artistName}</p>
                </div>

                <SongPreviewSection
                  key={preparedTrack?.youtubeVideoId ?? 'preview-loading'}
                  waveformPeaks={waveformPeaks}
                  durationMs={durationMs}
                  youtubeVideoId={preparedTrack?.youtubeVideoId}
                  onClipStartChange={setClipStartMs}
                />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3 px-[15px]">
            <div className="flex items-center gap-2">
              <h3 className="body-15-r text-grayscale-300">소개</h3>
              {introductionError ? (
                <p id="song-intro-error" role="alert" className="etc-13-r text-red">
                  {introductionError}
                </p>
              ) : introduction.length >= INTRO_MAX_LENGTH ? (
                <p id="song-intro-limit" aria-live="polite" className="etc-13-r text-red">
                  소개는 최대 100자까지 가능
                </p>
              ) : null}
            </div>
            <div className="relative rounded-xl bg-pli-black-85 p-5 h-[156px]">
              <label htmlFor="song-intro" className="sr-only">
                소개
              </label>
              <textarea
                id="song-intro"
                value={introduction}
                onChange={(event) => {
                  const nextIntroduction = event.target.value.slice(0, INTRO_MAX_LENGTH);
                  setIntroduction(nextIntroduction);
                  if (nextIntroduction.trim()) setIntroductionError(null);
                }}
                placeholder="이 음악을 들었을 때 나의 기분은?"
                aria-invalid={Boolean(introductionError)}
                aria-describedby={
                  introductionError
                    ? 'song-intro-error'
                    : introduction.length >= INTRO_MAX_LENGTH
                      ? 'song-intro-limit'
                      : undefined
                }
                className="body-17-r min-h-[156px] w-full resize-none text-grayscale-300 outline-none placeholder:text-grayscale-1100"
              />
              <span
                className={cn(
                  'absolute bottom-3 right-4 etc-13-r',
                  introduction.length >= INTRO_MAX_LENGTH ? 'text-red' : 'text-grayscale-600',
                )}
              >
                {introduction.length}/{INTRO_MAX_LENGTH}
              </span>
            </div>
          </section>

          <section className="px-4 pt-6">
            <div className="flex items-center gap-2">
              <h3 className="flex items-center gap-1 body-15-r text-grayscale-300">
                태그 <span className="etc-13-r text-grayscale-700">(최소 1개)</span>
              </h3>
              {tagErrorMessage ? (
                <p id="song-tag-error" aria-live="polite" className="etc-13-r text-red">
                  {tagErrorMessage}
                </p>
              ) : null}
            </div>
            <div
              role="group"
              aria-label="태그 선택"
              aria-describedby={tagErrorMessage ? 'song-tag-error' : undefined}
              className="grid grid-cols-5 justify-items-center gap-x-2 gap-y-3 pt-3"
            >
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
            finalFocusRef={songChangeButtonRef}
            onSelect={(selected) => {
              navigate(`/app/song/detail/${selected.itunesTrackId}`, { replace: true });
            }}
          />
        </div>
      </div>
    </>
  );
}
