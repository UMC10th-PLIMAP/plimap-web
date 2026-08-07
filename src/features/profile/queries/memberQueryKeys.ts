import type { FollowTab } from '@/features/profile/types';

export const memberQueryKeys = {
  all: ['member'] as const,
  me: () => [...memberQueryKeys.all, 'me'] as const,
  profiles: () => [...memberQueryKeys.all, 'profile'] as const,
  profile: (memberId: number) => [...memberQueryKeys.profiles(), memberId] as const,
  searches: () => [...memberQueryKeys.all, 'search'] as const,
  search: (keyword: string, pageSize: number) =>
    [...memberQueryKeys.searches(), { keyword, pageSize }] as const,
  followLists: () => [...memberQueryKeys.all, 'follow-list'] as const,
  followList: (memberId: number | undefined, tab: FollowTab, pageSize: number) =>
    [...memberQueryKeys.followLists(), memberId, tab, { pageSize }] as const,
};
