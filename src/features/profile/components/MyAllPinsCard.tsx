import LocationPinIcon from '@/assets/icons/location.svg?react';
import MoreIcon from '@/assets/icons/more.svg?react';
import NextIcon from '@/assets/icons/next.svg?react';
import type { MyAllPin } from '@/features/profile/types';

type MyAllPinsCardProps = {
  pin: MyAllPin;
  onClick?: () => void;
  onMoreClick?: () => void;
};

export function MyAllPinsCard({ pin, onClick, onMoreClick }: MyAllPinsCardProps) {
  return (
    <article className="relative flex w-full flex-col rounded-[20px] bg-pli-black-85 px-4 pt-4 pb-3">
      {onClick ? (
        <button
          type="button"
          aria-label={`${pin.placeName}에 등록한 ${pin.trackName} 상세 보기`}
          onClick={onClick}
          className="absolute inset-0 rounded-[20px] cursor-pointer"
        />
      ) : null}

      <div className="flex items-center gap-[6px]">
        <div className="flex min-w-0 flex-1 items-center gap-1 text-left">
          <LocationPinIcon className="size-5  text-neon" aria-hidden />
          <span className="flex min-w-0 flex-1 items-center body-17-m text-grayscale-100">
            <span className="truncate">{pin.placeName}</span>
            <NextIcon className="size-6 shrink-0 text-grayscale-400" aria-hidden />
          </span>
        </div>

        <button
          type="button"
          aria-label="더보기"
          onClick={onMoreClick}
          className="relative z-10 flex size-6 shrink-0 items-center justify-center cursor-pointer"
        >
          <MoreIcon className="size-6 text-grayscale-100" aria-hidden />
        </button>
      </div>

      <div className="flex items-center gap-[17px] pt-[13px]">
        <div className="size-[59px] overflow-hidden rounded-lg">
          <img
            src={pin.albumImageUrl}
            alt={`${pin.trackName} 앨범 커버`}
            className="size-full object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="body-17-r text-grayscale-300 line-clamp-2">{pin.trackName}</p>
          <p className="truncate body-15-r text-grayscale-500">{pin.artistName}</p>
        </div>
      </div>

      {pin.content ? <p className="pt-[13px] body-15-r text-grayscale-300">{pin.content}</p> : null}

      {pin.tags.length > 0 ? (
        <div className="pt-1 flex flex-wrap gap-2">
          {pin.tags.map((tag) => (
            <span key={tag} className="body-15-m text-grayscale-700">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="pt-1 border-b border-pli-black-75" />
      <p className=" pt-2 self-end body-15-m text-grayscale-500">{pin.createdAtLabel}</p>
    </article>
  );
}
