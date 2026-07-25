import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type { TermId } from '@/features/auth/terms/types';

type TermsAgreementType = 'SERVICE' | 'PRIVACY' | 'LOCATION' | 'MARKETING';

const TERM_TYPE_BY_ID: Record<TermId, TermsAgreementType> = {
  service: 'SERVICE',
  privacy: 'PRIVACY',
  location: 'LOCATION',
  marketing: 'MARKETING',
};

type TermsAgreementRequest = {
  agreements: { type: TermsAgreementType; agreed: boolean }[];
};

type TermsAgreementResult = {
  type: TermsAgreementType;
  agreed: boolean;
  agreedAt: string;
}[];

export async function agreeToTerms(agreements: { id: TermId; agreed: boolean }[]) {
  const body: TermsAgreementRequest = {
    agreements: agreements.map(({ id, agreed }) => ({ type: TERM_TYPE_BY_ID[id], agreed })),
  };

  const { data } = await apiClient.post<ApiResponse<TermsAgreementResult>>(
    '/api/v1/auth/terms',
    body,
  );
  return data.result;
}
