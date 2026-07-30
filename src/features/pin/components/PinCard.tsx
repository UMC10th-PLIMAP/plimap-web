import HeartIcon from '@/assets/icons/heart.svg?react';
import NextIcon from '@/assets/icons/next.svg?react';
import { useDeleteLikedTrack } from '@/features/pin/queries/useDeleteLikedTrack';
import { usePutLikedTrack } from '@/features/pin/queries/usePutLikedTrack';
import type { Pin } from '@/features/pin/types';
import { cn } from '@/lib/utils';

type PinCardProps = {
  pin: Pin;
  onClick?: () => void;
};

export function PinCard({ pin, onClick }: PinCardProps) {
  const { mutate: putLikedTrack, isPending: isPutPending } = usePutLikedTrack();
  const { mutate: deleteLikedTrack, isPending: isDeletePending } = useDeleteLikedTrack();
  const isPending = isPutPending || isDeletePending;

  const handleLikeClick = () => {
    if (isPending) return;

    const placeTrackId = String(pin.placeTrackId);
    if (pin.liked) {
      deleteLikedTrack(placeTrackId);
      return;
    }
    putLikedTrack(placeTrackId);
  };

  return (
    <article className="flex w-full items-center justify-between rounded-xl bg-pli-black-85 p-4.5 text-left">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="size-13 overflow-hidden rounded-lg bg-grayscale-0">
            {pin.artworkUrl ? (
              <img src={pin.artworkUrl} alt={pin.trackName} className="size-full object-cover" />
            ) : null}
          </div>
          <div className="flex min-w-0 flex-col items-start gap-[3px]">
            <p className="w-full truncate body-15-sb text-grayscale-100">{pin.trackName}</p>
            <p className="w-full truncate body-15-r text-grayscale-500">{pin.artistName}</p>
          </div>
        </div>

        {pin.likeCount !== undefined ? (
          <button
            type="button"
            aria-label={pin.liked ? '좋아요 취소' : '좋아요'}
            aria-pressed={Boolean(pin.liked)}
            disabled={isPending}
            onClick={handleLikeClick}
            className="flex w-fit cursor-pointer items-center gap-1 body-15-r text-grayscale-300 disabled:opacity-100"
          >
            <HeartIcon
              className={cn('size-[18px]', pin.liked ? 'fill-red text-red' : 'text-grayscale-300')}
              aria-hidden
            />
            <span>{pin.likeCount}</span>
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onClick}
        className="ml-3 flex shrink-0 cursor-pointer items-center gap-1 etc-13-r text-grayscale-300"
      >
        {pin.pinCount != null ? `${pin.pinCount}명이 등록` : '맵으로 이동'}
        <NextIcon className="size-5" aria-hidden />
      </button>
    </article>
  );
}
