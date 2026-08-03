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
  profileImageObjectKey: string | null;
  followerCount: number;
  followingCount: number;
  onboardingCompletedAt: string | null;
};

export type MemberProfileResponse = {
  id: number;
  nickname: string;
  name: string | null;
  introduction: string | null;
  profileImageObjectKey: string | null;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
};
