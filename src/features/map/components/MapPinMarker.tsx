import pinIconUrl from '@/assets/icons/pin.svg?url';

export type MapPinMarkerProps = {
  coverUrl?: string;
  isSelected?: boolean;
};

export function MapPinMarker({ coverUrl, isSelected = false }: MapPinMarkerProps) {
  return (
    <div
      className="relative cursor-pointer select-none transition-transform duration-150"
      style={{
        width: 51,
        height: 57,
        transform: isSelected ? 'scale(1.2)' : undefined,
      }}
    >
      <img
        src={pinIconUrl}
        alt="핀 아이콘"
        draggable={false}
        className="pointer-events-none block size-full object-contain"
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
  );
}
