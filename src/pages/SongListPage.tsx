import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SongCard } from '@/features/pin/components/SongCard';
import { useSearchTracks } from '@/features/pin/queries/useSearchTracks';

export default function SongListPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const { data: tracks } = useSearchTracks({ keyword: query, limit: 200 });

  return (
    <div>
      <TopBar onBack={() => navigate(-1)} title="노래 선택하기" titleWeight="regular" />
      <div className="px-[15px] pt-4">
        <SearchInput
          variant="song"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
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
