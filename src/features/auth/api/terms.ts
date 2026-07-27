import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type { TermId } from '@/features/auth/terms/types';

type TermsAgreementRequest = {
  agreements: { type: TermId; agreed: boolean }[];
};

type TermsAgreementResult = {
  type: TermId;
  agreed: boolean;
  agreedAt: string;
}[];

export async function agreeToTerms(agreements: { id: TermId; agreed: boolean }[]) {
  const body: TermsAgreementRequest = {
    agreements: agreements.map(({ id, agreed }) => ({ type: id, agreed })),
  };

  const { data } = await apiClient.post<ApiResponse<TermsAgreementResult>>(
    '/api/v1/auth/terms',
    body,
  );
  return data.result;
}
