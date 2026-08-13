import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { RequestErrorScreen } from '@/components/ui/RequestErrorScreen';
import { TopBar } from '@/components/ui/TopBar';
import { PinDetailSkeleton } from '@/components/skeletons/PinDetailSkeleton';
import { useToast } from '@/hooks/useToast';

import { reportPin } from '@/api/report';
import { ReportModal } from '@/features/pin/components/ReportModal';
import { PinFeedCard } from '@/features/pin/components/PinFeedCard';
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

const LIKE_FAILED_MESSAGE = '좋아요를 변경하지 못했어요. 다시 시도해 주세요.';
const DELETE_FAILED_MESSAGE = '핀을 삭제하지 못했어요. 다시 시도해 주세요.';
const REPORT_FAILED_MESSAGE = '신고를 접수하지 못했어요. 다시 시도해 주세요.';

type PlaceTrackPin = GetPlaceTrackPinsResponse['data'][number];

type PinDetailLocationState = {
  userLatitude?: number;
  userLongitude?: number;
  placeAccessToken?: string;
};

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
  const toast = useToast();
  const location = useLocation();
  const locationState = (location.state as PinDetailLocationState | null) ?? null;
  const { pinId } = useParams<{ pinId: string }>();
  const [sort, setSort] = useState<PinSort>('LATEST');
  const [reportFeedId, setReportFeedId] = useState<string | null>(null);
  const [deletePinId, setDeletePinId] = useState<string | null>(null);

  const hasLocationFromState =
    locationState?.userLatitude != null &&
    locationState?.userLongitude != null &&
    Number.isFinite(locationState.userLatitude) &&
    Number.isFinite(locationState.userLongitude);

  const currentPositionQuery = useCurrentPosition({
    enabled: !hasLocationFromState,
  });
  // 지도/피드에서 navigate state로 넘긴 토큰만 사용 (스토어 잔여 토큰 혼입 방지)
  const placeAccessToken = locationState?.placeAccessToken;
  const { playingKey, toggle: toggleClipPlayback, stop: stopClipPlayback } = useYouTubeClipPlayer();
  const userLatitude = hasLocationFromState
    ? locationState.userLatitude
    : currentPositionQuery.data?.latitude;
  const userLongitude = hasLocationFromState
    ? locationState.userLongitude
    : currentPositionQuery.data?.longitude;
  const pinDetailQuery = usePlaceTrackDetail({
    placeTrackId: pinId,
    userLatitude,
    userLongitude,
    placeAccessToken,
  });
  const pinPagesQuery = usePlaceTrackPins({
    placeTrackId: pinId,
    pinSortType: sort,
    userLatitude,
    userLongitude,
    placeAccessToken,
  });
  const { data: pinDetail } = pinDetailQuery;
  const { data: pinPages } = pinPagesQuery;

  const { mutate: putLikedTrack, isPending: isPutPending } = usePutLikedTrack();
  const { mutate: deleteLikedTrack, isPending: isDeletePending } = useDeleteLikedTrack();
  const { mutate: deletePin, isPending: isDeletePinPending } = useDeletePin();
  const isLikePending = isPutPending || isDeletePending;

  const pins = pinPages?.pages.flatMap((page) => page.data.map(toPinFeedEntry)) ?? [];
  const locationErrorMessage =
    !hasLocationFromState && currentPositionQuery.isError
      ? getGeolocationErrorMessage(
          toGeolocationFailureReason(
            currentPositionQuery.error instanceof Error
              ? currentPositionQuery.error
              : new Error('POSITION_UNAVAILABLE'),
          ),
        )
      : null;

  const isLocationPending = !hasLocationFromState && currentPositionQuery.isPending;
  const isContentPending =
    !locationErrorMessage &&
    (isLocationPending || pinDetailQuery.isPending || pinPagesQuery.isPending);
  const queryError =
    (!pinDetail ? pinDetailQuery.error : null) ?? (!pinPages ? pinPagesQuery.error : null);
  const requestError = queryError;

  const handleErrorAction = () => {
    void Promise.all([pinDetailQuery.refetch(), pinPagesQuery.refetch()]);
  };

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
      deleteLikedTrack(placeTrackId, {
        onError: () => toast.error(LIKE_FAILED_MESSAGE),
      });
      return;
    }
    putLikedTrack(placeTrackId, {
      onError: () => toast.error(LIKE_FAILED_MESSAGE),
    });
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

  if (isContentPending) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <TopBar onBack={() => navigate(-1)} className="pt-[env(safe-area-inset-top)]" />
        <PinDetailSkeleton />
      </div>
    );
  }

  if (requestError) {
    return <RequestErrorScreen error={requestError} onRetry={handleErrorAction} />;
  }

  if (!pinDetail) {
    return (
      <RequestErrorScreen
        error={new Error('Pin detail response is empty')}
        onRetry={handleErrorAction}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain scrollbar-hide">
      <div className="relative overflow-hidden ">
        <img
          src={pinDetail.albumImageUrl}
          alt={pinDetail.title}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-12 blur-[4px]"
        />
        <TopBar onBack={() => navigate(-1)} className="pt-[env(safe-area-inset-top)]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-pli-black-100/0 to-pli-black-100"
        />
        <div className="relative z-10 flex w-full flex-col items-center px-15">
          <img
            src={pinDetail.albumImageUrl}
            alt={pinDetail.title}
            aria-hidden
            className="size-[112px] rounded-lg object-cover"
          />
          <h1 className="w-full min-w-0 pt-3 text-center head-24-sb text-grayscale-100 line-clamp-2">
            {pinDetail.title}
          </h1>
          <p className="body-15-r text-grayscale-600">{pinDetail.artist}</p>

          <button
            type="button"
            aria-pressed={pinDetail.userLike}
            aria-label={pinDetail.userLike ? '좋아요 취소' : '좋아요'}
            disabled={isLikePending}
            onClick={handleLikeClick}
            className="mt-[14px] flex h-11 w-full max-w-[183px] cursor-pointer items-center justify-center gap-[5px] rounded-lg bg-pli-black-75 disabled:opacity-100"
          >
            <HeartIcon
              className={cn(
                'size-[18px]',
                pinDetail.userLike ? 'fill-red text-red' : 'text-grayscale-400',
              )}
              aria-hidden
            />
            <span className="body-15-m text-grayscale-300">{pinDetail.likeCount}</span>
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
          <PinFeedCard
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
                  title: pinDetail.title,
                  artist: pinDetail.artist,
                  albumImageUrl: pinDetail.albumImageUrl,
                  introduction: entry.content,
                  tags: entry.tags,
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
          try {
            await reportPin(Number(reportFeedId), reason, detail);
          } catch (error) {
            toast.error(REPORT_FAILED_MESSAGE);
            throw error;
          }
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
                onError: () => toast.error(DELETE_FAILED_MESSAGE),
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
