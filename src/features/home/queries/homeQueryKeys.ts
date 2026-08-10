export const homeQueryKeys = {
  all: ['home'] as const,
  contexts: () => [...homeQueryKeys.all, 'context'] as const,
  context: (latitude: number | null, longitude: number | null) =>
    [...homeQueryKeys.contexts(), { latitude, longitude }] as const,
};
