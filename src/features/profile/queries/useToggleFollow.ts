import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { followMember, unfollowMember } from '@/api/member';
import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';
import { updateFollowCaches } from '@/features/profile/queries/updateFollowCaches';

type ToggleFollowParams = {
  memberId: number;
  isFollowing: boolean;
};

const memberFollowQueues = new Map<number, Promise<void>>();

function enqueueFollowMutation(queryClient: QueryClient, params: ToggleFollowParams) {
  const { memberId, isFollowing } = params;
  const previousMutation = memberFollowQueues.get(memberId) ?? Promise.resolve();
  const mutation = previousMutation.then(async () => {
    try {
      await (isFollowing ? unfollowMember(memberId) : followMember(memberId));
      updateFollowCaches(queryClient, { memberId, wasFollowing: isFollowing });
    } finally {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: memberQueryKeys.me() }),
        queryClient.invalidateQueries({ queryKey: memberQueryKeys.profile(memberId) }),
        queryClient.invalidateQueries({ queryKey: memberQueryKeys.searches() }),
        queryClient.invalidateQueries({ queryKey: memberQueryKeys.followLists() }),
      ]);
    }
  });
  const settledMutation = mutation.then(
    () => undefined,
    () => undefined,
  );

  memberFollowQueues.set(memberId, settledMutation);
  void settledMutation.then(() => {
    if (memberFollowQueues.get(memberId) === settledMutation) {
      memberFollowQueues.delete(memberId);
    }
  });

  return mutation;
}

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ToggleFollowParams) => enqueueFollowMutation(queryClient, params),
  });
}
