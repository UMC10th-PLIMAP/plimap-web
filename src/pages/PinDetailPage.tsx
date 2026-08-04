import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';

import { reportPin } from '@/api/report';
import { ReportModal } from '@/features/pin/components/ReportModal';
import { SongFeedCard } from '@/features/pin/components/SongFeedCard';
import { useDeleteLikedTrack } from '@/features/pin/queries/useDeleteLikedTrack';
import { usePlaceTrackDetail } from '@/features/pin/queries/usePlaceTrackDetail';
import { usePlaceTrackPins } from '@/features/pin/queries/usePlaceTrackPins';
import { usePutLikedTrack } from '@/features/pin/queries/usePutLikedTrack';
import type { GetPlaceTrackPinsResponse, PinFeedEntry, PinSort } from '@/features/pin/types';
import HeartIcon from '@/assets/icons/heart.svg?react';
import ChangeIcon from '@/assets/icons/change.svg?react';
import { cn } from '@/lib/utils';

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
    avatarUrl: pin.writerProfileImage,
    createdAtLabel: pin.staticCreatedAt,
    content: pin.introduction,
    tags: pin.tags,
    likeCount: pin.likeCount,
    liked: pin.userLike,
    isMine: pin.pinByMe,
  };
}

export default function PinDetailPage() {
  const navigate = useNavigate();
  const { pinId } = useParams<{ pinId: string }>();
  const [sort, setSort] = useState<PinSort>('LATEST');
  const [reportFeedId, setReportFeedId] = useState<string | null>(null);

  const { data: pinDetail } = usePlaceTrackDetail({
    placeTrackId: pinId,
  });
  const { data: pinPages } = usePlaceTrackPins({
    placeTrackId: pinId,
    pinSortType: sort,
  });

  const { mutate: putLikedTrack, isPending: isPutPending } = usePutLikedTrack();
  const { mutate: deleteLikedTrack, isPending: isDeletePending } = useDeleteLikedTrack();
  const isLikePending = isPutPending || isDeletePending;

  const pins = pinPages?.pages.flatMap((page) => page.data.map(toPinFeedEntry)) ?? [];

  const handleLikeClick = () => {
    if (!pinDetail || isLikePending) return;

    const placeTrackId = String(pinDetail.placeTrackId);
    if (pinDetail.userLike) {
      deleteLikedTrack(placeTrackId);
      return;
    }
    putLikedTrack(placeTrackId);
  };

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
            onReport={setReportFeedId}
            onNicknameClick={() => {
              if (entry.isMine) {
                navigate('/app/my');
                return;
              }
              navigate(`/app/users/${entry.memberId}`);
            }}
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
    </div>
  );
}
