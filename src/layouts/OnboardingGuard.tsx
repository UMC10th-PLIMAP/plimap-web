import { Navigate, Outlet } from 'react-router-dom';

import { isDemoSession } from '@/features/auth/utils/demoSession';

export default function OnboardingGuard() {
  if (isDemoSession()) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
