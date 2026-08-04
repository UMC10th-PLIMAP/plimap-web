import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { SettingsRow } from '@/features/settings/components/SettingsRow';
import { WithdrawConfirmDialog } from '@/features/settings/components/WithdrawConfirmDialog';

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

      <WithdrawConfirmDialog
        open={isWithdrawDialogOpen}
        onClose={() => setIsWithdrawDialogOpen(false)}
        onConfirm={handleWithdraw}
      />
    </div>
  );
}
