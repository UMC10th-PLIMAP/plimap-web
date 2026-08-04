import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { logout } from '@/api/auth';
import { ApiError } from '@/api/client';
import { TopBar } from '@/components/ui/TopBar';
import { ConfirmAlertDialog } from '@/features/settings/components/ConfirmAlertDialog';
import { SettingsRow } from '@/features/settings/components/SettingsRow';
import type { TermId } from '@/features/auth/terms/types';

const TERM_LIST_ITEMS: { id: TermId; label: string }[] = [
  { id: 'SERVICE', label: 'PLIMAP 서비스 이용약관' },
  { id: 'PRIVACY', label: '개인정보 처리 방침' },
  { id: 'LOCATION', label: '위치 정보 수집 동의' },
  { id: 'MARKETING', label: '마케팅 정보 수신 설정' },
];

const LOGOUT_FAILED_MESSAGE = '로그아웃에 실패했어요. 잠시 후 다시 시도해주세요.';

export default function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logout();
      setIsLogoutDialogOpen(false);
      queryClient.removeQueries({ queryKey: ['me'] });
      navigate('/app/login', { replace: true });
    } catch (error) {
      setIsLogoutDialogOpen(true);
      alert(error instanceof ApiError ? error.message : LOGOUT_FAILED_MESSAGE);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar title="설정" titleWeight="medium" onBack={() => navigate(-1)} />

      <div className="flex flex-col gap-5 px-4 pt-[35px]">
        <div className="flex flex-col gap-2">
          <p className="etc-13-r text-grayscale-400">고객 지원</p>
          <div className="flex flex-col gap-0.5">
            <SettingsRow label="서비스 이용가이드" disabled />
          </div>
        </div>

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
          <p className="etc-13-r text-grayscale-400">내 계정</p>
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
