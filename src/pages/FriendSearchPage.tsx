import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ApiError } from '@/api/client';
import { SearchInput } from '@/components/ui/SearchInput';
import { TopBar } from '@/components/ui/TopBar';
import { MemberSearchResultRow } from '@/features/profile/components/MemberSearchResultRow';
import { useMemberSearch } from '@/features/profile/queries/useMemberSearch';
import { useToggleFollow } from '@/features/profile/queries/useToggleFollow';
import { useGoBack } from '@/hooks/useGoBack';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { MemberSearchItem } from '@/types/member.type';

const FOLLOW_TOGGLE_FAILED_MESSAGE = '요청을 처리하지 못했어요. 다시 시도해주세요.';

export default function FriendSearchPage() {
  const navigate = useNavigate();
  const goBack = useGoBack('/app/home');
  const [searchParams, setSearchParams] = useSearchParams();
  const [pendingMemberIds, setPendingMemberIds] = useState<Set<number>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pendingScrollTopRef = useRef<number | null>(null);
  const keyword = searchParams.get('q') ?? '';
  const trimmedKeyword = keyword.trim();
  const scrollStorageKey = `friend-search-scroll:${trimmedKeyword.toLowerCase()}`;
  const searchQuery = useMemberSearch({ keyword });
  const toggleFollowMutation = useToggleFollow();
  const members = searchQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const isWaitingForDebounce =
    trimmedKeyword.length > 0 && trimmedKeyword !== searchQuery.debouncedKeyword;
  const isInitialLoading =
    trimmedKeyword.length > 0 && (isWaitingForDebounce || searchQuery.isPending);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const savedScrollTop = Number(sessionStorage.getItem(scrollStorageKey));
    const scrollTop = Number.isFinite(savedScrollTop) ? savedScrollTop : 0;
    pendingScrollTopRef.current = scrollTop;
    container.scrollTop = scrollTop;
    if (container.scrollTop === scrollTop) {
      pendingScrollTopRef.current = null;
    }

    let finalRestoreFrame = 0;
    const restoreFrame = requestAnimationFrame(() => {
      finalRestoreFrame = requestAnimationFrame(() => {
        const pendingScrollTop = pendingScrollTopRef.current;
        if (pendingScrollTop === null) return;

        container.scrollTop = pendingScrollTop;
        if (container.scrollTop === pendingScrollTop) {
          pendingScrollTopRef.current = null;
        }
      });
    });

    return () => {
      cancelAnimationFrame(restoreFrame);
      cancelAnimationFrame(finalRestoreFrame);
      sessionStorage.setItem(
        scrollStorageKey,
        String(pendingScrollTopRef.current ?? container.scrollTop),
      );
    };
  }, [scrollStorageKey]);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || pendingScrollTopRef.current === null) return;

    let finalRestoreFrame = 0;
    const restoreFrame = requestAnimationFrame(() => {
      finalRestoreFrame = requestAnimationFrame(() => {
        const pendingScrollTop = pendingScrollTopRef.current;
        if (pendingScrollTop === null) return;

        container.scrollTop = pendingScrollTop;
        const reachedSavedPosition = container.scrollTop === pendingScrollTop;
        const reachedFinalPage = searchQuery.isSuccess && !searchQuery.hasNextPage;
        if (reachedSavedPosition || reachedFinalPage) {
          pendingScrollTopRef.current = null;
        }
      });
    });

    return () => {
      cancelAnimationFrame(restoreFrame);
      cancelAnimationFrame(finalRestoreFrame);
    };
  }, [
    members.length,
    searchQuery.data?.pages.length,
    searchQuery.hasNextPage,
    searchQuery.isSuccess,
  ]);

  const updateKeyword = (nextKeyword: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextKeyword) {
      nextParams.set('q', nextKeyword);
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const loadMoreRef = useInfiniteScroll(
    () => {
      if (
        searchQuery.hasNextPage &&
        !searchQuery.isFetchingNextPage &&
        !searchQuery.isFetchNextPageError
      ) {
        void searchQuery.fetchNextPage();
      }
    },
    {
      enabled: Boolean(searchQuery.hasNextPage) && !searchQuery.isFetchNextPageError,
      reconnectKey: searchQuery.isFetchingNextPage,
    },
  );

  const handleToggleFollow = async (member: MemberSearchItem) => {
    setPendingMemberIds((current) => new Set(current).add(member.id));

    try {
      await toggleFollowMutation.mutateAsync({
        memberId: member.id,
        isFollowing: member.isFollowing,
      });
    } catch (error) {
      alert(error instanceof ApiError ? error.message : FOLLOW_TOGGLE_FAILED_MESSAGE);
    } finally {
      setPendingMemberIds((current) => {
        const next = new Set(current);
        next.delete(member.id);
        return next;
      });
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      className="flex h-full min-h-0 flex-col overflow-y-auto bg-pli-black-100 pt-[env(safe-area-inset-top)] scrollbar-hide"
    >
      <TopBar title="친구 찾기" titleWeight="medium" onBack={goBack} />

      <div className="px-[15px] pt-4">
        <SearchInput
          autoFocus={trimmedKeyword.length === 0}
          value={keyword}
          variant="friend"
          onChange={(event) => updateKeyword(event.target.value)}
          onClear={() => updateKeyword('')}
          placeholder="찾고 있는 친구의 닉네임은?"
          aria-label="친구 닉네임 검색"
        />
      </div>

      <main className="flex min-h-0 flex-1 flex-col px-4 pt-5 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        {trimmedKeyword.length === 0 ? null : isInitialLoading ? (
          <div
            role="status"
            aria-label="친구 검색 중"
            className="flex flex-1 items-center justify-center"
          >
            <span className="size-10 animate-spin rounded-full border-2 border-grayscale-600 border-r-transparent" />
          </div>
        ) : searchQuery.isError && !searchQuery.isFetchNextPageError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="body-15-r text-grayscale-500">친구를 검색하지 못했어요.</p>
            <button
              type="button"
              onClick={() => void searchQuery.refetch()}
              className="body-15-m text-neon-2 cursor-pointer"
            >
              다시 시도
            </button>
          </div>
        ) : members.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-center body-15-r text-grayscale-600">
            검색 결과가 없어요.
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-5" aria-busy={searchQuery.isFetchingNextPage}>
              {members.map((member) => (
                <MemberSearchResultRow
                  key={member.id}
                  member={member}
                  onOpenProfile={(target) => navigate(`/app/users/${target.id}`)}
                  onToggleFollow={(target) => void handleToggleFollow(target)}
                  isFollowPending={pendingMemberIds.has(member.id)}
                />
              ))}
            </ul>

            {searchQuery.isFetchNextPageError ? (
              <div className="flex flex-col items-center gap-2 py-5">
                <p className="body-15-r text-grayscale-500">더 불러오지 못했어요.</p>
                <button
                  type="button"
                  onClick={() => void searchQuery.fetchNextPage()}
                  disabled={searchQuery.isFetchingNextPage}
                  className="body-15-m text-neon-2 cursor-pointer disabled:opacity-50"
                >
                  다시 시도
                </button>
              </div>
            ) : (
              <div ref={loadMoreRef} className="h-4" aria-hidden />
            )}

            {searchQuery.isFetchingNextPage ? (
              <div
                className="flex justify-center py-4"
                role="status"
                aria-label="검색 결과 더 불러오는 중"
              >
                <span className="size-6 animate-spin rounded-full border-2 border-grayscale-600 border-r-transparent" />
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
