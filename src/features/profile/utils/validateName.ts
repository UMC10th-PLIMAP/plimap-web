import { z } from 'zod';

export const NAME_MAX_LENGTH = 5;

const NAME_PATTERN = /^[가-힣]+$/;

export const nameSchema = z
  .string()
  .max(NAME_MAX_LENGTH, { error: `최대 ${NAME_MAX_LENGTH}자까지만 입력할 수 있어요.` })
  .regex(NAME_PATTERN, { error: '공백 없이 한글만 사용 가능해요.' });

export function validateName(name: string): string | null {
  if (name.length === 0) return null;

  const result = nameSchema.safeParse(name);
  return result.success ? null : result.error.issues[0].message;
}
