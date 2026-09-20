import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import type { NavItemId } from '@/components/BottomNav';
import { trackEvent } from '@/lib/analytics';

const NAV_ROUTES: Record<NavItemId, string> = {
  home: '/app/home',
  plimap: '/app',
  my: '/app/my',
};

export function useBottomNavigation() {
  const navigate = useNavigate();

  return useCallback(
    (id: NavItemId) => {
      trackEvent('bottom_nav_click', { tab: id });
      navigate(NAV_ROUTES[id]);
    },
    [navigate],
  );
}
