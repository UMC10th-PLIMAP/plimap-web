import type { ComponentProps } from 'react';

import NextIcon from '@/assets/icons/next.svg?react';
import UserPlaceholderIcon from '@/assets/icons/user-placeholder.svg?react';
import { cn } from '@/lib/utils';

export type RecommendationPin = {
  id: string;
  place: {
    name: string;
  };
  song: {
    title: string;
    artist: string;
  };
  creator: {
    name: string;
    avatarUrl: string | null;
  };
  imageUrl: string | null;
};

type RecommendationPinCardData = Omit<RecommendationPin, 'song'> & {
  song?: RecommendationPin['song'];
};

type RecommendationPinCardProps = Omit<ComponentProps<'button'>, 'children' | 'type'> & {
  pin: RecommendationPinCardData;
  profileAriaLabel?: string;
  onProfileClick?: ComponentProps<'button'>['onClick'];
};

export function RecommendationPinCard({
  pin,
  className,
  'aria-label': ariaLabel,
  profileAriaLabel,
  onProfileClick,
  ...props
}: RecommendationPinCardProps) {
  const { place, song, creator, imageUrl } = pin;
  const profileImage = creator.avatarUrl ? (
    <img src={creator.avatarUrl} alt="" className="size-full object-cover" />
  ) : (
    <UserPlaceholderIcon aria-hidden className="size-5 text-pli-black-50" />
  );

  return (
    <article
      className={cn(
        'relative size-[124px] shrink-0 rounded-xl border border-pli-black-50',
        className,
      )}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-pointer overflow-hidden rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon"
        aria-label={
          ariaLabel ??
          `${place.name}${song ? `, ${song.title} - ${song.artist}` : ''}, ${creator.name}님의 PIN`
        }
        {...props}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <span aria-hidden className="absolute inset-0 bg-pli-black-75" />
        )}
        <span aria-hidden className="absolute inset-0 bg-black/70 backdrop-blur-[4px]" />

        <span className="absolute left-3.5 right-3.5 top-[68px] truncate etc-13-r text-grayscale-300">
          {creator.name}
        </span>
        <span className="absolute bottom-3.5 left-3.5 right-3.5 flex min-w-0 items-center">
          <span className="min-w-0 truncate body-15-m text-grayscale-100">{place.name}</span>
          <NextIcon className="size-5 shrink-0" aria-hidden />
        </span>
      </button>

      {onProfileClick ? (
        <button
          type="button"
          onClick={onProfileClick}
          aria-label={profileAriaLabel ?? `${creator.name} 프로필 보기`}
          className="absolute left-3.5 top-[15px] z-10 flex size-[38px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-pli-black-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon"
        >
          {profileImage}
        </button>
      ) : (
        <span className="absolute left-3.5 top-[15px] flex size-[38px] items-center justify-center overflow-hidden rounded-full bg-pli-black-75">
          {profileImage}
        </span>
      )}
    </article>
  );
}
