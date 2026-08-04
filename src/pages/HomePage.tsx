import { useState } from 'react';

import BookmarkActiveIcon from '@/assets/home/bookmark-active.svg?react';
import BellIcon from '@/assets/home/bell.svg?react';
import NextIcon from '@/assets/icons/next.svg?react';
import SearchIcon from '@/assets/icons/search.svg?react';
import PlimapLogo from '@/assets/logo/plimap-logo.svg?react';
import { Chip } from '@/components/ui/chip';
import {
  MOCK_FRIEND_PINS,
  MOCK_HOME_USER,
  MOCK_HOT_PLACES,
  type HotPlace,
} from '@/features/home/constants/mockHome';
import { RecommendationContentCarousel } from '@/features/home/components/RecommendationContentCarousel';
import { RecommendationPinCard } from '@/features/home/components/RecommendationPinCard';
import { useMyProfile } from '@/features/home/hooks/useMyProfile';
import { usePlaceBookmarks, useTogglePlaceBookmark } from '@/features/pin/queries/usePlaceBookmark';
import { useCurrentPosition } from '@/hooks/useCurrentPosition';
import type { PlaceBookmarkListItem } from '@/types/place.type';

function HomeLoadingState() {
  return (
    <main
      className="flex min-h-full shrink-0 items-center justify-center bg-pli-black-100"
      role="status"
      aria-label="홈 화면 불러오는 중"
    >
      <span className="size-8 animate-spin rounded-full border-2 border-grayscale-700 border-t-neon-2" />
    </main>
  );
}

function HomeErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="flex min-h-full shrink-0 flex-col items-center justify-center gap-4 bg-pli-black-100 px-6 text-center">
      <p className="body-15-r text-grayscale-300">홈 화면을 불러오지 못했어요.</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-neon px-6 py-3 body-15-sb text-grayscale-1250"
      >
        다시 시도
      </button>
    </main>
  );
}

function HotPlaceCard({ place }: { place: HotPlace }) {
  return (
    <button
      type="button"
      aria-label={`${place.name}, ${place.distance}, ${place.pinCount}개의 핀`}
      className="relative block size-full overflow-hidden rounded-xl border border-pli-black-50 text-left"
    >
      <img src={place.imageSrc} alt="" className="size-full object-cover" />
      <span className="absolute inset-0 bg-gradient-to-b from-transparent from-[33%] to-pli-black-100 to-[92%]" />
      <span className="absolute inset-x-3 bottom-3 flex min-w-0 flex-col">
        <span className="flex min-w-0 items-center text-grayscale-100">
          <span className="truncate body-17-m">{place.name}</span>
          <NextIcon aria-hidden className="size-5 shrink-0" />
        </span>
        <span className="truncate body-15-r text-grayscale-500">
          {place.distance} · {place.pinCount}개의 핀
        </span>
      </span>
    </button>
  );
}

function formatSavedPlaceDistance(distanceMeters: number) {
  const normalizedDistance = Math.max(0, distanceMeters);

  if (normalizedDistance >= 1000) {
    const kilometers = normalizedDistance / 1000;
    return `${Number.isInteger(kilometers) ? kilometers : kilometers.toFixed(1)}km`;
  }

  return `${Math.round(normalizedDistance)}m`;
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
          {formatSavedPlaceDistance(place.distanceMeters)}
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
  const [hotPlaceFilter, setHotPlaceFilter] = useState<'nearby' | 'popular'>('nearby');
  const myProfileQuery = useMyProfile();
  const currentPositionQuery = useCurrentPosition();
  const savedPlacesQuery = usePlaceBookmarks({
    latitude: currentPositionQuery.data?.latitude ?? null,
    longitude: currentPositionQuery.data?.longitude ?? null,
  });
  const toggleBookmarkMutation = useTogglePlaceBookmark();
  const savedPlaces = savedPlacesQuery.data?.items ?? [];

  if (myProfileQuery.isPending) {
    return <HomeLoadingState />;
  }

  if (!myProfileQuery.data) {
    return <HomeErrorState onRetry={() => void myProfileQuery.refetch()} />;
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
              {myProfileQuery.data.nickname ? (
                <>
                  반가워요, <span className="text-neon-2">{myProfileQuery.data.nickname}</span> 님
                </>
              ) : (
                '반가워요!'
              )}
            </h1>
            <div className="flex items-center gap-2 body-17-r">
              <span className="shrink-0 text-grayscale-500">현재 위치</span>
              <button
                type="button"
                className="flex min-w-0 items-center text-grayscale-30"
                aria-label={`현재 위치 ${MOCK_HOME_USER.currentLocation}에서 검색`}
              >
                <span className="max-w-[190px] truncate">{MOCK_HOME_USER.currentLocation}</span>
                <NextIcon aria-hidden className="size-4 shrink-0" />
              </button>
            </div>
          </div>

          <div className="flex h-44 gap-3 overflow-x-auto px-4 pt-3 pb-10 scrollbar-hide">
            {MOCK_FRIEND_PINS.map((pin) => (
              <RecommendationPinCard key={pin.id} pin={pin} />
            ))}
          </div>
        </section>

        <button
          type="button"
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
            <RecommendationContentCarousel
              ariaLabel="내 주변 인기 장소"
              items={MOCK_HOT_PLACES}
              getItemKey={(place) => place.id}
              itemsPerPage={2}
              showPagination
              itemClassName="aspect-square min-w-0 flex-1 self-start"
              renderItem={(place) => <HotPlaceCard place={place} />}
            />
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
                  isRemoving={
                    toggleBookmarkMutation.isPending &&
                    toggleBookmarkMutation.variables?.placeId === place.placeId
                  }
                  onUnbookmark={(placeId) =>
                    toggleBookmarkMutation.mutate({ placeId, bookmarked: false })
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
