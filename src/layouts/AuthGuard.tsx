import { useEffect } from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';

import { isUnauthorizedError } from '@/api/client';
import { useMyProfile } from '@/hooks/useMyProfile';
import type { AppOutletContext } from '@/layouts/RootLayout';

const SESSION_CHECK_FAILED_MESSAGE = '로그인 상태를 확인하지 못했어요. 다시 로그인해 주세요.';

const AuthGuard = () => {
  const context = useOutletContext<AppOutletContext>();
  const { status, error } = useMyProfile({
    retry: (failureCount, err) => !isUnauthorizedError(err) && failureCount < 2,
  });

  useEffect(() => {
    if (status === 'error' && !isUnauthorizedError(error)) {
      alert(SESSION_CHECK_FAILED_MESSAGE);
    }
  }, [status, error]);

  if (status === 'pending') return null;
  if (status === 'error') return <Navigate to="/app/login" replace />;

  return <Outlet context={context} />;
};

export default AuthGuard;
