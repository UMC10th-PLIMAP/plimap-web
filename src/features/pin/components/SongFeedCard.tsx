import { useEffect, useRef, useState } from 'react';

import type { PinFeedEntry } from '@/features/pin/types';
import MoreIcon from '@/assets/icons/more.svg?react';
import LikeIcon from '@/assets/icons/like.svg?react';
import SoundWaveIcon from '@/assets/icons/soundwaves.svg?react';
import PlayIcon from '@/assets/icons/play.svg?react';
type SongFeedCardProps = {
  entry: PinFeedEntry;
  onToggleLike?: (entryId: string) => void;
  onPlay?: (entryId: string) => void;
  onReport?: (entryId: string) => void;
};

export function SongFeedCard({ entry, onToggleLike, onPlay, onReport }: SongFeedCardProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

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
    <article className="rounded-[20px] bg-pli-black-85 p-4">
      <header className="flex items-center gap-2.5">
        {entry.avatarUrl ? (
          <img src={entry.avatarUrl} alt="" className="size-7 rounded-full object-cover" />
        ) : (
          <div className="size-7 rounded-full bg-grayscale-0" aria-hidden />
        )}

        <div className="flex flex-1 items-center gap-[6px]">
          <p className=" body-15-m text-grayscale-300">{entry.nickname} </p>
          <span className="etc-13-r text-grayscale-600">• </span>
          <span className="body-15-m text-grayscale-500"> {entry.createdAtLabel} </span>
        </div>

        <div ref={moreRef} className="relative">
          <button
            type="button"
            aria-label="더보기"
            aria-expanded={isMoreOpen}
            onClick={() => setIsMoreOpen((prev) => !prev)}
            className="flex size-6  items-center justify-center text-grayscale-500 cursor-pointer"
          >
            <MoreIcon className="size-6" aria-hidden />
          </button>

          {isMoreOpen && (
            <div className="w-[92px] h-[53px] absolute right-0 top-full z-10 mt-1">
              <SongFeedCardMore
                onReport={() => {
                  setIsMoreOpen(false);
                  onReport?.(entry.id);
                }}
              />
            </div>
          )}
        </div>
      </header>

      <div className="pt-4 pb-2.5">
        <p className="whitespace-pre-wrap body-15-r text-grayscale-100">{entry.content}</p>

        {entry.tags.length > 0 && (
          <p className="pt-1 body-15-r text-grayscale-700">
            {entry.tags.map((tag) => `#${tag}`).join(' ')}
          </p>
        )}
      </div>

      <div className="h-[1px] bg-pli-black-75" />

      <footer className="pt-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onToggleLike?.(entry.id)}
          aria-pressed={entry.liked}
          aria-label="추천"
          className="flex items-center gap-1.5 text-grayscale-400"
        >
          <LikeIcon
            className={`size-5 ${entry.liked ? 'text-grayscale-100' : 'text-grayscale-400'}`}
            aria-hidden
          />
          <span className="body-15-r">{entry.likeCount}</span>
        </button>

        <div className="flex items-center gap-2.5">
          <SoundWaveIcon className="size-6 text-grayscale-400" aria-hidden />
          <button
            type="button"
            aria-label="미리듣기 재생"
            onClick={() => onPlay?.(entry.id)}
            className="flex size-[30px] items-center justify-center rounded-full bg-neon text-grayscale-1250"
          >
            <PlayIcon className="size-5" aria-hidden />
          </button>
        </div>
      </footer>
    </article>
  );
}

type SongFeedCardMoreProps = {
  onReport?: () => void;
};

export function SongFeedCardMore({ onReport }: SongFeedCardMoreProps) {
  return (
    <article
      className="rounded-lg bg-pli-black-75 px-5 py-4"
      onClick={(event) => event.stopPropagation()}
    >
      <button type="button" onClick={onReport} className="body-15-m text-red cursor-pointer">
        신고하기
      </button>
    </article>
  );
}
