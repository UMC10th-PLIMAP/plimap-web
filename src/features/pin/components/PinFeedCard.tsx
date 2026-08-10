import { useEffect, useRef, useState } from 'react';

import { usePutPinLike } from '@/features/pin/queries/usePutPinLike';
import { useDeletePinLike } from '@/features/pin/queries/useDeletePinLike';
import type { PinFeedEntry } from '@/features/pin/types';
import MoreIcon from '@/assets/icons/more.svg?react';
import LikeIcon from '@/assets/icons/like.svg?react';
import SoundWaveIcon from '@/assets/icons/soundwaves.svg?react';
import PlayIcon from '@/assets/icons/play.svg?react';

type PinFeedCardProps = {
  entry: PinFeedEntry;
  isPlaying?: boolean;
  onPlay?: (entryId: string) => void;
  onReport?: (entryId: string) => void;
  onEdit?: (entryId: string) => void;
  onDelete?: (entryId: string) => void;
  onNicknameClick?: (entry: PinFeedEntry) => void;
};

export function PinFeedCard({
  entry,
  isPlaying = false,
  onPlay,
  onReport,
  onEdit,
  onDelete,
  onNicknameClick,
}: PinFeedCardProps) {
  const { mutate: putPinLike, isPending: isPutPending } = usePutPinLike();
  const { mutate: deletePinLike, isPending: isDeletePending } = useDeletePinLike();
  const isLikePending = isPutPending || isDeletePending;
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const handleLikeClick = () => {
    if (isLikePending) return;

    if (entry.liked) {
      deletePinLike(entry.id);
      return;
    }
    putPinLike(entry.id);
  };

  useEffect(() => {
    if (!isMoreOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreOpen]);

  return (
    <article className="rounded-[20px] bg-pli-black-85 px-4 pt-4 pb-3 ">
      <header className="flex items-center gap-2.5">
        {entry.avatarUrl ? (
          <img src={entry.avatarUrl} alt="" className="size-7 rounded-full object-cover" />
        ) : (
          <div className="size-7 rounded-full bg-grayscale-0" aria-hidden />
        )}

        <div className="flex flex-1 items-center gap-[6px]">
          <button
            type="button"
            onClick={() => onNicknameClick?.(entry)}
            className="body-15-m text-grayscale-300 cursor-pointer"
          >
            {entry.nickname}
          </button>
          <span className="etc-13-r text-grayscale-600">•</span>
          <span className="body-15-m text-grayscale-500">{entry.createdAtLabel}</span>
        </div>

        <div ref={moreRef} className="relative">
          <button
            type="button"
            aria-label="더보기"
            aria-expanded={isMoreOpen}
            onClick={() => setIsMoreOpen((prev) => !prev)}
            className="flex size-6 cursor-pointer items-center justify-center text-grayscale-500"
          >
            <MoreIcon className="size-6" aria-hidden />
          </button>

          {isMoreOpen && (
            <div className="absolute right-0 top-full z-10 mt-1">
              <PinFeedCardMore
                isMine={Boolean(entry.isMine)}
                onReport={() => {
                  setIsMoreOpen(false);
                  onReport?.(entry.id);
                }}
                onEdit={() => {
                  setIsMoreOpen(false);
                  onEdit?.(entry.id);
                }}
                onDelete={() => {
                  setIsMoreOpen(false);
                  onDelete?.(entry.id);
                }}
              />
            </div>
          )}
        </div>
      </header>

      <div className="pt-4 pb-[14px]">
        <p className="whitespace-pre-wrap body-15-r text-grayscale-100">{entry.content}</p>

        {entry.tags.length > 0 && (
          <p className="pt-2 body-15-r text-grayscale-700 h-[29px] ">
            {entry.tags.map((tag) => `#${tag}`).join(' ')}
          </p>
        )}
      </div>

      <div className="h-[1px] bg-pli-black-75" />

      <footer className="flex items-center justify-between pt-2.5">
        <button
          type="button"
          onClick={handleLikeClick}
          aria-pressed={entry.liked}
          aria-label="추천"
          disabled={isLikePending}
          className="flex cursor-pointer items-center gap-1.5 text-grayscale-400 disabled:opacity-100"
        >
          <LikeIcon
            className={`size-5 ${entry.liked ? 'fill-grayscale-100 text-grayscale-100' : 'text-grayscale-400'}`}
            aria-hidden
          />
          <span className="body-15-r">{entry.likeCount}</span>
        </button>

        <div className="flex items-center gap-2.5">
          <SoundWaveIcon className="size-6 text-grayscale-400" aria-hidden />
          <button
            type="button"
            aria-label={isPlaying ? '미리듣기 일시정지' : '미리듣기 재생'}
            aria-pressed={isPlaying}
            onClick={() => onPlay?.(entry.id)}
            className="flex size-[30px] cursor-pointer items-center justify-center rounded-full bg-gradient-neon text-grayscale-1250"
          >
            {isPlaying ? (
              <span className="flex items-center gap-[3px]" aria-hidden>
                <span className="h-3.5 w-[3px] rounded-full bg-grayscale-1250" />
                <span className="h-3.5 w-[3px] rounded-full bg-grayscale-1250" />
              </span>
            ) : (
              <PlayIcon className="size-5" aria-hidden />
            )}
          </button>
        </div>
      </footer>
    </article>
  );
}

type PinFeedCardMoreProps = {
  isMine?: boolean;
  onReport?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function PinFeedCardMore({
  isMine = false,
  onReport,
  onEdit,
  onDelete,
}: PinFeedCardMoreProps) {
  return (
    <article
      className="min-w-[92px] rounded-lg bg-pli-black-75 px-5 py-4"
      onClick={(event) => event.stopPropagation()}
    >
      {isMine ? (
        <div className="flex flex-col gap-3 cursor-pointer">
          <button
            type="button"
            onClick={onEdit}
            className="body-15-m text-grayscale-300 cursor-pointer"
          >
            수정하기
          </button>
          <button type="button" onClick={onDelete} className="body-15-m text-red cursor-pointer">
            삭제하기
          </button>
        </div>
      ) : (
        <button type="button" onClick={onReport} className="body-15-m text-red ">
          신고하기
        </button>
      )}
    </article>
  );
}
