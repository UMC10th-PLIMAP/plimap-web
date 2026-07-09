declare namespace google.maps {
  type LatLngLiteral = {
    lat: number;
    lng: number;
  };

  type Padding = {
    bottom?: number;
    left?: number;
    right?: number;
    top?: number;
  };

  type MapOptions = {
    center?: LatLngLiteral;
    disableDefaultUI?: boolean;
    styles?: unknown[];
    zoom?: number;
  };

  type MarkerOptions = {
    icon?: Symbol;
    label?: MarkerLabel;
    map?: Map;
    position?: LatLngLiteral;
    title?: string;
  };

  type MarkerLabel = {
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    text: string;
  };

  type Symbol = {
    fillColor?: string;
    fillOpacity?: number;
    path: SymbolPath;
    scale?: number;
    strokeColor?: string;
    strokeWeight?: number;
  };

  const enum SymbolPath {
    CIRCLE = 0,
  }

  class LatLng {
    lat(): number;
    lng(): number;
  }

  class LatLngBounds {
    extend(point: LatLng | LatLngLiteral): LatLngBounds;
  }

  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    addListener(eventName: string, handler: () => void): MapsEventListener;
    fitBounds(bounds: LatLngBounds, padding?: number | Padding): void;
    getCenter(): LatLng | null;
    getZoom(): number | undefined;
    panTo(latLng: LatLng | LatLngLiteral): void;
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setOptions(options: MapOptions): void;
    setZoom(zoom: number): void;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    addListener(eventName: string, handler: () => void): MapsEventListener;
    getPosition(): LatLng | null;
    setIcon(icon: Symbol): void;
    setMap(map: Map | null): void;
    setZIndex(zIndex: number | undefined): void;
  }

  class InfoWindow {
    close(): void;
    open(options: { anchor?: Marker; map?: Map }): void;
    setContent(content: Node | string): void;
  }

  type MapsEventListener = {
    remove(): void;
  };

  namespace event {
    function trigger(instance: object, eventName: string): void;
  }
}

interface Window {
  google: {
    maps: typeof google.maps;
  };
}
