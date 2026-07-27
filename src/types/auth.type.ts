import type { TermId } from '@/features/auth/terms/types';

export type TermsAgreementRequest = {
  agreements: { type: TermId; agreed: boolean }[];
};

export type TermsAgreementResult = {
  type: TermId;
  agreed: boolean;
  agreedAt: string;
}[];
