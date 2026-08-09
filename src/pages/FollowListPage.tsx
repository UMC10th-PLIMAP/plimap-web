import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';

import { ApiError } from '@/api/client';
import { FollowListSkeleton } from '@/components/skeletons/FollowListSkeleton';
import { TopBar } from '@/components/ui/TopBar';
import { FollowUserRow } from '@/features/profile/components/FollowUserRow';
import { SearchInput } from '@/components/ui/SearchInput';
import { useInfiniteFollowList } from '@/features/profile/queries/useFollowList';
import { useToggleFollow } from '@/features/profile/queries/useToggleFollow';
import { useGoBack } from '@/hooks/useGoBack';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useMyProfile } from '@/hooks/useMyProfile';
import { useOtherMemberProfile } from '@/hooks/useOtherMemberProfile';

import type { FollowTab } from '@/features/profile/types';
import type { FollowListItem } from '@/types/member.type';

const FOLLOW_TOGGLE_FAILED_MESSAGE = '요청을 처리하지 못했어요. 다시 시도해주세요.';

function getTabFromPath(pathname: string): FollowTab {
  return pathname.endsWith('/followers') ? 'follower' : 'following';
}

const EMPTY_STATE: Record<FollowTab, { title: string; description: string }> = {
  following: {
    title: '아직 팔로잉이 없어요.',
    description: '관심 있는 사용자를 팔로우하면 여기에 표시돼요.',
  },
  follower: {
    title: '아직 팔로워가 없어요.',
    description: '다른 사용자가 회원님을 팔로우하면 여기에 표시돼요.',
  },
};

const OTHER_EMPTY_STATE: Record<FollowTab, { title: string; description: string }> = {
  following: {
    title: '아직 팔로잉이 없어요.',
    description: '이 사용자가 팔로우한 사람이 여기에 표시돼요.',
  },
  follower: {
    title: '아직 팔로워가 없어요.',
    description: '이 사용자를 팔로우한 사람이 여기에 표시돼요.',
  },
};

export default function FollowListPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { memberId: memberIdParam } = useParams<{ memberId?: string }>();
  const tab = getTabFromPath(pathname);
  const [keyword, setKeyword] = useState('');

  const parsedMemberId = Number(memberIdParam);
  const otherMemberId =
    Number.isInteger(parsedMemberId) && parsedMemberId > 0 ? parsedMemberId : undefined;
  const hasInvalidMemberId = memberIdParam !== undefined && otherMemberId === undefined;
  const isOtherMember = otherMemberId !== undefined;

  const myProfileQuery = useMyProfile();
  const myProfile = myProfileQuery.data;
  const { data: otherProfile } = useOtherMemberProfile(otherMemberId);

  const targetMemberId = hasInvalidMemberId
    ? undefined
    : isOtherMember
      ? otherMemberId
      : myProfile?.id;
  const titleNickname = isOtherMember
    ? (otherProfile?.nickname ?? '')
    : (myProfile?.nickname ?? '');
  const profilePath = isOtherMember ? `/app/users/${otherMemberId}` : '/app/my';
  const goBack = useGoBack(profilePath);

  const tabOptions = useMemo(
    () => [
      {
        value: 'following' as const,
        label: '팔로잉',
        path: isOtherMember ? `/app/users/${otherMemberId}/following` : '/app/my/following',
      },
      {
        value: 'follower' as const,
        label: '팔로워',
        path: isOtherMember ? `/app/users/${otherMemberId}/followers` : '/app/my/followers',
      },
    ],
    [isOtherMember, otherMemberId],
  );

  const {
    data: followList,
    fetchNextPage,
    hasNextPage,
    isPending,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfiniteFollowList({ memberId: targetMemberId, tab });

  const users = followList?.pages.flatMap((page) => page.data) ?? [];
  const isTargetProfilePending = !isOtherMember && myProfileQuery.isPending;
  const isTargetProfileError =
    !isOtherMember &&
    (myProfileQuery.isError || (!myProfileQuery.isPending && targetMemberId === undefined));
  const isInitialListPending =
    isTargetProfilePending || (targetMemberId !== undefined && isPending);

  const trimmedKeyword = keyword.trim();
  const filteredUsers = trimmedKeyword
    ? users.filter((user) => user.nickname.toLowerCase().includes(trimmedKeyword.toLowerCase()))
    : users;

  const { mutateAsync: toggleFollow } = useToggleFollow();
  const [pendingMemberIds, setPendingMemberIds] = useState<Set<number>>(new Set());

  const handleActionClick = async (target: FollowListItem) => {
    setPendingMemberIds((prev) => new Set(prev).add(target.id));

    try {
      await toggleFollow({ memberId: target.id, isFollowing: target.isFollowing });
    } catch (error) {
      alert(error instanceof ApiError ? error.message : FOLLOW_TOGGLE_FAILED_MESSAGE);
    } finally {
      setPendingMemberIds((prev) => {
        const next = new Set(prev);
        next.delete(target.id);
        return next;
      });
    }
  };

  const loadMoreRef = useInfiniteScroll(
    () => {
      if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) fetchNextPage();
    },
    { enabled: Boolean(hasNextPage) && !isFetchNextPageError, reconnectKey: isFetchingNextPage },
  );

  if (hasInvalidMemberId) {
    return <Navigate to="/app" replace />;
  }

  const emptyState = isOtherMember ? OTHER_EMPTY_STATE[tab] : EMPTY_STATE[tab];

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar title={titleNickname} titleWeight="medium" onBack={goBack} />

      <div
        role="tablist"
        aria-label="팔로우 목록"
        className="flex w-full border-b border-pli-black-75"
      >
        {tabOptions.map((option) => {
          const selected = tab === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => navigate(option.path, { replace: true })}
              className={`relative flex h-[45px] flex-1 items-center justify-center body-15-r cursor-pointer ${selected ? 'text-grayscale-300' : 'text-grayscale-800'}`}
            >
              {option.label}
              {selected ? (
                <span
                  className="absolute inset-x-0 bottom-0 h-[1px] bg-grayscale-300"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="px-[15px] pt-3">
        <SearchInput
          placeholder="사용자의 닉네임을 검색하세요"
          variant="song"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onClear={() => setKeyword('')}
        />
      </div>
      {isTargetProfileError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="body-15-r text-grayscale-500">팔로우 목록을 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => void myProfileQuery.refetch()}
            className="rounded-full bg-pli-black-75 px-4 py-2 body-15-m text-grayscale-100"
          >
            다시 시도
          </button>
        </div>
      ) : isInitialListPending ? (
        <FollowListSkeleton />
      ) : users.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-[2px] text-center">
          <p className="body-17-m text-grayscale-300">{emptyState.title}</p>
          <p className="body-15-m text-grayscale-700">{emptyState.description}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="flex flex-1 items-center justify-center body-15-r text-grayscale-600">
          검색 결과가 없어요.
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-5 px-4 pt-5">
            {filteredUsers.map((user) => (
              <FollowUserRow
                key={user.id}
                user={user}
                onClick={(target) => navigate(`/app/users/${target.id}`)}
                onActionClick={handleActionClick}
                disabled={pendingMemberIds.has(user.id)}
              />
            ))}
          </ul>
          {isFetchingNextPage ? <FollowListSkeleton count={1} /> : null}
          {isFetchNextPageError ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <p className="body-15-m text-grayscale-500">더 불러오지 못했어요</p>
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="body-15-m text-grayscale-300 underline disabled:opacity-50 cursor-pointer"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div ref={loadMoreRef} className="h-4" aria-hidden />
          )}
        </>
      )}
    </div>
  );
}
