import { useCallback, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { SESSION_EXPIRED_EVENT } from '@/api/client';
import { FullScreenError } from '@/components/ui/FullScreenError';
import { AccountSanctionModal } from '@/features/auth/components/AccountSanctionModal';
import { useAccountSanctionListener } from '@/features/auth/hooks/useAccountSanctionListener';
import type { PinSearchPlace } from '@/features/pin/types';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export type AppOutletContext = {
  selectedMapPlace: PinSearchPlace | null;
  selectMapPlace: (place: PinSearchPlace | null) => void;
  selectedMapPinId: string | null;
  selectMapPin: (pinId: string | null) => void;
};

const RootLayout = () => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const { sanction: accountSanction, clearSanction } = useAccountSanctionListener();
  const [selectedMapPlace, setSelectedMapPlace] = useState<PinSearchPlace | null>(null);
  const [selectedMapPinId, setSelectedMapPinId] = useState<string | null>(null);
  // 장소 검색 결과 시트와 핀 탭 시트는 동시에 뜨면 안 되므로 상호 배타적으로 둔다.
  // 그렇지 않으면, 핀 탭 → 장소 검색 → 장소 시트 닫기 순서에서 남아있던
  // selectedMapPinId 때문에 핀 시트가 뜬금없이 다시 떠 버린다.
  const selectMapPlace = useCallback((place: PinSearchPlace | null) => {
    setSelectedMapPlace(place);
    setSelectedMapPinId(null);
  }, []);
  const selectMapPin = useCallback((pinId: string | null) => {
    setSelectedMapPinId(pinId);
    setSelectedMapPlace(null);
  }, []);
  const outletContext = {
    selectedMapPlace,
    selectMapPlace,
    selectedMapPinId,
    selectMapPin,
  } satisfies AppOutletContext;

  useEffect(() => {
    const handleSessionExpired = () => setIsSessionExpired(true);
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  const handleSessionExpiredAction = () => {
    setIsSessionExpired(false);
    navigate('/app/login', { replace: true });
  };

  // 세션 도중 정지/탈퇴가 확인된 경우, 안내를 확인시킨 뒤 로그인 화면으로 내보낸다.
  const handleAccountSanctionModalClose = () => {
    clearSanction();
    navigate('/app/login', { replace: true });
  };

  return (
    <div className="mx-auto flex h-[var(--app-vh,100dvh)] max-w-[402px] flex-col overflow-y-auto bg-pli-black-100 scrollbar-hide">
      {!isOnline ? (
        <FullScreenError variant="network" onAction={() => window.location.reload()} />
      ) : isSessionExpired ? (
        <FullScreenError variant="session" onAction={handleSessionExpiredAction} />
      ) : (
        <Outlet context={outletContext} />
      )}
      <AccountSanctionModal
        open={accountSanction !== null}
        sanction={accountSanction}
        onClose={handleAccountSanctionModalClose}
      />
    </div>
  );
};

export default RootLayout;
