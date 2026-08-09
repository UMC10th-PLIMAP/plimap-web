import { useEffect, useRef } from 'react';

type ViewTransitionDocument = Document & {
  activeViewTransition?: { finished: Promise<void> } | null;
};

export function useAutoFocusAfterViewTransition<T extends HTMLElement>(enabled = true) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    let isCancelled = false;
    const focusElement = () => {
      if (!isCancelled) elementRef.current?.focus({ preventScroll: true });
    };
    const activeViewTransition = (document as ViewTransitionDocument).activeViewTransition;

    if (!activeViewTransition) {
      focusElement();
      return;
    }

    void activeViewTransition.finished.then(focusElement, focusElement);

    return () => {
      isCancelled = true;
    };
  }, [enabled]);

  return elementRef;
}
