import { useRef, useState, type RefObject } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { SearchInput } from '@/components/ui/SearchInput';
import { SongSelectSkeleton } from '@/components/skeletons/SongSelectSkeleton';
import { SongCard } from '@/features/pin/components/SongCard';
import { fetchPlaybackPreparations } from '@/features/pin/queries/useGetPlaybackPreparations';
import { useSearchTracks } from '@/features/pin/queries/useSearchTracks';
import type { SearchTrack } from '@/features/pin/types';

const PLAYBACK_ERROR_MESSAGE = '이 곡은 현재 재생할 수 없어요. 다른 곡을 선택해 주세요.';

type SongSelectSheetProps = {
  open: boolean;
  onClose: () => void;
  onSelect?: (song: SearchTrack) => void;
  finalFocusRef?: RefObject<HTMLElement | null>;
  /** 열릴 때 검색창 자동 포커스를 막는다. */
  preventOpenAutoFocus?: boolean;
};

export function SongSelectSheet({
  open,
  onClose,
  onSelect,
  finalFocusRef,
  preventOpenAutoFocus = false,
}: SongSelectSheetProps) {
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [prevOpen, setPrevOpen] = useState(open);
  const [preparingTrackId, setPreparingTrackId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 스와이프/뒤로가기 등 onClick을 거치지 않는 닫힘까지 포함해 검색어를 리셋한다.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setQuery('');
      setPreparingTrackId(null);
      setErrorMessage(null);
    }
  }

  const searchQuery = useSearchTracks({ keyword: query });
  const hasSearchQuery = query.trim().length > 0;
  const isSearchPending = hasSearchQuery && (searchQuery.isDebouncing || searchQuery.isPending);
  const tracks =
    hasSearchQuery && !searchQuery.isDebouncing ? (searchQuery.data?.tracks ?? []) : [];

  const handleSelectTrack = async (track: SearchTrack) => {
    if (preparingTrackId != null) return;

    setErrorMessage(null);
    setPreparingTrackId(track.itunesTrackId);
    try {
      await fetchPlaybackPreparations(queryClient, track.itunesTrackId);
      onSelect?.(track);
      onClose();
    } catch {
      setErrorMessage(PLAYBACK_ERROR_MESSAGE);
    } finally {
      setPreparingTrackId(null);
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      initialFocusRef={preventOpenAutoFocus ? undefined : searchInputRef}
      finalFocusRef={finalFocusRef}
      preventOpenAutoFocus={preventOpenAutoFocus}
      snapPoints={[0.98, 1]}
      className="z-[80] bg-pli-black-85"
    >
      <BottomSheet.Header className="px-[15px]">
        <BottomSheet.Title className="my-5.5 text-center body-15-r text-grayscale-300">
          노래 선택하기
        </BottomSheet.Title>
        <SearchInput
          ref={searchInputRef}
          variant="song"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="노래를 검색하세요"
        />
      </BottomSheet.Header>

      <BottomSheet.Content className="px-3 pt-5.5">
        {isSearchPending ? (
          <SongSelectSkeleton />
        ) : (
          <ul>
            {tracks.map((track) => (
              <li key={track.itunesTrackId}>
                <SongCard
                  song={track}
                  disabled={preparingTrackId != null}
                  isLoading={preparingTrackId === track.itunesTrackId}
                  onClick={() => {
                    void handleSelectTrack(track);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
        {errorMessage ? (
          <p className="sticky bottom-0 bg-pli-black-85 py-3 text-center body-15-m text-grayscale-400">
            {errorMessage}
          </p>
        ) : null}
      </BottomSheet.Content>
    </BottomSheet>
  );
}
