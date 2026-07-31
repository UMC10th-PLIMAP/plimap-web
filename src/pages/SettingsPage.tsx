import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { ConfirmAlertDialog } from '@/features/settings/components/ConfirmAlertDialog';
import { SettingsRow } from '@/features/settings/components/SettingsRow';
import type { TermId } from '@/features/auth/terms/types';

const TERM_LIST_ITEMS: { id: TermId; label: string }[] = [
  { id: 'SERVICE', label: 'PLIMAP 서비스 이용약관' },
  { id: 'LOCATION', label: '위치 정보 수집 동의' },
  { id: 'PRIVACY', label: '개인정보 처리 방침' },
  { id: 'MARKETING', label: '마케팅 정보 수신 설정' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    // TODO: 로그아웃 API 연동 (별도 이슈)
    setIsLogoutDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar title="설정" titleWeight="medium" onBack={() => navigate(-1)} />

      <div className="flex flex-col gap-5 px-4 pt-[35px]">
        <div className="flex flex-col gap-2">
          <p className="etc-13-r text-grayscale-400">약관 및 정책</p>
          <div className="flex flex-col gap-0.5">
            {TERM_LIST_ITEMS.map((item) => (
              <SettingsRow
                key={item.id}
                label={item.label}
                onClick={() => navigate(`/app/settings/terms/${item.id}`)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="etc-13-r text-grayscale-400">계정 관리</p>
          <div className="flex flex-col gap-0.5">
            <SettingsRow label="계정 관리" onClick={() => navigate('/app/settings/account')} />
            <SettingsRow
              label="로그아웃"
              chevron={false}
              tone="danger"
              onClick={() => setIsLogoutDialogOpen(true)}
            />
          </div>
        </div>
      </div>

      <ConfirmAlertDialog
        open={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        title="로그아웃"
        message="계정에서 로그아웃 하시겠어요?"
        actions={[
          { label: '취소', onClick: () => setIsLogoutDialogOpen(false) },
          { label: '로그아웃', onClick: handleLogout, tone: 'danger' },
        ]}
      />
    </div>
  );
}
