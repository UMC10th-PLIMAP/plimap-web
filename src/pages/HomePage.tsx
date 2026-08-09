import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BookmarkActiveIcon from '@/assets/home/bookmark-active.svg?react';
import BellIcon from '@/assets/home/bell.svg?react';
import NextIcon from '@/assets/icons/next.svg?react';
import SearchIcon from '@/assets/icons/search.svg?react';
import PlimapLogo from '@/assets/logo/plimap-logo.svg?react';
import { HomeHotPlaceCarouselSkeleton, HomeSkeleton } from '@/components/skeletons/HomeSkeleton';
import { useToast } from '@/hooks/useToast';
import { Chip } from '@/components/ui/chip';
import { RecommendationContentCarousel } from '@/features/home/components/RecommendationContentCarousel';
import { RecommendationPinCard } from '@/features/home/components/RecommendationPinCard';
import { useFriendPins } from '@/features/home/hooks/useFriendPins';
import { useHomeContext } from '@/features/home/hooks/useHomeContext';
import { usePopularPlaces } from '@/features/home/hooks/usePopularPlaces';
import { usePlaceBookmarks, useTogglePlaceBookmark } from '@/features/pin/queries/usePlaceBookmark';
import { useCurrentPosition } from '@/hooks/useCurrentPosition';
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
  const isHomePending =
    currentPositionQuery.isPending ||
    friendPinsQuery.isPending ||
    (!currentPositionQuery.isError && savedPlacesQuery.isPending);

  const currentLocationLabel = currentPositionQuery.isError
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

  if (isHomePending) {
    return <HomeSkeleton />;
  }

  return (
    <main className="relative min-h-full shrink-0 bg-pli-black-100 pb-[calc(env(safe-area-inset-bottom)+148px)]">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[calc(env(safe-area-inset-top)+331px)] bg-pli-black-85"
      />

      <div className="relative flex flex-col gap-[30px]">
        <section className="pt-[calc(env(safe-area-inset-top)+2px)]">
          <header className="flex h-14 items-center justify-between px-4">
            <PlimapLogo aria-label="PLIMAP" className="h-[30px] w-auto" />
            <button
              type="button"
              aria-label="알림"
              className="flex size-11 items-center justify-center rounded-full bg-pli-black-75"
            >
              <BellIcon aria-hidden className="h-[22px] w-[18px]" />
            </button>
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

          <div className="flex h-44 gap-3 overflow-x-auto px-4 pt-3 pb-10 scrollbar-hide">
            {friendPinsQuery.isError ? (
              <div className="flex w-full items-center justify-center gap-3 text-center">
                <p className="body-15-r text-grayscale-500">친구의 PIN을 불러오지 못했어요.</p>
                <button
                  type="button"
                  onClick={() => void friendPinsQuery.refetch()}
                  className="rounded-full bg-pli-black-75 px-4 py-2 body-15-m text-grayscale-100"
                >
                  다시 시도
                </button>
              </div>
            ) : friendPins.length === 0 ? (
              <p className="flex w-full items-center justify-center body-15-r text-grayscale-500">
                팔로우한 친구의 PIN이 아직 없어요.
              </p>
            ) : (
              friendPins.map((pin) => (
                <RecommendationPinCard
                  key={pin.pinId}
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
              ))
            )}
          </div>
        </section>

        <button
          type="button"
          onClick={() => navigate('/app/friends/search')}
          className="mx-4 flex h-[86px] items-center justify-between rounded-xl bg-pli-black-85 px-[18px] text-left"
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

        <section className="flex flex-col gap-4">
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
            {currentPositionQuery.isError ? (
              <p className="py-6 text-center body-15-r text-grayscale-500">
                위치 정보를 확인할 수 없어요.
              </p>
            ) : popularPlacesQuery.isPending ? (
              <div role="status" aria-label="인기 장소 불러오는 중">
                <HomeHotPlaceCarouselSkeleton />
              </div>
            ) : popularPlacesQuery.isError ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="body-15-r text-grayscale-500">인기 장소를 불러오지 못했어요.</p>
                <button
                  type="button"
                  onClick={() => void popularPlacesQuery.refetch()}
                  className="rounded-full bg-pli-black-75 px-4 py-2 body-15-m text-grayscale-100"
                >
                  다시 시도
                </button>
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

        {savedPlaces.length > 0 ? (
          <section className="flex flex-col gap-5 px-4">
            <h2 className="text-[22px] leading-[1.4] font-medium text-white">
              저장해둔 장소, 지금 근처예요!
            </h2>
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
          </section>
        ) : null}
      </div>
    </main>
  );
}
