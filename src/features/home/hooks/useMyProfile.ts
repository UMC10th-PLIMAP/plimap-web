import { useQuery } from '@tanstack/react-query';

import { getMyProfile } from '@/api/member';

export function useMyProfile() {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
