import { useCallback, useEffect, useMemo, useState } from 'react';

import BookmarkActiveIcon from '@/assets/home/bookmark-active.svg?react';
import BookmarkIcon from '@/assets/icons/bookmark.svg?react';
import CloseIcon from '@/assets/icons/close.svg?react';
import NextIcon from '@/assets/icons/next.svg?react';
import UserPlaceholderIcon from '@/assets/icons/user-placeholder.svg?react';
import { BottomSheet, useBottomSheet } from '@/components/ui/BottomSheet';
import { Toast, ToastPortal, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import { PinCard } from '@/features/pin/components/PinCard';
import { SortTabs } from '@/features/pin/components/SortTabs';
import { usePlaceDetail, useTogglePlaceBookmark } from '@/features/pin/queries/usePlaceBookmark';
import { usePlaceTrack } from '@/features/pin/queries/usePlaceTrack';
import type { FocusedFeedPin, Pin, PinSort, PlaceInfo } from '@/features/pin/types';
import { cn } from '@/lib/utils';
import type { PlaceSearchHistoryRequest } from '@/types/place.type';

type BookmarkStatus = 'loading' | 'error' | 'ready';

/** MapPage처럼 시트 바깥에서 등록 가능 여부(거리·본인 핀 여부)를 판단해야 하는 곳에서 쓴다. */
export type ResolvedPlaceSummary = {
  placeId: number;
  placeName: string;
  address: string;
  roadAddress: string | null;
  latitude: number;
  longitude: number;
  distance: number;
  isMine: boolean;
  withinAccessRange: boolean;
};

type PinListSheetProps = {
  open: boolean;
  onClose: () => void;
  place: PlaceInfo;
  focusedFeedPin?: FocusedFeedPin;
  detailLocation: PlaceSearchHistoryRequest | null;
  detailLocationError?: string | null;
  onPinClick?: (pin: Pin) => void;
  onFocusedTrackClick?: (placeTrackId: string) => void;
  /**
   * 내/친구 피드 → 지도 진입 시에만 true.
   * false면 곡 카드는 보이되 하트·상세 이동은 막는다.
   */
  allowTrackDetailAccess?: boolean;
  /** 이 값이 바뀌면 시트가 열린 채로도 default 스냅으로 리셋한다(다른 핀/장소 선택 시 사용). */
  resetKey?: string | number;
  /** 이 값이 바뀔 때마다 가장 작은 스냅으로 축소한다(지도 빈 곳 탭 시 사용). */
  collapseToSmallestSignal?: number;
  /** 현재 활성 스냅(0~1)이 바뀔 때마다 호출된다. */
  onActiveSnapChange?: (snap: number) => void;
  /** 서버에서 해결된 장소 정보(등록 가능 거리·본인 핀 여부 포함)가 바뀔 때마다 호출된다. */
  onResolvedPlaceChange?: (summary: ResolvedPlaceSummary | null) => void;
  /** 풀페이지에서 뒤로가기를 눌렀을 때 호출. 생략하면 기본 스냅으로 접는다. */
  onFullPageBack?: () => void;
};

// 화면 전체 높이 874 기준 Figma 스냅. 헤더(제목·주소·등록자·거리)까지만 보이는 높이.
const PIN_LIST_SHEET_COLLAPSED_SNAP = 180 / 874;
// MapPage 등 시트 바깥에서 기본 높이를 알아야 하는 곳에서 재사용한다.
export const PIN_LIST_SHEET_MID_SNAP = 340 / 874;
// 프로필 피드 진입: MY·장소정보·등록곡 CTA·정렬 탭까지 보이는 높이 (Figma FD-01-04)
const PIN_LIST_SHEET_FEED_MID_SNAP = 300 / 874;

function buildSnapPoints(collapsedSnap: number, midSnap: number) {
  return [collapsedSnap, midSnap, 1];
}

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

function findFocusedPlaceTrackId(focusedFeedPin?: FocusedFeedPin) {
  if (focusedFeedPin?.placeTrackId == null) return null;
  return String(focusedFeedPin.placeTrackId);
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
  onBlockedPinClick?: () => void;
  allowTrackDetailAccess?: boolean;
  focusedFeedPin?: FocusedFeedPin;
  onFocusedTrackClick?: () => void;
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
  onBlockedPinClick,
  allowTrackDetailAccess = false,
  focusedFeedPin,
  onFocusedTrackClick,
}: PinListContentProps) {
  const { isFullPage, onClose } = useBottomSheet();
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
              {/* MY 칩은 본인 핀 여부와 무관하게 항상 보이고, 본인 핀일 때만 활성(네온) 스타일을 쓴다. */}
              <div className="flex items-center justify-center gap-1.5 rounded-[25px] bg-pli-black-75 px-2 py-1">
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    place.isMine ? 'bg-neon-2' : 'bg-pli-black-10',
                  )}
                  aria-hidden
                />
                <span
                  className={cn('etc-13-r', place.isMine ? 'text-neon-2' : 'text-pli-black-10')}
                >
                  MY
                </span>
              </div>

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

          {/* 풀페이지 상태에선 BottomSheet.FullPageNav의 상단바에 북마크·닫기가 이미 있어 중복 노출을 피한다. */}
          {!isFullPage ? (
            <div className="flex shrink-0 items-center gap-2">
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

              <button
                type="button"
                aria-label="닫기"
                onClick={onClose}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-pli-black-75"
              >
                <CloseIcon className="size-6" aria-hidden />
              </button>
            </div>
          ) : null}
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
                <PinCard
                  pin={pin}
                  showLike={allowTrackDetailAccess}
                  onClick={
                    allowTrackDetailAccess
                      ? () => onPinClick?.(pin)
                      : onBlockedPinClick
                        ? () => onBlockedPinClick()
                        : undefined
                  }
                />
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
const TRACK_DETAIL_BLOCKED_TOAST_MESSAGE =
  '내 장소이거나, 피드에서 진입한 경우에만 곡 상세를 볼 수 있어요.';

