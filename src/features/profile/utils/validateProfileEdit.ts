import { z } from 'zod';

import { nicknameSchema } from '@/features/auth/utils/validateNickname';

export const NAME_MAX_LENGTH = 5;
export const BIO_MAX_LENGTH = 30;

const NAME_PATTERN = /^[가-힣]+$/;

export const nameSchema = z
  .string()
  .max(NAME_MAX_LENGTH, { error: `최대 ${NAME_MAX_LENGTH}자까지만 입력할 수 있어요.` })
  .regex(NAME_PATTERN, { error: '한글만 입력할 수 있어요.' });

export const bioSchema = z
  .string()
  .max(BIO_MAX_LENGTH, { error: `최대 ${BIO_MAX_LENGTH}자까지만 입력할 수 있어요.` });

export const profileEditSchema = z.object({
  nickname: nicknameSchema,
  name: nameSchema,
  bio: bioSchema,
});

export type ProfileEditFormValues = z.infer<typeof profileEditSchema>;
