interface Window {
  Kakao?: {
    init: (javascriptKey: string) => void;
    isInitialized: () => boolean;
    Auth: {
      authorize: (settings: { redirectUri: string }) => void;
    };
  };
}
