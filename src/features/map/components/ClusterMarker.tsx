const CLUSTER_COUNT_DISPLAY_MAX = 99;

export type ClusterMarkerProps = {
  placeCount: number;
};

export function ClusterMarker({ placeCount }: ClusterMarkerProps) {
  const isOverflow = placeCount > CLUSTER_COUNT_DISPLAY_MAX;

  return (
    <div
      className="flex items-center justify-center rounded-full bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
      style={{ width: isOverflow ? 66 : 38, height: isOverflow ? 66 : 38 }}
    >
      <span className="head-24-sb text-black">
        {isOverflow ? `${CLUSTER_COUNT_DISPLAY_MAX}+` : placeCount}
      </span>
    </div>
  );
}
