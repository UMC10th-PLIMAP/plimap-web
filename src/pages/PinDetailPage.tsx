import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';

import { reportPin } from '@/api/report';
import { ReportModal } from '@/features/pin/components/ReportModal';
import { SongFeedCard } from '@/features/pin/components/SongFeedCard';
import { useDeleteLikedTrack } from '@/features/pin/queries/useDeleteLikedTrack';
import { useDeletePin } from '@/features/pin/queries/useDeletePin';
import { usePlaceTrackDetail } from '@/features/pin/queries/usePlaceTrackDetail';
import { usePlaceTrackPins } from '@/features/pin/queries/usePlaceTrackPins';
import { usePutLikedTrack } from '@/features/pin/queries/usePutLikedTrack';
import type { GetPlaceTrackPinsResponse, PinFeedEntry, PinSort } from '@/features/pin/types';
import { ConfirmAlertDialog } from '@/features/settings/components/ConfirmAlertDialog';
import { useCurrentPosition } from '@/hooks/useCurrentPosition';
import { useYouTubeClipPlayer, preloadYouTubeIframeApi } from '@/hooks/useYouTubeClipPlayer';
import HeartIcon from '@/assets/icons/heart.svg?react';
import ChangeIcon from '@/assets/icons/change.svg?react';
import { cn } from '@/lib/utils';
import { getGeolocationErrorMessage, type GeolocationFailureReason } from '@/utils/geolocation';

const SORT_LABEL: Record<PinSort, string> = {
  LATEST: '최신순',
  POPULAR: '인기순',
};

type PlaceTrackPin = GetPlaceTrackPinsResponse['data'][number];

function toPinFeedEntry(pin: PlaceTrackPin): PinFeedEntry {
  return {
    id: String(pin.pinId),
    memberId: pin.memberId,
    nickname: pin.writerNickname,
    avatarUrl: pin.writerProfileImage ?? undefined,
    createdAtLabel: pin.staticCreatedAt,
    content: pin.introduction,
    tags: pin.tags,
    likeCount: pin.likeCount,
    liked: pin.userLike,
    isMine: pin.pinByMe,
    clipStartMs: pin.clipStartMs,
  };
}

function toGeolocationFailureReason(error: Error): GeolocationFailureReason {
  const reason = error.message;
  if (
    reason === 'PERMISSION_DENIED' ||
    reason === 'POSITION_UNAVAILABLE' ||
    reason === 'TIMEOUT' ||
    reason === 'UNSUPPORTED'
  ) {
    return reason;
  }
  return 'POSITION_UNAVAILABLE';
}

