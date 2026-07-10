/// <reference types="google.maps" />

interface Window {
  google?: {
    maps: typeof google.maps;
  };
}
