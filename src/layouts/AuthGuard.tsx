import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet } from 'react-router-dom';

import { isUnauthorizedError } from '@/api/client';
import { getMyProfile } from '@/api/member';

const SESSION_CHECK_FAILED_MESSAGE = '로그인 상태를 확인하지 못했어요. 다시 로그인해 주세요.';

const AuthGuard = () => {
  const { status, error } = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
    retry: (failureCount, err) => !isUnauthorizedError(err) && failureCount < 2,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (status === 'error' && !isUnauthorizedError(error)) {
      alert(SESSION_CHECK_FAILED_MESSAGE);
    }
  }, [status, error]);

  if (status === 'pending') return null;
  if (status === 'error') return <Navigate to="/app/login" replace />;

  return <Outlet />;
};

export default AuthGuard;
