import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import LocationIcon from '@/assets/icons/location.svg?react';
import { useToast } from '@/hooks/useToast';
import { Tag } from '@/components/ui/tag';
import { TAG_OPTIONS } from '@/features/pin/data/songPreview';
import { useDeletePin } from '@/features/pin/queries/useDeletePin';
import { usePatchPin } from '@/features/pin/queries/usePatchPin';
import { usePinDetail } from '@/features/pin/queries/usePinDetail';
import { usePlaceDetail } from '@/features/pin/queries/usePlaceBookmark';
import { useCurrentPosition } from '@/hooks/useCurrentPosition';
import { cn } from '@/lib/utils';

const INTRO_MAX_LENGTH = 100;
const MAX_TAG_COUNT = 4;

export type PinEditLocationState = {
  title?: string;
  artist?: string;
  albumImageUrl?: string;
  placeName?: string;
  introduction?: string;
  tags?: string[];
  feedOpen?: boolean;
};

function areSameTags(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((tag, index) => tag === sortedB[index]);
}

function FeedVisibilityToggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex h-8 w-[52px] items-center rounded-full px-0.5 transition-colors disabled:opacity-60',
        checked ? 'justify-end bg-neon' : 'justify-start bg-pli-black-50',
      )}
    >
      <span aria-hidden className="size-7 rounded-full bg-grayscale-0" />
    </button>
  );
}

