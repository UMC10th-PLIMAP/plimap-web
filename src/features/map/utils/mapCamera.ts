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
    }
  };

  frameId = requestAnimationFrame(step);

  return () => cancelAnimationFrame(frameId);
}
