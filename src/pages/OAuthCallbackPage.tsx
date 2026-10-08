import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import type { AccountSanctionInfo } from '@/features/auth/types';
import { isAccountSanctionReasonCategory } from '@/features/auth/utils/accountSanctionReason';
import { isSuspensionPeriod } from '@/features/auth/utils/suspensionPeriod';
import type { LoginPageLocationState } from '@/pages/LoginPage';

function parsePenaltyPoint(value: string | null): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function parseAccountSanctionInfo(
  error: string | null,
  searchParams: URLSearchParams,
): AccountSanctionInfo | null {
  if (error !== 'account_suspended' && error !== 'account_permanently_banned') return null;

  const reasonCategoryParam = searchParams.get('reasonCategory');
  const periodParam = searchParams.get('period');

  return {
    status: error === 'account_suspended' ? 'SUSPENDED' : 'WITHDRAWN',
    reasonCategory: isAccountSanctionReasonCategory(reasonCategoryParam)
      ? reasonCategoryParam
      : null,
    reasonDetail: searchParams.get('reasonDetail'),
    suspendedUntil: searchParams.get('suspendedUntil'),
    period: isSuspensionPeriod(periodParam) ? periodParam : null,
    penaltyPoint: parsePenaltyPoint(searchParams.get('penaltyPoint')),
  };
}

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');

    const accountSanction = parseAccountSanctionInfo(error, searchParams);
    if (accountSanction) {
      const state: LoginPageLocationState = { accountSanction };
      navigate('/app/login', { replace: true, state });
      return;
    }

    if (error === 'oauth_login_failed') {
      const state: LoginPageLocationState = { oauthError: true };
      navigate('/app/login', { replace: true, state });
      return;
    }

    const isNewUser = searchParams.get('isNewUser');

    if (isNewUser === 'true') {
      navigate('/app/onboarding/terms', { replace: true });
    } else if (isNewUser === 'false') {
      navigate('/app', { replace: true });
    } else {
      const state: LoginPageLocationState = { oauthError: true };
      navigate('/app/login', { replace: true, state });
    }
  }, [searchParams, navigate]);

  return <div className="h-full min-h-screen bg-pli-black-100" />;
}
