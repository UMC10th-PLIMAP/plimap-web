// 핀(overlayMouseTarget)보다 항상 위에 보이도록, 가장 위에 있는 floatPane에 렌더링한다.

export type CurrentLocationOverlayHandle = google.maps.OverlayView & {
  setPosition: (position: google.maps.LatLngLiteral) => void;
  setHeading: (heading: number) => void;
};

export const createCurrentLocationOverlay = (
  color: string,
  initialPosition: google.maps.LatLngLiteral,
  characterUrl?: string,
  characterFrontUrl?: string,
): CurrentLocationOverlayHandle => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.pointerEvents = 'none';
  container.innerHTML = `
    ${
      characterUrl
        ? `<span class="current-location-character-heading" data-facing="back">
            <img class="current-location-character current-location-character-back" src="${characterUrl}" alt="" />
            ${
              characterFrontUrl
                ? `<img class="current-location-character current-location-character-front" src="${characterFrontUrl}" alt="" />`
                : ''
            }
          </span>`
        : ''
    }
    <svg class="current-location-default-marker" width="48" height="48" viewBox="-24 -24 48 48"
      style="${characterUrl ? 'display:none' : ''}">
      <circle class="current-location-pulse" cx="0" cy="0" r="9" fill="${color}" />
      <path class="heading-wedge" d="M -6,-16 L 0,-23 L 6,-16 Z" fill="${color}"
        stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round" transform="rotate(0)" />
      <circle cx="0" cy="0" r="12" fill="#ffffff" />
      <circle cx="0" cy="0" r="9" fill="${color}" />
    </svg>
  `;
  const defaultMarker = container.querySelector(
    '.current-location-default-marker',
  ) as SVGElement | null;
  const headingWedge = container.querySelector('.heading-wedge') as SVGPathElement | null;
  const characterHeading = container.querySelector(
    '.current-location-character-heading',
  ) as HTMLSpanElement | null;
  const characterImages = container.querySelectorAll<HTMLImageElement>(
    '.current-location-character',
  );
  characterImages.forEach((image) => {
    image.addEventListener('error', () => {
      image.remove();
      if (!characterHeading?.querySelector('.current-location-character')) {
        characterHeading?.remove();
        if (defaultMarker) defaultMarker.style.display = '';
      }
    });
  });

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
      const normalizedHeading = ((heading % 360) + 360) % 360;
      headingWedge?.setAttribute('transform', `rotate(${normalizedHeading})`);
      if (!characterHeading) return;
      const desiredFacing = normalizedHeading <= 90 || normalizedHeading >= 270 ? 'back' : 'front';
      const hasDesiredImage = characterHeading.querySelector(
        `.current-location-character-${desiredFacing}`,
      );
      characterHeading.dataset.facing = hasDesiredImage
        ? desiredFacing
        : desiredFacing === 'back'
          ? 'front'
          : 'back';
      characterHeading.style.setProperty(
        '--current-location-character-scale-x',
        normalizedHeading > 180 ? '-1' : '1',
      );
    }
  }

  return new CurrentLocationOverlay();
};
