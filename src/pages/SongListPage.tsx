import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SongCard } from '@/features/pin/components/SongCard';

import { MOCK_SONG_CARD_LIST } from '@/features/pin/data/songPreview';

export default function SongListPage() {
  const navigate = useNavigate();
  return (
    <div>
      <TopBar onBack={() => navigate(-1)} title="노래 선택하기" titleWeight="regular" />
      <div className="pt-4 px-[15px]">
        <SearchInput variant="song" placeholder="노래를 검색하세요" />
      </div>
      <div className="pt-5.5 px-4">
        <ul>
          {MOCK_SONG_CARD_LIST.map((song) => (
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
