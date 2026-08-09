{
  /* 노래 프리뷰 데이터 */
}
export const MOCK_WAVEFORM_PEAKS = [
  0.4, 0.48, 0.22, 0.3, 0.28, 0.45, 0.43, 0.48, 0.5, 0.42, 0.32, 0.25, 0.35, 0.45, 0.55, 0.32, 0.68,
  0.52, 0.5, 0.45, 0.32, 0.25, 0.33, 0.45, 0.44, 0.55, 0.32, 0.56, 0.52, 0.52, 0.42, 0.34, 0.28,
  0.45, 0.35, 0.55, 0.44, 0.46, 0.58, 0.42, 0.36, 0.48, 0.22, 0.34,
] as const;

export const MOCK_PREVIEW_DURATION = 30;
/** 고정 트림 구간 길이(초). 곡 길이와 무관하게 이 값을 쓴다. */
export const MIN_TRIM_DURATION = 30;

export const TAG_OPTIONS = [
  '감성',
  '고독',
  '낭만',
  '몽환',
  '설렘',
  '신남',
  '위로',
  '잔잔',
  '청량',
  '힙함',
] as const;

/** 최초 진입 시 맨 왼쪽부터 MIN_TRIM_DURATION 초 구간을 선택한다. */
export function defaultTrimRange(durationSec: number) {
  const duration = Math.max(durationSec, 1);
  const trimDuration = Math.min(MIN_TRIM_DURATION, duration);
  return { start: 0, end: trimDuration };
}

export function peaksToTrimRange(
  startIndex: number,
  endIndex: number,
  peaks: readonly number[],
  duration: number,
) {
  return {
    start: (startIndex / peaks.length) * duration,
    end: ((endIndex + 1) / peaks.length) * duration,
  };
}

export function timeToPercent(time: number, duration: number) {
  if (duration <= 0) return 0;
  return (time / duration) * 100;
}

export function percentToTime(percent: number, duration: number) {
  return (Math.min(100, Math.max(0, percent)) / 100) * duration;
}

export function timeToPeakIndex(time: number, duration: number, peakCount: number) {
  if (duration <= 0 || peakCount <= 0) return 0;
  return Math.min(peakCount - 1, Math.max(0, Math.floor((time / duration) * peakCount)));
}
