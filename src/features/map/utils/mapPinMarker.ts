import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MapPinMarker, type MapPinMarkerProps } from '../components/MapPinMarker';
import type { MapPin } from '../types';

const markerRoots = new WeakMap<HTMLElement, Root>();

export type MapPinMarkerMount = {
  anchor: HTMLDivElement;
  mount: HTMLDivElement;
};

export const toMapPinMarkerProps = (
  pin: MapPin,
  isSelected = false,
  onPlay?: () => void,
  isPlaying = false,
  showMessageBubble = false,
  isBookmarked = false,
  onProfileClick?: () => void,
  isDimmed = false,
): MapPinMarkerProps => ({
  coverUrl: pin.coverUrl,
  isSelected,
  isPlaying,
  nickname: pin.nickname,
  avatarUrl: pin.avatarUrl,
  introduction: pin.introduction,
  onPlay,
  onProfileClick,
  showMessageBubble,
  isBookmarked,
  isDimmed,
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
  setPosition: (position: google.maps.LatLngLiteral) => void;
  setZIndex: (zIndex: number) => void;
  setOnClick: (onClick: (() => void) | undefined) => void;
};

export type MapPinOverlayEntry = {
  overlay: MapPinOverlayHandle;
  mount: HTMLDivElement;
};

export const createMapPinOverlay = ({
  position: initialPosition,
  zIndex = 100,
  onClick: initialOnClick,
  ...markerProps
}: MapPinOverlayOptions): MapPinOverlayEntry => {
  const { anchor, mount } = createMapPinMarkerMount(markerProps);
  let currentPosition = initialPosition;
  let onClick = initialOnClick;

  class MapPinOverlay extends google.maps.OverlayView {
    private container: HTMLDivElement | null = null;
    private currentZIndex = zIndex;
    private handleClick = () => onClick?.();

    onAdd() {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.zIndex = String(this.currentZIndex);

      anchor.addEventListener('click', this.handleClick);
      container.appendChild(anchor);

      this.container = container;
      this.getPanes()?.overlayMouseTarget.appendChild(container);
    }

    draw() {
      const projection = this.getProjection();
      if (!projection || !this.container) return;

      const point = projection.fromLatLngToDivPixel(
        new google.maps.LatLng(currentPosition.lat, currentPosition.lng),
      );
      if (!point) return;

      this.container.style.left = `${point.x}px`;
      this.container.style.top = `${point.y}px`;
      this.container.style.transform = 'translate(-50%, -73%)';
    }

    onRemove() {
      anchor.removeEventListener('click', this.handleClick);
      this.container?.remove();
      this.container = null;
    }

    setPosition(nextPosition: google.maps.LatLngLiteral) {
      currentPosition = nextPosition;
      this.draw();
    }

    setZIndex(nextZIndex: number) {
      this.currentZIndex = nextZIndex;
      if (this.container) {
        this.container.style.zIndex = String(nextZIndex);
      }
    }

    setOnClick(nextOnClick: (() => void) | undefined) {
      onClick = nextOnClick;
    }
  }

  return { overlay: new MapPinOverlay(), mount };
};

export const disposeMapPinOverlay = ({ overlay, mount }: MapPinOverlayEntry) => {
  overlay.setMap(null);
  unmountMapPinMarker(mount);
};
