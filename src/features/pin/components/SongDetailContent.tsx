import { useState } from 'react';
import { Pencil } from 'lucide-react';
import rectangleBg from '@/assets/Rectangle.png';
import { Tag } from '@/components/ui/tag';
import { SongPreviewPlayer } from '@/features/pin/components/SongPreviewPlayer';
import { MOCK_WAVEFORM_PEAKS, TAG_OPTIONS } from '@/features/pin/constants/songPreview';
import { cn } from '@/lib/utils';
import type { Song } from '@/types/pin';

const INTRO_MAX_LENGTH = 100;
const MAX_TAG_COUNT = 4;

type SongDetailContentProps = {
  song: Song;
  onCancel: () => void;
  onRegister: () => void;
};

function FeedVisibilityToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 rounded-full transition-colors',
        checked ? 'bg-neon' : 'bg-pli-black-50',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-0.5 left-0.5 size-6 rounded-full bg-grayscale-0 transition-transform',
          checked && 'translate-x-5',
        )}
      />
    </button>
  );
}

export function SongDetailContent({ song, onCancel, onRegister }: SongDetailContentProps) {
  const [introduction, setIntroduction] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFeedPublic, setIsFeedPublic] = useState(true);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      }

      if (prev.length >= MAX_TAG_COUNT) {
        return prev;
      }

      return [...prev, tag];
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
      <section className="relative w-full shrink-0 overflow-hidden pb-4">
        <img
          src={rectangleBg}
          alt=""
          aria-hidden
          className="absolute inset-0 object-cover blur-sm opacity-12"
        />

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-pli-black-100/0 to-pli-black-100"
        />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex h-[64px] items-center justify-between px-4">
            <button type="button" onClick={onCancel} className="body-17-r text-grayscale-400">
              취소
            </button>
            <button type="button" onClick={onRegister} className="body-17-m text-grayscale-0">
              등록
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative">
              <img src={rectangleBg} alt="" className="size-16 rounded-md object-cover" />

              <button
                type="button"
                aria-label="앨범 이미지 수정"
                className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-pli-black-75 text-grayscale-300"
              >
                <Pencil className="size-3.5" aria-hidden />
              </button>
            </div>

            <div className="mt-3.5 text-center">
              <h2 className="body-17-m text-grayscale-0">{song.title}</h2>
              <p className="body-15-r text-grayscale-500">{song.artist}</p>
            </div>

            <SongPreviewPlayer
              previewUrl={song.previewUrl}
              duration={song.duration}
              waveformPeaks={song.waveformPeaks ?? MOCK_WAVEFORM_PEAKS}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 px-[15px]">
        <h3 className="body-15-r text-grayscale-300">소개</h3>
        <div className="relative rounded-xl bg-pli-black-85 p-5">
          <label htmlFor="song-intro" className="sr-only">
            소개
          </label>
          <textarea
            id="song-intro"
            value={introduction}
            onChange={(event) => setIntroduction(event.target.value.slice(0, INTRO_MAX_LENGTH))}
            placeholder="이 음악을 들었을 때 나의 기분은?"
            className="body-17-r min-h-[120px] w-full resize-none text-grayscale-300 outline-none placeholder:text-grayscale-1100"
          />
          <span className="absolute bottom-3 right-4 etc-13-r text-grayscale-600">
            {introduction.length}/{INTRO_MAX_LENGTH}
          </span>
        </div>
      </section>

      <section className="px-4 pt-9">
        <h3 className="body-15-r text-grayscale-300">
          태그 <span className="etc-13-r text-grayscale-700">(최대 4개)</span>
        </h3>
        <div className="flex flex-wrap justify-between gap-y-3 pt-3">
          {TAG_OPTIONS.map((tag) => {
            const isSelected = selectedTags.includes(tag);

            return (
              <Tag
                key={tag}
                variant={isSelected ? 'selected' : 'default'}
                onClick={() => toggleTag(tag)}
              >
                #{tag}
              </Tag>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3 px-4 pt-6">
        <span className="body-15-r text-grayscale-300">피드 공개</span>
        <FeedVisibilityToggle checked={isFeedPublic} onChange={setIsFeedPublic} />
      </section>
    </div>
  );
}
