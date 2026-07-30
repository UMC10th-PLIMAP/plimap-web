import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { MyAllPinsCard } from '@/features/profile/components/MyAllPinsCard';
import { MyPlimapTabs } from '@/features/profile/components/MyPlimapTabs';
import { PinCard } from '@/features/pin/components/PinCard';
import type { MyAllPin, MyPlimapTab } from '@/features/profile/types';
import type { Pin } from '@/features/pin/types';

const MOCK_PIN: Pin = {
  id: '1',
  title: '밤편지',
  artist: '아이유',
  likeCount: 1,
  liked: false,
};

const MOCK_MY_ALL_PINS: MyAllPin[] = [
  {
    id: '1',
    placeName: '서울특별시 강남구 영동대로 513',
    albumImageUrl: 'https://picsum.photos/seed/plimap-pin-1/200',
    trackName: '밤편지',
    artistName: '아이유',
    content: '지우고 널 지우려 해봐도\n가슴 한켠에 남아서\n자꾸 니가 떠올라\n또 하루를 넘겨',
    tags: ['감성'],
    createdAtLabel: '방금',
  },
  {
    id: '2',
    placeName: '뚝섬 한강공원',
    albumImageUrl: 'https://picsum.photos/seed/plimap-pin-2/200',
    trackName: '밤편지',
    artistName: '아이유',
    content: '지우고 널 지우려 해봐도\n가슴 한켠에 남아서\n자꾸 니가 떠올라\n또 하루를 넘겨',
    tags: ['감성'],
    createdAtLabel: '방금',
  },
];

export default function MyPlimapPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<MyPlimapTab>('all');

  return (
    <div className="flex min-h-full flex-col ">
      <TopBar onBack={() => navigate(-1)} title="내 PLIMAP" titleWeight="medium" />

      <div className="px-4 pt-3 ">
        <MyPlimapTabs value={tab} onChange={setTab} />

        <div className="flex flex-col gap-3 pt-5">
          {tab === 'all' ? (
            MOCK_MY_ALL_PINS.map((pin) => (
              <MyAllPinsCard
                key={pin.id}
                pin={pin}
                onPlaceClick={() => {
                  // TODO: 장소 상세/맵 이동 연결
                }}
                onMoreClick={() => {
                  // TODO: 더보기 메뉴 연결
                }}
              />
            ))
          ) : (
            <PinCard pin={MOCK_PIN} />
          )}
        </div>
      </div>
    </div>
  );
}
