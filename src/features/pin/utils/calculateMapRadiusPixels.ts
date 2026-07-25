const MAX_MERCATOR_LATITUDE = 85.05112878;
const EARTH_CIRCUMFERENCE_METERS = 40_075_016.68557849;
const MAP_TILE_SIZE_PX = 256;

export const calculateMapRadiusPixels = (radiusMeters: number, zoom: number, latitude: number) => {
  if (
    !Number.isFinite(radiusMeters) ||
    radiusMeters <= 0 ||
    !Number.isFinite(zoom) ||
    !Number.isFinite(latitude)
  ) {
    return 0;
  }

  const clampedLatitude = Math.min(
    MAX_MERCATOR_LATITUDE,
    Math.max(-MAX_MERCATOR_LATITUDE, latitude),
  );
  const mapScale = 2 ** zoom;

  if (!Number.isFinite(mapScale) || mapScale <= 0) return 0;

  const metersPerPixel =
    (EARTH_CIRCUMFERENCE_METERS * Math.cos((clampedLatitude * Math.PI) / 180)) /
    (MAP_TILE_SIZE_PX * mapScale);
  const radiusPixels = radiusMeters / metersPerPixel;

  return Number.isFinite(radiusPixels) && radiusPixels > 0 ? radiusPixels : 0;
};
