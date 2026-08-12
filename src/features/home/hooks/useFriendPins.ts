import { useQuery } from '@tanstack/react-query';

import { getFriendPins } from '@/api/pin';

export function useFriendPins(pageSize = 10) {
  return useQuery({
    queryKey: ['home', 'pins', 'friends', { pageSize }],
    queryFn: () => getFriendPins({ pageSize }),
    staleTime: 60_000,
  });
}
