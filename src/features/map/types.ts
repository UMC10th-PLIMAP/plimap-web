export type ColorSettings = {
  background: string;
  road: string;
  highway: string;
  highwayRamp: string;
  water: string;
  natural: string;
  building: string;
  subway: string;
};

export type ToggleSettings = {
  // 라벨 및 경계
  allLabels: boolean;
  administrative: boolean;
  // 지형 및 건물
  landscapeManMade: boolean;
  landscapeNatural: boolean;
  water: boolean;
  // 도로 및 교통
  roadHighway: boolean;
  roadArterial: boolean;
  roadLocal: boolean;
  transitLine: boolean;
  transitStation: boolean;
  // 관심 지점 (POI)
  poiBusiness: boolean;
  poiAttraction: boolean;
  poiMedical: boolean;
  poiPark: boolean;
  poiSchool: boolean;
};

// 다크 모드 기본 색상 (PLIMAP 스타일)
export const DEFAULT_DARK_COLORS: ColorSettings = {
  background: '#1c2128',
  road: '#373d45',
  highway: '#4c5741',
  highwayRamp: '#8fae2b',
  water: '#2d485f',
  natural: '#2a482a',
  building: '#49546a',
  subway: '#394066',
};

// 라이트 모드 기본 색상
export const DEFAULT_LIGHT_COLORS: ColorSettings = {
  background: '#f8f9fa',
  road: '#ffffff',
  highway: '#ffe8a6',
  highwayRamp: '#ffd56e',
  water: '#a4c8ff',
  natural: '#d2e4c2',
  building: '#e8e8e8',
  subway: '#9fa8da',
};

// 제어 토글 기본값 설정
export const DEFAULT_TOGGLES: ToggleSettings = {
  allLabels: false,
  administrative: false,
  landscapeManMade: true,
  landscapeNatural: true,
  water: true,
  roadHighway: true,
  roadArterial: true,
  roadLocal: true,
  transitLine: true,
  transitStation: true,
  poiBusiness: false,
  poiAttraction: false,
  poiMedical: false,
  poiPark: false,
  poiSchool: false,
};
