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
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!src) return;

    const audio = new Audio(src);
    audio.preload = 'metadata';

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handleTimeUpdate = () => {
      if (endSec == null) return;
      if (audio.currentTime >= endSec) {
        audio.pause();
        audio.currentTime = Math.max(0, startSec);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.pause();
      audioRef.current = null;
    };
  }, [src, startSec, endSec]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    const safeStart = Math.max(0, startSec);
    if (audio.currentTime < safeStart || (endSec != null && audio.currentTime >= endSec)) {
      audio.currentTime = safeStart;
    }

    try {
      await audio.play();
    } catch (error) {
      console.error(error);
      setIsPlaying(false);
    }
  }, [endSec, src, startSec]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = Math.max(0, startSec);
  }, [startSec]);

  return { isPlaying, toggle, stop, canPlay: Boolean(src) };
}
