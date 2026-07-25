export type ReportReason = 'PRIVACY' | 'OBSCENE' | 'ABUSE' | 'PROMOTIONAL' | 'OTHER';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'PRIVACY', label: '개인정보노출' },
  { value: 'OBSCENE', label: '음란/유해' },
  { value: 'ABUSE', label: '욕설/혐오 표현' },
  { value: 'PROMOTIONAL', label: '상업적/홍보성' },
  { value: 'OTHER', label: '기타' },
];
