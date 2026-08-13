import type { MemberSanctionReasonCategory, MemberSuspensionPeriod } from '@/types/member.type';

export type AccountSanctionStatus = 'SUSPENDED' | 'WITHDRAWN';
export type AccountSanctionReasonCategory = MemberSanctionReasonCategory;
export type SuspensionPeriod = MemberSuspensionPeriod;

export type AccountSanctionInfo = {
  status: AccountSanctionStatus;
  reasonCategory: AccountSanctionReasonCategory | null;
  reasonDetail: string | null;
  suspendedUntil: string | null;
  period: SuspensionPeriod | null;
  penaltyPoint: number;
};
