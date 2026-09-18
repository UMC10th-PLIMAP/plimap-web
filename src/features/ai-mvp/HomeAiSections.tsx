import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { WEEKLY_REPORT, recommendTodaySong, type TodayMood } from '@/features/ai-mvp/mockAi';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

const MOODS: TodayMood[] = ['신남', '차분', '지침', '설렘'];

function createWeeklyReportImage() {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext('2d');
  if (!context) return Promise.reject(new Error('공유 이미지를 만들 수 없어요.'));

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#0c0d0f');
  gradient.addColorStop(0.55, '#242429');
  gradient.addColorStop(1, '#3e541b');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#c8f940';
  context.font = '600 42px Pretendard, sans-serif';
  context.fillText('PLIMAP · AI WEEKLY', 90, 150);

  context.fillStyle = '#efefef';
  context.font = '600 76px Pretendard, sans-serif';
  context.fillText(WEEKLY_REPORT.weekLabel, 90, 290);

  context.fillStyle = '#999999';
  context.font = '400 38px Pretendard, sans-serif';
  context.fillText('기분', 90, 490);
  context.fillText('많이 들은 장르', 90, 750);
  context.fillText('대표 곡', 90, 1010);

  context.fillStyle = '#fdfdfd';
  context.font = '600 64px Pretendard, sans-serif';
  context.fillText(WEEKLY_REPORT.mood, 90, 580);
  context.fillText(WEEKLY_REPORT.genre, 90, 840);
  context.fillText(WEEKLY_REPORT.track, 90, 1100);

  context.fillStyle = '#c8f940';
  context.fillRect(90, 1280, 900, 4);
  context.fillStyle = '#dddddd';
  context.font = '400 42px Pretendard, sans-serif';
  context.fillText('힘이 필요한 순간마다', 90, 1410);
  context.fillText('리듬이 분명한 음악을 골랐어요.', 90, 1470);

  context.fillStyle = '#777777';
  context.font = '400 34px Pretendard, sans-serif';
  context.fillText('나의 장소와 음악을 기록하는 PLIMAP', 90, 1770);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('공유 이미지를 만들 수 없어요.'))),
      'image/png',
    );
  });
}

export function HomeAiSections() {
  const toast = useToast();
  const [mood, setMood] = useState<TodayMood>('신남');
  const [prompt, setPrompt] = useState('');
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendation, setRecommendation] = useState<
    Awaited<ReturnType<typeof recommendTodaySong>> | undefined
  >();
  const [isSharing, setIsSharing] = useState(false);

  const handleRecommend = async () => {
    if (isRecommending) return;
    setIsRecommending(true);
    try {
      setRecommendation(await recommendTodaySong(mood, prompt));
    } finally {
      setIsRecommending(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const blob = await createWeeklyReportImage();
      const file = new File([blob], 'plimap-weekly-report.png', { type: 'image/png' });
      const shareData = { files: [file], title: WEEKLY_REPORT.weekLabel };

      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('공유 이미지를 저장했어요.', { placement: 'above-navigation' });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast.error('리포트를 공유하지 못했어요.', { placement: 'above-navigation' });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="mt-12 flex flex-col gap-10 px-4">
      <section aria-labelledby="today-ai-title">
        <p className="etc-13-sb text-neon-2">AI MUSIC</p>
        <h2 id="today-ai-title" className="mt-1 text-[22px] font-medium leading-[1.4] text-white">
          오늘 나에게 어울리는 노래
        </h2>
        <p className="mt-1 body-15-r text-grayscale-500">맑음 · 22°C</p>

        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          aria-label="오늘 기분 선택"
        >
          {MOODS.map((item) => (
            <Chip
              key={item}
              variant={mood === item ? 'selected' : 'default'}
              onClick={() => setMood(item)}
            >
              {item}
            </Chip>
          ))}
        </div>

        <div className="mt-3 rounded-2xl bg-pli-black-85 p-4">
          <label htmlFor="today-ai-prompt" className="body-15-m text-grayscale-300">
            지금 상황을 더 알려주세요 <span className="text-grayscale-600">(선택)</span>
          </label>
          <textarea
            id="today-ai-prompt"
            value={prompt}
            maxLength={80}
            rows={2}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="예: 퇴근길에 힘이 나는 노래"
            className="mt-2 w-full resize-none rounded-xl bg-pli-black-75 p-3 body-15-r text-grayscale-100 outline-none placeholder:text-grayscale-600 focus:ring-1 focus:ring-neon"
          />
          <Button
            variant="confirm"
            size="bt"
            className="mt-3 w-full bg-neon"
            aria-busy={isRecommending || undefined}
            onClick={() => void handleRecommend()}
          >
            {isRecommending ? '취향을 분석하고 있어요' : 'AI 노래 추천받기'}
          </Button>
        </div>

        {recommendation ? (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-neon/25 bg-neon/10 p-4">
            {recommendation.track.artworkUrl ? (
              <img
                src={recommendation.track.artworkUrl}
                alt=""
                className="size-14 rounded-lg object-cover"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="truncate body-17-m text-grayscale-100">
                {recommendation.track.trackName}
              </p>
              <p className="truncate body-15-r text-grayscale-500">
                {recommendation.track.artistName}
              </p>
              <p className="mt-1 body-15-r text-grayscale-300">{recommendation.message}</p>
            </div>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="weekly-report-title" className="pb-2">
        <div className="rounded-3xl bg-gradient-to-br from-pli-black-75 to-[#344716] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="etc-13-sb text-neon-2">AI WEEKLY</p>
              <h2 id="weekly-report-title" className="mt-1 head-20-sb text-grayscale-100">
                {WEEKLY_REPORT.weekLabel}
              </h2>
            </div>
            <span aria-hidden className="text-3xl">
              📊
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3">
            {[
              ['이번 주 기분', WEEKLY_REPORT.mood],
              ['많이 들은 장르', WEEKLY_REPORT.genre],
              ['대표 곡', WEEKLY_REPORT.track],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={cn('rounded-xl bg-black/25 p-3', index === 2 && 'col-span-2')}
              >
                <dt className="etc-13-r text-grayscale-500">{label}</dt>
                <dd className="mt-1 body-15-m text-grayscale-100">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 body-15-r text-grayscale-300">{WEEKLY_REPORT.comment}</p>
          <Button
            variant="confirm"
            size="bt"
            className="mt-5 w-full"
            aria-busy={isSharing || undefined}
            onClick={() => void handleShare()}
          >
            {isSharing ? '공유 카드 만드는 중' : '인스타에 공유하기'}
          </Button>
        </div>
      </section>
    </div>
  );
}
