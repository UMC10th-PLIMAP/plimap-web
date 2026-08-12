import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { ApiError, isNetworkError } from '@/api/client';
import { FullScreenError, type FullScreenErrorVariant } from '@/components/ui/FullScreenError';

type RequestErrorScreenProps = {
  error: unknown;
  onRetry: () => void;
  onBack?: () => void;
};

function getRequestErrorVariant(error: unknown): FullScreenErrorVariant {
  if (isNetworkError(error)) return 'network';

  const status =
    error instanceof ApiError
      ? error.status
      : axios.isAxiosError(error)
        ? error.response?.status
        : undefined;

  if (status === 401) return 'session';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not-found';
  return 'unknown';
}

export function RequestErrorScreen({ error, onRetry, onBack }: RequestErrorScreenProps) {
  const navigate = useNavigate();
  const variant = getRequestErrorVariant(error);

  const handleAction = () => {
    if (variant === 'session') {
      navigate('/app/login', { replace: true });
      return;
    }

    if (variant === 'forbidden' || variant === 'not-found') {
      if (onBack) {
        onBack();
        return;
      }

      navigate(-1);
      return;
    }

    onRetry();
  };

  return <FullScreenError variant={variant} onAction={handleAction} />;
}
