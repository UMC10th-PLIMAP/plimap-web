import { useState } from 'react';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { SearchInput } from '@/components/ui/SearchInput';
import { SongCard } from '@/features/pin/components/SongCard';
import { useSearchTracks } from '@/features/pin/queries/useSearchTracks';
import type { SearchTrack } from '@/features/pin/types';

type SongSelectSheetProps = {
  open: boolean;
  onClose: () => void;
  onSelect?: (song: SearchTrack) => void;
};

export function SongSelectSheet({ open, onClose, onSelect }: SongSelectSheetProps) {
  const [query, setQuery] = useState('');
  const [prevOpen, setPrevOpen] = useState(open);

  // 스와이프/뒤로가기 등 onClick을 거치지 않는 닫힘까지 포함해 검색어를 리셋한다.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setQuery('');
    }
  }

  const { data } = useSearchTracks({ keyword: query });
  const tracks = data?.tracks ?? [];

  return (
    <BottomSheet open={open} onClose={onClose} snapPoints={[0.98, 1]} className="bg-pli-black-85 ">
      <BottomSheet.Header className="px-[15px]">
        <BottomSheet.Title className="my-5.5 text-center body-15-r text-grayscale-300">
          노래 선택하기
        </BottomSheet.Title>
        <SearchInput
          variant="song"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="노래를 검색하세요"
        />
      </BottomSheet.Header>

      <BottomSheet.Content className="px-4 pt-5.5">
        <ul>
          {tracks.map((track) => (
            <li key={track.itunesTrackId}>
              <SongCard
                song={track}
                onClick={() => {
                  onSelect?.(track);
                  onClose();
                }}
              />
            </li>
          ))}
        </ul>
      </BottomSheet.Content>
    </BottomSheet>
  );
}
