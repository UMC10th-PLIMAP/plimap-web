import SoundWaveIcon from '@/assets/icons/soundwaves.svg?react';
import PlayIcon from '@/assets/icons/play.svg?react';
import './MapPinMessageBox.css';

export type MapPinMessageBoxProps = {
  nickname: string;
  avatarUrl?: string;
  introduction: string;
  isPlaying?: boolean;
  onPlay?: () => void;
};

export function MapPinMessageBox({
  nickname,
  avatarUrl,
  introduction,
  isPlaying = false,
  onPlay,
}: MapPinMessageBoxProps) {
  return (
    <div className="glass-card">
      <div className="gc-row">
        <div className="gc-user">
          <div className="gc-avatar overflow-hidden bg-grayscale-0">
            {avatarUrl ? <img src={avatarUrl} alt="" className="size-full object-cover" /> : null}
          </div>
          <span className="gc-name">{nickname}</span>
        </div>

        <div className="gc-actions">
          <SoundWaveIcon className="size-6 text-grayscale-400" aria-hidden />
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
              <span className="flex items-center gap-[3px]" aria-hidden>
                <span className="h-[14px] w-[3px] rounded-full bg-grayscale-1250" />
                <span className="h-[14px] w-[3px] rounded-full bg-grayscale-1250" />
              </span>
            ) : (
              <PlayIcon className="size-[18px]" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <p className="gc-title">{introduction}</p>
    </div>
  );
}
