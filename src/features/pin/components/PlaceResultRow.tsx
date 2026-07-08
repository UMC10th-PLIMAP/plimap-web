import type { ComponentProps } from 'react';

import type { PlaceResult } from '@/types/place';

type PlaceResultRowProps = ComponentProps<'button'> & {
  place: PlaceResult;
};

export function PlaceResultRow({ place, ...props }: PlaceResultRowProps) {
  const { creatorName, category, placeName, distance } = place;

  return (
    <button
      type="button"
      className="flex w-full max-w-[402px] flex-col items-start gap-[6px] px-6 py-2"
      {...props}
    >
      <div className="flex items-center gap-[6px]">
        <span className="body-17-r text-grayscale-30">{placeName}</span>
        <span className="etc-13-r text-grayscale-400">{category}</span>
      </div>

      <div className="flex items-center gap-[6px]">
        <span className="body-15-r text-grayscale-30">
          {creatorName}{' '}
          <span className="body-15-m text-grayscale-400">님이 생성한 PIN ∙ {distance}m</span>
        </span>
      </div>
    </button>
  );
}
