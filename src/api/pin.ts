import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type { MemberMeRequest, MemberMeResponse } from '../types';

{
  /* GET /api/v1/feed/members/me 내 피드 목록 조회 */
}
export async function getMemberMe({ pageSize, cursor }: MemberMeRequest) {
  const { data } = await apiClient.get<ApiResponse<MemberMeResponse>>(`/api/v1/feed/members/me`, {
    params: { pageSize, cursor },
  });
  return data.result;
}
