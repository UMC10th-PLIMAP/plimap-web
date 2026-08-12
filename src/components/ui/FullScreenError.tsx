import ErrorIcon from '@/assets/error/error.svg';
import NetworkIcon from '@/assets/error/network-base.svg';
import NetworkIconDot from '@/assets/error/network-overlay.svg';
import NotFoundIcon from '@/assets/error/not-found.svg';
import SessionIcon from '@/assets/error/session.svg';
import { cn } from '@/lib/utils';

export type FullScreenErrorVariant =
  'map' | 'session' | 'not-found' | 'network' | 'forbidden' | 'unknown';

type ErrorContent = {
  title: string;
  description: string;
  actionLabel: string;
  icon: 'error' | 'session' | 'not-found' | 'network';
};

const ERROR_CONTENT: Record<FullScreenErrorVariant, ErrorContent> = {
  map: {
    title: '지도를 불러오지 못했어요.',
    description: '일시적인 오류이거나 네트워크 상태가 불안정해요.',
    actionLabel: '다시 시도하기',
    icon: 'error',
  },
  session: {
    title: '세션이 만료되었어요.',
    description: '안전한 서비스 이용을 위해 다시 로그인해주세요.',
    actionLabel: '다시 시도하기',
    icon: 'session',
  },
  'not-found': {
    title: '페이지를 찾을 수 없어요.',
    description: '삭제되었거나 잘못된 접근이에요.',
    actionLabel: '이전 화면으로 돌아가기',
    icon: 'not-found',
  },
  network: {
    title: '네트워크 연결이 끊어졌어요.',
    description: 'Wi-fi 또는 셀룰러 데이터 연결 상태를 확인해주세요.',
    actionLabel: '다시 시도하기',
    icon: 'network',
  },
  forbidden: {
    title: '접근 권한이 없어요.',
    description: '요청한 페이지 또는 기능에 접근할 수 없어요.',
    actionLabel: '이전 화면으로 돌아가기',
    icon: 'error',
  },
  unknown: {
    title: '문제가 발생했어요.',
    description: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
    actionLabel: '다시 시도하기',
    icon: 'error',
  },
};

type FullScreenErrorProps = {
  variant: FullScreenErrorVariant;
  onAction: () => void;
  className?: string;
};

function ErrorStateIcon({ icon }: Pick<ErrorContent, 'icon'>) {
  if (icon === 'session') {
    return (
      <span className="relative block size-10 overflow-hidden" aria-hidden>
        <img
          src={SessionIcon}
          alt=""
          className="absolute inset-[4.17%_16.67%_8.33%_16.67%] h-[87.5%] w-[66.66%]"
        />
      </span>
    );
  }

  if (icon === 'not-found') {
    return (
      <span className="relative block size-10 overflow-hidden" aria-hidden>
        <img
          src={NotFoundIcon}
          alt=""
          className="absolute left-[8.75%] top-[0.42%] h-[99.17%] w-[82.5%]"
        />
      </span>
    );
  }

  if (icon === 'network') {
    return (
      <span className="relative block size-10 overflow-hidden" aria-hidden>
        <img
          src={NetworkIcon}
          alt=""
          className="absolute inset-[4.35%_3.73%_3.73%_4.35%] h-[91.92%] w-[91.92%]"
        />
        <img
          src={NetworkIconDot}
          alt=""
          className="absolute inset-[70%_42.5%_15%_42.5%] size-[15%]"
        />
      </span>
    );
  }

  return <img src={ErrorIcon} alt="" className="size-10" aria-hidden />;
}

export function FullScreenError({ variant, onAction, className }: FullScreenErrorProps) {
  const content = ERROR_CONTENT[variant];
  const titleId = `full-screen-error-${variant}`;

  return (
    <section
      role="alert"
      aria-labelledby={titleId}
      className={cn(
        'flex min-h-0 flex-1 items-center justify-center bg-pli-black-100 px-6 pt-[env(safe-area-inset-top)] text-center',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-[65px]">
        <div className="flex flex-col items-center gap-9">
          <ErrorStateIcon icon={content.icon} />

          <div className="flex flex-col items-center gap-0.5 break-keep">
            <h1 id={titleId} className="body-17-m text-grayscale-300">
              {content.title}
            </h1>
            <p className="body-15-m text-grayscale-700">{content.description}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAction}
          className="cursor-pointer body-15-m text-grayscale-300 underline underline-offset-2"
        >
          {content.actionLabel}
        </button>
      </div>
    </section>
  );
}
