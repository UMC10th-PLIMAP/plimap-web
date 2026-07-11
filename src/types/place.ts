export type PlaceResult = {
  id: string;
  creatorName?: string;
  category: string;
  placeName: string;
  distance: number;
};

export type PinSearchPlace = PlaceResult & {
  coordinates: {
    lat: number;
    lng: number;
  };
};
