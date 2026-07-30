import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type { NicknameCheckResponse } from '@/types/member.type';

const ENDPOINT = '/api/v1/members';

// 1) GET /api/v1/members/nickname/check - 닉네임 사용 가능 여부 확인
export async function checkNicknameAvailability(nickname: string) {
  const { data } = await apiClient.get<ApiResponse<NicknameCheckResponse>>(
    `${ENDPOINT}/nickname/check`,
    { params: { nickname } },
  );
  return data.result;
}
