export function getAuthCodeFromUrl(search: string) {
  const params = new URLSearchParams(search);
  return {
    code: params.get('code'),
    error: params.get('error'),
  };
}
