import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';

import { ApiError } from '@/api/client';
import { getMyProfile } from '@/api/member';
import { TopBar } from '@/components/ui/TopBar';
import { FollowUserRow } from '@/features/profile/components/FollowUserRow';
import { SearchInput } from '@/components/ui/SearchInput';
import { useInfiniteFollowList } from '@/features/profile/queries/useFollowList';
import { useToggleFollow } from '@/features/profile/queries/useToggleFollow';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

import type { FollowTab } from '@/features/profile/types';
import type { FollowListItem } from '@/types/member.type';

const FOLLOW_TOGGLE_FAILED_MESSAGE = '요청을 처리하지 못했어요. 다시 시도해주세요.';

const OPTIONS: { value: FollowTab; label: string; path: string }[] = [
  { value: 'following', label: '팔로잉', path: '/app/my/following' },
  { value: 'follower', label: '팔로워', path: '/app/my/followers' },
];

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

export default function FollowListPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tab = getTabFromPath(pathname);
  const [keyword, setKeyword] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
    staleTime: Infinity,
  });

  const {
    data: followList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfiniteFollowList({ memberId: profile?.id, tab });

  const users = followList?.pages.flatMap((page) => page.data) ?? [];

  const trimmedKeyword = keyword.trim();
  const filteredUsers = trimmedKeyword
    ? users.filter((user) => user.nickname.toLowerCase().includes(trimmedKeyword.toLowerCase()))
    : users;

  const {
    mutate: toggleFollow,
    isPending: isToggling,
    variables: toggleVariables,
  } = useToggleFollow();

  const handleActionClick = (target: FollowListItem) => {
    toggleFollow(
      { memberId: target.id, isFollowing: target.isFollowing },
      {
        onError: (error) => {
          alert(error instanceof ApiError ? error.message : FOLLOW_TOGGLE_FAILED_MESSAGE);
        },
      },
    );
  };

  const loadMoreRef = useInfiniteScroll(
    () => {
      if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) fetchNextPage();
    },
    { enabled: Boolean(hasNextPage) && !isFetchNextPageError, reconnectKey: isFetchingNextPage },
  );

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar
        title={profile?.nickname ?? ''}
        titleWeight="medium"
        onBack={() => navigate('/app/my')}
      />

      <div
        role="tablist"
        aria-label="팔로우 목록"
        className="flex w-full border-b border-pli-black-75"
      >
        {OPTIONS.map((option) => {
          const selected = tab === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => navigate(option.path)}
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
      {users.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-[2px] text-center">
          <p className="body-17-m text-grayscale-300">{EMPTY_STATE[tab].title}</p>
          <p className="body-15-m text-grayscale-700">{EMPTY_STATE[tab].description}</p>
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
                onActionClick={handleActionClick}
                disabled={isToggling && toggleVariables?.memberId === user.id}
              />
            ))}
          </ul>
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
