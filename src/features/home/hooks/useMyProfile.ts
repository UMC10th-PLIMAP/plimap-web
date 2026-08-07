import { useQuery } from '@tanstack/react-query';

import { getMyProfile } from '@/api/member';
import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';

export function useMyProfile() {
  return useQuery({
    queryKey: memberQueryKeys.me(),
    queryFn: getMyProfile,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
