import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { Toggle } from '@/components/ui/Toggle';
import { TermsDetailContent } from '@/features/auth/components/TermsDetailContent';
import { TERMS_BY_ID } from '@/features/auth/terms/content';
import type { TermId } from '@/features/auth/terms/types';

const isTermId = (value: string | undefined): value is TermId => !!value && value in TERMS_BY_ID;

export default function TermsDetailViewPage() {
  const navigate = useNavigate();
  const { termId } = useParams<{ termId: string }>();
  // TODO: 서버 저장/조회 연동 필요 (현재는 로컬 상태만, 새로고침하면 초기화됨)
  const [isMarketingConsentOn, setIsMarketingConsentOn] = useState(false);

  if (!isTermId(termId)) {
    return <Navigate to="/app/settings" replace />;
  }

  const term = TERMS_BY_ID[termId];

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar onBack={() => navigate(-1)} />
      <TermsDetailContent term={term} />

      {termId === 'MARKETING' && (
        <div className="px-4 pb-10">
          <Toggle
            checked={isMarketingConsentOn}
            onChange={setIsMarketingConsentOn}
            aria-label="마케팅 정보 수신 동의"
          />
        </div>
      )}
    </div>
  );
}
