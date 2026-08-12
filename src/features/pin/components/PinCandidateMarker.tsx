import { MapPinMarker } from '@/features/map/components/MapPinMarker';
import candidatePinUrl from '@/assets/icons/pin-candidate.svg?url';

type PinCandidateMarkerProps = {
  variant?: 'candidate' | 'confirmed';
};

export function PinCandidateMarker({ variant = 'candidate' }: PinCandidateMarkerProps) {
  if (variant === 'confirmed') {
    return <MapPinMarker />;
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
