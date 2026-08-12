import { useState, type CSSProperties, type RefObject } from 'react';

import { Button } from '@/components/ui/button';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import { calculateMapRadiusPixels } from '@/features/pin/utils/calculateMapRadiusPixels';
import { cn } from '@/lib/utils';

const PIN_REGISTRATION_RADIUS_METERS = 500;
const CONFLICT_TOAST_DURATION_MS = 2_000;

export type PinRadiusOverlayProps = {
  zoom: number;
  centerLatitude: number;
  radiusElementRef?: RefObject<HTMLDivElement | null>;
  feedbackMessage?: string | null;
  isCompleting?: boolean;
  isCompleteDisabled?: boolean;
  showRadius?: boolean;
  onCancel: () => void;
  onComplete: () => void;
  className?: string;
};

export function PinRadiusOverlay({
  zoom,
  centerLatitude,
  radiusElementRef,
  feedbackMessage,
  isCompleting = false,
  isCompleteDisabled = false,
  showRadius = true,
  onCancel,
  onComplete,
  className,
}: PinRadiusOverlayProps) {
  const [toastAttempt, setToastAttempt] = useState(0);
  const radiusPixels = calculateMapRadiusPixels(
    PIN_REGISTRATION_RADIUS_METERS,
    zoom,
    centerLatitude,
  );
  const diameterPixels = radiusPixels * 2;
  const radiusStyle: CSSProperties = {
    left: 'var(--pin-radius-center-x, 50%)',
    top: 'var(--pin-radius-center-y, 50%)',
    width: `var(--pin-radius-diameter, ${diameterPixels}px)`,
    height: `var(--pin-radius-diameter, ${diameterPixels}px)`,
    boxShadow: '0 0 0 200vmax rgba(0, 0, 0, 0.6)',
  };

  const handleComplete = () => {
    if (isCompleting || isCompleteDisabled) return;
    setToastAttempt((currentAttempt) => currentAttempt + 1);
    onComplete();
  };

  return (
    <ToastProvider duration={CONFLICT_TOAST_DURATION_MS}>
      <section
        aria-label="PIN 등록 가능 반경"
        className={cn('pointer-events-none absolute inset-0 z-30 overflow-hidden', className)}
      >
        {showRadius && radiusPixels > 0 ? (
          <div
            ref={radiusElementRef}
            aria-hidden="true"
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-[4px] border-[rgba(247,247,247,0.35)]"
            style={radiusStyle}
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-black/60" />
        )}

        <div className="absolute inset-x-[15px] top-[calc(env(safe-area-inset-top)+16px)] flex items-center justify-between">
          <Button
            type="button"
            variant="cancel"
            size="bt"
            className="pointer-events-auto"
            onClick={onCancel}
            disabled={isCompleting}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="confirm"
            size="bt"
            className="pointer-events-auto"
            onClick={handleComplete}
            disabled={isCompleting || isCompleteDisabled}
          >
            {isCompleting ? '확인 중' : '완료'}
          </Button>
        </div>

        <div className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+23px)] flex flex-col items-center gap-[50px]">
          {feedbackMessage && toastAttempt > 0 && (
            <Toast key={`${feedbackMessage}:${toastAttempt}`} defaultOpen>
              {feedbackMessage}
            </Toast>
          )}
          <ToastViewport />

          <p className="max-w-full px-6 py-4 text-center body-15-m text-grayscale-200 [text-shadow:0_1px_4px_#000]">
            반경 500m 이내에 PIN을 등록할 수 있어요.
            <br />
            다른 PIN과 10m 이상 떨어진 곳에 등록해 주세요.
          </p>
        </div>
      </section>
    </ToastProvider>
  );
}
