import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import BackIcon from '@/assets/icons/back.svg?react';
import MoreIcon from '@/assets/icons/more.svg?react';

import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';
import { reportMember } from '@/api/report';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import { ReportModal } from '@/features/pin/components/ReportModal';
import { ProfileActions } from '@/features/profile/components/ProfileActions';
import { ProfileInfo } from '@/features/profile/components/ProfileInfo';
import { ProfilePinGrid } from '@/features/profile/components/ProfilePinGrid';
import { ProfileShareDialog } from '@/features/profile/components/ProfileShareDialog';
import { useOpenPinPlaceOnMap } from '@/features/pin/hooks/useOpenPinPlaceOnMap';
import { useInfiniteOtherMemberFeed } from '@/features/pin/queries/useOtherMemberFeed';
import { useToggleFollow } from '@/features/profile/queries/useToggleFollow';
import { useGoBack } from '@/hooks/useGoBack';
import { useOtherMemberProfile } from '@/hooks/useOtherMemberProfile';

const SHARE_TOAST_DURATION_MS = 2_000;

type ShareToast = {
  attempt: number;
};

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId: string }>();
  const parsedId = Number(memberId);
  const id = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : undefined;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const goBack = useGoBack('/app/home');
  const { openPinPlaceOnMap } = useOpenPinPlaceOnMap();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareToast, setShareToast] = useState<ShareToast | null>(null);
  const [trackedMemberId, setTrackedMemberId] = useState(id);

  if (id !== trackedMemberId) {
    setTrackedMemberId(id);
    setIsMoreOpen(false);
    setIsReportOpen(false);
    setIsShareOpen(false);
    setShareToast(null);
  }

  const {
    data: member,
    isPending: isMemberPending,
    isError: isMemberError,
    refetch: refetchMember,
  } = useOtherMemberProfile(id);
  const {
    data: feedPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isFeedPending,
    isError: isFeedError,
    refetch: refetchFeed,
  } = useInfiniteOtherMemberFeed({ memberId: id });
  const followMutation = useToggleFollow();

  const nickname = member?.nickname?.trim() ?? '';
  const canShareProfile = nickname.length > 0;

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '120px' },
    );

    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (!isMoreOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!moreMenuRef.current?.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreOpen]);

  return (
    <ToastProvider duration={SHARE_TOAST_DURATION_MS}>
      <div className="relative flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <header className="grid h-[60px] grid-cols-[24px_1fr_24px] items-center px-4">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={goBack}
            className="flex size-6 items-center text-grayscale-100 cursor-pointer"
          >
            <BackIcon className="size-6" />
          </button>
          <h1 className="text-center head-24-sb text-grayscale-100 truncate">
            {member?.nickname ?? ''}
          </h1>
          <div ref={moreMenuRef} className="relative flex justify-end">
            <button
              type="button"
              aria-label="더보기"
              aria-expanded={isMoreOpen}
              onClick={() => setIsMoreOpen((prev) => !prev)}
              className="flex size-6 items-center justify-end text-grayscale-100 cursor-pointer"
            >
              <MoreIcon className="size-6" />
            </button>

            {isMoreOpen ? (
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[92px] rounded-lg bg-pli-black-75 px-5 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    setIsReportOpen(true);
                  }}
                  className="body-15-m text-red cursor-pointer"
                >
                  신고하기
                </button>
              </div>
            ) : null}
          </div>
        </header>

        {member ? (
          <>
            <div className="mt-[3px] flex flex-col">
              <ProfileInfo
                profile={{
                  name: member.name,
                  introduction: member.introduction,
                  profileImageUrl: member.profileImageUrl,
                  followerCount: member.followerCount,
                  followingCount: member.followingCount,
                  pinCount: member.pinCount,
                }}
                onFollowingClick={() => {
                  if (!id) return;
                  navigate(`/app/users/${id}/following`);
                }}
                onFollowerClick={() => {
                  if (!id) return;
                  navigate(`/app/users/${id}/followers`);
                }}
              />
              <ProfileActions
                actions={[
                  {
                    label: member.isFollowing ? '팔로잉' : '팔로우',
                    onClick: () => {
                      if (followMutation.isPending || !id) return;
                      followMutation.mutate({ memberId: id, isFollowing: member.isFollowing });
                    },
                    className: member.isFollowing
                      ? undefined
                      : 'bg-neon-2 text-grayscale-1200 body-15-m',
                  },
                  {
                    label: '프로필 공유',
                    onClick: () => {
                      if (!canShareProfile) return;
                      setIsShareOpen(true);
                    },
                  },
                ]}
              />
            </div>
            <div className="mt-4 mb-4 h-[1px] bg-pli-black-50" />
            <ProfilePinGrid
              pins={feedPages?.pages.flatMap((page) => page.data) ?? []}
              isPending={isFeedPending}
              isError={isFeedError}
              onRetry={() => {
                void refetchFeed();
              }}
              onPinClick={(pin) => {
                void openPinPlaceOnMap({
                  pinId: pin.pinId,
                  fallbackPlaceName: pin.placeName,
                  isMine: false,
                  showMyRegisteredTrackCta: false,
                  // 팔로잉한 친구 피드 핀이면 장소 접근 토큰 발급
                  requestFeedPlaceAccess: Boolean(member?.isFollowing),
                });
              }}
            />
          </>
        ) : id && isMemberPending ? (
          <ProfileSkeleton />
        ) : (
          // TODO: 공통 에러 페이지/토스트 구현 시 교체 필요
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
            <p className="body-15-r text-grayscale-500">
              {isMemberError ? '프로필을 불러오지 못했어요.' : '존재하지 않는 사용자예요.'}
            </p>
            {isMemberError ? (
              <button
                type="button"
                onClick={() => refetchMember()}
                className="rounded-full bg-neon px-6 py-3 body-15-sb text-grayscale-1250"
              >
                다시 시도
              </button>
            ) : null}
          </div>
        )}

        <div ref={loadMoreRef} aria-hidden className="h-px" />

        {canShareProfile ? (
          <ProfileShareDialog
            open={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            onCopied={() => {
              setShareToast((current) => ({ attempt: (current?.attempt ?? 0) + 1 }));
            }}
            nickname={nickname}
            name={member?.name}
            profileImageUrl={member?.profileImageUrl}
          />
        ) : null}

        <ReportModal
          open={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          onSubmit={async (reason, detail) => {
            if (!id) return;
            await reportMember(id, reason, detail);
          }}
        />

        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+24px)] z-50 flex justify-center">
          {shareToast ? (
            <Toast key={shareToast.attempt} defaultOpen>
              닉네임이 복사되었어요!
            </Toast>
          ) : null}
          <ToastViewport />
        </div>
      </div>
    </ToastProvider>
  );
}
