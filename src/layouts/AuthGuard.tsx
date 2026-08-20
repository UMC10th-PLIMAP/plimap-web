import { Navigate, Outlet, useOutletContext } from 'react-router-dom';

import { isNetworkError, isUnauthorizedError } from '@/api/client';
import { FullScreenError } from '@/components/ui/FullScreenError';
import { useMyProfile } from '@/hooks/useMyProfile';
import type { AppOutletContext } from '@/layouts/RootLayout';

const AuthGuard = () => {
  const context = useOutletContext<AppOutletContext>();
  const { status, error, refetch } = useMyProfile({
    retry: (failureCount, err) => !isUnauthorizedError(err) && failureCount < 2,
  });

  if (status === 'pending') return null;
  if (status === 'error') {
    if (isNetworkError(error)) {
      return <FullScreenError variant="network" onAction={() => void refetch()} />;
    }

    if (isUnauthorizedError(error)) {
      return <Navigate to="/app/login" replace />;
    }

    return <FullScreenError variant="unknown" onAction={() => void refetch()} />;
  }

  return <Outlet context={context} />;
};

export default AuthGuard;
