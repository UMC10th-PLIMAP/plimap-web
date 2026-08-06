import type { SearchTrack } from '@/features/pin/types';
import { cn } from '@/lib/utils';

type SongCardProps = {
  song: SearchTrack;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export function SongCard({ song, onClick, disabled = false, isLoading = false }: SongCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={isLoading || undefined}
      className={cn(
        'flex w-full items-center gap-3 py-2 text-left cursor-pointer disabled:cursor-not-allowed',
        isLoading && 'opacity-50',
      )}
    >
      <div className="max-w-[52px] max-h-[52px] overflow-hidden rounded-[4px]">
        {song.artworkUrl ? (
          <img
            src={song.artworkUrl}
            alt={song.trackName ?? undefined}
            className="size-full object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="body-17-m text-grayscale-100 truncate">{song.trackName}</p>
        <p className="body-15-r text-grayscale-500 truncate">{song.artistName}</p>
      </div>
    </button>
  );
}
