import { useState } from 'react';

import BookmarkActiveIcon from '@/assets/home/bookmark-active.svg?react';
import BookmarkIcon from '@/assets/icons/bookmark.svg?react';
import NextIcon from '@/assets/icons/next.svg?react';
import UserPlaceholderIcon from '@/assets/icons/user-placeholder.svg?react';
import { BottomSheet, useBottomSheet } from '@/components/ui/BottomSheet';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import { PinCard } from '@/features/pin/components/PinCard';
import { SortTabs } from '@/features/pin/components/SortTabs';
import { usePlaceDetail, useTogglePlaceBookmark } from '@/features/pin/queries/usePlaceBookmark';
import { usePlaceTrack } from '@/features/pin/queries/usePlaceTrack';
import type { FocusedFeedPin, Pin, PinSort, PlaceInfo } from '@/features/pin/types';
import { useCurrentPosition } from '@/hooks/useCurrentPosition';
import { cn } from '@/lib/utils';

type PinListSheetProps = {
  open: boolean;
  onClose: () => void;
  place: PlaceInfo;
  focusedFeedPin?: FocusedFeedPin;
  onPinClick?: (pin: Pin) => void;
  onFocusedTrackClick?: (placeTrackId: string) => void;
};

// 화면 전체 높이 874 기준 Figma 스냅
const PIN_LIST_SHEET_SNAP_POINTS = [161 / 874, 340 / 874, 0.8, 1];
const PIN_LIST_SHEET_DEFAULT_SNAP_POINT = 340 / 874;
// 프로필 피드 진입: MY·장소정보·등록곡 CTA·정렬 탭까지 보이는 높이 (Figma FD-01-04)
const PIN_LIST_SHEET_FEED_SNAP_POINTS = [161 / 874, 300 / 874, 0.8, 1];
const PIN_LIST_SHEET_FEED_DEFAULT_SNAP_POINT = 300 / 874;

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

function findFocusedPlaceTrackId(pins: Pin[], focusedFeedPin?: FocusedFeedPin) {
  if (!focusedFeedPin) return null;

  const matched = pins.find(
    (pin) => pin.artworkUrl != null && pin.artworkUrl === focusedFeedPin.albumImageUrl,
  );
  return matched ? String(matched.placeTrackId) : null;
}

type PinListContentProps = {
  place: PlaceInfo;
  pins: Pin[];
  sort: PinSort;
  onSortChange: (sort: PinSort) => void;
  isBookmarked: boolean;
  isBookmarkPending: boolean;
  onBookmarkToggle: () => void;
  onPinClick?: (pin: Pin) => void;
  focusedFeedPin?: FocusedFeedPin;
  onFocusedTrackClick?: () => void;
};

