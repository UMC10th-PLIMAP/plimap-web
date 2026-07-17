import { z } from 'zod';

export const NAME_MAX_LENGTH = 5;
export const BIO_MAX_LENGTH = 30;

const NAME_PATTERN = /^[가-힣]+$/;

export const nameSchema = z
  .string()
  .min(1, { error: '이름을 입력해주세요.' })
  .max(NAME_MAX_LENGTH, { error: `최대 ${NAME_MAX_LENGTH}자까지만 입력할 수 있어요.` })
  .regex(NAME_PATTERN, { error: '한글만 입력할 수 있어요.' });

export const bioSchema = z
  .string()
  .max(BIO_MAX_LENGTH, { error: `최대 ${BIO_MAX_LENGTH}자까지만 입력할 수 있어요.` });

export function validateName(name: string): string | null {
  const result = nameSchema.safeParse(name);
  return result.success ? null : result.error.issues[0].message;
}

export function validateBio(bio: string): string | null {
  const result = bioSchema.safeParse(bio);
  return result.success ? null : result.error.issues[0].message;
}
