export type NicknameCheckReason =
  'TOO_SHORT' | 'TOO_LONG' | 'INVALID_FORMAT' | 'FORBIDDEN_WORD' | 'DUPLICATE';

export type NicknameCheckResponse =
  | { nickname: string; available: true; reason: null }
  | { nickname: string; available: false; reason: NicknameCheckReason };

export type ProfileImageUploadResponse = {
  objectKey: string;
  imageUrl: string;
};

export type MyProfileResponse = {
  id: number;
  nickname: string | null;
  name: string | null;
  introduction: string | null;
  profileImageUrl: string | null;
  followerCount: number;
  followingCount: number;
  pinCount: number;
  onboardingCompletedAt: string | null;
};

export type FollowListRequest = {
  memberId: number;
  pageSize?: number;
  cursor?: string;
};

export type FollowListItem = {
  id: number;
  nickname: string;
  name: string | null;
  profileImageUrl: string | null;
  followedAt: string;
  isFollowing: boolean;
};

export type FollowListResponse = {
  data: FollowListItem[];
  nextCursor: string;
  hasNext: boolean;
  pageSize: number;
};
export type MemberProfileResponse = {
  id: number;
  nickname: string;
  name: string | null;
  introduction: string | null;
  profileImageUrl: string | null;
  followerCount: number;
  followingCount: number;
  pinCount: number;
  isFollowing: boolean;
};

export type UpdateMyProfileRequest = {
  nickname?: string;
  name?: string;
  introduction?: string;
};

export type UpdateMyProfileResponse = {
  id: number;
  nickname: string;
  name: string;
  introduction: string;
  profileImageObjectKey: string;
  updatedAt: string;
};

/** @deprecated MemberProfileResponse 사용 */
export type OtherMemberProfileResponse = MemberProfileResponse;
