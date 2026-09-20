import { Navigate, useNavigate, useOutletContext } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { PinCandidateMarker } from '@/features/pin/components/PinCandidateMarker';
import type { PinRegistrationOutletContext } from '@/layouts/PinRegistrationLayout';
import { usePinCreationStore } from '@/store/pinCreationStore';

export default function PinLocationConfirmPage() {
  const navigate = useNavigate();
  const { mapStatus } = useOutletContext<PinRegistrationOutletContext>();
  const place = usePinCreationStore((state) => state.place);
  const confirmationOrigin = usePinCreationStore((state) => state.confirmationOrigin);

  if (!place) return <Navigate to="/app/pin/register" replace />;

  const handlePrevious = () => {
    navigate(confirmationOrigin === 'search' ? '/app/pin/register/search' : '/app/pin/register', {
      viewTransition: true,
    });
  };

  return (
    <main data-page="pin-register-confirm" className="pin-register-confirm-stage relative h-full">
      {mapStatus === 'ready' ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
          <PinCandidateMarker variant="confirmed" />
        </div>
      ) : null}

      <div className="pointer-events-auto absolute inset-x-[15px] top-[calc(env(safe-area-inset-top)+16px)] z-40 flex items-center justify-between">
        <Button variant="cancel" size="bt" onClick={handlePrevious}>
          이전
        </Button>
        <Button variant="confirm" size="bt" onClick={() => navigate('/app/song/list')}>
          확정
        </Button>
      </div>

      <section className="absolute inset-x-0 bottom-0 z-40 min-h-[161px] rounded-t-[20px] bg-pli-black-100 px-4 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-10">
        <h1 className="truncate head-24-sb text-grayscale-100">{place.placeName}</h1>
        <p className="mt-2 body-15-r text-grayscale-500">
          내 위치에서 {Math.max(0, Math.round(place.distanceMeters))}m
        </p>
        <p className="mt-2 line-clamp-2 body-15-r text-grayscale-600">
          {place.roadAddress || place.address}
        </p>
      </section>
    </main>
  );
}
