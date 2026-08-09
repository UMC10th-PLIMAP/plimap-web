import { Outlet, useMatches, useNavigate, useOutletContext } from 'react-router-dom';

import PlusIcon from '@/assets/icons/plus.svg?react';
import { BottomNav, type NavItemId } from '@/components/BottomNav';
import { useBottomNavigation } from '@/hooks/useBottomNavigation';
import type { AppOutletContext } from '@/layouts/RootLayout';
import { usePinCreationStore } from '@/store/pinCreationStore';

type BottomNavRouteHandle = {
  bottomNavItem?: NavItemId;
  mapPresentation?: 'visible' | 'overlay' | 'covered';
};

export default function BottomNavLayout() {
  const appContext = useOutletContext<AppOutletContext>();
  const matches = useMatches();
  const navigate = useNavigate();
  const handleTabChange = useBottomNavigation();
  const resetPinCreation = usePinCreationStore((state) => state.reset);
  const activeNavItem = matches.reduce<NavItemId | null>((activeItem, match) => {
    const { bottomNavItem } = (match.handle as BottomNavRouteHandle | undefined) ?? {};
    return bottomNavItem ?? activeItem;
  }, null);
  const isMapOverlay = matches.some(
    (match) => (match.handle as BottomNavRouteHandle | undefined)?.mapPresentation === 'overlay',
  );
  const isMapNavHidden =
    activeNavItem === 'plimap' &&
    (isMapOverlay || appContext.selectedMapPlace !== null || appContext.selectedMapPinId !== null);

  return (
    <>
      <Outlet context={appContext} />
      {activeNavItem && !isMapNavHidden ? (
        <BottomNav activeId={activeNavItem} onTabChange={handleTabChange}>
          {activeNavItem === 'plimap' ? (
            <button
              type="button"
              aria-label="핀 등록"
              onClick={() => {
                resetPinCreation();
                navigate('/app/pin/register/place');
              }}
              className="flex size-16 items-center justify-center rounded-full bg-gradient-neon text-grayscale-1200 shadow-[0_3px_8px_rgba(0,0,0,0.7)]"
            >
              <PlusIcon className="size-7" />
            </button>
          ) : null}
        </BottomNav>
      ) : null}
    </>
  );
}
