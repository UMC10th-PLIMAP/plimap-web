import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { ConfirmAlertDialog } from '@/features/settings/components/ConfirmAlertDialog';
import { SettingsRow } from '@/features/settings/components/SettingsRow';

export default function AccountManagementPage() {
  const navigate = useNavigate();
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

  const handleWithdraw = () => {
    // TODO: 회원탈퇴 API 연동 (백엔드 준비 후, 별도 이슈)
    setIsWithdrawDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar title="계정 관리" titleWeight="medium" onBack={() => navigate(-1)} />

      <div className="flex flex-col gap-2 px-4 pt-[35px]">
        <p className="etc-13-r text-grayscale-400">계정 관리</p>
        <div className="flex flex-col gap-0.5">
          <SettingsRow
            label="회원 탈퇴"
            chevron={false}
            tone="danger"
            onClick={() => setIsWithdrawDialogOpen(true)}
          />
        </div>
      </div>

      <ConfirmAlertDialog
        open={isWithdrawDialogOpen}
        onClose={() => setIsWithdrawDialogOpen(false)}
        title="회원 탈퇴"
        message={
          '정말 탈퇴하시겠어요? \n탈퇴 시 기존의 모든 데이터와 이용 내역이 삭제되며 복구할 수 없습니다.'
        }
        actions={[
          { label: '회원 탈퇴', onClick: handleWithdraw, tone: 'danger' },
          { label: '취소', onClick: () => setIsWithdrawDialogOpen(false) },
        ]}
      />
    </div>
  );
}
