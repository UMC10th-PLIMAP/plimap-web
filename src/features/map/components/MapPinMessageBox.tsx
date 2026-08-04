import SoundWaveIcon from '@/assets/icons/soundwaves.svg?react';
import PlayIcon from '@/assets/icons/play.svg?react';
import './MapPinMessageBox.css';

export type MapPinMessageBoxProps = {
  nickname: string;
  avatarUrl?: string;
  introduction: string;
  onPlay?: () => void;
};

export function MapPinMessageBox({
  nickname,
  avatarUrl,
  introduction,
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
            aria-label="미리듣기 재생"
            onClick={(event) => {
              event.stopPropagation();
              onPlay?.();
            }}
            className="gc-play cursor-pointer text-grayscale-1250"
          >
            <PlayIcon className="size-[18px]" aria-hidden />
          </button>
        </div>
      </div>

      <p className="gc-title">{introduction}</p>
    </div>
  );
}
