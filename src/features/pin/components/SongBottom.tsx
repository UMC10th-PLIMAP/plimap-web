import { useEffect, useMemo, useRef, useState } from 'react';

import { BottomSheet, useBottomSheet } from '@/components/ui/BottomSheet';
import { SearchInput } from '@/components/ui/SearchInput';
import { SongCard } from '@/features/pin/components/SongCard';
import { SongDetailContent } from '@/features/pin/components/SongDetailContent';
import { MOCK_SONGS } from '@/features/pin/constants/songPreview';
import type { Song } from '@/types/pin';

type SongBottomProps = {
  songs?: Song[];
  onSelect?: (song: Song) => void;
};

type SongBottomSheetContentProps = {
  songs: Song[];
  onSelect?: (song: Song) => void;
  onClose: () => void;
};

type SongBottomStep = 'search' | 'detail';

function SongBottomSheetContent({ songs, onSelect, onClose }: SongBottomSheetContentProps) {
  const { expand, collapse, isFullPage } = useBottomSheet();
  const [step, setStep] = useState<SongBottomStep>('search');
  const [query, setQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const prevFullPageRef = useRef(isFullPage);

  const filteredSongs = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return songs;

    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(keyword) || song.artist.toLowerCase().includes(keyword),
    );
  }, [query, songs]);

  useEffect(() => {
    if (prevFullPageRef.current && !isFullPage && step === 'detail') {
      setStep('search');
    }

    prevFullPageRef.current = isFullPage;
  }, [isFullPage, step]);

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
    setStep('detail');
    expand();
  };

  const handleCancelDetail = () => {
    setStep('search');
    collapse();
  };

  const handleRegister = () => {
    if (!selectedSong) return;

    onSelect?.(selectedSong);
    onClose();
  };

  if (step === 'detail' && selectedSong) {
    return (
      <SongDetailContent
        song={selectedSong}
        onCancel={handleCancelDetail}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <>
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
              <SongCard song={song} onClick={() => handleSongClick(song)} />
            </li>
          ))}
        </ul>
      </BottomSheet.Content>
    </>
  );
}

export default function SongBottom({ songs = MOCK_SONGS, onSelect }: SongBottomProps) {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <p className="body-15-r text-grayscale-400">노래 선택 바텀시트 미리보기</p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-neon px-6 py-3 body-15-sb text-grayscale-1250"
      >
        노래 선택 시트 열기
      </button>

      <BottomSheet open={open} onClose={handleClose}>
        {open ? (
          <SongBottomSheetContent songs={songs} onSelect={onSelect} onClose={handleClose} />
        ) : null}
      </BottomSheet>
    </div>
  );
}
