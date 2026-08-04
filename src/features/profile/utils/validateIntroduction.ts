import { z } from 'zod';

export const INTRODUCTION_MAX_LENGTH = 50;

export const introductionSchema = z
  .string()
  .max(INTRODUCTION_MAX_LENGTH, { error: `최대 ${INTRODUCTION_MAX_LENGTH}자까지 가능해요.` });

export function validateIntroduction(introduction: string): string | null {
  const result = introductionSchema.safeParse(introduction);
  return result.success ? null : result.error.issues[0].message;
}
