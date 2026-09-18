import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@/assets/icons/settings.svg?react';
import ShareIcon from '@/assets/icons/share.svg?react';

import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';
import { useToast } from '@/hooks/useToast';
import { ProfileActions } from '@/features/profile/components/ProfileActions';
import { ProfileInfo } from '@/features/profile/components/ProfileInfo';
import { ProfilePinGrid } from '@/features/profile/components/ProfilePinGrid';
import { ProfileShareDialog } from '@/features/profile/components/ProfileShareDialog';

import { useOpenPinPlaceOnMap } from '@/features/pin/hooks/useOpenPinPlaceOnMap';
import { useInfiniteMemberMe } from '@/features/pin/queries/useMemberMe';
import { useMyProfile } from '@/hooks/useMyProfile';
import { cn } from '@/lib/utils';
import { getUnlockedCharacters } from '@/features/ai-mvp/mockAi';
import { useAiMvpStore } from '@/features/ai-mvp/useAiMvpStore';
import { SongSelectSheet } from '@/features/pin/components/SongSelectSheet';

const MY_PROFILE_STALE_TIME = 60 * 1000;

export default function MyProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: myProfile } = useMyProfile({ staleTime: MY_PROFILE_STALE_TIME });
  const { openPinPlaceOnMap } = useOpenPinPlaceOnMap({
    errorToastPlacement: 'above-navigation',
  });
  const {
    data: memberMePages,
    isPending: isMemberMePending,
    isError: isMemberMeError,
    refetch: refetchMemberMe,
  } = useInfiniteMemberMe();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSongSelectOpen, setIsSongSelectOpen] = useState(false);
  const representativeMusicButtonRef = useRef<HTMLButtonElement>(null);
  const selectedCharacterId = useAiMvpStore((state) => state.selectedCharacterId);
  const setSelectedCharacterId = useAiMvpStore((state) => state.setSelectedCharacterId);
  const representativeTrack = useAiMvpStore((state) => state.representativeTrack);
  const setRepresentativeTrack = useAiMvpStore((state) => state.setRepresentativeTrack);

  // 실제로는 AuthGuard에서 캐시가 저장되기 때문에 myProfile이 undefined인 경우가 거의 없음
  // 하지만 혹시 모르니 skeleton을 띄워줌
  if (!myProfile) return <ProfileSkeleton />;

  const nickname = myProfile.nickname?.trim() ?? '';
  const canShareProfile = nickname.length > 0;
  const unlockedCharacters = getUnlockedCharacters(myProfile.pinCount);

  return (
    <>
      <div className="relative flex flex-col pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+108px)]">
        <header className="grid h-[60px] grid-cols-[24px_1fr_24px] items-center px-4">
          <div />
          <h1 className="text-center head-24-sb text-grayscale-100">{myProfile.nickname}</h1>
          <button
            type="button"
            aria-label="설정"
            onClick={() => navigate('/app/settings')}
            className="flex size-6 items-center text-grayscale-100 cursor-pointer"
          >
            <SettingsIcon className="size-6" />
          </button>
        </header>

        <div className="mt-[3px] flex flex-col ">
          <ProfileInfo
            profile={myProfile}
            onFollowingClick={() => navigate('/app/my/following')}
            onFollowerClick={() => navigate('/app/my/followers')}
          />
          <ProfileActions
            actions={[
              {
                label: '프로필 편집',
                onClick: () => navigate('/app/my/edit'),
              },
              {
                label: '내 PLIMAP',
                onClick: () => navigate('/app/my/plimap'),
              },
              {
                label: <ShareIcon />,
                onClick: () => {
                  if (!canShareProfile) return;
                  setIsShareOpen(true);
                },
                'aria-label': '프로필 공유',
                className: cn(
                  'max-w-9 max-h-9 shrink-0',
                  !canShareProfile && 'cursor-not-allowed opacity-40',
                ),
              },
            ]}
          />

          <section className="mt-3 px-4" aria-labelledby="my-character-title">
            <div className="flex items-end justify-between">
              <div>
                <h2 id="my-character-title" className="head-20-sb text-grayscale-100">
                  내 캐릭터
                </h2>
                <p className="mt-1 body-15-r text-grayscale-500">
                  기본 3종 제공 · PIN 10개마다 새 캐릭터가 생겨요
                </p>
              </div>
              <span className="etc-13-r text-neon-2">{unlockedCharacters.length}개 보유</span>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                type="button"
                aria-pressed={selectedCharacterId === null}
                onClick={() => setSelectedCharacterId(null)}
                className={cn(
                  'flex h-32 w-25 shrink-0 flex-col items-center justify-center rounded-2xl border bg-pli-black-85 px-2 text-center',
                  selectedCharacterId === null ? 'border-neon' : 'border-pli-black-50',
                )}
              >
                <span className="text-3xl" aria-hidden>
                  📍
                </span>
                <span className="mt-2 etc-13-r text-grayscale-300">기본 마커</span>
              </button>

              {unlockedCharacters.map((character) => {
                const selected = selectedCharacterId === character.id;
                return (
                  <button
                    key={character.id}
                    type="button"
                    aria-label={`${character.name} 캐릭터 선택`}
                    aria-pressed={selected}
                    onClick={() => setSelectedCharacterId(character.id)}
                    className={cn(
                      'relative h-32 w-25 shrink-0 overflow-hidden rounded-2xl border bg-gradient-to-b p-2 text-center',
                      character.gradient,
                      selected ? 'border-neon ring-2 ring-neon/30' : 'border-transparent',
                    )}
                  >
                    <span className="flex h-20 items-center justify-center text-4xl" aria-hidden>
                      {character.emoji}
                    </span>
                    {character.cardUrl ? (
                      <img
                        src={character.cardUrl}
                        alt=""
                        className="absolute inset-0 size-full object-contain object-bottom p-1 pb-7"
                        onError={(event) => {
                          event.currentTarget.hidden = true;
                        }}
                      />
                    ) : null}
                    <span className="relative z-10 block truncate rounded-full bg-black/55 px-2 py-1 etc-12-r text-white">
                      {character.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-6 px-4" aria-labelledby="representative-music-title">
            <div className="flex items-center justify-between">
              <h2 id="representative-music-title" className="head-20-sb text-grayscale-100">
                대표 음악
              </h2>
              {representativeTrack ? (
                <button
                  type="button"
                  onClick={() => setRepresentativeTrack(null)}
                  className="etc-13-r text-grayscale-500"
                >
                  해제
                </button>
              ) : null}
            </div>
            <button
              ref={representativeMusicButtonRef}
              type="button"
              onClick={() => setIsSongSelectOpen(true)}
              className="mt-3 flex w-full items-center gap-3 rounded-xl bg-pli-black-85 p-3 text-left"
            >
              {representativeTrack?.artworkUrl ? (
                <img
                  src={representativeTrack.artworkUrl}
                  alt=""
                  className="size-14 rounded-lg object-cover"
                />
              ) : (
                <span
                  className="flex size-14 items-center justify-center rounded-lg bg-pli-black-75 text-2xl"
                  aria-hidden
                >
                  🎵
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate body-17-m text-grayscale-100">
                  {representativeTrack?.trackName ?? '대표 음악을 설정해 보세요'}
                </span>
                <span className="block truncate body-15-r text-grayscale-500">
                  {representativeTrack?.artistName ?? '프로필에 나를 닮은 노래를 보여줘요'}
                </span>
              </span>
              <span className="body-15-m text-neon-2">변경</span>
            </button>
          </section>
        </div>
        <div className="mt-4 mb-4 h-[1px] bg-pli-black-50" />
        <ProfilePinGrid
          pins={memberMePages?.pages.flatMap((page) => page.data) ?? []}
          isPending={isMemberMePending}
          isError={isMemberMeError}
          onRetry={() => {
            void refetchMemberMe();
          }}
          onPinClick={(pin) => {
            void openPinPlaceOnMap({
              pinId: pin.pinId,
              placeTrackId: pin.placeTrackId,
              fallbackPlaceName: pin.placeName,
              isMine: true,
              showMyRegisteredTrackCta: true,
              showMapBackButton: true,
            });
          }}
          onRegisterPin={() => navigate('/app')}
        />

        {canShareProfile ? (
          <ProfileShareDialog
            open={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            onCopied={() => {
              toast.success('닉네임이 복사되었어요!', { placement: 'above-navigation' });
            }}
            nickname={nickname}
            name={myProfile.name}
            profileImageUrl={myProfile.profileImageUrl}
          />
        ) : null}

        <SongSelectSheet
          open={isSongSelectOpen}
          onClose={() => setIsSongSelectOpen(false)}
          onSelect={setRepresentativeTrack}
          finalFocusRef={representativeMusicButtonRef}
          preventOpenAutoFocus
        />
      </div>
    </>
  );
}
