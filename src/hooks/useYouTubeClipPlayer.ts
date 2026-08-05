import { useCallback, useEffect, useRef, useState } from 'react';

const YOUTUBE_IFRAME_API_SRC = 'https://www.youtube.com/iframe_api';
const DEFAULT_CLIP_DURATION_MS = 15_000;

type YouTubePlayer = {
  destroy: () => void;
  pauseVideo: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
};

type YouTubePlayerConstructor = new (
  elementId: string | HTMLElement,
  options: {
    height?: string | number;
    width?: string | number;
    videoId?: string;
    playerVars?: Record<string, string | number>;
    events?: {
      onReady?: (event: { target: YouTubePlayer }) => void;
      onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
      onError?: () => void;
    };
  },
) => YouTubePlayer;

type YouTubeNamespace = {
  Player: YouTubePlayerConstructor;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
  };
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

type ClipTarget = {
  videoId: string;
  clipStartMs: number;
  clipDurationMs?: number;
};

let youtubeApiPromise: Promise<YouTubeNamespace> | null = null;

function loadYouTubeIframeApi() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube API is only available in the browser'));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<YouTubeNamespace>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT?.Player) {
        resolve(window.YT);
        return;
      }
      reject(new Error('YouTube IFrame API failed to initialize'));
    };

    if (!document.querySelector(`script[src="${YOUTUBE_IFRAME_API_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = YOUTUBE_IFRAME_API_SRC;
      script.async = true;
      script.onerror = () => reject(new Error('Failed to load YouTube IFrame API'));
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

export function preloadYouTubeIframeApi() {
  void loadYouTubeIframeApi().catch(() => {
    // 지도 진입 시 미리 로드만 시도한다. 실패해도 재생 시점에 다시 시도한다.
  });
}

/** 지도 PIN 말풍선용 YouTube 구간 재생. 화면 밖 플레이어로 오디오만 재생한다. */
export function useYouTubeClipPlayer() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const activeKeyRef = useRef<string | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  const clearStopTimer = useCallback(() => {
    if (stopTimerRef.current == null) return;
    window.clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
  }, []);

  const ensureHost = useCallback(() => {
    if (hostRef.current) return hostRef.current;

    const host = document.createElement('div');
    host.id = 'plimap-youtube-clip-player';
    host.setAttribute('aria-hidden', 'true');
    host.style.position = 'fixed';
    host.style.width = '1px';
    host.style.height = '1px';
    host.style.left = '-9999px';
    host.style.top = '0';
    host.style.opacity = '0';
    host.style.pointerEvents = 'none';
    document.body.appendChild(host);
    hostRef.current = host;
    return host;
  }, []);

  const destroyPlayer = useCallback(() => {
    playerRef.current?.destroy();
    playerRef.current = null;
    if (hostRef.current) {
      hostRef.current.replaceChildren();
    }
  }, []);

  const stop = useCallback(() => {
    clearStopTimer();
    activeKeyRef.current = null;
    setPlayingKey(null);
    playerRef.current?.pauseVideo();
  }, [clearStopTimer]);

  const play = useCallback(
    async (key: string, target: ClipTarget) => {
      if (!target.videoId) return;

      if (playingKey === key && activeKeyRef.current === key) {
        stop();
        return;
      }

      clearStopTimer();
      destroyPlayer();
      activeKeyRef.current = key;
      setPlayingKey(key);

      try {
        const YT = await loadYouTubeIframeApi();
        if (activeKeyRef.current !== key) return;

        const host = ensureHost();
        const mount = document.createElement('div');
        host.replaceChildren(mount);

        const startSec = Math.max(0, Math.floor(target.clipStartMs / 1000));
        const clipDurationMs = target.clipDurationMs ?? DEFAULT_CLIP_DURATION_MS;

        playerRef.current = new YT.Player(mount, {
          height: 1,
          width: 1,
          videoId: target.videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            start: startSec,
          },
          events: {
            onReady: (event) => {
              if (activeKeyRef.current !== key) return;
              event.target.seekTo(startSec, true);
              event.target.playVideo();
              clearStopTimer();
              stopTimerRef.current = window.setTimeout(() => {
                if (activeKeyRef.current !== key) return;
                stop();
              }, clipDurationMs);
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.ENDED && activeKeyRef.current === key) {
                stop();
              }
            },
            onError: () => {
              if (activeKeyRef.current === key) stop();
            },
          },
        });
      } catch (error) {
        console.error(error);
        if (activeKeyRef.current === key) stop();
      }
    },
    [clearStopTimer, destroyPlayer, ensureHost, playingKey, stop],
  );

  const toggle = useCallback(
    (key: string, target: ClipTarget) => {
      void play(key, target);
    },
    [play],
  );

  useEffect(() => {
    return () => {
      clearStopTimer();
      destroyPlayer();
      hostRef.current?.remove();
      hostRef.current = null;
    };
  }, [clearStopTimer, destroyPlayer]);

  return { playingKey, toggle, stop };
}
