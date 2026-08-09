const GOOGLE_MAPS_READY_CALLBACK = '__plimapGoogleMapsReady';

type GoogleMapsWindow = typeof window & {
  __plimapGoogleMapsReady?: () => void;
};

let googleMapsLoadPromise: Promise<void> | null = null;

// Google Maps API 스크립트 동적 로드 함수
export const loadGoogleMapsScript = (apiKey: string) => {
  if (typeof window.google?.maps?.Map === 'function') {
    return Promise.resolve();
  }
  if (googleMapsLoadPromise) return googleMapsLoadPromise;

  googleMapsLoadPromise = new Promise<void>((resolve, reject) => {
    const mapsWindow = window as GoogleMapsWindow;
    const handleReady = () => {
      delete mapsWindow[GOOGLE_MAPS_READY_CALLBACK];
      resolve();
    };
    const handleError = () => {
      delete mapsWindow[GOOGLE_MAPS_READY_CALLBACK];
      document.getElementById('google-maps-script')?.remove();
      googleMapsLoadPromise = null;
      reject(new Error('Google Maps Script load error'));
    };

    mapsWindow[GOOGLE_MAPS_READY_CALLBACK] = handleReady;

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    const params = new URLSearchParams({
      key: apiKey,
      libraries: 'maps,marker',
      language: 'ko',
      region: 'KR',
      loading: 'async',
      callback: GOOGLE_MAPS_READY_CALLBACK,
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = handleError;
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
};
