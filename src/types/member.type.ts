export type NicknameCheckReason =
  'TOO_SHORT' | 'TOO_LONG' | 'INVALID_FORMAT' | 'FORBIDDEN_WORD' | 'DUPLICATE';

export type NicknameCheckResponse =
  | { nickname: string; available: true; reason: null }
  | { nickname: string; available: false; reason: NicknameCheckReason };
