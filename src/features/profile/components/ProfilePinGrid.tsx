import EmptyPinsImage from '@/assets/images/empty-pins.png';
import NextIcon from '@/assets/icons/next.svg?react';
import { ProfilePinGridSkeleton } from '@/components/skeletons/ProfilePinGridSkeleton';
import type { MemberMeFeedItem } from '@/features/pin/types';

type ProfilePinGridProps = {
  pins: MemberMeFeedItem[];
  isPending?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onPinClick?: (pin: MemberMeFeedItem) => void;
  onRegisterPin?: () => void;
};

function formatDistanceMeters(distance: number) {
  const normalizedDistance = Math.max(0, distance);

  if (normalizedDistance >= 1000) {
    const kilometers = normalizedDistance / 1000;
    return Number.isInteger(kilometers) ? `${kilometers}km` : `${kilometers.toFixed(1)}km`;
  }

  return `${Math.round(normalizedDistance)}m`;
}

function ProfilePinGridItem({
  pin,
  onPinClick,
}: {
  pin: MemberMeFeedItem;
  onPinClick?: (pin: MemberMeFeedItem) => void;
}) {
  const distanceLabel = formatDistanceMeters(pin.distanceFromUser);

  return (
    <li className="aspect-square">
      <button
        type="button"
        onClick={() => onPinClick?.(pin)}
        className="group relative size-full overflow-hidden rounded-[4.5px] text-left cursor-pointer"
        aria-label={`${pin.placeName}, ${distanceLabel}, ${pin.pinCount}개의 핀`}
      >
        <img src={pin.albumImageUrl} alt="" className="size-full object-cover" />

        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden
        >
          <span className="absolute inset-0 bg-gradient-to-b from-transparent from-[33%] to-pli-black-100 to-[92%]" />
          <span className="absolute inset-x-2 bottom-2 flex min-w-0 flex-col items-start overflow-hidden text-left">
            <span className="flex min-w-0 max-w-full items-center text-grayscale-30">
              <span className="min-w-0 truncate body-15-m">{pin.placeName}</span>
              <NextIcon className="size-5 shrink-0 text-grayscale-300" aria-hidden />
            </span>
            <span className="min-w-0 max-w-full truncate etc-13-r text-grayscale-500">
              {distanceLabel} · {pin.pinCount}개의 핀
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}

export function ProfilePinGrid({
  pins,
  isPending = false,
  isError = false,
  onRetry,
  onPinClick,
  onRegisterPin,
}: ProfilePinGridProps) {
  if (isPending) {
    return <ProfilePinGridSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-[69px] pt-7.5">
        <p className="body-15-r text-grayscale-500">핀을 불러오지 못했어요.</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="h-10 rounded-xl bg-grayscale-0 px-4 body-15-m text-grayscale-1250 cursor-pointer"
          >
            다시 시도
          </button>
        ) : null}
      </div>
    );
  }

  if (pins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-[69px] pt-7.5">
        <img src={EmptyPinsImage} alt="빈 핀" className="size-[140px] object-cover" />

        <div className="flex flex-col items-center justify-center pt-6 gap-[2px]">
          <p className="body-17-m text-grayscale-300">아직 등록한 핀이 없어요</p>
          <p className=" body-15-m text-grayscale-700">원하는 장소에 나만의 음악을 기록해보세요</p>
        </div>

        {onRegisterPin && (
          <button
            type="button"
            onClick={onRegisterPin}
            className="mt-5 w-[144px] h-10 rounded-xl bg-grayscale-0 body-15-m text-grayscale-1250 cursor-pointer"
          >
            핀 등록하러 가기
          </button>
        )}
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-3 gap-1 px-[17px]">
      {pins.map((pin) => (
        <ProfilePinGridItem key={pin.pinId} pin={pin} onPinClick={onPinClick} />
      ))}
    </ul>
  );
}
