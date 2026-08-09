import { useQuery } from '@tanstack/react-query';

import { getOtherMemberProfile } from '@/api/member';
import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';

export function useOtherMemberProfile(memberId?: number) {
  const isValidId = Number.isInteger(memberId) && (memberId ?? 0) > 0;

  return useQuery({
    queryKey: memberQueryKeys.profile(memberId ?? 0),
    queryFn: () => getOtherMemberProfile(memberId!),
    enabled: isValidId,
  });
}
