import { useNavigate } from 'react-router-dom';
import type { MyProfileResponse } from '@/types/member.type';

type ProfileInfoProps = {
  myProfile: MyProfileResponse;
  onClick?: () => void;
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
  return (
    <button
      type="button"
      className="flex flex-col min-w-[34px] items-center cursor-pointer"
      onClick={onClick}
    >
      <span className="head-18-sb text-grayscale-100">{value}</span>
      <span className="body-15-r text-grayscale-400">{label}</span>
    </button>
  );
}

// id: number;
// nickname: string | null;
// name: string | null;
// introduction: string | null;
// profileImageObjectKey: string | null;
// followerCount: number;
// followingCount: number;
// onboardingCompletedAt: string | null;

export function ProfileInfo({ myProfile }: ProfileInfoProps) {
  const navigate = useNavigate();
  return (
    <section className="flex flex-col items-center px-4">
      <div className="flex size-22 rounded-full overflow-hidden">
        {myProfile.profileImageObjectKey ? (
          <img
            src={myProfile.profileImageObjectKey}
            alt="프로필 이미지"
            className="size-full object-cover rounded-full"
          />
        ) : (
          <div className="size-full  bg-pli-black-50" />
        )}
      </div>
      {myProfile.name && <p className="mt-2.5 body-16-r text-grayscale-500">{myProfile.name}</p>}
      <div className="mt-4 flex w-full max-w-[236px] h-[46px] items-center justify-between">
        <StatItem
          label="팔로잉"
          value={myProfile.followingCount}
          onClick={() => navigate('/app/my/following')}
        />
        <StatItem
          label="팔로워"
          value={myProfile.followingCount}
          onClick={() => navigate('/app/my/followers')}
        />
        <StatItem label="게시물" value={0} />
      </div>

      {myProfile.introduction && (
        <p className="mt-5 text-center body-15-r text-grayscale-200">{myProfile.introduction}</p>
      )}
    </section>
  );
}
