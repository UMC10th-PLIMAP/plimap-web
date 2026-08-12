import type { TermId } from '@/features/auth/terms/types';

export type TermsAgreementRequest = {
  agreements: { type: TermId; agreed: boolean }[];
};

export type TermsAgreement = {
  type: TermId;
  agreed: boolean;
  agreedAt: string | null;
};

export type TermsAgreementResponse = TermsAgreement[];

export type OnboardingRequest = {
  nickname: string;
};

export type OnboardingResponse = {
  nickname: string;
};
