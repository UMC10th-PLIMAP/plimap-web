import type { Song } from '@/types/pin';

export const MOCK_WAVEFORM_PEAKS = [
  0.35, 0.55, 0.75, 0.9, 1, 0.85, 0.7, 0.95, 0.8, 0.65, 0.5, 0.4, 0.55, 0.7, 0.85, 0.95, 0.75, 0.6,
  0.45, 0.35, 0.5, 0.65, 0.8, 0.7, 0.55, 0.4, 0.35, 0.45, 0.6, 0.75, 0.85, 0.7, 0.55, 0.4, 0.35,
  0.45, 0.6, 0.75, 0.65, 0.5, 0.35, 0.55, 0.75, 0.9, 1, 0.85, 0.7, 0.95, 0.8, 0.65, 0.5, 0.4, 0.55,
  0.7, 0.85, 0.95, 0.75, 0.6, 0.45, 0.35, 0.5, 0.65, 0.8, 0.7, 0.55, 0.4, 0.35, 0.45, 0.6, 0.75,
  0.85, 0.7, 0.55, 0.4, 0.35, 0.45, 0.6, 0.75, 0.65, 0.5,
] as const;

export const MOCK_PREVIEW_DURATION = 30;
export const MIN_TRIM_DURATION = 5;
export const DEFAULT_TRIM_START_INDEX = 8;
export const DEFAULT_TRIM_END_INDEX = 24;

export const MOCK_SONGS: Song[] = [
  { id: '1', title: 'Hype Boy', artist: 'NewJeans', waveformPeaks: [...MOCK_WAVEFORM_PEAKS] },
  {
    id: '2',
    title: 'Hype Boy (250 Remix)',
    artist: 'NewJeans',
    waveformPeaks: [...MOCK_WAVEFORM_PEAKS],
  },
  {
    id: '3',
    title: 'Hype Boy (Instrumental)',
    artist: 'NewJeans',
    waveformPeaks: [...MOCK_WAVEFORM_PEAKS],
  },
  { id: '4', title: 'Attention', artist: 'NewJeans', waveformPeaks: [...MOCK_WAVEFORM_PEAKS] },
];

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
