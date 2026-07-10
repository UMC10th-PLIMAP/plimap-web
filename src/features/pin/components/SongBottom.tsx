import { useMemo, useState } from 'react';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { SearchInput } from '@/components/ui/SearchInput';
import { SongCard } from '@/features/pin/components/SongCard';
import type { Song } from '@/types/pin';

type SongCardProps = {
  songs?: Song[];
  onSelect?: (song: Song) => void;
};

const MOCK_SONGS: Song[] = [
  { id: '1', title: 'Hype Boy', artist: 'NewJeans' },
  { id: '2', title: 'Hype Boy (250 Remix)', artist: 'NewJeans' },
  { id: '3', title: 'Hype Boy (Instrumental)', artist: 'NewJeans' },
  { id: '4', title: 'Attention', artist: 'NewJeans' },
];

export default function SongPage({ songs = MOCK_SONGS, onSelect }: SongCardProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredSongs = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return songs;

    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(keyword) || song.artist.toLowerCase().includes(keyword),
    );
  }, [query, songs]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      {/* 지도 부분 onclick시 바텀시트 열기 */}
      <p className="body-15-r text-grayscale-400">노래 선택 바텀시트 미리보기</p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-neon px-6 py-3 body-15-sb text-grayscale-1250"
      >
        노래 선택 시트 열기
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <BottomSheet.Header className="space-y-4 px-[15px]">
          <BottomSheet.Title className="mt-5.5 text-center body-15-r text-grayscale-300">
            노래 선택하기
          </BottomSheet.Title>

          <SearchInput
            variant="song"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="노래를 검색하세요"
          />
        </BottomSheet.Header>

        <BottomSheet.Content className="mt-5.5 px-4">
          <ul>
            {filteredSongs.map((song) => (
              <li key={song.id}>
                <SongCard
                  song={song}
                  onClick={() => {
                    onSelect?.(song);
                    setOpen(false);
                    setQuery('');
                  }}
                />
              </li>
            ))}
          </ul>
        </BottomSheet.Content>
      </BottomSheet>
    </div>
  );
}
