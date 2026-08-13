import type { AccountSanctionReasonCategory } from '@/features/auth/types';

const ACCOUNT_SANCTION_REASON_LABEL: Record<AccountSanctionReasonCategory, string> = {
  PERSONAL_INFORMATION_EXPOSURE: '개인정보노출',
  OBSCENE_OR_HARMFUL: '음란/유해',
  ABUSE_OR_HATE_SPEECH: '욕설/혐오 표현',
  COMMERCIAL_OR_PROMOTIONAL: '상업적/홍보성',
  OTHER: '기타',
};

export function getAccountSanctionReasonLabel(
  category: AccountSanctionReasonCategory | null,
): string | null {
  if (!category) return null;
  return ACCOUNT_SANCTION_REASON_LABEL[category] ?? null;
}

export function isAccountSanctionReasonCategory(
  value: string | null,
): value is AccountSanctionReasonCategory {
  return value !== null && Object.hasOwn(ACCOUNT_SANCTION_REASON_LABEL, value);
}
