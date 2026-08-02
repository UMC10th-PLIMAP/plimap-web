import { useEffect, useRef } from 'react';

type UseInfiniteScrollOptions = {
  enabled?: boolean;
  rootMargin?: string;
  /** 값이 바뀌면 observer를 다시 연결 (예: isFetchingNextPage) */
  reconnectKey?: unknown;
};

export function useInfiniteScroll(
  onIntersect: () => void,
  { enabled = true, rootMargin = '200px', reconnectKey }: UseInfiniteScrollOptions = {},
) {
  const targetRef = useRef<HTMLDivElement>(null);
  const onIntersectRef = useRef(onIntersect);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const target = targetRef.current;
    if (!enabled || !target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onIntersectRef.current();
      },
      { rootMargin },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, rootMargin, reconnectKey]);

  return targetRef;
}
