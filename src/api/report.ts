import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type { ReportReason } from '@/features/pin/constants/reportReasons';
import type { ReportRequest } from '@/types/report.type';

function buildReportBody(category: ReportReason, detail?: string): ReportRequest {
  const trimmedDetail = detail?.trim();
  if (category === 'OTHER' && !trimmedDetail) {
    throw new Error('OTHER 카테고리는 상세 내용이 필요합니다.');
  }

  return category === 'OTHER' ? { category, detail: trimmedDetail! } : { category };
}

/** POST /api/v1/reports/members/{memberId} - 회원 신고 */
export async function reportMember(memberId: number, category: ReportReason, detail?: string) {
  await apiClient.post<ApiResponse<null>>(
    `/api/v1/reports/members/${memberId}`,
    buildReportBody(category, detail),
  );
}

/** POST /api/v1/reports/pins/{pinId} - 피드(PIN) 신고 */
export async function reportPin(pinId: number, category: ReportReason, detail?: string) {
  await apiClient.post<ApiResponse<null>>(
    `/api/v1/reports/pins/${pinId}`,
    buildReportBody(category, detail),
  );
}
