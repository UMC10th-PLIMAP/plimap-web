import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';

import { SongFeedCard } from '@/features/pin/components/SongFeedCard';
import { ReportModal } from '@/features/pin/components/ReportModal';

import {
  MOCK_SONG_DETAIL_LOVE_ATTACK,
  MOCK_SONG_DETAILS,
} from '@/features/pin/data/mockPinSearchPlaces';
import type { PinSort } from '@/features/pin/types';
import HeartIcon from '@/assets/icons/heart.svg?react';
import ChangeIcon from '@/assets/icons/change.svg?react';
import { cn } from '@/lib/utils';

const SORT_LABEL: Record<PinSort, string> = {
  latest: '최신순',
  popular: '인기순',
};

export default function PinDetailPage() {
  const navigate = useNavigate();
  const { pinId } = useParams<{ pinId: string }>();

  const pinDetail = MOCK_SONG_DETAILS[pinId ?? ''] ?? MOCK_SONG_DETAIL_LOVE_ATTACK;

  const [sort, setSort] = useState<PinSort>('latest');
  const [liked, setLiked] = useState(Boolean(pinDetail.liked));
  const [likeCount, setLikeCount] = useState(pinDetail.likeCount);
  const [reportFeedId, setReportFeedId] = useState<string | null>(null);

  const sortedFeeds = useMemo(
    () =>
      sort === 'popular'
        ? [...pinDetail.feeds].sort((a, b) => b.likeCount - a.likeCount)
        : pinDetail.feeds,
    [pinDetail.feeds, sort],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain scrollbar-hide">
      <div className="relative h-[296px] shrink-0 overflow-hidden">
        <img
          src={pinDetail.coverUrl}
          alt={pinDetail.title}
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
            src={pinDetail.coverUrl}
            alt={pinDetail.title}
            aria-hidden
            className="size-[112px] rounded-lg object-cover"
          />
          <h1 className="pt-3 head-24-sb text-grayscale-100">{pinDetail.title}</h1>
          <p className="body-15-r text-grayscale-600">{pinDetail.artist}</p>

          <button
            type="button"
            aria-pressed={liked}
            aria-label={liked ? '좋아요 취소' : '좋아요'}
            onClick={() => {
              setLiked((prev) => !prev);
              setLikeCount((count) => count + (liked ? -1 : 1));
            }}
            className=" flex h-11 mt-[14px] w-full max-w-[183px] cursor-pointer items-center justify-center gap-[5px] rounded-lg bg-pli-black-75"
          >
            <HeartIcon
              className={cn('size-[18px]', liked ? 'fill-red text-red' : 'text-grayscale-400')}
              aria-hidden
            />
            <span className="body-15-m text-grayscale-300">{likeCount}</span>
          </button>
        </div>
      </div>

      <div className="flex  items-center justify-between px-4 pt-6">
        <p className="body-15-m text-grayscale-300">{pinDetail.registerCount}명이 등록</p>

        <button
          type="button"
          aria-label="피드 순서 변경"
          className="flex cursor-pointer items-center"
          onClick={() => setSort((current) => (current === 'latest' ? 'popular' : 'latest'))}
        >
          <p className="body-15-m text-grayscale-300">{SORT_LABEL[sort]}</p>
          <ChangeIcon className="size-6" aria-hidden />
        </button>
      </div>

      <div className="flex flex-col gap-4 px-[11px] pt-[17.5px] pb-[env(safe-area-inset-bottom)]">
        {sortedFeeds.map((feed) => (
          <SongFeedCard
            key={feed.id}
            entry={feed}
            onToggleLike={() => {}}
            onReport={setReportFeedId}
          />
        ))}
      </div>

      <ReportModal open={reportFeedId !== null} onClose={() => setReportFeedId(null)} />
    </div>
  );
}
