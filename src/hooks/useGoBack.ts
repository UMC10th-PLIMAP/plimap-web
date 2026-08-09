import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/** 앱 안에서 쌓인 히스토리가 있으면 한 칸 뒤로, 직접 진입이라 없으면 fallback으로 보낸다. */
export function useGoBack(fallbackPath: string) {
  const navigate = useNavigate();

  return useCallback(() => {
    const historyIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0;

    if (historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath, { replace: true });
  }, [fallbackPath, navigate]);
}
