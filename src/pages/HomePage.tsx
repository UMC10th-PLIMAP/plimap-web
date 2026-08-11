import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import BookmarkActiveIcon from '@/assets/home/bookmark-active.svg?react';
import BellIcon from '@/assets/home/bell.svg?react';
import NextIcon from '@/assets/icons/next.svg?react';
import SearchIcon from '@/assets/icons/search.svg?react';
import { HomeHotPlaceCarouselSkeleton, HomeSkeleton } from '@/components/skeletons/HomeSkeleton';
import { useToast } from '@/hooks/useToast';
import { Chip } from '@/components/ui/chip';
import { HomeBrandLogo } from '@/features/home/components/HomeBrandLogo';
import { HomeCarouselState } from '@/features/home/components/HomeCarouselState';
import { RecommendationContentCarousel } from '@/features/home/components/RecommendationContentCarousel';
import { RecommendationPinCard } from '@/features/home/components/RecommendationPinCard';
import { useFriendPins } from '@/features/home/hooks/useFriendPins';
import { useHomeContext } from '@/features/home/hooks/useHomeContext';
import { usePopularPlaces } from '@/features/home/hooks/usePopularPlaces';
import { usePlaceBookmarks, useTogglePlaceBookmark } from '@/features/pin/queries/usePlaceBookmark';
import { useCurrentPosition } from '@/hooks/useCurrentPosition';
import { cn } from '@/lib/utils';
import type { PopularPlaceItem, PlaceBookmarkListItem } from '@/types/place.type';

type HotPlaceFilter = 'nearby' | 'popular';

function formatDistanceMeters(distanceMeters: number) {
  const normalizedDistance = Math.max(0, distanceMeters);

  if (normalizedDistance >= 1000) {
    const kilometers = normalizedDistance / 1000;
    return `${Number.isInteger(kilometers) ? kilometers : kilometers.toFixed(1)}km`;
  }

  return `${Math.round(normalizedDistance)}m`;
}

function HotPlaceCard({ place }: { place: PopularPlaceItem }) {
  const distance = formatDistanceMeters(place.distanceMeters);

  return (
    <button
      type="button"
      aria-label={`${place.placeName}, ${distance}, ${place.pinCount}개의 핀`}
      className="relative block size-full overflow-hidden rounded-xl border border-pli-black-50 text-left"
    >
      {place.representativeImageUrl ? (
        <img src={place.representativeImageUrl} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden className="block size-full bg-pli-black-75" />
      )}
      <span className="absolute inset-0 bg-gradient-to-b from-transparent from-[33%] to-pli-black-100 to-[92%]" />
      <span className="absolute inset-x-3 bottom-3 flex min-w-0 flex-col">
        <span className="flex min-w-0 items-center text-grayscale-100">
          <span className="truncate body-17-m">{place.placeName}</span>
          <NextIcon aria-hidden className="size-5 shrink-0" />
        </span>
        <span className="truncate body-15-r text-grayscale-500">
          {distance} · {place.pinCount}개의 핀
        </span>
      </span>
    </button>
  );
}

type SavedPlaceCardProps = {
  place: PlaceBookmarkListItem;
  isRemoving: boolean;
  onUnbookmark: (placeId: number) => void;
};

