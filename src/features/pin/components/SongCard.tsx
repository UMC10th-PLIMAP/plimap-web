import type { SearchTrack } from '@/features/pin/types';

type SongCardProps = {
  song: SearchTrack;
  onClick?: () => void;
};

export function SongCard({ song, onClick }: SongCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 py-2 text-left cursor-pointer"
    >
      <div className="max-w-[52px] max-h-[52px] overflow-hidden rounded-[4px] bg-pli-black-50">
        {song.artworkUrl ? (
          <img
            src={song.artworkUrl}
            alt={song.trackName ?? undefined}
            className="size-full object-cover"
          />
        ) : null}
      </div>
      <div>
        <p className="body-17-m text-grayscale-100">{song.trackName}</p>
        <p className="body-15-r text-grayscale-500">{song.artistName}</p>
      </div>
    </button>
  );
}
