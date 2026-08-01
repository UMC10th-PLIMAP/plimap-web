import type { ReportReason } from '@/features/pin/constants/reportReasons';

export type MemberReportRequest =
  { category: Exclude<ReportReason, 'OTHER'> } | { category: 'OTHER'; detail: string };
