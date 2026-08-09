import { useMutation } from '@tanstack/react-query';

import { postFeedPlaceAccessRequest } from '@/api/pin';
import { useFeedPlaceAccessStore } from '@/store/feedPlaceAccessStore';

/** 친구 피드 장소 접근 토큰 발급 */
export function useRequestFeedPlaceAccess() {
  const setToken = useFeedPlaceAccessStore((state) => state.setToken);

  return useMutation({
    mutationFn: (placeId: number | string) => postFeedPlaceAccessRequest(String(placeId)),
    onSuccess: (result) => {
      setToken(result.placeId, result.placeAccessToken);
    },
  });
}
