import PinIcon from '@/assets/icons/pin.svg?react';
import { MapPinMessageBox } from '@/features/map/components/MapPinMessageBox';

export type MapPinMarkerProps = {
  coverUrl?: string;
  isSelected?: boolean;
  isPlaying?: boolean;
  nickname?: string;
  avatarUrl?: string;
  introduction?: string;
  onPlay?: () => void;
  /** 말풍선(MapPinMessageBox) 노출 여부. isSelected와 별개로, 줌 21 범위에서만 켠다. */
  showMessageBubble?: boolean;
};

export function MapPinMarker({
  coverUrl,
  isSelected = false,
  isPlaying = false,
  nickname,
  avatarUrl,
  introduction,
  onPlay,
  showMessageBubble = false,
}: MapPinMarkerProps) {
  return (
    <div className="relative cursor-pointer select-none" style={{ width: 51, height: 57 }}>
      {showMessageBubble && nickname && introduction ? (
        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2">
          <MapPinMessageBox
            nickname={nickname}
            avatarUrl={avatarUrl}
            introduction={introduction}
            isPlaying={isPlaying}
            onPlay={onPlay}
          />
        </div>
      ) : null}

      <div
        className="relative size-full transition-transform duration-150"
        style={{ transform: isSelected ? 'scale(1.2)' : undefined }}
      >
        <PinIcon
          role="img"
          aria-label="핀 아이콘"
          className="pointer-events-none block size-full overflow-visible"
        />

        <div
          className="pointer-events-none absolute overflow-hidden rounded-full"
          style={{
            left: '49.7%',
            top: '36%',
            width: 24,
            height: 24,
            transform: 'translate(-50%, -50%)',
            background: coverUrl,
          }}
        >
          {coverUrl ? (
            <img src={coverUrl} alt="" draggable={false} className="size-full object-cover" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
