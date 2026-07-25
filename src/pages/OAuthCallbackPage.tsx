import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import type { LoginPageLocationState } from '@/pages/LoginPage';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('error') === 'oauth_login_failed') {
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
