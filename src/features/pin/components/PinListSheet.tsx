import { useState } from 'react';

import BookmarkActiveIcon from '@/assets/home/bookmark-active.svg?react';
import BookmarkIcon from '@/assets/icons/bookmark.svg?react';
import { BottomSheet, useBottomSheet } from '@/components/ui/BottomSheet';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import { PinCard } from '@/features/pin/components/PinCard';
import { SortTabs } from '@/features/pin/components/SortTabs';
import { usePlaceDetail, useTogglePlaceBookmark } from '@/features/pin/queries/usePlaceBookmark';
import { usePlaceTrack } from '@/features/pin/queries/usePlaceTrack';
import type { Pin, PinSort, PlaceInfo } from '@/features/pin/types';
import { cn } from '@/lib/utils';
import type { PlaceSearchHistoryRequest } from '@/types/place.type';

type BookmarkStatus = 'loading' | 'error' | 'ready';

type PinListSheetProps = {
  open: boolean;
  onClose: () => void;
  place: PlaceInfo;
  detailLocation: PlaceSearchHistoryRequest | null;
  detailLocationError?: string | null;
  onPinClick?: (pin: Pin) => void;
};

// 화면 전체 높이 874 기준 Figma 스냅: 최소 161px, 기본 340px, 확장 80%, 풀페이지 100%
const PIN_LIST_SHEET_SNAP_POINTS = [161 / 874, 340 / 874, 0.8, 1];
const PIN_LIST_SHEET_DEFAULT_SNAP_POINT = 340 / 874;

function formatDistance(distance: number) {
  const normalizedDistance = Math.max(0, distance);

  if (normalizedDistance >= 1000) {
    const kilometers = normalizedDistance / 1000;
    return {
      value: Number.isInteger(kilometers) ? String(kilometers) : kilometers.toFixed(1),
      unit: 'km',
    };
  }

  return { value: String(Math.round(normalizedDistance)), unit: 'm' };
}

type PinListContentProps = {
  place: PlaceInfo;
  pins: Pin[];
  sort: PinSort;
  onSortChange: (sort: PinSort) => void;
  isBookmarked: boolean;
  bookmarkStatus: BookmarkStatus;
  detailErrorMessage: string | null;
  isBookmarkPending: boolean;
  onBookmarkToggle: () => void;
  onPinClick?: (pin: Pin) => void;
};

