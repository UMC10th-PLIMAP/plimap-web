import type { TermId } from '@/features/auth/terms/types';

export type TermsAgreementRequest = {
  agreements: { type: TermId; agreed: boolean }[];
};

export type TermsAgreementResponse = {
  type: TermId;
  agreed: boolean;
  agreedAt: string;
}[];
