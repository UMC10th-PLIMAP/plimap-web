import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { agreeToTerms, getTermsAgreementStatus } from '@/api/auth';
import { ApiError } from '@/api/client';
import CheckIcon from '@/assets/icons/check.svg?react';
import { useToast } from '@/hooks/useToast';
import { TopBar } from '@/components/ui/TopBar';
import { TermsDetailContent } from '@/features/auth/components/TermsDetailContent';
import { TERMS_BY_ID } from '@/features/auth/terms/content';
import type { TermId } from '@/features/auth/terms/types';
import { cn } from '@/lib/utils';
import type { TermsAgreementResponse } from '@/types/auth.type';

const MARKETING_CONSENT_FAILED_MESSAGE = '설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요.';
const MARKETING_CONSENT_LOAD_FAILED_MESSAGE = '동의 상태를 불러오지 못했어요.';
const TERMS_AGREEMENT_QUERY_KEY = ['auth', 'terms-agreement'] as const;

const isTermId = (value: string | undefined): value is TermId =>
  !!value && Object.hasOwn(TERMS_BY_ID, value);

export default function TermsDetailViewPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { termId } = useParams<{ termId: string }>();
  const isMarketingTerm = termId === 'MARKETING';
  const marketingConsentQuery = useQuery({
    queryKey: TERMS_AGREEMENT_QUERY_KEY,
    queryFn: getTermsAgreementStatus,
    enabled: isMarketingTerm,
  });
  const marketingConsentMutation = useMutation({
    mutationFn: (agreed: boolean) => agreeToTerms([{ id: 'MARKETING', agreed }]),
    onSuccess: (updatedAgreements) => {
      queryClient.setQueryData<TermsAgreementResponse>(
        TERMS_AGREEMENT_QUERY_KEY,
        (currentAgreements) =>
          currentAgreements?.map(
            (currentAgreement) =>
              updatedAgreements.find(
                (updatedAgreement) => updatedAgreement.type === currentAgreement.type,
              ) ?? currentAgreement,
          ) ?? updatedAgreements,
      );
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : MARKETING_CONSENT_FAILED_MESSAGE);
    },
  });
  const isMarketingConsentOn =
    marketingConsentQuery.data?.find((agreement) => agreement.type === 'MARKETING')?.agreed ??
    false;
  const isMarketingConsentDisabled =
    marketingConsentQuery.isPending ||
    marketingConsentQuery.isError ||
    marketingConsentMutation.isPending;

  if (!isTermId(termId)) {
    return <Navigate to="/app/settings" replace />;
  }

  const term = TERMS_BY_ID[termId];

  const handleMarketingConsentToggle = () => {
    if (isMarketingConsentDisabled) return;
    marketingConsentMutation.mutate(!isMarketingConsentOn);
  };

  return (
    <div className="flex min-h-screen flex-col pt-[env(safe-area-inset-top)]">
      <TopBar onBack={() => navigate(-1)} />
      <div className="pt-4">
        <TermsDetailContent term={term} />
      </div>

      {termId === 'MARKETING' && (
        <div className="-mt-5 flex flex-col gap-2 px-4 pb-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarketingConsentToggle}
              disabled={isMarketingConsentDisabled}
              aria-pressed={isMarketingConsentOn}
              aria-busy={marketingConsentQuery.isPending || marketingConsentMutation.isPending}
              aria-label="[선택] 마케팅 목적 광고성 정보 수신 동의"
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded bg-pli-black-75 disabled:cursor-not-allowed disabled:opacity-60',
                isMarketingConsentOn ? 'text-neon' : 'text-grayscale-600',
              )}
            >
              <CheckIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleMarketingConsentToggle}
              disabled={isMarketingConsentDisabled}
              className="body-17-r cursor-pointer text-left text-grayscale-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              [선택] 마케팅 목적 광고성 정보 수신 동의
            </button>
          </div>

          {marketingConsentQuery.isError ? (
            <p role="alert" className="flex items-center gap-2 body-15-r text-red">
              {MARKETING_CONSENT_LOAD_FAILED_MESSAGE}
              <button
                type="button"
                onClick={() => void marketingConsentQuery.refetch()}
                className="cursor-pointer underline underline-offset-2"
              >
                다시 시도
              </button>
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
