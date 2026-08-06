import { useCallback, useEffect, useRef, useState } from 'react';

type UseAudioPreviewOptions = {
  src?: string | null;
  /** 미리듣기 시작 지점 (초). 지정하지 않으면 0부터 재생 */
  startSec?: number;
  /** 미리듣기 종료 지점 (초). 지정하지 않으면 끝까지 재생 */
  endSec?: number;
};

/** HTMLAudioElement로 previewUrl 미리듣기를 재생/정지한다. */
export function useAudioPreview({ src, startSec = 0, endSec }: UseAudioPreviewOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startSecRef = useRef(startSec);
  const endSecRef = useRef(endSec);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [durationSec, setDurationSec] = useState<number | null>(null);

  useEffect(() => {
    startSecRef.current = startSec;
    endSecRef.current = endSec;
  }, [endSec, startSec]);

  useEffect(() => {
    if (!src) return;

    const audio = new Audio(src);
    audio.preload = 'metadata';

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handleCanPlay = () => setCanPlay(true);
    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDurationSec(audio.duration);
      }
    };
    const handleError = () => {
      setCanPlay(false);
      setIsPlaying(false);
    };
    const handleTimeUpdate = () => {
      const end = endSecRef.current;
      if (end == null) return;
      if (audio.currentTime >= end) {
        audio.pause();
        audio.currentTime = Math.max(0, startSecRef.current);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.pause();
      audioRef.current = null;
      setCanPlay(false);
      setIsPlaying(false);
      setDurationSec(null);
    };
  }, [src]);

  // 구간이 바뀌어도 재생 중이면 현재 위치가 새 구간 밖일 때만 seek 한다.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const safeStart = Math.max(0, startSec);
    const isOutsideRange =
      audio.currentTime < safeStart || (endSec != null && audio.currentTime >= endSec);

    if (isOutsideRange) {
      audio.currentTime = safeStart;
    }
  }, [endSec, startSec]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    const safeStart = Math.max(0, startSecRef.current);
    const end = endSecRef.current;
    if (audio.currentTime < safeStart || (end != null && audio.currentTime >= end)) {
      audio.currentTime = safeStart;
    }

    try {
      await audio.play();
    } catch (error) {
      console.error(error);
      setIsPlaying(false);
    }
  }, [src]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = Math.max(0, startSecRef.current);
  }, []);

  // 구간은 props(startSec/endSec)가 단일 소스. play는 props 기준으로만 재생한다.
  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    const safeStart = Math.max(0, startSecRef.current);
    audio.currentTime = safeStart;

    try {
      await audio.play();
    } catch (error) {
      console.error(error);
      setIsPlaying(false);
    }
  }, [src]);

  return { isPlaying, toggle, play, stop, canPlay, durationSec };
}
