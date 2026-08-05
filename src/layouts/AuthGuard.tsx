import { Outlet, useNavigate, useOutletContext } from 'react-router-dom';

import { isNetworkError, isUnauthorizedError } from '@/api/client';
import { FullScreenError } from '@/components/ui/FullScreenError';
import { useMyProfile } from '@/hooks/useMyProfile';
import type { AppOutletContext } from '@/layouts/RootLayout';

const AuthGuard = () => {
  const navigate = useNavigate();
  const context = useOutletContext<AppOutletContext>();
  const { status, error, refetch } = useMyProfile({
    retry: (failureCount, err) => !isUnauthorizedError(err) && failureCount < 2,
  });

  if (status === 'pending') return null;
  if (status === 'error') {
    if (isNetworkError(error)) {
      return <FullScreenError variant="network" onAction={() => void refetch()} />;
    }

    return (
      <FullScreenError
        variant="session"
        onAction={() => navigate('/app/login', { replace: true })}
      />
    );
  }

  return <Outlet context={context} />;
};

export default AuthGuard;
