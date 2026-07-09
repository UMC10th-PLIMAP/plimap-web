import { z } from 'zod';

export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 10;

const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]+$/;

export const nicknameSchema = z
  .string()
  .min(NICKNAME_MIN_LENGTH, '두 글자 이상 입력해주세요.')
  .max(NICKNAME_MAX_LENGTH, `최대 ${NICKNAME_MAX_LENGTH}자까지만 입력할 수 있어요.`)
  .regex(NICKNAME_PATTERN, '한글, 영문, 숫자만 사용 가능하며 공백은 포함할 수 없어요.');

export function validateNickname(nickname: string): string | null {
  const result = nicknameSchema.safeParse(nickname);
  return result.success ? null : result.error.issues[0].message;
}
