import { ColorSettings, ToggleSettings } from './types';

// Google Maps API 스크립트 동적 로드 함수
export const loadGoogleMapsScript = (apiKey: string) => {
  return new Promise<void>((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () =>
        reject(new Error('Google Maps Script load error')),
      );
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=maps,marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps Script load error'));
    document.head.appendChild(script);
  });
};

// 상태값을 기반으로 구글맵 JSON 스타일 배열을 생성하는 함수
export const generateMapStyles = (currentColors: ColorSettings, currentToggles: ToggleSettings) => {
  return [
    // --- 1. 색상 커스텀 적용 ---
    {
      elementType: 'geometry',
      stylers: [{ color: currentColors.background }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: currentColors.water }],
    },
    {
      featureType: 'natural',
      elementType: 'geometry',
      stylers: [{ color: currentColors.natural }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: currentColors.road }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: currentColors.highway }],
    },
    {
      featureType: 'road.highway.controlled_access',
      elementType: 'geometry',
      stylers: [{ color: currentColors.highwayRamp }],
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry',
      stylers: [{ color: currentColors.subway }],
    },
    {
      featureType: 'landscape.man_made',
      elementType: 'geometry',
      stylers: [{ color: currentColors.building }],
    },
    {
      featureType: 'landscape.man_made',
      elementType: 'geometry.stroke',
      stylers: [{ color: currentColors.background }],
    },

    // --- 2. 라벨 및 경계 제어 ---
    {
      elementType: 'labels',
      stylers: [{ visibility: currentToggles.allLabels ? 'on' : 'off' }],
    },
    {
      featureType: 'administrative',
      stylers: [{ visibility: currentToggles.administrative ? 'on' : 'off' }],
    },

    // --- 3. 지형 및 건물 제어 ---
    {
      featureType: 'landscape.man_made',
      stylers: [{ visibility: currentToggles.landscapeManMade ? 'on' : 'off' }],
    },
    {
      featureType: 'landscape.natural',
      stylers: [{ visibility: currentToggles.landscapeNatural ? 'on' : 'off' }],
    },
    {
      featureType: 'water',
      stylers: [{ visibility: currentToggles.water ? 'on' : 'off' }],
    },

    // --- 4. 도로 및 교통 제어 ---
    {
      featureType: 'road.highway',
      stylers: [{ visibility: currentToggles.roadHighway ? 'on' : 'off' }],
    },
    {
      featureType: 'road.arterial',
      stylers: [{ visibility: currentToggles.roadArterial ? 'on' : 'off' }],
    },
    {
      featureType: 'road.local',
      stylers: [{ visibility: currentToggles.roadLocal ? 'on' : 'off' }],
    },
    {
      featureType: 'transit.line',
      stylers: [{ visibility: currentToggles.transitLine ? 'on' : 'off' }],
    },
    {
      featureType: 'transit.station',
      stylers: [{ visibility: currentToggles.transitStation ? 'on' : 'off' }],
    },

    // --- 5. 관심 지점(POI) 제어 ---
    {
      featureType: 'poi.business',
      stylers: [{ visibility: currentToggles.poiBusiness ? 'on' : 'off' }],
    },
    {
      featureType: 'poi.attraction',
      stylers: [{ visibility: currentToggles.poiAttraction ? 'on' : 'off' }],
    },
    {
      featureType: 'poi.medical',
      stylers: [{ visibility: currentToggles.poiMedical ? 'on' : 'off' }],
    },
    {
      featureType: 'poi.park',
      stylers: [{ visibility: currentToggles.poiPark ? 'on' : 'off' }],
    },
    {
      featureType: 'poi.school',
      stylers: [{ visibility: currentToggles.poiSchool ? 'on' : 'off' }],
    },
  ];
};
