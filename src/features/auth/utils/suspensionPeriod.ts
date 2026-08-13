import type { SuspensionPeriod } from '@/features/auth/types';

const SUSPENSION_PERIOD_LABEL: Record<SuspensionPeriod, string> = {
  ONE_DAY: '1일 정지',
  THREE_DAYS: '3일 정지',
  FIVE_DAYS: '5일 정지',
  PERMANENT: '영구 정지',
};

export function getSuspensionPeriodLabel(period: SuspensionPeriod | null): string | null {
  if (!period) return null;
  return SUSPENSION_PERIOD_LABEL[period] ?? null;
}

export function isSuspensionPeriod(value: string | null): value is SuspensionPeriod {
  return value !== null && Object.hasOwn(SUSPENSION_PERIOD_LABEL, value);
}
