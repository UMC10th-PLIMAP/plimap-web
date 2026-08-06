import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { RequestErrorScreen } from '@/components/ui/RequestErrorScreen';
import { TopBar } from '@/components/ui/TopBar';
import { SettingsRow } from '@/features/settings/components/SettingsRow';
import { WithdrawConfirmDialog } from '@/features/settings/components/WithdrawConfirmDialog';
import { useWithdrawMember } from '@/features/settings/queries/useWithdrawMember';
import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';

export default function AccountManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [requestError, setRequestError] = useState<unknown>(null);
  const withdrawMutation = useWithdrawMember();

  const handleWithdraw = () => {
    if (withdrawMutation.isPending) return;

    withdrawMutation.mutate(undefined, {
      onSuccess: () => {
        setIsWithdrawDialogOpen(false);
        queryClient.removeQueries({ queryKey: memberQueryKeys.all });
        navigate('/app/login', { replace: true });
      },
      onError: (error) => {
        setIsWithdrawDialogOpen(false);
        setRequestError(error);
      },
    });
  };

  if (requestError) {
    return (
      <RequestErrorScreen
        error={requestError}
        onRetry={() => {
          setRequestError(null);
          setIsWithdrawDialogOpen(true);
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col pt-[env(safe-area-inset-top)]">
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
        isSubmitting={withdrawMutation.isPending}
      />
    </div>
  );
}