export default function PinEditPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { pinId } = useParams<{ pinId: string }>();
  const location = useLocation();
  const locationState = (location.state as PinEditLocationState | null) ?? null;

  const { data: pinDetail, isPending: isPinDetailPending } = usePinDetail({ pinId });
  const { data: currentPosition } = useCurrentPosition({
    enabled: Boolean(pinDetail?.placeId),
  });
  const placeDetailQuery = usePlaceDetail({
    placeId: pinDetail?.placeId ?? null,
    latitude: currentPosition?.latitude ?? pinDetail?.latitude ?? 0,
    longitude: currentPosition?.longitude ?? pinDetail?.longitude ?? 0,
    enabled: Boolean(pinDetail?.placeId),
  });

  const patchPinMutation = usePatchPin();
  const deletePinMutation = useDeletePin();
  const isMutating = patchPinMutation.isPending || deletePinMutation.isPending;

  const baselineIntroduction = locationState?.introduction ?? pinDetail?.introduction ?? '';
  const baselineTags = locationState?.tags ?? pinDetail?.tags;
  const baselineFeedOpen = locationState?.feedOpen ?? pinDetail?.feedOpen;

  const [introductionDraft, setIntroductionDraft] = useState<string | null>(
    locationState?.introduction ?? null,
  );
  const [tagsDraft, setTagsDraft] = useState<string[] | null>(locationState?.tags ?? null);
  const [feedOpenDraft, setFeedOpenDraft] = useState<boolean | null>(
    locationState?.feedOpen ?? null,
  );

  const introduction = introductionDraft ?? baselineIntroduction;
  const selectedTags = tagsDraft ?? baselineTags ?? [];
  const isFeedPublic = feedOpenDraft ?? baselineFeedOpen ?? false;
  const isFeedVisibilityKnown = baselineFeedOpen !== undefined;

  const hasIntroductionChanged = introduction !== baselineIntroduction;
  const hasTagsChanged =
    tagsDraft !== null && (baselineTags === undefined || !areSameTags(selectedTags, baselineTags));
  const hasFeedOpenChanged =
    feedOpenDraft !== null && baselineFeedOpen !== undefined && isFeedPublic !== baselineFeedOpen;
  const hasChanges = hasIntroductionChanged || hasTagsChanged || hasFeedOpenChanged;
  const isBaselineReady = Boolean(locationState) || Boolean(pinDetail);

  const coverUrl = locationState?.albumImageUrl || pinDetail?.albumImageUrl || '';
  const title = locationState?.title ?? 'PIN 수정';
  const artist = locationState?.artist ?? '';
  const placeName = locationState?.placeName || placeDetailQuery.data?.placeName || '';

  const toggleTag = (tag: string) => {
    setTagsDraft((prev) => {
      const current = prev ?? baselineTags ?? [];
      if (current.includes(tag)) return current.filter((item) => item !== tag);
      if (current.length >= MAX_TAG_COUNT) return current;
      return [...current, tag];
    });
  };

  const handleSubmit = () => {
    if (!pinId || isMutating || !isBaselineReady || !hasChanges) return;

    const normalizedIntroduction = introduction.trim();
    if (!normalizedIntroduction) {
      toast.error('소개를 입력해 주세요.');
      return;
    }

    const request = {
      pinId,
      ...(hasIntroductionChanged ? { introduction: normalizedIntroduction } : {}),
      ...(hasTagsChanged ? { tags: selectedTags } : {}),
      ...(hasFeedOpenChanged ? { feedOpen: isFeedPublic } : {}),
    };

    patchPinMutation.mutate(request, {
      onSuccess: () => navigate(-1),
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : '핀을 수정하지 못했어요. 다시 시도해 주세요.',
        );
      },
    });
  };

  const handleDelete = () => {
    if (!pinId || isMutating) return;

    deletePinMutation.mutate(pinId, {
      onSuccess: () => navigate(-1),
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : '핀을 삭제하지 못했어요. 다시 시도해 주세요.',
        );
      },
    });
  };

  return (
    <>
      <div className="relative flex min-h-0 flex-1 bg-pli-black-100">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain scrollbar-hide pb-[calc(env(safe-area-inset-bottom)+48px)]">
          <section className="relative w-full">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[349px] w-full object-cover opacity-12 blur-[8px]"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[349px] bg-gradient-to-b from-pli-black-100/0 from-[61%] to-pli-black-100"
            />

            <div className="relative z-10 flex flex-col gap-6 pt-[env(safe-area-inset-top)]">
              <div className="flex flex-col">
                <div className="flex h-[60px] items-center justify-between p-5">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={isMutating}
                    className="cursor-pointer body-17-r text-grayscale-400 disabled:cursor-not-allowed disabled:text-grayscale-700"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isMutating || !hasChanges || !isBaselineReady || isPinDetailPending}
                    aria-busy={patchPinMutation.isPending || undefined}
                    className={cn(
                      'cursor-pointer body-17-m disabled:cursor-not-allowed',
                      hasChanges && isBaselineReady
                        ? 'text-grayscale-0'
                        : 'text-grayscale-1000 disabled:text-grayscale-1000',
                    )}
                  >
                    {patchPinMutation.isPending ? '저장 중' : '완료'}
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  {coverUrl ? (
                    <img src={coverUrl} alt="" className="size-[112px] rounded-lg object-cover" />
                  ) : (
                    <div className="size-[112px] rounded-lg bg-pli-black-75" aria-hidden />
                  )}
                  <div className="mt-3 flex w-full flex-col items-center text-center">
                    <h2 className="head-24-sb text-grayscale-100">{title}</h2>
                    {artist ? <p className="body-15-r text-grayscale-500">{artist}</p> : null}
                  </div>
                  {placeName ? (
                    <p className="flex items-center gap-1 py-0.5 body-15-m text-grayscale-300">
                      <LocationIcon className="size-4 text-neon" aria-hidden />
                      {placeName}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex w-full flex-col gap-6 px-4">
                <section className="flex flex-col gap-3">
                  <h3 className="body-15-r text-grayscale-300">소개</h3>
                  <div className="flex flex-col gap-3 rounded-xl bg-pli-black-85 p-5">
                    <label htmlFor="pin-edit-intro" className="sr-only">
                      소개
                    </label>
                    <textarea
                      id="pin-edit-intro"
                      value={introduction}
                      onChange={(event) =>
                        setIntroductionDraft(event.target.value.slice(0, INTRO_MAX_LENGTH))
                      }
                      placeholder="이 음악을 들었을 때 나의 기분은?"
                      disabled={isMutating}
                      className="body-15-r h-[88px] w-full resize-none bg-transparent text-grayscale-300 outline-none placeholder:text-grayscale-1100"
                    />
                    <div className="flex h-4 items-center justify-end etc-13-r text-grayscale-500">
                      {introduction.length}/100
                    </div>
                  </div>
                </section>

                <section className="flex flex-col gap-3">
                  <h3 className="body-15-r text-grayscale-300">
                    태그 <span className="etc-13-r text-grayscale-700">(최대 4개)</span>
                  </h3>
                  <div className="grid grid-cols-5 justify-items-center gap-x-2 gap-y-3 pt-3">
                    {TAG_OPTIONS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <Tag
                          key={tag}
                          variant={isSelected ? 'selected' : 'default'}
                          disabled={isMutating}
                          onClick={() => toggleTag(tag)}
                        >
                          #{tag}
                        </Tag>
                      );
                    })}
                  </div>
                </section>

                <section className="flex flex-col gap-3">
                  <span className="body-15-r text-grayscale-300">피드 공개</span>
                  {isFeedVisibilityKnown ? (
                    <FeedVisibilityToggle
                      checked={isFeedPublic}
                      onChange={(checked) => setFeedOpenDraft(checked)}
                      disabled={isMutating}
                    />
                  ) : (
                    <p className="etc-13-r text-grayscale-700">
                      공개 상태를 불러올 수 없어 이번 수정에서는 기존 설정을 유지해요.
                    </p>
                  )}
                </section>

                <div className="flex justify-center pt-[5px]">
                  <button
                    type="button"
                    disabled={isMutating || !pinId}
                    onClick={handleDelete}
                    className="flex h-[53px] w-[180px] cursor-pointer items-center justify-center rounded-[50px] bg-pli-black-75 body-15-m text-red disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    삭제하기
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
