import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { TopBar } from '@/components/ui/TopBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SongSelectSkeleton } from '@/components/skeletons/SongSelectSkeleton';
import { useToast } from '@/hooks/useToast';
import { SongCard } from '@/features/pin/components/SongCard';
import { fetchPlaybackPreparations } from '@/features/pin/queries/useGetPlaybackPreparations';
import { useSearchTracks } from '@/features/pin/queries/useSearchTracks';
import type { SearchTrack } from '@/features/pin/types';
import { useAutoFocusAfterViewTransition } from '@/hooks/useAutoFocusAfterViewTransition';
import { usePinCreationStore } from '@/store/pinCreationStore';

const PLAYBACK_ERROR_MESSAGE = '이 곡은 현재 재생할 수 없어요. 다른 곡을 선택해 주세요.';

export default function SongListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchInputRef = useAutoFocusAfterViewTransition<HTMLInputElement>();
  const toast = useToast();
  const place = usePinCreationStore((state) => state.place);
  const currentLocation = usePinCreationStore((state) => state.currentLocation);
  const [query, setQuery] = useState('');
  const [preparingTrackId, setPreparingTrackId] = useState<number | null>(null);

  const trackSearchQuery = useSearchTracks({ keyword: query, limit: 200 });
  const hasSearchQuery = query.trim().length > 0;
  const isSearchPending =
    hasSearchQuery && (trackSearchQuery.isDebouncing || trackSearchQuery.isPending);
  const tracks =
    hasSearchQuery && !trackSearchQuery.isDebouncing
      ? (trackSearchQuery.data?.tracks ?? [])
      : [];

  useEffect(() => {
    if (!trackSearchQuery.isError) return;

    toast.error('검색을 실패했어요.\n네트워크 연결을 확인해 주세요', { duration: 3_000 });
  }, [toast, trackSearchQuery.error, trackSearchQuery.isError]);

  const handleSelectTrack = async (track: SearchTrack) => {
    if (preparingTrackId != null) return;

    setPreparingTrackId(track.itunesTrackId);
    try {
      // 카드 클릭 시 구간 재생 준비 API를 먼저 실행한다.
      await fetchPlaybackPreparations(queryClient, track.itunesTrackId);
      navigate(`/app/song/detail/${track.itunesTrackId}`);
    } catch (error) {
      toast.error(PLAYBACK_ERROR_MESSAGE, { duration: 2_500 });
      console.error(error);
    } finally {
      setPreparingTrackId(null);
    }
  };

  if (!place || !currentLocation) {
    return <Navigate to="/app/pin/register/place" replace />;
  }

  return (
    <>
      <div className="relative flex min-h-full flex-col pt-[env(safe-area-inset-top)]">
        <TopBar onBack={() => navigate(-1)} title="노래 선택하기" titleWeight="regular" />
        <div className="px-[15px] pt-4">
          <SearchInput
            ref={searchInputRef}
            variant="song"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery('')}
            placeholder="노래를 검색하세요"
          />
        </div>
        <div className="px-4 pt-5.5">
          {isSearchPending ? (
            <SongSelectSkeleton />
          ) : trackSearchQuery.isError ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="body-15-r text-grayscale-500">노래를 검색하지 못했어요.</p>
              <button
                type="button"
                onClick={() => void trackSearchQuery.refetch()}
                className="body-15-m text-neon-2 cursor-pointer"
              >
                다시 시도
              </button>
            </div>
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
        </div>
      </div>
    </>
  );
}
