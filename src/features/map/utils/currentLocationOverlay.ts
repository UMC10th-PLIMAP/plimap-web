// 핀(overlayMouseTarget)보다 항상 위에 보이도록, 가장 위에 있는 floatPane에 렌더링한다.

export type CurrentLocationOverlayHandle = google.maps.OverlayView & {
  setPosition: (position: google.maps.LatLngLiteral) => void;
  setHeading: (heading: number) => void;
};

export const createCurrentLocationOverlay = (
  color: string,
  initialPosition: google.maps.LatLngLiteral,
): CurrentLocationOverlayHandle => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.pointerEvents = 'none';
  container.innerHTML = `
    <svg width="48" height="48" viewBox="-24 -24 48 48">
      <circle class="current-location-pulse" cx="0" cy="0" r="9" fill="${color}" />
      <path class="heading-wedge" d="M -6,-16 L 0,-23 L 6,-16 Z" fill="${color}"
        stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round" transform="rotate(0)" />
      <circle cx="0" cy="0" r="12" fill="#ffffff" />
      <circle cx="0" cy="0" r="9" fill="${color}" />
    </svg>
  `;
  const headingWedge = container.querySelector('.heading-wedge') as SVGPathElement;

  let position = initialPosition;

  class CurrentLocationOverlay extends google.maps.OverlayView {
    onAdd() {
      this.getPanes()?.floatPane.appendChild(container);
    }

    draw() {
      const projection = this.getProjection();
      if (!projection) return;

      const point = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(position.lat, position.lng),
      );
      if (!point) return;

      container.style.left = `${point.x}px`;
      container.style.top = `${point.y}px`;
      container.style.transform = 'translate(-50%, -50%)';
    }

    onRemove() {
      container.remove();
    }

    setPosition(nextPosition: google.maps.LatLngLiteral) {
      position = nextPosition;
      this.draw();
    }

    setHeading(heading: number) {
      headingWedge.setAttribute('transform', `rotate(${heading})`);
    }
  }

  return new CurrentLocationOverlay();
};
