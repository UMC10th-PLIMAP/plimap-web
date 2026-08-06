import { apiClient, ApiError } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type {
  FollowListRequest,
  FollowListResponse,
  MemberProfileResponse,
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

// 5) GET /api/v1/members/{memberId}/following - 팔로잉 목록 조회
export async function getFollowingList({ memberId, pageSize, cursor }: FollowListRequest) {
  const { data } = await apiClient.get<ApiResponse<FollowListResponse>>(
    `${ENDPOINT}/${memberId}/following`,
    { params: { pageSize, cursor } },
  );
  return data.result;
}

// 6) GET /api/v1/members/{memberId}/followers - 팔로워 목록 조회
export async function getFollowerList({ memberId, pageSize, cursor }: FollowListRequest) {
  const { data } = await apiClient.get<ApiResponse<FollowListResponse>>(
    `${ENDPOINT}/${memberId}/followers`,
    { params: { pageSize, cursor } },
  );
  return data.result;
}

// 7) GET /api/v1/members/{memberId} - 다른 사용자 프로필 조회
export async function getOtherMemberProfile(memberId: string | number) {
  const { data } = await apiClient.get<ApiResponse<MemberProfileResponse>>(
    `${ENDPOINT}/${memberId}`,
  );
  return data.result;
}

// 8) POST /api/v1/members/{memberId}/follow - 팔로우
export async function followMember(memberId: number) {
  await apiClient.post<ApiResponse<null>>(`${ENDPOINT}/${memberId}/follow`);
}

// 9) DELETE /api/v1/members/{memberId}/follow - 언팔로우
export async function unfollowMember(memberId: number) {
  await apiClient.delete(`${ENDPOINT}/${memberId}/follow`);
}

// 10) DELETE /api/v1/members/me - 회원 탈퇴
export async function withdrawMember() {
  // 2xx 응답이라도 isSuccess:false(code 없는 논리적 실패 포함)일 수 있어 직접 검사한다 -
  // client.ts의 응답 인터셉터는 axios가 에러로 취급하는 비-2xx 응답만 ApiError로 변환한다.
  const { data, status } = await apiClient.delete<ApiResponse<string>>(`${ENDPOINT}/me`);
  if (!data.isSuccess) {
    throw new ApiError(data.code, data.message, status);
  }
  return data.result;
}
