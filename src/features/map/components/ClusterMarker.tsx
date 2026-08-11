const CLUSTER_COUNT_DISPLAY_MAX = 99;
const CLUSTER_BOOKMARKED_COLOR = '#F7FE90';

export type ClusterMarkerProps = {
  placeCount: number;
  /** 북마크 강조 모드가 켜져 있고 이 클러스터에 북마크된 장소가 포함되어 있을 때 색을 바꾼다. */
  isBookmarked?: boolean;
};

export function ClusterMarker({ placeCount, isBookmarked = false }: ClusterMarkerProps) {
  const isOverflow = placeCount > CLUSTER_COUNT_DISPLAY_MAX;

  return (
    <div
      className="flex items-center justify-center rounded-full shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
      style={{
        width: isOverflow ? 66 : 38,
        height: isOverflow ? 66 : 38,
        backgroundColor: isBookmarked ? CLUSTER_BOOKMARKED_COLOR : '#FFFFFF',
      }}
    >
      <span className="head-24-sb text-black">
        {isOverflow ? `${CLUSTER_COUNT_DISPLAY_MAX}+` : placeCount}
      </span>
    </div>
  );
}
