import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { TopBar } from '@/components/ui/TopBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import { SongCard } from '@/features/pin/components/SongCard';
import { fetchPlaybackPreparations } from '@/features/pin/queries/useGetPlaybackPreparations';
import { useSearchTracks } from '@/features/pin/queries/useSearchTracks';
import type { SearchTrack } from '@/features/pin/types';
import { usePinCreationStore } from '@/store/pinCreationStore';

const TOAST_DURATION_MS = 2_500;
const PLAYBACK_ERROR_MESSAGE = '이 곡은 현재 재생할 수 없어요. 다른 곡을 선택해 주세요.';

type SelectToast = {
  attempt: number;
  message: string;
};

export default function SongListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const place = usePinCreationStore((state) => state.place);
  const currentLocation = usePinCreationStore((state) => state.currentLocation);
  const [query, setQuery] = useState('');
  const [preparingTrackId, setPreparingTrackId] = useState<number | null>(null);
  const [toast, setToast] = useState<SelectToast | null>(null);

  const { data: tracks } = useSearchTracks({ keyword: query, limit: 200 });

  const showToast = (message: string) => {
    setToast((current) => ({
      attempt: (current?.attempt ?? 0) + 1,
      message,
    }));
  };

  const handleSelectTrack = async (track: SearchTrack) => {
    if (preparingTrackId != null) return;

    setPreparingTrackId(track.itunesTrackId);
    try {
      // 카드 클릭 시 구간 재생 준비 API를 먼저 실행한다.
      await fetchPlaybackPreparations(queryClient, track.itunesTrackId);
      navigate(`/app/song/detail/${track.itunesTrackId}`);
    } catch (error) {
      showToast(PLAYBACK_ERROR_MESSAGE);
      console.error(error);
    } finally {
      setPreparingTrackId(null);
    }
  };

  if (!place || !currentLocation) {
    return <Navigate to="/app/pin/register/place" replace />;
  }

  return (
    <ToastProvider duration={TOAST_DURATION_MS}>
      <div className="relative flex min-h-full flex-col">
        <TopBar onBack={() => navigate(-1)} title="노래 선택하기" titleWeight="regular" />
        <div className="px-[15px] pt-4">
          <SearchInput
            variant="song"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery('')}
            placeholder="노래를 검색하세요"
          />
        </div>
        <div className="px-4 pt-5.5">
          <ul>
            {tracks?.tracks.map((track) => (
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
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+23px)] z-50 flex justify-center">
          {toast ? (
            <Toast key={`${toast.message}:${toast.attempt}`} defaultOpen>
              {toast.message}
            </Toast>
          ) : null}
          <ToastViewport />
        </div>
      </div>
    </ToastProvider>
  );
}