function SavedPlaceCard({ place, isRemoving, onUnbookmark }: SavedPlaceCardProps) {
  return (
    <article className="flex h-[88px] w-full items-center justify-between rounded-xl bg-pli-black-85 px-5">
      <button type="button" className="min-w-0 text-left">
        <span className="flex min-w-0 items-center text-grayscale-100">
          <span className="truncate body-17-m">{place.placeName}</span>
          <NextIcon aria-hidden className="size-5 shrink-0" />
        </span>
        <span className="mt-1 block truncate body-15-m text-grayscale-500">
          {place.firstPinCreatorNickname ? (
            <>
              <span className="text-grayscale-300">{place.firstPinCreatorNickname}</span> 님이
              생성한 핀 ·{' '}
            </>
          ) : (
            '생성되지 않음 · '
          )}
          {formatDistanceMeters(place.distanceMeters)}
        </span>
      </button>
      <button
        type="button"
        aria-label={`${place.placeName} 북마크 해제`}
        disabled={isRemoving}
        onClick={() => onUnbookmark(place.placeId)}
        className="ml-4 flex size-[52px] shrink-0 items-center justify-center rounded-full bg-pli-black-100 disabled:opacity-50"
      >
        <BookmarkActiveIcon aria-hidden className="size-6" />
      </button>
    </article>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [hotPlaceFilter, setHotPlaceFilter] = useState<HotPlaceFilter>('nearby');
  const [hotPlacePages, setHotPlacePages] = useState<Record<HotPlaceFilter, number>>({
    nearby: 0,
    popular: 0,
  });
  const currentPositionQuery = useCurrentPosition();
  const homeContextQuery = useHomeContext({
    latitude: currentPositionQuery.data?.latitude ?? null,
    longitude: currentPositionQuery.data?.longitude ?? null,
  });
  const friendPinsQuery = useFriendPins();
  const friendPins = friendPinsQuery.data?.data ?? [];
  const popularPlacesQuery = usePopularPlaces({
    scope: hotPlaceFilter === 'nearby' ? 'NEARBY' : 'GLOBAL',
    latitude: currentPositionQuery.data?.latitude ?? null,
    longitude: currentPositionQuery.data?.longitude ?? null,
  });
  const popularPlaces = popularPlacesQuery.data?.items ?? [];
  const savedPlacesQuery = usePlaceBookmarks({
    latitude: currentPositionQuery.data?.latitude ?? null,
    longitude: currentPositionQuery.data?.longitude ?? null,
  });
  const toggleBookmarkMutation = useTogglePlaceBookmark();
  const savedPlaces = savedPlacesQuery.data?.items ?? [];
  const isCurrentPositionError = currentPositionQuery.isLoadingError;
  const isFriendPinsError = friendPinsQuery.isLoadingError;
  const isPopularPlacesError = isCurrentPositionError || popularPlacesQuery.isLoadingError;
  const isSavedPlacesError = isCurrentPositionError || savedPlacesQuery.isLoadingError;
  const hasFriendPins = friendPins.length > 0;
  const isSavedPlacesFallback = isSavedPlacesError || savedPlaces.length === 0;
  const isHomePending =
    currentPositionQuery.isPending ||
    friendPinsQuery.isPending ||
    (!isCurrentPositionError && savedPlacesQuery.isPending);

  const currentLocationLabel = isCurrentPositionError
    ? '위치 정보를 확인할 수 없어요'
    : homeContextQuery.isPending
      ? '주소를 확인하고 있어요'
      : (homeContextQuery.data?.currentRegion.displayName ?? '현재 위치');

  const handleCurrentLocationClick = () => {
    if (!currentPositionQuery.data) return;

    navigate('/app', {
      state: {
        mapFocusCoordinate: {
          lat: currentPositionQuery.data.latitude,
          lng: currentPositionQuery.data.longitude,
        },
      },
    });
  };

  const handlePopularPlacesRetry = () => {
    if (isCurrentPositionError) {
      void currentPositionQuery.refetch();
      return;
    }

    void popularPlacesQuery.refetch();
  };

  const handleSavedPlacesRetry = () => {
    if (isCurrentPositionError) {
      void currentPositionQuery.refetch();
      return;
    }

    void savedPlacesQuery.refetch();
  };

  if (isHomePending) {
    return <HomeSkeleton />;
  }

  return (
    <main className="relative min-h-full shrink-0 bg-pli-black-100 pb-[calc(env(safe-area-inset-bottom)+148px)]">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[calc(env(safe-area-inset-top)+331px)] bg-pli-black-85"
      />

      <div className="relative flex flex-col">
        <section className="pt-[calc(env(safe-area-inset-top)+2px)]">
          <header className="flex h-14 items-center justify-between px-4">
            <HomeBrandLogo />
            <Link
              to="/app/my/notifications"
              aria-label="알림"
              onClick={() => navigate('/app/my/notifications')}
              className="flex size-11 items-center justify-center rounded-full bg-pli-black-75"
            >
              <BellIcon aria-hidden className="h-[22px] w-[18px]" />
            </Link>
          </header>

          <div className="flex h-[94px] flex-col gap-1 px-4 py-4">
            <h1 className="head-24-sb text-grayscale-100">
              {homeContextQuery.data?.nickname ? (
                <>
                  반가워요, <span className="text-neon-2">{homeContextQuery.data.nickname}</span> 님
                </>
              ) : (
                '반가워요!'
              )}
            </h1>
            <div className="flex items-center gap-2 body-17-r">
              <span className="shrink-0 text-grayscale-500">현재 위치</span>
              <button
                type="button"
                disabled={!currentPositionQuery.data}
                onClick={handleCurrentLocationClick}
                className="flex min-w-0 items-center text-grayscale-30"
                aria-label={`${currentLocationLabel} 지도에서 보기`}
              >
                <span className="max-w-[190px] truncate">{currentLocationLabel}</span>
                <NextIcon aria-hidden className="size-4 shrink-0" />
              </button>
            </div>
          </div>

          {isFriendPinsError || !hasFriendPins ? (
            <div className="mt-4 px-[14px]">
              {isFriendPinsError ? (
                <HomeCarouselState
                  role="alert"
                  className="h-[148px] border border-pli-black-50"
                  contentClassName="gap-4"
                  description={
                    <>
                      <span className="block">정보를 불러올 수 없어요.</span>
                      <span className="block">다시 시도해주세요.</span>
                    </>
                  }
                  actionLabel="다시 시도하기"
                  actionAriaLabel="친구 PIN 다시 시도하기"
                  onAction={() => void friendPinsQuery.refetch()}
                />
              ) : (
                <HomeCarouselState
                  className="h-[148px] border border-pli-black-50"
                  contentClassName="gap-4"
                  description={
                    <>
                      <span className="block">내가 팔로우한 친구들이 등록한 곡이 나와요.</span>
                      <span className="block">지금 친구를 찾아볼까요?</span>
                    </>
                  }
                  actionLabel="친구 검색하러 가기"
                  actionTo="/app/friends/search"
                />
              )}
            </div>
          ) : (
            <div className="flex h-44 gap-3 overflow-x-auto px-4 pt-3 pb-10 scrollbar-hide">
              {friendPins.map((pin) => (
                <RecommendationPinCard
                  key={pin.pinId}
                  aria-label={`${pin.writerNickname} 프로필 보기`}
                  onClick={() => navigate(`/app/users/${pin.memberId}`)}
                  pin={{
                    id: String(pin.pinId),
                    place: { name: pin.placeName },
                    creator: {
                      name: pin.writerNickname,
                      avatarUrl: pin.writerProfileImage,
                    },
                    imageUrl: pin.albumImageUrl,
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {hasFriendPins ? (
          <button
            type="button"
            onClick={() => navigate('/app/friends/search')}
            className="mx-4 mt-[30px] flex h-[86px] items-center justify-between rounded-xl bg-pli-black-85 px-[18px] text-left"
          >
            <span className="flex min-w-0 items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-pli-black-75 text-neon-2">
                <SearchIcon aria-hidden className="size-7" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate body-15-r text-grayscale-700">
                  닉네임으로 친구를 찾아보세요
                </span>
                <span className="truncate body-18-r text-grayscale-100">친구 검색하러 가기</span>
              </span>
            </span>
            <NextIcon aria-hidden className="size-7 shrink-0 text-grayscale-100" />
          </button>
        ) : null}

        <section className={cn('flex flex-col gap-4', hasFriendPins ? 'mt-[30px]' : 'mt-[52px]')}>
          <h2 className="px-4 text-[22px] leading-[1.4] font-medium text-white">
            내 주변 HOT한 장소🔥
          </h2>
          <div className="flex gap-3 px-[19px]">
            <Chip
              variant={hotPlaceFilter === 'nearby' ? 'selected' : 'default'}
              onClick={() => setHotPlaceFilter('nearby')}
            >
              나와 가까운
            </Chip>
            <Chip
              variant={hotPlaceFilter === 'popular' ? 'selected' : 'default'}
              onClick={() => setHotPlaceFilter('popular')}
            >
              많이 등록된
            </Chip>
          </div>
          <div className="px-[19px]">
            {isPopularPlacesError ? (
              <HomeCarouselState
                role="alert"
                className="h-44 bg-pli-black-85"
                description={
                  <>
                    <span className="block">정보를 불러올 수 없어요.</span>
                    <span className="block">다시 시도해주세요.</span>
                  </>
                }
                actionLabel="다시 시도하기"
                actionAriaLabel="인기 장소 다시 시도하기"
                onAction={handlePopularPlacesRetry}
              />
            ) : popularPlacesQuery.isPending ? (
              <div role="status" aria-label="인기 장소 불러오는 중">
                <HomeHotPlaceCarouselSkeleton />
              </div>
            ) : (
              <RecommendationContentCarousel
                key={hotPlaceFilter}
                ariaLabel="내 주변 인기 장소"
                items={popularPlaces}
                getItemKey={(place) => place.placeId}
                itemsPerPage={2}
                showPagination
                pageClassName="grid grid-cols-2"
                itemClassName="aspect-square self-start"
                currentPage={hotPlacePages[hotPlaceFilter]}
                onPageChange={(page) =>
                  setHotPlacePages((pages) => ({ ...pages, [hotPlaceFilter]: page }))
                }
                renderItem={(place) => <HotPlaceCard place={place} />}
              />
            )}
          </div>
        </section>

        <section
          className={cn(
            'flex flex-col',
            hasFriendPins ? 'mt-[30px]' : isPopularPlacesError ? 'mt-[70px]' : 'mt-12',
            isSavedPlacesFallback ? 'gap-4 pl-3 pr-4' : 'gap-5 px-4',
          )}
        >
          <h2 className="text-[22px] leading-[1.4] font-medium text-white">
            저장해둔 장소, 지금 근처예요!
          </h2>
          {isSavedPlacesError ? (
            <HomeCarouselState
              role={savedPlacesQuery.isLoadingError ? 'alert' : undefined}
              className="h-[148px] bg-pli-black-85"
              description={
                <>
                  <span className="block">정보를 불러올 수 없어요.</span>
                  <span className="block">다시 시도해주세요.</span>
                </>
              }
              actionLabel="다시 시도하기"
              actionAriaLabel="저장한 장소 다시 시도하기"
              onAction={handleSavedPlacesRetry}
            />
          ) : savedPlaces.length === 0 ? (
            <HomeCarouselState
              className="h-[132px] bg-pli-black-85"
              description="내가 좋아하는 장소를 저장하면 여기에 나타나요."
              actionLabel="장소 저장하러 가기"
              actionTo="/app"
            />
          ) : (
            <RecommendationContentCarousel
              ariaLabel="가까운 저장 장소"
              items={savedPlaces}
              getItemKey={(place) => place.placeId}
              itemsPerPage={3}
              showPagination
              pageClassName="flex-col gap-4"
              itemClassName="w-full"
              renderItem={(place) => (
                <SavedPlaceCard
                  place={place}
                  isRemoving={toggleBookmarkMutation.isPending}
                  onUnbookmark={(placeId) =>
                    toggleBookmarkMutation.mutate(
                      { placeId, bookmarked: false },
                      {
                        onError: () => {
                          toast.error('북마크를 해제하지 못했어요. 다시 시도해 주세요.', {
                            placement: 'above-navigation',
                          });
                        },
                      },
                    )
                  }
                />
              )}
            />
          )}
        </section>
      </div>
    </main>
  );
}
