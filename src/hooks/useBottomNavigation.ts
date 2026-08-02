import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import type { NavItemId } from '@/components/BottomNav';

const NAV_ROUTES: Record<NavItemId, string> = {
  home: '/app/home',
  plimap: '/app',
  my: '/app/my',
};

export function useBottomNavigation() {
  const navigate = useNavigate();

  return useCallback(
    (id: NavItemId) => {
      navigate(NAV_ROUTES[id]);
    },
    [navigate],
  );
}
