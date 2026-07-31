import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';

import { getMyProfile } from '@/api/member';
import type { AppOutletContext } from '@/layouts/RootLayout';

const AuthGuard = () => {
  const outletContext = useOutletContext<AppOutletContext>();

  const { status } = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  if (status === 'pending') return null;
  if (status === 'error') return <Navigate to="/app/login" replace />;

  return <Outlet context={outletContext} />;
};

export default AuthGuard;
