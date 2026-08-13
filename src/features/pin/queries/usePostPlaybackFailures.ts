import { useMutation } from '@tanstack/react-query';

import { postPlaybackFailures } from '@/api/track';
import type { PostPlaybackFailuresRequest } from '@/features/pin/types';

/** YouTube IFrame 재생 실패를 서버에 보고한다. */
export function usePostPlaybackFailures() {
  return useMutation({
    mutationFn: (payload: PostPlaybackFailuresRequest) => postPlaybackFailures(payload),
  });
}
