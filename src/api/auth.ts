import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type { TermsAgreementRequest, TermsAgreementResponse } from '@/types/auth.type';
import type { TermId } from '@/features/auth/terms/types';

const ENDPOINT = '/api/v1/auth';

// 1) POST /api/v1/auth/terms - 이용약관 동의
export async function agreeToTerms(agreements: { id: TermId; agreed: boolean }[]) {
  const body: TermsAgreementRequest = {
    agreements: agreements.map(({ id, agreed }) => ({ type: id, agreed })),
  };

  const { data } = await apiClient.post<ApiResponse<TermsAgreementResponse>>(
    `${ENDPOINT}/terms`,
    body,
  );
  return data.result;
}
