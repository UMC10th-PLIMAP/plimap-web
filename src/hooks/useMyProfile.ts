import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { getMyProfile } from '@/api/member';
import type { MyProfileResponse } from '@/types/member.type';

import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';

type UseMyProfileOptions = Partial<
  Pick<UseQueryOptions<MyProfileResponse>, 'staleTime' | 'retry' | 'refetchOnWindowFocus'>
>;

export function useMyProfile(options?: UseMyProfileOptions) {
  return useQuery({
    queryKey: memberQueryKeys.me(),
    queryFn: getMyProfile,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    ...options,
  });
}
