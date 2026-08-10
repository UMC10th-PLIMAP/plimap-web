export type FollowRelation = {
  isFollowing: boolean;
  isFollowingViewer: boolean;
};

/**
 * 팔로우 버튼 라벨 우선순위
 * 1. isFollowing=true: "팔로잉" (이미 내가 팔로우 중)
 * 2. isFollowing=false, isFollowingViewer=true: "맞팔로우" (상대가 나를 팔로우 중이므로 팔로우하면 맞팔이 됨)
 * 3. 둘 다 false: "팔로우" (아무 관계 없음)
 */
export function getFollowActionLabel({ isFollowing, isFollowingViewer }: FollowRelation) {
  if (isFollowing) return '팔로잉';
  if (isFollowingViewer) return '맞팔로우';
  return '팔로우';
}
