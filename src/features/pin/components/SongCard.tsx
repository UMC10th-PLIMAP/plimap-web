import type { Song } from '@/features/pin/types';

type SongCardProps = {
  song: Song;
  onClick?: () => void;
};

export function SongCard({ song, onClick }: SongCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 py-2 text-left"
    >
      <div className="size-13 rounded-md bg-grayscale-0" />
      <div>
        <p className="body-17-m text-grayscale-100">{song.title}</p>
        <p className="body-15-r text-grayscale-500">{song.artist}</p>
      </div>
    </button>
  );
}
