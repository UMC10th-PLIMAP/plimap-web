import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type { NicknameCheckResponse, ProfileImageUploadResponse } from '@/types/member.type';

const ENDPOINT = '/api/v1/members';

// 1) GET /api/v1/members/nickname/check - 닉네임 사용 가능 여부 확인
export async function checkNicknameAvailability(nickname: string) {
  const { data } = await apiClient.get<ApiResponse<NicknameCheckResponse>>(
    `${ENDPOINT}/nickname/check`,
    { params: { nickname } },
  );
  return data.result;
}

// 2) POST /api/v1/members/me/profile-image - 프로필 이미지 업로드
export async function uploadProfileImage(image: File) {
  const formData = new FormData();
  formData.append('image', image);

  const { data } = await apiClient.post<ApiResponse<ProfileImageUploadResponse>>(
    `${ENDPOINT}/me/profile-image`,
    formData,
  );
  return data.result;
}
