import { useMutation, useQueryClient } from '@tanstack/react-query';

import { loginWithDemoAccount } from '@/api/auth';
import { getMyProfile } from '@/api/member';
import { markDemoSession } from '@/features/auth/utils/demoSession';
import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';

export function useDemoLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await loginWithDemoAccount();
      markDemoSession();
      return getMyProfile();
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(memberQueryKeys.me(), profile);
    },
  });
}
