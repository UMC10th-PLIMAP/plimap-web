import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';

import { SongFeedCard } from '@/features/pin/components/SongFeedCard';

import {
  MOCK_SONG_DETAIL_LOVE_ATTACK,
  MOCK_SONG_DETAILS,
} from '@/features/pin/data/mockPinSearchPlaces';
import type { PinSort } from '@/features/pin/types';
import HeartIcon from '@/assets/icons/heart.svg?react';
import ChangeIcon from '@/assets/icons/change.svg?react';
import { cn } from '@/lib/utils';

export default function PinDetailPage() {
  const navigate = useNavigate();
  const { pinId } = useParams<{ pinId: string }>();

  const pinDetail = MOCK_SONG_DETAILS[pinId ?? ''] ?? MOCK_SONG_DETAIL_LOVE_ATTACK;

  const [sort, setSort] = useState<PinSort>('latest');

  const SORT_LABEL: Record<PinSort, string> = { latest: '최신순', popular: '인기순' };

  const handleSortChange = (nextSort: PinSort) => {
    setSort(nextSort);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-hide">
      <div className="relative h-[296px] ">
        <img
          src={pinDetail.coverUrl}
          alt={pinDetail.title}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-12 blur-sm"
        />
        <TopBar
          onBack={() => navigate(-1)}
          className="relative z-10 pt-[env(safe-area-inset-top)]"
        />
        {/* <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-[120px] bg-gradient-to-t from-pli-black-100 to-transparent"
        /> */}
        <div className="flex flex-col items-center h-[296px]">
          <img
            src={pinDetail.coverUrl}
            alt={pinDetail.title}
            aria-hidden
            className="size-[112px] rounded-lg object-cover"
          />
          <h1 className="pt-3 head-24-sb text-grayscale-100">{pinDetail.title}</h1>
          <p className=" body-15-r text-grayscale-600">{pinDetail.artist}</p>

          <button
            type="button"
            aria-pressed={pinDetail.liked}
            aria-label={pinDetail.liked ? '좋아요 취소' : '좋아요'}
            className="absolute bottom-0 mt-[14px] flex h-11 w-full max-w-[183px] items-center justify-center gap-[5px] rounded-lg bg-pli-black-75"
          >
            <HeartIcon
              className={cn('size-5', pinDetail.liked ? 'fill-red text-red' : 'text-grayscale-400')}
              aria-hidden
            />
            <span className="body-15-m text-grayscale-300">{pinDetail.likeCount}</span>
          </button>
        </div>
      </div>

      <div className="px-4 pt-6  justify-between items-center flex ">
        <p className="body-15-m text-grayscale-300">{pinDetail.registerCount}명이 등록</p>
        <button
          type="button"
          aria-label="피드 순서 변경"
          className="flex items-center cursor-pointer"
          onClick={() => handleSortChange(sort === 'latest' ? 'popular' : 'latest')}
        >
          <p className="body-15-m text-grayscale-300">{SORT_LABEL[sort]}</p>
          <ChangeIcon className="size-6" aria-hidden />
        </button>
      </div>

      <div className="flex flex-col gap-4 px-[11px] pt-[17.5px]">
        {pinDetail.feeds.map((feed) => (
          <SongFeedCard key={feed.id} entry={feed} onToggleLike={() => {}} />
        ))}
      </div>
    </div>
  );
}