function PinListContent({
  place,
  pins,
  sort,
  onSortChange,
  isBookmarked,
  isBookmarkPending,
  onBookmarkToggle,
  onPinClick,
  focusedFeedPin,
  onFocusedTrackClick,
}: PinListContentProps) {
  const { isFullPage } = useBottomSheet();
  const distance = formatDistance(place.distance);
  const hasPins = pins.length > 0;

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
                  {place.name}
                </BottomSheet.Title>
                {place.address ? (
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
            aria-label={`${place.name} ${isBookmarked ? '북마크 해제' : '북마크 등록'}`}
            aria-pressed={isBookmarked}
            aria-busy={isBookmarkPending || undefined}
            disabled={isBookmarkPending}
            onClick={onBookmarkToggle}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-pli-black-75 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBookmarked ? (
              <BookmarkActiveIcon className="size-7" aria-hidden />
            ) : (
              <BookmarkIcon className="size-7" aria-hidden />
            )}
          </button>
        </div>

        {focusedFeedPin ? (
          <button
            type="button"
            onClick={onFocusedTrackClick}
            disabled={!onFocusedTrackClick}
            className="mt-4 flex w-full min-w-0 items-center gap-3 rounded-xl bg-pli-black-85 px-3 py-3 text-left disabled:opacity-50 cursor-pointer"
          >
            {focusedFeedPin.avatarUrl ? (
              <img
                src={focusedFeedPin.avatarUrl}
                alt=""
                className="size-7 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-7 items-center justify-center rounded-full bg-pli-black-75 ">
                <UserPlaceholderIcon className="size-4 text-pli-black-50" aria-hidden />
              </span>
            )}
            <p className="min-w-0 flex-1 truncate body-15-r text-grayscale-100">
              <span className="text-neon-2">{focusedFeedPin.nickname} </span>님이 등록한 곡 상세
              보기
            </p>
            <NextIcon className="size-5 text-grayscale-400" aria-hidden />
          </button>
        ) : null}

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
  focusedFeedPin,
  onPinClick,
  onFocusedTrackClick,
}: PinListSheetProps) {
  const [sort, setSort] = useState<PinSort>('POPULAR');
  const [bookmarkToast, setBookmarkToast] = useState<BookmarkToast | null>(null);
  const normalizedPlaceId = place.id.startsWith('place:')
    ? place.id.slice('place:'.length)
    : place.id;
  const parsedPlaceId = place.placeId ?? Number(normalizedPlaceId);
  const placeId = Number.isSafeInteger(parsedPlaceId) && parsedPlaceId > 0 ? parsedPlaceId : null;
  const { data: currentPosition } = useCurrentPosition({ enabled: open });
  const queryLatitude = currentPosition?.latitude ?? place.latitude;
  const queryLongitude = currentPosition?.longitude ?? place.longitude;
  const placeDetailQuery = usePlaceDetail({
    placeId,
    latitude: queryLatitude,
    longitude: queryLongitude,
    enabled: open,
  });
  const bookmarkMutation = useTogglePlaceBookmark();
  const resolvedBookmarkState =
    placeDetailQuery.data?.bookmarkedByMe ?? place.bookmarkedByMe ?? false;
  const isCurrentPlaceMutation = bookmarkMutation.variables?.placeId === placeId;
  const isBookmarked =
    isCurrentPlaceMutation && bookmarkMutation.isPending
      ? bookmarkMutation.variables.bookmarked
      : resolvedBookmarkState;
  const isBookmarkStateLoading =
    open && place.bookmarkedByMe === undefined && placeDetailQuery.isPending;
  const { data } = usePlaceTrack({
    placeId: normalizedPlaceId,
    latitude: queryLatitude,
    longitude: queryLongitude,
    sort: sort === 'LATEST' ? 'LATEST' : 'POPULAR',
    enabled: open,
  });

  const handleBookmarkToggle = () => {
    if (placeId === null || bookmarkMutation.isPending || isBookmarkStateLoading) return;

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

  const focusedPlaceTrackId = findFocusedPlaceTrackId(pins, focusedFeedPin);

  const resolvedPlace: PlaceInfo = {
    ...place,
    name: placeDetailQuery.data?.placeName ?? place.name,
    address: placeDetailQuery.data?.address ?? place.address,
    distance: placeDetailQuery.data?.distanceMeters ?? place.distance,
  };

  return (
    <ToastProvider duration={BOOKMARK_TOAST_DURATION_MS}>
      <BottomSheet
        open={open}
        onClose={onClose}
        snapPoints={focusedFeedPin ? PIN_LIST_SHEET_FEED_SNAP_POINTS : PIN_LIST_SHEET_SNAP_POINTS}
        defaultSnapPoint={
          focusedFeedPin
            ? PIN_LIST_SHEET_FEED_DEFAULT_SNAP_POINT
            : PIN_LIST_SHEET_DEFAULT_SNAP_POINT
        }
      >
        <BottomSheet.FullPageNav />
        <PinListContent
          place={resolvedPlace}
          pins={pins}
          sort={sort}
          onSortChange={setSort}
          isBookmarked={isBookmarked}
          isBookmarkPending={bookmarkMutation.isPending || isBookmarkStateLoading}
          onBookmarkToggle={handleBookmarkToggle}
          onPinClick={onPinClick}
          focusedFeedPin={focusedFeedPin}
          onFocusedTrackClick={
            focusedPlaceTrackId && onFocusedTrackClick
              ? () => onFocusedTrackClick(focusedPlaceTrackId)
              : undefined
          }
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
