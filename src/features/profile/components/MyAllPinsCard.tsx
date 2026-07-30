import LocationPinIcon from '@/assets/icons/location-pin.svg?react';
import MoreIcon from '@/assets/icons/more.svg?react';
import NextIcon from '@/assets/icons/next.svg?react';
import type { MyAllPin } from '@/features/profile/types';

type MyAllPinsCardProps = {
  pin: MyAllPin;
  onPlaceClick?: () => void;
  onMoreClick?: () => void;
};

export function MyAllPinsCard({ pin, onPlaceClick, onMoreClick }: MyAllPinsCardProps) {
  return (
    <article className="flex w-full flex-col rounded-2xl bg-pli-black-75 px-4 py-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPlaceClick}
          className="flex min-w-0 flex-1 items-center gap-1 text-left cursor-pointer"
        >
          <LocationPinIcon className="size-5 shrink-0 text-neon" aria-hidden />
          <span className="min-w-0 flex-1 truncate body-15-m text-grayscale-100">
            {pin.placeName}
          </span>
          <NextIcon className="size-5 shrink-0 text-grayscale-100" aria-hidden />
        </button>

        <button
          type="button"
          aria-label="더보기"
          onClick={onMoreClick}
          className="flex size-6 shrink-0 items-center justify-center text-grayscale-300 cursor-pointer"
        >
          <MoreIcon className="size-5" aria-hidden />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="size-13 shrink-0 overflow-hidden rounded-lg bg-pli-black-50">
          <img
            src={pin.albumImageUrl}
            alt={`${pin.trackName} 앨범 커버`}
            className="size-full object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate body-15-sb text-grayscale-100">{pin.trackName}</p>
          <p className="truncate body-15-r text-grayscale-500">{pin.artistName}</p>
        </div>
      </div>

      {pin.content ? (
        <p className="mt-3 whitespace-pre-wrap break-keep body-15-r text-grayscale-200">
          {pin.content}
        </p>
      ) : null}

      {pin.tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
          {pin.tags.map((tag) => (
            <span key={tag} className="body-15-r text-grayscale-400">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      <p className="mt-3 self-end etc-13-r text-grayscale-600">{pin.createdAtLabel}</p>
    </article>
  );
}
