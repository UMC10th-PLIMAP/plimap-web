import { useState } from 'react';

import {
  RecommendationPinCard,
  type RecommendationPin,
} from '@/features/home/components/RecommendationPinCard';

const recommendationPins: RecommendationPin[] = [
  {
    id: 'tukseom-hangang',
    place: { name: '뚝섬한강공원' },
    song: { title: 'Dancing In The Moonlight', artist: 'Toploader' },
    creator: { name: '냥코', avatarUrl: 'https://picsum.photos/seed/nyangko-avatar/76' },
    imageUrl: 'https://picsum.photos/seed/tukseom-hangang/248',
  },
  {
    id: 'mulbit-stage',
    place: { name: '물빛무대 앞 광장' },
    song: { title: '밤편지', artist: '아이유' },
    creator: { name: '정', avatarUrl: 'https://picsum.photos/seed/jung-avatar/76' },
    imageUrl: 'https://picsum.photos/seed/mulbit-stage/248',
  },
  {
    id: 'tukseom-station',
    place: { name: '뚝섬역 2호선' },
    song: { title: 'Seoul', artist: '소란' },
    creator: { name: 'COR', avatarUrl: 'https://picsum.photos/seed/cor-avatar/76' },
    imageUrl: 'https://picsum.photos/seed/tukseom-station/248',
  },
];

export default function RecommendationPinCardPreviewPage() {
  const [selectedPin, setSelectedPin] = useState<RecommendationPin | null>(null);

  return (
    <main className="min-h-dvh bg-pli-black-100 px-4 py-8 text-grayscale-100">
      <section className="mx-auto flex w-full max-w-[402px] flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="etc-13-r text-neon">COMPONENT PREVIEW</p>
          <h1 className="head-24-sb">추천 PIN 카드</h1>
          <p className="body-15-r text-grayscale-500">
            카드를 눌러 전달되는 장소, 음악, 작성자 데이터를 확인할 수 있어요.
          </p>
        </header>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {recommendationPins.map((pin) => (
            <RecommendationPinCard key={pin.id} pin={pin} onClick={() => setSelectedPin(pin)} />
          ))}
        </div>

        <section className="rounded-xl bg-pli-black-85 p-4" aria-live="polite">
          <h2 className="body-17-m">선택한 PIN</h2>
          {selectedPin ? (
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 body-15-r">
              <dt className="text-grayscale-500">장소</dt>
              <dd>{selectedPin.place.name}</dd>
              <dt className="text-grayscale-500">음악</dt>
              <dd>{`${selectedPin.song.title} · ${selectedPin.song.artist}`}</dd>
              <dt className="text-grayscale-500">작성자</dt>
              <dd>{selectedPin.creator.name}</dd>
            </dl>
          ) : (
            <p className="mt-3 body-15-r text-grayscale-500">카드를 선택해 주세요.</p>
          )}
        </section>
      </section>
    </main>
  );
}
