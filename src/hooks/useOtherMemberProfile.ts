import { useQuery } from '@tanstack/react-query';

import { getOtherMemberProfile } from '@/api/member';

export function useOtherMemberProfile(memberId?: number) {
  const isValidId = Number.isInteger(memberId) && (memberId ?? 0) > 0;

  return useQuery({
    queryKey: ['members', memberId],
    queryFn: () => getOtherMemberProfile(memberId!),
    enabled: isValidId,
  });
}
