import { useEffect, useState } from 'react';

import { ACCOUNT_SANCTIONED_EVENT } from '@/api/client';
import { getMyProfile } from '@/api/member';
import type { AccountSanctionInfo } from '@/features/auth/types';
import type { MyProfileResponse } from '@/types/member.type';

function toAccountSanctionInfo(profile: MyProfileResponse): AccountSanctionInfo | null {
  if (profile.status !== 'SUSPENDED' && profile.status !== 'WITHDRAWN') return null;

  return {
    status: profile.status,
    reasonCategory: profile.reasonCategory,
    reasonDetail: profile.reasonDetail,
    suspendedUntil: profile.suspendedUntil,
    period: profile.lastPenaltyPeriod,
    penaltyPoint: profile.penaltyPoint,
  };
}

export function useAccountSanctionListener() {
  const [sanction, setSanction] = useState<AccountSanctionInfo | null>(null);

  useEffect(() => {
    const handleAccountSanctioned = () => {
      getMyProfile()
        .then((profile) => setSanction(toAccountSanctionInfo(profile)))
        .catch(() => {
          // 상세 조회 자체가 실패하면(예: 네트워크 오류) 조용히 무시한다
        });
    };

    window.addEventListener(ACCOUNT_SANCTIONED_EVENT, handleAccountSanctioned);
    return () => window.removeEventListener(ACCOUNT_SANCTIONED_EVENT, handleAccountSanctioned);
  }, []);

  return { sanction, clearSanction: () => setSanction(null) };
}
