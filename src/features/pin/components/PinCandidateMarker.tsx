import { MapPinMarker } from '@/features/map/components/MapPinMarker';
import PlimapIcon from '@/assets/icons/plimap.svg?react';
import candidatePinUrl from '@/assets/icons/pin-candidate.svg?url';

type PinCandidateMarkerProps = {
  variant?: 'candidate' | 'confirmed';
};

export function PinCandidateMarker({ variant = 'candidate' }: PinCandidateMarkerProps) {
  if (variant === 'confirmed') {
    return (
      <div className="relative h-[57px] w-[51px]" aria-hidden>
        <MapPinMarker />
        <div className="absolute left-[49.7%] top-[36%] flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-grayscale-600 text-grayscale-300">
          <PlimapIcon className="size-4" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={candidatePinUrl}
      alt=""
      draggable={false}
      className="block h-[58px] w-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
      aria-hidden
    />
  );
}
