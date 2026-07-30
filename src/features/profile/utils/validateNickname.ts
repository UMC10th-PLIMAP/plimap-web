import { z } from 'zod';

import type { NicknameCheckReason } from '@/types/member.type';

export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 10;

const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]+$/;

export const nicknameSchema = z
  .string()
  .min(NICKNAME_MIN_LENGTH, { error: '두 글자 이상 입력해주세요.' })
  .max(NICKNAME_MAX_LENGTH, { error: `최대 ${NICKNAME_MAX_LENGTH}자까지만 입력할 수 있어요.` })
  .regex(NICKNAME_PATTERN, { error: '공백 없이 한글, 영문, 숫자만 가능해요.' });

export function validateNickname(nickname: string): string | null {
  const result = nicknameSchema.safeParse(nickname);
  return result.success ? null : result.error.issues[0].message;
}

export const NICKNAME_UNAVAILABLE_MESSAGE: Record<NicknameCheckReason, string> = {
  TOO_SHORT: '두 글자 이상 입력해주세요.',
  TOO_LONG: `최대 ${NICKNAME_MAX_LENGTH}자까지만 입력할 수 있어요.`,
  INVALID_FORMAT: '공백 없이 한글, 영문, 숫자만 가능해요.',
  FORBIDDEN_WORD: '부적절하거나 사용할 수 없는 단어가 포함되어 있어요.',
  DUPLICATE: '이미 사용 중인 닉네임이에요.',
};
