const FLY_TO_DURATION_MS = 450;

const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

/**
 * 지정한 좌표로 패닝하면서 동시에 줌을 부드럽게 애니메이션한다.
 * 반환된 함수를 호출하면 진행 중인 애니메이션을 취소할 수 있다 (연타 시 이전 애니메이션 정리용).
 */
export function flyToLocation(
  map: google.maps.Map,
  position: google.maps.LatLngLiteral,
  targetZoom: number,
): () => void {
  const startZoom = map.getZoom() ?? targetZoom;
  const startTime = performance.now();
  let frameId: number;

  map.panTo(position);

  const step = (now: number) => {
    const t = Math.min((now - startTime) / FLY_TO_DURATION_MS, 1);
    map.setZoom(startZoom + (targetZoom - startZoom) * easeOutQuad(t));

    if (t < 1) {
      frameId = requestAnimationFrame(step);
    }
  };

  frameId = requestAnimationFrame(step);

  return () => cancelAnimationFrame(frameId);
}
