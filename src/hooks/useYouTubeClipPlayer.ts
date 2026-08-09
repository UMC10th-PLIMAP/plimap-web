import { useCallback, useEffect, useRef, useState } from 'react';

const YOUTUBE_IFRAME_API_SRC = 'https://www.youtube.com/iframe_api';
const DEFAULT_CLIP_DURATION_MS = 15_000;

type YouTubePlayer = {
  destroy: () => void;
  pauseVideo: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  loadVideoById: (args: { videoId: string; startSeconds?: number }) => void;
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
    CUED: number;
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

type UseYouTubeClipPlayerOptions = {
  enabled?: boolean;
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

  const request = new Promise<YouTubeNamespace>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT?.Player) {
        resolve(window.YT);
        return;
      }
      reject(new Error('YouTube IFrame API failed to initialize'));
    };

    const script = document.createElement('script');
    script.src = YOUTUBE_IFRAME_API_SRC;
    script.async = true;
    script.dataset.plimapYoutubeApi = 'true';
    script.onerror = () => {
      script.remove();
      reject(new Error('Failed to load YouTube IFrame API'));
    };

    document.querySelector('script[data-plimap-youtube-api]')?.remove();
    document.head.appendChild(script);
  });

  // 실패한 로드를 캐싱하면 이후 재생이 영구히 막히므로, 실패 시 다음 호출이 새로 로드하게 한다.
  youtubeApiPromise = request.catch((error: unknown) => {
    youtubeApiPromise = null;
    throw error;
  });

  return youtubeApiPromise;
}

export function preloadYouTubeIframeApi() {
  void loadYouTubeIframeApi().catch(() => {
    // 지도 진입 시 미리 로드만 시도한다. 실패해도 재생 시점에 다시 시도한다.
  });
}

/** 지도 PIN 말풍선용 YouTube 구간 재생. 화면 안 초소형 플레이어로 오디오만 재생한다. */
export function useYouTubeClipPlayer({ enabled = true }: UseYouTubeClipPlayerOptions = {}) {
  const enabledRef = useRef(enabled);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerReadyRef = useRef(false);
  const ytRef = useRef<YouTubeNamespace | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const activeKeyRef = useRef<string | null>(null);
  const activeClipDurationRef = useRef(DEFAULT_CLIP_DURATION_MS);
  const playerReadyPromiseRef = useRef<Promise<YouTubePlayer> | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

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
    // iOS는 화면 밖(-9999px)·완전 투명 플레이어 재생을 막는 경우가 있어
    // 뷰포트 안에 아주 작게 둔다.
    host.style.position = 'fixed';
    host.style.width = '48px';
    host.style.height = '48px';
    host.style.right = '0';
    host.style.bottom = '0';
    host.style.opacity = '0.01';
    host.style.overflow = 'hidden';
    host.style.pointerEvents = 'none';
    host.style.zIndex = '-1';
    document.body.appendChild(host);
    hostRef.current = host;
    return host;
  }, []);

  const destroyPlayer = useCallback(() => {
    playerReadyRef.current = false;
    playerReadyPromiseRef.current = null;
    const player = playerRef.current;
    playerRef.current = null;
    player?.destroy();
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

  const scheduleClipStop = useCallback(
    (key: string, clipDurationMs: number) => {
      clearStopTimer();
      stopTimerRef.current = window.setTimeout(() => {
        if (activeKeyRef.current !== key) return;
        stop();
      }, clipDurationMs);
    },
    [clearStopTimer, stop],
  );

  const ensurePlayer = useCallback(async () => {
    if (playerRef.current && playerReadyRef.current) {
      return playerRef.current;
    }
    if (playerReadyPromiseRef.current) {
      return playerReadyPromiseRef.current;
    }

    const readyPromise = (async () => {
      const YT = await loadYouTubeIframeApi();
      if (!enabledRef.current) throw new Error('YouTube clip player is disabled');
      ytRef.current = YT;

      if (playerRef.current && playerReadyRef.current) {
        return playerRef.current;
      }

      destroyPlayer();
      const host = ensureHost();
      const mount = document.createElement('div');
      host.replaceChildren(mount);

      return await new Promise<YouTubePlayer>((resolve, reject) => {
        try {
          playerRef.current = new YT.Player(mount, {
            height: 48,
            width: 48,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
            },
            events: {
              onReady: (event) => {
                if (!enabledRef.current) {
                  if (playerRef.current === event.target) destroyPlayer();
                  reject(new Error('YouTube clip player is disabled'));
                  return;
                }
                playerReadyRef.current = true;
                resolve(event.target);
              },
              onStateChange: (event) => {
                const key = activeKeyRef.current;
                if (!key) return;

                if (event.data === YT.PlayerState.PLAYING) {
                  setPlayingKey(key);
                  scheduleClipStop(key, activeClipDurationRef.current);
                  return;
                }

                if (event.data === YT.PlayerState.ENDED && activeKeyRef.current === key) {
                  stop();
                }
              },
              onError: () => {
                if (activeKeyRef.current) stop();
              },
            },
          });
        } catch (error) {
          playerReadyPromiseRef.current = null;
          reject(error);
        }
      });
    })();

    playerReadyPromiseRef.current = readyPromise.catch((error: unknown) => {
      playerReadyPromiseRef.current = null;
      throw error;
    });

    return playerReadyPromiseRef.current;
  }, [destroyPlayer, ensureHost, scheduleClipStop, stop]);

  const playClipOnPlayer = useCallback((player: YouTubePlayer, target: ClipTarget) => {
    const startSec = Math.max(0, target.clipStartMs / 1000);
    activeClipDurationRef.current = target.clipDurationMs ?? DEFAULT_CLIP_DURATION_MS;
    player.loadVideoById({
      videoId: target.videoId,
      startSeconds: startSec,
    });
    player.playVideo();
  }, []);

  const play = useCallback(
    async (key: string, target: ClipTarget) => {
      if (!enabledRef.current || !target.videoId) return;

      // 같은 키면 토글 정지 (UI상 재생 중이거나 로딩 중이어도)
      if (activeKeyRef.current === key) {
        stop();
        return;
      }

      clearStopTimer();
      activeKeyRef.current = key;
      setPlayingKey(null);

      // 플레이어가 이미 준비됐으면 클릭 제스처 안에서 바로 playVideo 호출 (모바일 핵심)
      if (playerRef.current && playerReadyRef.current) {
        playClipOnPlayer(playerRef.current, target);
        return;
      }

      try {
        const player = await ensurePlayer();
        if (activeKeyRef.current !== key) return;
        playClipOnPlayer(player, target);
      } catch (error) {
        if (enabledRef.current) console.error(error);
        if (activeKeyRef.current === key) stop();
      }
    },
    [clearStopTimer, ensurePlayer, playClipOnPlayer, stop],
  );

  const toggle = useCallback(
    (key: string, target: ClipTarget) => {
      void play(key, target);
    },
    [play],
  );

  // 지도/상세 진입 시 API·플레이어를 미리 만들어 첫 클릭 지연을 줄인다.
  useEffect(() => {
    if (!enabled) {
      clearStopTimer();
      activeKeyRef.current = null;
      destroyPlayer();
      hostRef.current?.remove();
      hostRef.current = null;
      return;
    }

    void ensurePlayer().catch(() => {
      // 미리 준비 실패해도 재생 시점에 다시 시도한다.
    });
  }, [clearStopTimer, destroyPlayer, enabled, ensurePlayer]);

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