function PinListContent({
  place,
  pins,
  sort,
  onSortChange,
  isBookmarked,
  bookmarkStatus,
  detailErrorMessage,
  isBookmarkPending,
  onBookmarkToggle,
  onPinClick,
}: PinListContentProps) {
  const { isFullPage } = useBottomSheet();
  const distance = formatDistance(place.distance);
  const hasPins = pins.length > 0;
  const bookmarkLabel =
    bookmarkStatus === 'loading'
      ? '북마크 상태 불러오는 중'
      : bookmarkStatus === 'error'
        ? '북마크 상태를 불러오지 못함'
        : `${place.name} ${isBookmarked ? '북마크 해제' : '북마크 등록'}`;

  return (
    <>
      <BottomSheet.Header className={cn('px-4', isFullPage ? 'mt-0' : 'mt-[26.75px]')}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-col items-start gap-2">
              {place.isMine ? (
                <div className="flex items-center justify-center gap-1.5 rounded-[25px] bg-pli-black-75 px-2 py-1">
                  <span className="size-1.5 rounded-full bg-neon-2" aria-hidden />
                  <span className="etc-13-r text-neon-2">MY</span>
                </div>
              ) : null}

              <div className="min-w-0">
                <BottomSheet.Title className="block truncate head-24-sb text-grayscale-100">
                  {place.name ||
                    (detailErrorMessage
                      ? '장소 정보를 불러올 수 없어요'
                      : '장소 정보를 불러오고 있어요')}
                </BottomSheet.Title>
                {detailErrorMessage ? (
                  <p role="alert" className="body-15-r text-red">
                    {detailErrorMessage}
                  </p>
                ) : place.address ? (
                  <p className="truncate body-15-r text-grayscale-500">{place.address}</p>
                ) : null}
              </div>
            </div>

            <p className="truncate body-15-m text-grayscale-400">
              {place.creatorName ? (
                <>
                  <span className="body-15-r text-grayscale-200">{place.creatorName}</span> 님이
                  생성한 핀 · <span className="text-grayscale-300">{distance.value}</span>
                  {distance.unit}
                </>
              ) : (
                <>
                  생성되지 않음 · <span className="text-grayscale-300">{distance.value}</span>
                  {distance.unit}
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            aria-label={bookmarkLabel}
            aria-pressed={bookmarkStatus === 'ready' ? isBookmarked : undefined}
            aria-busy={bookmarkStatus === 'loading' || isBookmarkPending || undefined}
            disabled={bookmarkStatus !== 'ready' || isBookmarkPending}
            onClick={onBookmarkToggle}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-pli-black-75 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bookmarkStatus === 'loading' ? (
              <span aria-hidden className="size-6 animate-pulse rounded-md bg-grayscale-700" />
            ) : bookmarkStatus === 'error' ? (
              <span aria-hidden className="body-15-m text-grayscale-500">
                !
              </span>
            ) : isBookmarked ? (
              <BookmarkActiveIcon className="size-7" aria-hidden />
            ) : (
              <BookmarkIcon className="size-7" aria-hidden />
            )}
          </button>
        </div>

        {hasPins ? (
          <div className="mt-6">
            <SortTabs value={sort} onChange={onSortChange} />
          </div>
        ) : null}
      </BottomSheet.Header>

      <BottomSheet.Content className={cn('mt-5 px-4', !hasPins && 'flex flex-col')}>
        {hasPins ? (
          <ul className="flex flex-col gap-4">
            {pins.map((pin) => (
              <li key={pin.placeTrackId}>
                <PinCard pin={pin} onClick={() => onPinClick?.(pin)} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col h-[131px] items-center justify-center rounded-[12px] bg-pli-black-85  text-center">
            <p className="body-18-r text-grayscale-300">생성된 핀이 없어요</p>
            <p className="body-15-r text-grayscale-600">첫번째 등록자가 되어보세요!</p>
          </div>
        )}
      </BottomSheet.Content>
    </>
  );
}

const BOOKMARK_TOAST_DURATION_MS = 2_000;

type BookmarkToast = {
  attempt: number;
  message: string;
};

export function PinListSheet({
  open,
  onClose,
  place,
  detailLocation,
  detailLocationError = null,
  onPinClick,
}: PinListSheetProps) {
  const [sort, setSort] = useState<PinSort>('POPULAR');
  const [bookmarkToast, setBookmarkToast] = useState<BookmarkToast | null>(null);
  const normalizedPlaceId = place.id.startsWith('place:')
    ? place.id.slice('place:'.length)
    : place.id;
  const parsedPlaceId = place.placeId ?? Number(normalizedPlaceId);
  const placeId = Number.isSafeInteger(parsedPlaceId) && parsedPlaceId > 0 ? parsedPlaceId : null;
  const queryLatitude = detailLocation?.latitude ?? 0;
  const queryLongitude = detailLocation?.longitude ?? 0;
  const placeDetailQuery = usePlaceDetail({
    placeId,
    latitude: detailLocation?.latitude ?? 0,
    longitude: detailLocation?.longitude ?? 0,
    enabled: open && detailLocation !== null,
  });
  const resolvedPlace: PlaceInfo = {
    ...place,
    name: placeDetailQuery.data?.placeName ?? place.name,
    distance: placeDetailQuery.data?.distanceMeters ?? place.distance,
    address: placeDetailQuery.data
      ? placeDetailQuery.data.roadAddress || placeDetailQuery.data.address
      : place.address,
    isMine: placeDetailQuery.data?.pinnedByMe ?? place.isMine,
  };
  const bookmarkMutation = useTogglePlaceBookmark();
  const resolvedBookmarkState = placeDetailQuery.data?.bookmarkedByMe ?? place.bookmarkedByMe;
  const detailErrorMessage =
    detailLocation === null
      ? detailLocationError
      : placeDetailQuery.isError
        ? '장소 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
        : null;
  const bookmarkStatus: BookmarkStatus =
    resolvedBookmarkState !== undefined ? 'ready' : detailErrorMessage ? 'error' : 'loading';
  const isCurrentPlaceMutation = bookmarkMutation.variables?.placeId === placeId;
  const isBookmarked =
    isCurrentPlaceMutation && bookmarkMutation.isPending
      ? bookmarkMutation.variables.bookmarked
      : (resolvedBookmarkState ?? false);
  const { data } = usePlaceTrack({
    placeId: normalizedPlaceId,
    latitude: queryLatitude,
    longitude: queryLongitude,
    sort: sort === 'LATEST' ? 'LATEST' : 'POPULAR',
    enabled: open && detailLocation !== null,
  });

  const handleBookmarkToggle = () => {
    if (placeId === null || bookmarkMutation.isPending || bookmarkStatus !== 'ready') return;

    bookmarkMutation.mutate(
      { placeId, bookmarked: !isBookmarked },
      {
        onError: (error) => {
          setBookmarkToast((currentToast) => ({
            attempt: (currentToast?.attempt ?? 0) + 1,
            message:
              error instanceof Error
                ? error.message
                : '북마크를 변경하지 못했어요. 다시 시도해 주세요.',
          }));
        },
      },
    );
  };

  const pins: Pin[] =
    data?.tracks.map((track) => ({
      ...track,
      liked: track.isLiked,
    })) ?? [];

  return (
    <ToastProvider duration={BOOKMARK_TOAST_DURATION_MS}>
      <BottomSheet
        open={open}
        onClose={onClose}
        snapPoints={PIN_LIST_SHEET_SNAP_POINTS}
        defaultSnapPoint={PIN_LIST_SHEET_DEFAULT_SNAP_POINT}
      >
        <BottomSheet.FullPageNav />
        <PinListContent
          place={resolvedPlace}
          pins={pins}
          sort={sort}
          onSortChange={setSort}
          isBookmarked={isBookmarked}
          bookmarkStatus={bookmarkStatus}
          detailErrorMessage={detailErrorMessage}
          isBookmarkPending={bookmarkMutation.isPending}
          onBookmarkToggle={handleBookmarkToggle}
          onPinClick={onPinClick}
        />
      </BottomSheet>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+23px)] z-[70] flex justify-center">
        {bookmarkToast ? (
          <Toast key={`${bookmarkToast.message}:${bookmarkToast.attempt}`} defaultOpen>
            {bookmarkToast.message}
          </Toast>
        ) : null}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}
