import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/ui/TopBar';
import { TermCheckbox } from '@/features/auth/components/TermCheckbox';
import { TermRow } from '@/features/auth/components/TermRow';
import { TermsDetailContent } from '@/features/auth/components/TermsDetailContent';
import { TERMS, TERMS_BY_ID } from '@/features/auth/terms/content';
import type { TermId } from '@/features/auth/terms/types';

const INITIAL_CHECKED: Record<TermId, boolean> = {
  service: false,
  privacy: false,
  location: false,
  marketing: false,
};

export default function TermsAgreementPage() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState<Record<TermId, boolean>>(INITIAL_CHECKED);
  const [detailTermId, setDetailTermId] = useState<TermId | null>(null);

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

  const handleSubmit = () => {
    navigate('/app/onboarding/nickname');
  };

  if (detailTermId) {
    const term = TERMS_BY_ID[detailTermId];
    return (
      <div className="flex min-h-screen flex-col">
        <TopBar onBack={() => setDetailTermId(null)} />
        <TermsDetailContent term={term} />
        <div className="mt-auto flex flex-col items-center px-[10px] pb-[52px]">
          <Button
            key="confirm"
            type="button"
            variant="cta"
            size="cta"
            onClick={() => setDetailTermId(null)}
          >
            확인
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
          disabled={!isValid}
          onClick={handleSubmit}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
