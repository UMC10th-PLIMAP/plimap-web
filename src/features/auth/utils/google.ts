const GOOGLE_GIS_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_GIS_SCRIPT_ID = 'google-gis-script';

export const GOOGLE_REDIRECT_URI = `${window.location.origin}/app/login/google/callback`;

export function loadGoogleGis() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts.oauth2) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(GOOGLE_GIS_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () =>
        reject(new Error('Google GIS script load error')),
      );
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_GIS_SCRIPT_ID;
    script.src = GOOGLE_GIS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google GIS script load error'));
    document.head.appendChild(script);
  });
}
