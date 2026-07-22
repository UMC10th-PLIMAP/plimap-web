import type { MyProfile } from '../types';

type ProfileInfoProps = {
  profile: MyProfile;
};

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col min-w-[34px] items-center ">
      <span className="head-18-sb text-grayscale-100">{value}</span>
      <span className="body-15-r text-grayscale-400">{label}</span>
    </div>
  );
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  return (
    <section className="flex flex-col items-center px-4">
      <div className="flex size-22 rounded-full">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="프로필 이미지" className="size-full object-cover" />
        ) : (
          <div className="size-full  bg-pli-black-50" />
        )}
      </div>
      {profile.name && <p className="mt-2.5 body-16-r text-grayscale-500">{profile.name}</p>}
      <div className="mt-4 flex w-full max-w-[236px] h-[46px] items-center justify-between">
        <StatItem label="팔로잉" value={profile.followingCount} />
        <StatItem label="팔로워" value={profile.followerCount} />
        <StatItem label="게시물" value={profile.postCount} />
      </div>

      {profile.bio && (
        <p className="mt-5 text-center body-15-r text-grayscale-200">{profile.bio}</p>
      )}
    </section>
  );
}
