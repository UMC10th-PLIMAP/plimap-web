import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { getMyProfile } from '@/api/member';
import type { MyProfileResponse } from '@/types/member.type';

type UseMyProfileOptions = Partial<
  Pick<UseQueryOptions<MyProfileResponse>, 'staleTime' | 'retry' | 'refetchOnWindowFocus'>
>;

const MY_PROFILE_STALE_TIME = 60 * 1000;

export function useMyProfile(options?: UseMyProfileOptions) {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
    staleTime: MY_PROFILE_STALE_TIME,
    refetchOnWindowFocus: false,
    ...options,
  });
}
