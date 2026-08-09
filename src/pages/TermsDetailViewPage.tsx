import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { agreeToTerms } from '@/api/auth';
import { ApiError } from '@/api/client';
import CheckIcon from '@/assets/icons/check.svg?react';
import { TopBar } from '@/components/ui/TopBar';
import { TermsDetailContent } from '@/features/auth/components/TermsDetailContent';
import { TERMS_BY_ID } from '@/features/auth/terms/content';
import type { TermId } from '@/features/auth/terms/types';
import { cn } from '@/lib/utils';

const MARKETING_CONSENT_FAILED_MESSAGE = '설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요.';

const isTermId = (value: string | undefined): value is TermId =>
  !!value && Object.hasOwn(TERMS_BY_ID, value);

export default function TermsDetailViewPage() {
  const navigate = useNavigate();
  const { termId } = useParams<{ termId: string }>();
  // TODO: 동의 상태를 조회하는 API가 아직 없어 항상 false로 시작한다.
  // 조회 API가 추가되면 초기값을 서버 값으로 대체할 것.
  const [isMarketingConsentOn, setIsMarketingConsentOn] = useState(false);
  const [isSavingConsent, setIsSavingConsent] = useState(false);

  if (!isTermId(termId)) {
    return <Navigate to="/app/settings" replace />;
  }

  const term = TERMS_BY_ID[termId];

  const handleMarketingConsentToggle = async () => {
    if (isSavingConsent) return;
    const nextValue = !isMarketingConsentOn;
    setIsSavingConsent(true);

    try {
      await agreeToTerms([{ id: 'MARKETING', agreed: nextValue }]);
      setIsMarketingConsentOn(nextValue);
    } catch (error) {
      alert(error instanceof ApiError ? error.message : MARKETING_CONSENT_FAILED_MESSAGE);
    } finally {
      setIsSavingConsent(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar onBack={() => navigate(-1)} />
      <div className="pt-4">
        <TermsDetailContent term={term} />
      </div>

      {termId === 'MARKETING' && (
        <div className="-mt-5 flex items-center gap-2 px-4 pb-10">
          <button
            type="button"
            onClick={handleMarketingConsentToggle}
            aria-pressed={isMarketingConsentOn}
            aria-label="[선택] 마케팅 목적 광고성 정보 수신 동의"
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded bg-pli-black-75',
              isMarketingConsentOn ? 'text-neon' : 'text-grayscale-600',
            )}
          >
            <CheckIcon className="size-4" />
          </button>
          <span
            onClick={handleMarketingConsentToggle}
            className="body-17-r cursor-pointer text-grayscale-300"
          >
            [선택] 마케팅 목적 광고성 정보 수신 동의
          </span>
        </div>
      )}
    </div>
  );
}
