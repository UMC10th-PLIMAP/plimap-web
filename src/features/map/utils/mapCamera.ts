export const FLY_TO_DURATION_MS = 450;

const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

const WORLD_DIM_PX = 256;
// bounds 가장자리가 화면에 딱 붙지 않도록 여백을 두는 비율 (85%만 쓴다고 가정하고 계산하면
// 그만큼 한 단계 덜 확대되어 여유가 생긴다).
const BOUNDS_FIT_PADDING_RATIO = 0.85;

const latToMercatorRadians = (lat: number) => {
  const sin = Math.sin((lat * Math.PI) / 180);
  const radians = Math.log((1 + sin) / (1 - sin)) / 2;
  return Math.max(Math.min(radians, Math.PI), -Math.PI) / 2;
};

const zoomForFraction = (pixelDimension: number, fraction: number) =>
  Math.log(pixelDimension / WORLD_DIM_PX / fraction) / Math.LN2;

/**
 * 주어진 위경도 bounds가 mapPixelSize 안에 다 들어오는 정수 줌 레벨을 계산한다.
 * `map.fitBounds()`는 이 프로젝트의 restriction(대한민국 경계 제한) 설정과 함께 쓰면
 * center를 restriction 중심으로 되돌려버리는 버그가 있어(zoom만 바뀌고 center가
 * 안 움직임), 대신 이 값으로 직접 flyToLocation을 호출한다.
 */
export function getBoundsZoomLevel(
  bounds: google.maps.LatLngBoundsLiteral,
  mapPixelSize: { width: number; height: number },
  maxZoom: number,
): number {
  const latFraction =
    (latToMercatorRadians(bounds.north) - latToMercatorRadians(bounds.south)) / Math.PI;

  const lngDiff = bounds.east - bounds.west;
  const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

  const latZoom = zoomForFraction(mapPixelSize.height * BOUNDS_FIT_PADDING_RATIO, latFraction);
  const lngZoom = zoomForFraction(mapPixelSize.width * BOUNDS_FIT_PADDING_RATIO, lngFraction);

  // 한 축의 fraction이 0이면(위도 또는 경도가 같은 두 지점) 그 축의 zoom은
  // Infinity가 되는데, 이때도 유한한 다른 축의 값을 그대로 써야 한다 - 두 축
  // 모두 무한할 때만(완전히 같은 점) maxZoom으로 대체한다.
  const finiteZooms = [latZoom, lngZoom].filter(Number.isFinite);
  if (finiteZooms.length === 0) return maxZoom;

  return Math.max(1, Math.min(Math.floor(Math.min(...finiteZooms)), maxZoom));
}

/**
 * 지정한 좌표로 패닝하면서 동시에 줌을 부드럽게 애니메이션한다.
 * 반환된 함수를 호출하면 진행 중인 애니메이션을 취소할 수 있다 (연타 시 이전 애니메이션 정리용).
 */
export function flyToLocation(
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  targetZoom: number,
  onArrive?: () => void,
): () => void {
  const startZoom = map.getZoom() ?? targetZoom;
  const startCenter = map.getCenter();
  const startLat = startCenter?.lat() ?? position.lat;
  const startLng = startCenter?.lng() ?? position.lng;
  const startTime = performance.now();
  let frameId: number;

  const step = (now: number) => {
    const t = Math.min((now - startTime) / FLY_TO_DURATION_MS, 1);
    const eased = easeOutQuad(t);

    // panTo의 자체 애니메이션(타이밍이 다름)에 맡기지 않고, 줌과 같은 루프에서
    // center도 같이 보간해서 두 움직임이 어긋나지 않게 한다.
    map.setCenter({
      lat: startLat + (position.lat - startLat) * eased,
      lng: startLng + (position.lng - startLng) * eased,
    });
    map.setZoom(startZoom + (targetZoom - startZoom) * eased);

    if (t < 1) {
      frameId = requestAnimationFrame(step);
    } else {
      onArrive?.();
    }
  };

  frameId = requestAnimationFrame(step);

  return () => cancelAnimationFrame(frameId);
}
