import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type {
  MyProfileResponse,
  NicknameCheckResponse,
  ProfileImageUploadResponse,
  UpdateMyProfileRequest,
  UpdateMyProfileResponse,
} from '@/types/member.type';

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

// 3) GET /api/v1/members/me - 내 프로필 조회 (로그인 여부 확인 용도로도 사용)
export async function getMyProfile() {
  const { data } = await apiClient.get<ApiResponse<MyProfileResponse>>(`${ENDPOINT}/me`);
  return data.result;
}

// 4) PATCH /api/v1/members/me - 내 프로필 수정
export async function updateMyProfile(payload: UpdateMyProfileRequest) {
  const { data } = await apiClient.patch<ApiResponse<UpdateMyProfileResponse>>(
    `${ENDPOINT}/me`,
    payload,
  );
  return data.result;
}
