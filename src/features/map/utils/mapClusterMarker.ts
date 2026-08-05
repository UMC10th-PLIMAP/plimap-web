import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ClusterMarker, type ClusterMarkerProps } from '../components/ClusterMarker';

const markerRoots = new WeakMap<HTMLElement, Root>();

const renderClusterMarker = (mount: HTMLElement, props: ClusterMarkerProps) => {
  let root = markerRoots.get(mount);
  if (!root) {
    root = createRoot(mount);
    markerRoots.set(mount, root);
  }
  root.render(createElement(ClusterMarker, props));
};

const unmountClusterMarker = (mount: HTMLElement) => {
  const root = markerRoots.get(mount);
  root?.unmount();
  markerRoots.delete(mount);
};

type ClusterOverlayOptions = {
  position: google.maps.LatLngLiteral;
  onClick?: () => void;
} & ClusterMarkerProps;

export type ClusterOverlayEntry = {
  overlay: google.maps.OverlayView;
  mount: HTMLDivElement;
};

export const createClusterOverlay = ({
  position,
  onClick,
  ...markerProps
}: ClusterOverlayOptions): ClusterOverlayEntry => {
  const anchor = document.createElement('div');
  const mount = document.createElement('div');
  anchor.appendChild(mount);
  renderClusterMarker(mount, markerProps);

  class ClusterOverlay extends google.maps.OverlayView {
    private container: HTMLDivElement | null = null;

    onAdd() {
      const container = document.createElement('div');
      container.style.position = 'absolute';

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
      // 원형 버블이라 pin과 달리 좌표를 중심에 맞춘다 (translate -50%, -50%).
      this.container.style.transform = 'translate(-50%, -50%)';
    }

    onRemove() {
      this.container?.remove();
      this.container = null;
    }
  }

  return { overlay: new ClusterOverlay(), mount };
};

export const disposeClusterOverlay = ({ overlay, mount }: ClusterOverlayEntry) => {
  overlay.setMap(null);
  unmountClusterMarker(mount);
};
