import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/ui/TopBar';
import { agreeToTerms } from '@/api/auth';
import { TermCheckbox } from '@/features/auth/components/TermCheckbox';
import { TermRow } from '@/features/auth/components/TermRow';
import { TermsDetailContent } from '@/features/auth/components/TermsDetailContent';
import { TERMS, TERMS_BY_ID } from '@/features/auth/terms/content';
import type { TermId } from '@/features/auth/terms/types';
import { useOnboardingStore } from '@/store/onboardingStore';

const TERMS_AGREEMENT_FAILED_MESSAGE = '약관 동의 처리에 실패했어요. 다시 시도해주세요.';

const INITIAL_CHECKED: Record<TermId, boolean> = {
  SERVICE: false,
  PRIVACY: false,
  LOCATION: false,
  MARKETING: false,
};

export default function TermsAgreementPage() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState<Record<TermId, boolean>>(INITIAL_CHECKED);
  const [detailTermId, setDetailTermId] = useState<TermId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이전 사용자가 온보딩을 완료하지 않고 이탈한 경우를 대비해 새 온보딩 시작 시점에도 스토어를 초기화
  useEffect(() => {
    useOnboardingStore.getState().reset();
  }, []);

  const allChecked = TERMS.every((term) => checked[term.id]);
  const isValid = TERMS.filter((term) => term.required).every((term) => checked[term.id]);

  const toggleTerm = (id: TermId) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    const next = !allChecked;
    setChecked(
      TERMS.reduce((acc, term) => ({ ...acc, [term.id]: next }), {} as Record<TermId, boolean>),
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await agreeToTerms(TERMS.map((term) => ({ id: term.id, agreed: checked[term.id] })));
      navigate('/app/onboarding/nickname');
    } catch (error) {
      alert(error instanceof ApiError ? error.message : TERMS_AGREEMENT_FAILED_MESSAGE);
      setIsSubmitting(false);
    }
  };

  if (detailTermId) {
    const term = TERMS_BY_ID[detailTermId];
    return (
      <div className="flex min-h-screen flex-col">
        <div className="pt-[44px]">
          <TermsDetailContent term={term} />
        </div>
        {/* 고정 CTA에 가려지지 않도록 스크롤 영역 하단에 여백 확보 */}
        <div aria-hidden className="h-[116px]" />
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-[10px] pb-[52px]">
          <Button
            key="confirm"
            type="button"
            variant="cta"
            size="cta"
            className="w-full"
            onClick={() => {
              if (term.required) {
                setChecked((prev) => ({ ...prev, [term.id]: true }));
              }
              setDetailTermId(null);
            }}
          >
            {term.required ? '확인' : '닫기'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar onBack={() => navigate(-1)} />

      <div className="flex flex-col gap-7 px-4 pt-[44px]">
        <div className="flex flex-col gap-9">
          <h1 className="head-24-sb text-grayscale-100">이용약관 동의</h1>

          <div className="flex h-[60px] items-center gap-3 rounded-xl bg-pli-black-85 px-4">
            <TermCheckbox checked={allChecked} onToggle={toggleAll} label="약관 전체 동의" />
            <span onClick={toggleAll} className="head-18-sb cursor-pointer text-grayscale-300">
              약관 전체 동의
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-[18px]">
          <p className="etc-13-r text-grayscale-400">PLIMAP 이용약관</p>
          <div className="flex flex-col gap-4">
            {TERMS.map((term) => (
              <TermRow
                key={term.id}
                label={term.listLabel}
                checked={checked[term.id]}
                onToggle={() => toggleTerm(term.id)}
                onViewDetail={() => setDetailTermId(term.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center px-[10px] pb-[52px]">
        <Button
          key="next"
          type="button"
          variant="cta"
          size="cta"
          className="w-full"
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
