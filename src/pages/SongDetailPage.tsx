import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PlayIcon from '@/assets/icons/play.svg?react';
import PencilIcon from '@/assets/icons/pencil.svg?react';
import rectangleBg from '@/assets/Rectangle.png';
import { Tag } from '@/components/ui/tag';
import { SongSelectSheet } from '@/features/pin/components/SongSelectSheet';
import {
  DEFAULT_TRIM_END_INDEX,
  DEFAULT_TRIM_START_INDEX,
  MOCK_PREVIEW_DURATION,
  MOCK_SONG_CARD_LIST,
  MOCK_WAVEFORM_PEAKS,
  peaksToTrimRange,
  TAG_OPTIONS,
  timeToPercent,
} from '@/features/pin/data/songPreview';
import { cn } from '@/lib/utils';

const INTRO_MAX_LENGTH = 100;
const MAX_TAG_COUNT = 4;

type TrimBarProps = {
  trimStartPercent: number;
  trimEndPercent: number;
};

function TrimBar({ trimStartPercent, trimEndPercent }: TrimBarProps) {
  return (
    <div className="relative h-1.5 w-[244px] rounded-full bg-pli-black-50">
      <div
        className="absolute inset-y-0 rounded-full bg-neon"
        style={{
          left: `${trimStartPercent}%`,
          right: `${100 - trimEndPercent}%`,
        }}
      />

      <span
        aria-hidden
        className="absolute top-1/2 z-10 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-grayscale-0"
        style={{ left: `${trimStartPercent}%` }}
      />
      <span
        aria-hidden
        className="absolute top-1/2 z-10 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-grayscale-0"
        style={{ left: `${trimEndPercent}%` }}
      />
    </div>
  );
}

type SongWaveformProps = {
  peaks: readonly number[];
  trimStartIndex: number;
  trimEndIndex: number;
};

function SongWaveform({ peaks, trimStartIndex, trimEndIndex }: SongWaveformProps) {
  return (
    <div className="flex h-[72px] items-center gap-1.5 px-1.5" aria-hidden>
      {peaks.map((height, index) => {
        const isSelected = index >= trimStartIndex && index <= trimEndIndex;

        return (
          <span
            key={index}
            className={cn(
              'w-[3px] rounded-full',
              isSelected ? 'bg-gradient-neon' : 'bg-pli-black-50',
            )}
            style={{ height: `${height * 70}%` }}
          />
        );
      })}
    </div>
  );
}

type SongPreviewSectionProps = {
  waveformPeaks: readonly number[];
};

function SongPreviewSection({ waveformPeaks }: SongPreviewSectionProps) {
  const trim = peaksToTrimRange(
    DEFAULT_TRIM_START_INDEX,
    DEFAULT_TRIM_END_INDEX,
    waveformPeaks,
    MOCK_PREVIEW_DURATION,
  );

  const trimStartPercent = timeToPercent(trim.start, MOCK_PREVIEW_DURATION);
  const trimEndPercent = timeToPercent(trim.end, MOCK_PREVIEW_DURATION);

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto flex h-11 w-[297px] items-center gap-[25px]">
        <TrimBar trimStartPercent={trimStartPercent} trimEndPercent={trimEndPercent} />

        <button
          type="button"
          aria-label="재생"
          className="flex size-7 items-center justify-center rounded-full bg-grayscale-100"
        >
          <PlayIcon className="size-4.5 text-grayscale-1200" aria-hidden />
        </button>
      </div>

      <SongWaveform
        peaks={waveformPeaks}
        trimStartIndex={DEFAULT_TRIM_START_INDEX}
        trimEndIndex={DEFAULT_TRIM_END_INDEX}
      />
    </div>
  );
}

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

export default function SongDetailPage() {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();

  const song = MOCK_SONG_CARD_LIST.find((item) => item.id === songId) ?? MOCK_SONG_CARD_LIST[0];

  const [introduction, setIntroduction] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFeedPublic, setIsFeedPublic] = useState(true);
  const [isSongSelectOpen, setIsSongSelectOpen] = useState(false);

  const coverUrl = song.artistImage || rectangleBg;
  const waveformPeaks = MOCK_WAVEFORM_PEAKS;

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
      <section className="relative w-full overflow-hidden pb-4">
        <img
          src={coverUrl}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 object-cover opacity-12 blur-[4px]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-pli-black-100/0 to-pli-black-100"
        />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex h-[64px] items-center justify-between px-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="body-17-r text-grayscale-400 cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => {}}
              className="body-17-m text-grayscale-0 cursor-pointer"
            >
              등록
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative">
              <img src={coverUrl} alt="" className="size-16 rounded-md object-cover" />

              <button
                type="button"
                aria-label="노래 변경"
                onClick={() => setIsSongSelectOpen(true)}
                className="absolute -bottom-3 -right-4 flex cursor-pointer items-center justify-center rounded-[50px] border-4 border-transparent bg-origin-border [background-clip:padding-box,border-box] [background-image:linear-gradient(#777777,#777777),linear-gradient(135deg,#1C1D21_0%,#1C1D21_100%)]"
              >
                <div className="size-6">
                  <PencilIcon aria-hidden />
                </div>
              </button>
            </div>

            <div className="mt-3.5 text-center">
              <h2 className="body-17-m text-grayscale-0">{song.title}</h2>
              <p className="body-15-r text-grayscale-500">{song.artist}</p>
            </div>

            <SongPreviewSection waveformPeaks={waveformPeaks} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 px-[15px]">
        <h3 className="body-15-r text-grayscale-300">소개</h3>
        <div className="relative rounded-xl bg-pli-black-85 p-5 h-[156px]">
          <label htmlFor="song-intro" className="sr-only">
            소개
          </label>
          <textarea
            id="song-intro"
            value={introduction}
            onChange={(event) => setIntroduction(event.target.value.slice(0, INTRO_MAX_LENGTH))}
            placeholder="이 음악을 들었을 때 나의 기분은?"
            className="body-17-r min-h-[156px] w-full resize-none text-grayscale-300 outline-none placeholder:text-grayscale-1100"
          />
          <span className="absolute bottom-3 right-4 etc-13-r text-grayscale-600">
            {introduction.length}/{INTRO_MAX_LENGTH}
          </span>
        </div>
      </section>

      <section className="px-4 pt-6">
        <h3 className="body-15-r text-grayscale-300">
          태그 <span className="etc-13-r text-grayscale-700">(최대 4개)</span>
        </h3>
        <div className="grid grid-cols-5 justify-items-center gap-x-2 gap-y-3 pt-3">
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

      <SongSelectSheet
        open={isSongSelectOpen}
        onClose={() => setIsSongSelectOpen(false)}
        onSelect={(selected) => {
          navigate(`/app/song/detail/${selected.itunesTrackId}`, { replace: true });
        }}
      />
    </div>
  );
}
