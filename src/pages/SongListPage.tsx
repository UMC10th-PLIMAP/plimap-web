import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SongCard } from '@/features/pin/components/SongCard';

import { MOCK_SONG_CARD_LIST } from '@/features/pin/data/songPreview';

export default function SongListPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filteredSongs = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return MOCK_SONG_CARD_LIST;

    return MOCK_SONG_CARD_LIST.filter(
      (song) =>
        song.title.toLowerCase().includes(keyword) || song.artist.toLowerCase().includes(keyword),
    );
  }, [query]);

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
          {filteredSongs.map((song) => (
            <li key={song.id}>
              <SongCard
                song={song}
                onClick={() => {
                  navigate(`/app/song/detail/${song.id}`);
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
