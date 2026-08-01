import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type { ReportReason } from '@/features/pin/constants/reportReasons';
import type { MemberReportRequest } from '@/types/report.type';

const ENDPOINT = '/api/v1/reports/members';

/** POST /api/v1/reports/members/{memberId} - 회원 신고 */
export async function reportMember(memberId: number, category: ReportReason, detail?: string) {
  const trimmedDetail = detail?.trim();
  if (category === 'OTHER' && !trimmedDetail) {
    throw new Error('OTHER 카테고리는 상세 내용이 필요합니다.');
  }

  const body: MemberReportRequest =
    category === 'OTHER' ? { category, detail: trimmedDetail! } : { category };

  await apiClient.post<ApiResponse<null>>(`${ENDPOINT}/${memberId}`, body);
}
