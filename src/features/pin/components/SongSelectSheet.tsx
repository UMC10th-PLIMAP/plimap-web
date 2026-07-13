import { useMemo, useState } from 'react';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { SearchInput } from '@/components/ui/SearchInput';
import { SongCard } from '@/features/pin/components/SongCard';
import type { Song } from '@/features/pin/types';

type SongSelectSheetProps = {
  open: boolean;
  onClose: () => void;
  songs: Song[];
  onSelect?: (song: Song) => void;
};

export function SongSelectSheet({ open, onClose, songs, onSelect }: SongSelectSheetProps) {
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
    <BottomSheet open={open} onClose={onClose}>
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
                  onClose();
                  setQuery('');
                }}
              />
            </li>
          ))}
        </ul>
      </BottomSheet.Content>
    </BottomSheet>
  );
}
