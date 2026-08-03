import { useQuery } from '@tanstack/react-query';

import { getOtherMemberProfile } from '@/api/member';

export function useOtherMemberProfile(memberId?: string | number) {
  const id = memberId != null ? String(memberId) : undefined;

  return useQuery({
    queryKey: ['members', id],
    queryFn: () => getOtherMemberProfile(id!),
    enabled: Boolean(id),
  });
}
