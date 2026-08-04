import EmptyPinsImage from '@/assets/images/empty-pins.png';
import type { MemberMeResponse } from '@/features/pin/types';

type ProfilePinGridProps = {
  pins: MemberMeResponse['data'];
  onPinClick?: (pinId: string) => void;
  onRegisterPin?: () => void;
};

export function ProfilePinGrid({ pins, onPinClick, onRegisterPin }: ProfilePinGridProps) {
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
        <li key={pin.pinId} className="aspect-square">
          <button
            type="button"
            onClick={() => onPinClick?.(pin.pinId.toString())}
            className="size-full"
            aria-label="핀 보기"
          >
            <img
              src={pin.albumImageUrl}
              alt="핀 이미지"
              aria-label="핀 이미지"
              className="size-full object-cover rounded-[4.5px] cusor-pointer"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
