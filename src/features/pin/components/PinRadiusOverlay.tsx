import { useState, type CSSProperties } from 'react';

import { Button } from '@/components/ui/button';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import { calculateMapRadiusPixels } from '@/features/pin/utils/calculateMapRadiusPixels';
import { cn } from '@/lib/utils';

const PIN_REGISTRATION_RADIUS_METERS = 500;
const CONFLICT_TOAST_DURATION_MS = 2_000;

export type PinRadiusCenter = {
  x: number;
  y: number;
};

export type PinRadiusOverlayProps = {
  zoom: number;
  centerLatitude: number;
  radiusCenter?: PinRadiusCenter;
  hasNearbyPinConflict?: boolean;
  onCancel: () => void;
  onComplete: () => void;
  className?: string;
};

export function PinRadiusOverlay({
  zoom,
  centerLatitude,
  radiusCenter,
  hasNearbyPinConflict = false,
  onCancel,
  onComplete,
  className,
}: PinRadiusOverlayProps) {
  const [isConflictToastVisible, setIsConflictToastVisible] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const radiusPixels = calculateMapRadiusPixels(
    PIN_REGISTRATION_RADIUS_METERS,
    zoom,
    centerLatitude,
  );
  const diameterPixels = radiusPixels * 2;
  const radiusCenterX = radiusCenter && Number.isFinite(radiusCenter.x) ? radiusCenter.x : '50%';
  const radiusCenterY = radiusCenter && Number.isFinite(radiusCenter.y) ? radiusCenter.y : '50%';
  const radiusStyle: CSSProperties = {
    left: radiusCenterX,
    top: radiusCenterY,
    width: diameterPixels,
    height: diameterPixels,
    boxShadow: '0 0 0 200vmax rgba(0, 0, 0, 0.6)',
  };

  const handleComplete = () => {
    if (!hasNearbyPinConflict) {
      setIsConflictToastVisible(false);
      onComplete();
      return;
    }

    setToastKey((currentKey) => currentKey + 1);
    setIsConflictToastVisible(true);
  };

  return (
    <ToastProvider duration={CONFLICT_TOAST_DURATION_MS}>
      <section
        aria-label="PIN 등록 가능 반경"
        className={cn('pointer-events-none absolute inset-0 z-30 overflow-hidden', className)}
      >
        {radiusPixels > 0 ? (
          <div
            aria-hidden="true"
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-[4px] border-[rgba(247,247,247,0.35)] transition-[width,height] duration-300 ease-out motion-reduce:transition-none"
            style={radiusStyle}
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-black/60" />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[55px] bg-gradient-to-b from-black to-transparent"
        />

        <div className="absolute inset-x-[15px] top-[calc(env(safe-area-inset-top)+16px)] flex items-center justify-between">
          <Button
            type="button"
            variant="cancel"
            size="bt"
            className="pointer-events-auto text-grayscale-500"
            onClick={onCancel}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="confirm"
            size="bt"
            className="pointer-events-auto text-grayscale-1300"
            onClick={handleComplete}
          >
            완료
          </Button>
        </div>

        <div className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+23px)] flex flex-col items-center gap-[50px]">
          <Toast
            key={toastKey}
            open={isConflictToastVisible}
            onOpenChange={setIsConflictToastVisible}
            className="mx-[15px]"
          >
            이미 근처 20m 이내에 PIN이 있어요
          </Toast>
          <ToastViewport />

          <p className="max-w-full px-6 py-4 text-center body-15-m text-grayscale-200 [text-shadow:0_1px_4px_#000]">
            반경 500m 이내에 PIN을 등록할 수 있어요.
            <br />
            다른 PIN과 20m 이상 떨어진 곳에 등록해 주세요.
          </p>
        </div>
      </section>
    </ToastProvider>
  );
}
