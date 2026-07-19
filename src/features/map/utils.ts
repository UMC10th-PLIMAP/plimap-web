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
