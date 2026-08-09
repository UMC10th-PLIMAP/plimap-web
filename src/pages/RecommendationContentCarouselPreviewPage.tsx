import { useState } from 'react';

import RecommendationCardImage from '@/assets/recommendation-content-card.png';
import { RecommendationContentCarousel } from '@/features/home/components/RecommendationContentCarousel';

const RECOMMENDED_PLACES = [
  { id: 'tuksom', name: '뚝섬한강공원', description: '50m · 30개의 핀' },
  { id: 'mulbit', name: '물빛무대 앞 광장', description: '120m · 30개의 핀' },
  { id: 'bookstore', name: '한강서점', description: '230m · 12개의 핀' },
  { id: 'sevit', name: '세빛섬', description: '350m · 8개의 핀' },
] as const;

export default function RecommendationContentCarouselPreviewPage() {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <main className="min-h-dvh bg-pli-black-100 py-10 text-grayscale-100">
      <div className="w-full px-4">
        <RecommendationContentCarousel
          title="내 주변 HOT한 장소🔥"
          ariaLabel="내 주변 HOT한 장소"
          items={RECOMMENDED_PLACES}
          getItemKey={(place) => place.id}
          showPagination
          itemsPerPage={2}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageClassName="grid grid-cols-2"
          itemClassName="aspect-square self-start"
          renderItem={(place) => (
            <button
              type="button"
              className="relative block size-full overflow-hidden rounded-xl border border-pli-black-50 text-left"
            >
              <img src={RecommendationCardImage} alt="" className="size-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-b from-transparent to-pli-black-100" />
              <span className="absolute inset-x-3 bottom-3 flex min-w-0 flex-col gap-1">
                <span className="truncate body-17-m text-grayscale-100">{place.name}</span>
                <span className="truncate body-15-r text-grayscale-500">{place.description}</span>
              </span>
            </button>
          )}
        />
      </div>
    </main>
  );
}
