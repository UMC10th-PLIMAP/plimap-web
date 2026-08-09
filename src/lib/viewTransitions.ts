type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => {
    finished: Promise<void>;
  };
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const shouldUseViewTransition = () => {
  if (typeof document === 'undefined' || prefersReducedMotion()) return false;

  return typeof (document as ViewTransitionDocument).startViewTransition === 'function';
};

export const runViewTransition = (update: () => void | Promise<void>) => {
  if (!shouldUseViewTransition()) {
    void update();
    return;
  }

  const startViewTransition = (document as ViewTransitionDocument).startViewTransition;
  startViewTransition?.call(document, update);
};
