import type { ReportReason } from '@/features/pin/constants/reportReasons';

// 회원 신고 / 피드(PIN) 신고 공통 요청 바디 (대상 리소스는 URL로만 구분된다).
export type ReportRequest =
  { category: Exclude<ReportReason, 'OTHER'> } | { category: 'OTHER'; detail: string };
