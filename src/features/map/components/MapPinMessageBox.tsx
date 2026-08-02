import SoundWaveIcon from '@/assets/icons/soundwaves.svg?react';
import PlayIcon from '@/assets/icons/play.svg?react';

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
    <div className="flex w-[236px] flex-col items-center gap-3.5 rounded-2xl bg-black/10 px-5 pt-4 pb-[18px] backdrop-blur-[10px] [box-shadow:0px_4px_8.4px_0px_rgba(0,0,0,0.25)]">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-6 shrink-0 overflow-hidden rounded-full bg-grayscale-0">
            {avatarUrl ? <img src={avatarUrl} alt="" className="size-full object-cover" /> : null}
          </div>
          <span className="etc-13-sb text-grayscale-500">{nickname}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <SoundWaveIcon className="size-6 text-grayscale-400" aria-hidden />
          <button
            type="button"
            aria-label="미리듣기 재생"
            onClick={(event) => {
              event.stopPropagation();
              onPlay?.();
            }}
            className="flex size-[30px] items-center justify-center rounded-full bg-neon text-grayscale-1250"
          >
            <PlayIcon className="size-[18px]" aria-hidden />
          </button>
        </div>
      </div>

      <p className="w-full truncate body-15-m text-grayscale-100 [text-shadow:0px_0px_4px_rgba(0,0,0,0.5)]">
        {introduction}
      </p>
    </div>
  );
}