type BookmarkToast = {
  attempt: number;
  message: string;
};

export function PinListSheet({
  open,
  onClose,
  place,
  focusedFeedPin,
  detailLocation,
  detailLocationError = null,
  onPinClick,
  onFocusedTrackClick,
  allowTrackDetailAccess = false,
  resetKey,
  collapseToSmallestSignal,
  onActiveSnapChange,
  onResolvedPlaceChange,
  onFullPageBack,
}: PinListSheetProps) {
  const [sort, setSort] = useState<PinSort>('POPULAR');
  const [bookmarkToast, setBookmarkToast] = useState<BookmarkToast | null>(null);
  const [accessToast, setAccessToast] = useState<BookmarkToast | null>(null);
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
  useEffect(() => {
    if (!onResolvedPlaceChange) return;

    const detail = placeDetailQuery.data;
    if (!detail) {
      onResolvedPlaceChange(null);
      return;
    }

    onResolvedPlaceChange({
      placeId: detail.placeId,
      placeName: detail.placeName,
      address: detail.address,
      roadAddress: detail.roadAddress,
      latitude: detail.latitude,
      longitude: detail.longitude,
      distance: detail.distanceMeters,
      isMine: detail.pinnedByMe,
      withinAccessRange: detail.withinAccessRange,
    });
  }, [onResolvedPlaceChange, placeDetailQuery.data]);

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

  const focusedPlaceTrackId = findFocusedPlaceTrackId(focusedFeedPin);
  // 피드 진입이거나, 내가 등록한 장소(MY)면 곡 상세 열람 허용
  const canOpenTrackDetail = allowTrackDetailAccess || Boolean(resolvedPlace.isMine);
  const midSnap = focusedFeedPin ? PIN_LIST_SHEET_FEED_MID_SNAP : PIN_LIST_SHEET_MID_SNAP;
  // 매 렌더 새 배열이면 vaul이 prop 변화로 인식해 재실행하므로 값이 바뀔 때만 새로 만든다.
  const snapPoints = useMemo(
    () => buildSnapPoints(PIN_LIST_SHEET_COLLAPSED_SNAP, midSnap),
    [midSnap],
  );
  const handleActiveSnapChange = useCallback(
    (snap: number | string) => {
      onActiveSnapChange?.(typeof snap === 'number' ? snap : midSnap);
    },
    [onActiveSnapChange, midSnap],
  );

  const bookmarkTrailingButton = (
    <button
      type="button"
      aria-label={isBookmarked ? '북마크 해제' : '북마크 등록'}
      aria-pressed={bookmarkStatus === 'ready' ? isBookmarked : undefined}
      disabled={bookmarkStatus !== 'ready' || bookmarkMutation.isPending}
      onClick={handleBookmarkToggle}
      className="flex size-7 shrink-0 items-center justify-center text-grayscale-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isBookmarked ? (
        <BookmarkActiveIcon className="size-6" aria-hidden />
      ) : (
        <BookmarkIcon className="size-6" aria-hidden />
      )}
    </button>
  );

  return (
    <ToastProvider duration={BOOKMARK_TOAST_DURATION_MS}>
      <BottomSheet
        open={open}
        onClose={onClose}
        dismissible={false}
        snapPoints={snapPoints}
        defaultSnapPoint={midSnap}
        resetKey={resetKey}
        collapseToSmallestSignal={collapseToSmallestSignal}
        onActiveSnapChange={handleActiveSnapChange}
      >
        <BottomSheet.FullPageNav onBack={onFullPageBack} trailing={bookmarkTrailingButton} />
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
          onBlockedPinClick={() => {
            setAccessToast((currentToast) => ({
              attempt: (currentToast?.attempt ?? 0) + 1,
              message: TRACK_DETAIL_BLOCKED_TOAST_MESSAGE,
            }));
          }}
          allowTrackDetailAccess={canOpenTrackDetail}
          focusedFeedPin={focusedFeedPin}
          onFocusedTrackClick={
            focusedPlaceTrackId && onFocusedTrackClick
              ? () => onFocusedTrackClick(focusedPlaceTrackId)
              : undefined
          }
        />
      </BottomSheet>

      <ToastPortal>
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+23px)] z-[90] flex justify-center">
          {bookmarkToast ? (
            <Toast key={`bookmark:${bookmarkToast.message}:${bookmarkToast.attempt}`} defaultOpen>
              {bookmarkToast.message}
            </Toast>
          ) : null}
          {accessToast ? (
            <Toast key={`access:${accessToast.message}:${accessToast.attempt}`} defaultOpen>
              {accessToast.message}
            </Toast>
          ) : null}
          <ToastViewport />
        </div>
      </ToastPortal>
    </ToastProvider>
  );
}
