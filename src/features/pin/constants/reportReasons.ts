export type ReportReason =
  | 'PERSONAL_INFORMATION_EXPOSURE'
  | 'OBSCENE_OR_HARMFUL'
  | 'ABUSE_OR_HATE_SPEECH'
  | 'COMMERCIAL_OR_PROMOTIONAL'
  | 'OTHER';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'PERSONAL_INFORMATION_EXPOSURE', label: '개인정보노출' },
  { value: 'OBSCENE_OR_HARMFUL', label: '음란/유해' },
  { value: 'ABUSE_OR_HATE_SPEECH', label: '욕설/혐오 표현' },
  { value: 'COMMERCIAL_OR_PROMOTIONAL', label: '상업적/홍보성' },
  { value: 'OTHER', label: '기타' },
];
