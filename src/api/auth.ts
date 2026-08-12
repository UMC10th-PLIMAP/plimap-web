import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type {
  OnboardingRequest,
  OnboardingResponse,
  TermsAgreementRequest,
  TermsAgreementResponse,
} from '@/types/auth.type';
import type { TermId } from '@/features/auth/terms/types';

const ENDPOINT = '/api/v1/auth';

// GET /api/v1/auth/terms - 현재 사용자의 약관 동의 상태 조회
export async function getTermsAgreementStatus() {
  const { data } = await apiClient.get<ApiResponse<TermsAgreementResponse>>(`${ENDPOINT}/terms`);
  return data.result;
}

// POST /api/v1/auth/terms - 이용약관 동의
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

// POST /api/v1/auth/onboarding - 온보딩(닉네임/프로필 설정) 완료
export async function completeOnboarding(nickname: string) {
  const body: OnboardingRequest = { nickname };

  const { data } = await apiClient.post<ApiResponse<OnboardingResponse>>(
    `${ENDPOINT}/onboarding`,
    body,
  );
  return data.result;
}

// DELETE /api/v1/auth/logout - 로그아웃
export async function logout() {
  await apiClient.delete<ApiResponse<null>>(`${ENDPOINT}/logout`);
}
