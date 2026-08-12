import UserPlaceholderIcon from '@/assets/icons/user-placeholder.svg?react';
import SoundWaveIcon from '@/assets/icons/soundwaves.svg?react';
import PlayIcon from '@/assets/icons/play.svg?react';
import StopIcon from '@/assets/icons/stop.svg?react';
import { cn } from '@/lib/utils';
import './MapPinMessageBox.css';

export type MapPinMessageBoxProps = {
  nickname: string;
  avatarUrl?: string;
  introduction: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  onProfileClick?: () => void;
};

export function MapPinMessageBox({
  nickname,
  avatarUrl,
  introduction,
  isPlaying = false,
  onPlay,
  onProfileClick,
}: MapPinMessageBoxProps) {
  const profileContent = (
    <>
      <div className="gc-avatar flex items-center justify-center overflow-hidden bg-pli-black-75">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="size-full object-cover" />
        ) : (
          <UserPlaceholderIcon className="size-4 text-pli-black-50" aria-hidden />
        )}
      </div>
      <span className="gc-name">{nickname}</span>
    </>
  );

  return (
    <div className="glass-card cursor-default">
      <div className="gc-row">
        {onProfileClick ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onProfileClick();
            }}
            className="gc-user cursor-pointer border-0 bg-transparent p-0 text-left"
          >
            {profileContent}
          </button>
        ) : (
          <div className="gc-user">{profileContent}</div>
        )}

        <div className="gc-actions">
          <span className={cn('gc-wave', isPlaying && 'gc-wave--playing')} aria-hidden>
            <SoundWaveIcon className="size-6" />
          </span>
          <button
            type="button"
            aria-label={isPlaying ? '미리듣기 일시정지' : '미리듣기 재생'}
            aria-pressed={isPlaying}
            onClick={(event) => {
              event.stopPropagation();
              onPlay?.();
            }}
            className="gc-play cursor-pointer text-grayscale-1250"
          >
            {isPlaying ? (
              <StopIcon className="size-4.5 text-grayscale-1300" aria-hidden />
            ) : (
              <PlayIcon className="size-4.5 text-grayscale-1300" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <p className="gc-title">{introduction}</p>
    </div>
  );
}
