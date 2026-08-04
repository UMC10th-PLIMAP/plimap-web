import type { MyProfileResponse } from '@/types/member.type';

type ProfileInfoData = Pick<
  MyProfileResponse,
  'name' | 'introduction' | 'profileImageUrl' | 'followerCount' | 'followingCount'
>;

type ProfileInfoProps = {
  profile: ProfileInfoData;
  onFollowingClick?: () => void;
  onFollowerClick?: () => void;
};

function StatItem({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="head-18-sb text-grayscale-100">{value}</span>
      <span className="body-15-r text-grayscale-400">{label}</span>
    </>
  );

  if (!onClick) {
    return <div className="flex flex-col min-w-[34px] items-center">{content}</div>;
  }

  return (
    <button
      type="button"
      className="flex flex-col min-w-[34px] items-center cursor-pointer"
      onClick={onClick}
    >
      {content}
    </button>
  );
}

export function ProfileInfo({ profile, onFollowingClick, onFollowerClick }: ProfileInfoProps) {
  return (
    <section className="flex flex-col items-center px-4">
      <div className="flex size-22 rounded-full overflow-hidden">
        {profile.profileImageUrl ? (
          <img
            src={profile.profileImageUrl}
            alt="프로필 이미지"
            className="size-full object-cover rounded-full"
          />
        ) : (
          <div className="size-full bg-pli-black-50" />
        )}
      </div>
      {profile.name && <p className="mt-2.5 body-16-r text-grayscale-500">{profile.name}</p>}
      <div className="mt-4 flex w-full max-w-[236px] h-[46px] items-center justify-between">
        <StatItem label="팔로잉" value={profile.followingCount} onClick={onFollowingClick} />
        <StatItem label="팔로워" value={profile.followerCount} onClick={onFollowerClick} />
        <StatItem label="게시물" value={0} />
      </div>

      {profile.introduction && (
        <p className="mt-5 text-center body-15-r text-grayscale-200">{profile.introduction}</p>
      )}
    </section>
  );
}
