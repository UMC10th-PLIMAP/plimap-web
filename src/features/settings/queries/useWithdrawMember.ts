import { useMutation } from '@tanstack/react-query';

import { withdrawMember } from '@/api/member';

/** 회원 탈퇴 (DELETE /api/v1/members/me) */
export function useWithdrawMember() {
  return useMutation({
    mutationFn: withdrawMember,
  });
}