export default function PinDetailPage() {
  const navigate = useNavigate();
  const { pinId } = useParams<{ pinId: string }>();
  const [sort, setSort] = useState<PinSort>('LATEST');
  const [reportFeedId, setReportFeedId] = useState<string | null>(null);
  const [deletePinId, setDeletePinId] = useState<string | null>(null);
  const currentPositionQuery = useCurrentPosition();
  const { playingKey, toggle: toggleClipPlayback, stop: stopClipPlayback } = useYouTubeClipPlayer();

  const userLatitude = currentPositionQuery.data?.latitude;
  const userLongitude = currentPositionQuery.data?.longitude;

  const { data: pinDetail } = usePlaceTrackDetail({
    placeTrackId: pinId,
    userLatitude,
    userLongitude,
  });
  const { data: pinPages } = usePlaceTrackPins({
    placeTrackId: pinId,
    pinSortType: sort,
    userLatitude,
    userLongitude,
  });

  const { mutate: putLikedTrack, isPending: isPutPending } = usePutLikedTrack();
  const { mutate: deleteLikedTrack, isPending: isDeletePending } = useDeleteLikedTrack();
  const { mutate: deletePin, isPending: isDeletePinPending } = useDeletePin();
  const isLikePending = isPutPending || isDeletePending;

  const pins = pinPages?.pages.flatMap((page) => page.data.map(toPinFeedEntry)) ?? [];
  const locationErrorMessage = currentPositionQuery.isError
    ? getGeolocationErrorMessage(
        toGeolocationFailureReason(
          currentPositionQuery.error instanceof Error
            ? currentPositionQuery.error
            : new Error('POSITION_UNAVAILABLE'),
        ),
      )
    : null;

  useEffect(() => {
    preloadYouTubeIframeApi();
  }, []);

  useEffect(() => {
    stopClipPlayback();
  }, [pinId, sort, stopClipPlayback]);

  const handlePlay = (entry: PinFeedEntry) => {
    if (!pinDetail?.youtubeVideoId) return;

    toggleClipPlayback(entry.id, {
      videoId: pinDetail.youtubeVideoId,
      clipStartMs: entry.clipStartMs,
    });
  };

  const handleLikeClick = () => {
    if (!pinDetail || isLikePending) return;

    const placeTrackId = String(pinDetail.placeTrackId);
    if (pinDetail.userLike) {
      deleteLikedTrack(placeTrackId);
      return;
    }
    putLikedTrack(placeTrackId);
  };

  if (locationErrorMessage) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <TopBar onBack={() => navigate(-1)} className="pt-[env(safe-area-inset-top)]" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
          <p className="body-15-r text-grayscale-500">{locationErrorMessage}</p>
          <button
            type="button"
            onClick={() => void currentPositionQuery.refetch()}
            disabled={currentPositionQuery.isFetching}
            className="cursor-pointer rounded-full bg-pli-black-75 px-4 py-2 body-15-m text-grayscale-100 disabled:opacity-50"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain scrollbar-hide">
      <div className="relative h-[296px] shrink-0 overflow-hidden">
        <img
          src={pinDetail?.albumImageUrl}
          alt={pinDetail?.title}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-12 blur-[4px]"
        />
        <TopBar onBack={() => navigate(-1)} className="pt-[env(safe-area-inset-top)]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-pli-black-100/0 to-pli-black-100"
        />
        <div className="relative z-10 flex h-full flex-col items-center">
          <img
            src={pinDetail?.albumImageUrl}
            alt={pinDetail?.title}
            aria-hidden
            className="size-[112px] rounded-lg object-cover"
          />
          <h1 className="pt-3 head-24-sb text-grayscale-100">{pinDetail?.title}</h1>
          <p className="body-15-r text-grayscale-600">{pinDetail?.artist}</p>

          <button
            type="button"
            aria-pressed={pinDetail?.userLike}
            aria-label={pinDetail?.userLike ? '좋아요 취소' : '좋아요'}
            disabled={isLikePending}
            onClick={handleLikeClick}
            className="mt-[14px] flex h-11 w-full max-w-[183px] cursor-pointer items-center justify-center gap-[5px] rounded-lg bg-pli-black-75 disabled:opacity-100"
          >
            <HeartIcon
              className={cn(
                'size-[18px]',
                pinDetail?.userLike ? 'fill-red text-red' : 'text-grayscale-400',
              )}
              aria-hidden
            />
            <span className="body-15-m text-grayscale-300">{pinDetail?.likeCount}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pt-6">
        <p className="body-15-m text-grayscale-300">{pins.length}명이 등록</p>

        <button
          type="button"
          aria-label="피드 순서 변경"
          className="flex cursor-pointer items-center"
          onClick={() => setSort((current) => (current === 'LATEST' ? 'POPULAR' : 'LATEST'))}
        >
          <p className="body-15-m text-grayscale-300">{SORT_LABEL[sort]}</p>
          <ChangeIcon className="size-6" aria-hidden />
        </button>
      </div>

      <div className="flex flex-col gap-4 px-[11px] pt-[17.5px] pb-[env(safe-area-inset-bottom)]">
        {pins.map((entry) => (
          <SongFeedCard
            key={entry.id}
            entry={entry}
            isPlaying={playingKey === entry.id}
            onPlay={() => handlePlay(entry)}
            onReport={setReportFeedId}
            onNicknameClick={() => {
              if (entry.isMine) {
                navigate('/app/my');
                return;
              }
              navigate(`/app/users/${entry.memberId}`);
            }}
            onEdit={(entryId) => {
              navigate(`/app/pins/${entryId}/edit`, {
                state: {
                  title: pinDetail?.title,
                  artist: pinDetail?.artist,
                  albumImageUrl: pinDetail?.albumImageUrl,
                  introduction: entry.content,
                  tags: entry.tags,
                  feedOpen: true,
                },
              });
            }}
            onDelete={setDeletePinId}
          />
        ))}
      </div>

      <ReportModal
        open={reportFeedId !== null}
        onClose={() => setReportFeedId(null)}
        onSubmit={async (reason, detail) => {
          await reportPin(Number(reportFeedId), reason, detail);
        }}
      />

      <ConfirmAlertDialog
        open={deletePinId !== null}
        onClose={() => {
          if (isDeletePinPending) return;
          setDeletePinId(null);
        }}
        title="해당 핀을 삭제하시겠어요?"
        message="삭제된 핀은 복구할 수 없어요."
        actions={[
          {
            label: '삭제',
            tone: 'danger',
            onClick: () => {
              if (!deletePinId || isDeletePinPending) return;
              deletePin(deletePinId, {
                onSuccess: () => setDeletePinId(null),
              });
            },
          },
          {
            label: '취소',
            onClick: () => {
              if (isDeletePinPending) return;
              setDeletePinId(null);
            },
          },
        ]}
      />
    </div>
  );
}
