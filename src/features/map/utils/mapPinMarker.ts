import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MapPinMarker, type MapPinMarkerProps } from '../components/MapPinMarker';
import type { MapPin } from '../types';

const markerRoots = new WeakMap<HTMLElement, Root>();

export type MapPinMarkerMount = {
  anchor: HTMLDivElement;
  mount: HTMLDivElement;
};

export const toMapPinMarkerProps = (pin: MapPin, isSelected = false): MapPinMarkerProps => ({
  coverUrl: pin.coverUrl,
  isSelected,
});

export const renderMapPinMarker = (mount: HTMLElement, props: MapPinMarkerProps) => {
  let root = markerRoots.get(mount);
  if (!root) {
    root = createRoot(mount);
    markerRoots.set(mount, root);
  }
  root.render(createElement(MapPinMarker, props));
};

export const unmountMapPinMarker = (mount: HTMLElement) => {
  const root = markerRoots.get(mount);
  root?.unmount();
  markerRoots.delete(mount);
};

export const createMapPinMarkerMount = (props: MapPinMarkerProps): MapPinMarkerMount => {
  const anchor = document.createElement('div');

  const mount = document.createElement('div');
  anchor.appendChild(mount);
  renderMapPinMarker(mount, props);

  return { anchor, mount };
};

export const updateMapPinMarker = (mount: HTMLElement, props: MapPinMarkerProps) => {
  renderMapPinMarker(mount, props);
};

type MapPinOverlayOptions = {
  position: google.maps.LatLngLiteral;
  zIndex?: number;
  onClick?: () => void;
} & MapPinMarkerProps;

export type MapPinOverlayHandle = google.maps.OverlayView & {
  setZIndex: (zIndex: number) => void;
};

export type MapPinOverlayEntry = {
  overlay: MapPinOverlayHandle;
  mount: HTMLDivElement;
};

export const createMapPinOverlay = ({
  position,
  zIndex = 100,
  onClick,
  ...markerProps
}: MapPinOverlayOptions): MapPinOverlayEntry => {
  const { anchor, mount } = createMapPinMarkerMount(markerProps);

  class MapPinOverlay extends google.maps.OverlayView {
    private container: HTMLDivElement | null = null;
    private currentZIndex = zIndex;

    onAdd() {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.zIndex = String(this.currentZIndex);

      if (onClick) {
        anchor.addEventListener('click', onClick);
      }
      container.appendChild(anchor);

      this.container = container;
      this.getPanes()?.overlayMouseTarget.appendChild(container);
    }

    draw() {
      const projection = this.getProjection();
      if (!projection || !this.container) return;

      const point = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(position.lat, position.lng),
      );
      if (!point) return;

      this.container.style.left = `${point.x}px`;
      this.container.style.top = `${point.y}px`;
      this.container.style.transform = 'translate(-50%, -73%)';
    }

    onRemove() {
      this.container?.remove();
      this.container = null;
    }

    setZIndex(nextZIndex: number) {
      this.currentZIndex = nextZIndex;
      if (this.container) {
        this.container.style.zIndex = String(nextZIndex);
      }
    }
  }

  return { overlay: new MapPinOverlay(), mount };
};

export const disposeMapPinOverlay = ({ overlay, mount }: MapPinOverlayEntry) => {
  overlay.setMap(null);
  unmountMapPinMarker(mount);
};
