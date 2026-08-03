import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SongCard } from '@/features/pin/components/SongCard';
import { useSearchTracks } from '@/features/pin/queries/useSearchTracks';
import { usePinCreationStore } from '@/store/pinCreationStore';

export default function SongListPage() {
  const navigate = useNavigate();
  const place = usePinCreationStore((state) => state.place);
  const currentLocation = usePinCreationStore((state) => state.currentLocation);
  const [query, setQuery] = useState('');

  const { data: tracks } = useSearchTracks({ keyword: query, limit: 200 });

  if (!place || !currentLocation) {
    return <Navigate to="/app/pin/register/place" replace />;
  }

  return (
    <div>
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
                onClick={() => {
                  navigate(`/app/song/detail/${track.itunesTrackId}`);
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
