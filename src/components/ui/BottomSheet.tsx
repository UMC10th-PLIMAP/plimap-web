import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { TopBar } from '@/components/ui/TopBar';

import { cn } from '@/lib/utils';

type SnapPoint = number | string;

const DEFAULT_SNAP_POINTS: SnapPoint[] = [0.5, 1];

function getViewportHeight() {
  if (typeof window === 'undefined') return 1;
  return window.innerHeight || document.documentElement.clientHeight || 1;
}

function getSnapVisibleHeight(snapPoint: SnapPoint | null, viewportHeight: number) {
  if (typeof snapPoint === 'number') return snapPoint * viewportHeight;
  if (typeof snapPoint !== 'string') return 0;

  const pixelHeight = Number.parseInt(snapPoint, 10);
  return Number.isFinite(pixelHeight) ? pixelHeight : 0;
}

/** Vaul Drawer 루트. 시트 열림/닫힘·스냅 포인트 상태를 관리한다. */
function SheetRoot({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="bottom-sheet" {...props} />;
}

/** 시트를 document body 포털로 렌더링한다. */
function SheetPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="bottom-sheet-portal" {...props} />;
}

type SheetContentProps = React.ComponentProps<typeof DrawerPrimitive.Content>;

/** 화면 하단에 고정되는 시트 패널. 기본 레이아웃·스타일을 적용한다. */
function SheetContent({ className, children, ref, ...props }: SheetContentProps) {
  return (
    <SheetPortal>
      <DrawerPrimitive.Content
        ref={ref}
        data-slot="bottom-sheet-content"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[402px] flex-col overflow-hidden',
          'rounded-t-[20px] bg-pli-black-100 pb-[env(safe-area-inset-bottom)] outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </DrawerPrimitive.Content>
    </SheetPortal>
  );
}

/** 상단 드래그 핸들. 사용자가 시트 높이를 조절할 때 잡는 영역이다. */
function SheetHandle({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Handle>) {
  return (
    <DrawerPrimitive.Handle
      data-slot="bottom-sheet-handle"
      className="mx-auto mt-[10px] !h-1 !w-[41px] !rounded-[2px] !bg-[#8A8A8A]" // Vaul이 주입하는 [data-vaul-handle] 기본 스타일이 Tailwind보다 늦게 적용되어 !로 덮어쓴다.

      {...props}
    />
  );
}

type BottomSheetContextValue = {
  isFullPage: boolean;
  onClose: () => void;
  /** 풀페이지 → 이전 스냅(절반)으로 내리기 */
  collapse: () => void;
  /** 절반 → 풀페이지로 올리기 */
  expand: () => void;
};

const BottomSheetContext = React.createContext<BottomSheetContextValue | null>(null);

/** BottomSheet 하위 컴포넌트에서 풀페이지 여부·닫기·접기 상태에 접근하는 훅. */
function useBottomSheet() {
  const context = React.useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within BottomSheet');
  }
  return context;
}

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** 시트가 열릴 때 포커스를 받을 요소. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** 시트가 닫힐 때 포커스를 돌려줄 요소. */
  finalFocusRef?: React.RefObject<HTMLElement | null>;
  /** drag handle 표시 여부 */
  showHandle?: boolean;
  /** 오버레이 클릭·드래그로 닫기 */
  dismissible?: boolean;
  /**
   * 스냅 지점(높이 단계). 기본 [0.5, 1] = 절반 → 전체.
   * 마지막 지점(끝까지 올림)에 도달하면 페이지 형식으로 전환된다.
   */
  snapPoints?: SnapPoint[];
  /** 처음 열릴 때(및 풀페이지에서 뒤로가기 시) 돌아갈 스냅 지점. 생략하면 snapPoints의 첫 값을 쓴다. */
  defaultSnapPoint?: SnapPoint;
  resetKey?: string | number;
  collapseToSmallestSignal?: number;
  trackingElementRef?: React.RefObject<HTMLElement | null>;
  keepOpenWhileMounted?: boolean;
  className?: string;
};

/**
 * 바텀시트 메인 컴포넌트.
 * 스냅 포인트(기본 절반 → 전체)를 제어하고, 마지막 스냅에 도달하면 풀페이지 UI로 전환한다.
 */
function BottomSheet({
  open,
  onClose,
  children,
  initialFocusRef,
  finalFocusRef,
  showHandle = true,
  dismissible = true,
  snapPoints = DEFAULT_SNAP_POINTS,
  defaultSnapPoint,
  resetKey,
  collapseToSmallestSignal,
  trackingElementRef,
  keepOpenWhileMounted = false,
  className,
}: BottomSheetProps) {
  const firstSnap = defaultSnapPoint ?? snapPoints[0] ?? null;
  const smallestSnap = snapPoints[0] ?? null;
  const lastSnap = snapPoints[snapPoints.length - 1];
  const [activeSnap, setActiveSnap] = React.useState<SnapPoint | null>(firstSnap);
  const [prevOpen, setPrevOpen] = React.useState(open);
  const [prevResetKey, setPrevResetKey] = React.useState(resetKey);
  const [prevCollapseSignal, setPrevCollapseSignal] = React.useState(collapseToSmallestSignal);
  const [hasBeenOpen, setHasBeenOpen] = React.useState(open);
  if (keepOpenWhileMounted && open && !hasBeenOpen) {
    setHasBeenOpen(true);
  }
  const vaulOpen = keepOpenWhileMounted ? hasBeenOpen : open;
  const [viewportHeight, setViewportHeight] = React.useState(getViewportHeight);

  if (open !== prevOpen || resetKey !== prevResetKey) {
    setPrevOpen(open);
    setPrevResetKey(resetKey);
    if (open) {
      setActiveSnap(firstSnap);
    }
  }

  if (collapseToSmallestSignal !== prevCollapseSignal) {
    setPrevCollapseSignal(collapseToSmallestSignal);
    if (open) {
      setActiveSnap(smallestSnap);
    }
  }

  React.useEffect(() => {
    const updateViewportHeight = () => setViewportHeight(getViewportHeight());
    window.addEventListener('resize', updateViewportHeight);
    return () => window.removeEventListener('resize', updateViewportHeight);
  }, []);

  const snapObserverRef = React.useRef<MutationObserver | null>(null);
  const snapReportRafRef = React.useRef<number | null>(null);

  // vaul이 드래그 중 DOM에 직접 반영하는 transform을 실시간 관찰해야 해서 콜백 ref를 쓴다 -
  // vaul/Radix가 content 노드를 교체해도(예: presence 애니메이션) 항상 최신 노드를 관찰한다.
  // 드래그 프레임을 React 상태로 올리면 지도 전체가 다시 렌더되므로 CSS 변수만 직접 갱신한다.
  const setSnapObserverTarget = React.useCallback(
    (node: HTMLDivElement | null) => {
      snapObserverRef.current?.disconnect();
      snapObserverRef.current = null;
      if (snapReportRafRef.current !== null) {
        cancelAnimationFrame(snapReportRafRef.current);
        snapReportRafRef.current = null;
      }
      if (!node) {
        trackingElementRef?.current?.style.removeProperty('--bottom-sheet-visible-height');
        return;
      }

      trackingElementRef?.current?.style.setProperty(
        '--bottom-sheet-visible-height',
        `${getSnapVisibleHeight(activeSnap, viewportHeight)}px`,
      );

      const reportFromStyle = () => {
        const match = /translate3d\(0(?:px)?,\s*(-?[\d.]+)px/.exec(node.style.transform);
        if (!match) return;
        const translateY = Number(match[1]);
        const visibleHeight = Math.min(viewportHeight, Math.max(0, viewportHeight - translateY));
        trackingElementRef?.current?.style.setProperty(
          '--bottom-sheet-visible-height',
          `${visibleHeight}px`,
        );
      };

      reportFromStyle();
      // 드래그 중엔 스타일 변경이 화면 주사율보다 잦을 수 있으므로 프레임당
      // 최대 한 번만 플로팅 UI 위치를 반영한다.
      const observer = new MutationObserver(() => {
        if (snapReportRafRef.current !== null) return;
        snapReportRafRef.current = requestAnimationFrame(() => {
          snapReportRafRef.current = null;
          reportFromStyle();
        });
      });
      observer.observe(node, { attributes: true, attributeFilter: ['style'] });
      snapObserverRef.current = observer;
    },
    [activeSnap, trackingElementRef, viewportHeight],
  );

  React.useEffect(
    () => () => {
      snapObserverRef.current?.disconnect();
      if (snapReportRafRef.current !== null) cancelAnimationFrame(snapReportRafRef.current);
      trackingElementRef?.current?.style.removeProperty('--bottom-sheet-visible-height');
    },
    [trackingElementRef],
  );

  const isFullPage = snapPoints.length > 1 && activeSnap === lastSnap;

  const collapse = React.useCallback(() => {
    setActiveSnap(firstSnap);
  }, [firstSnap]);

  const expand = React.useCallback(() => {
    setActiveSnap(lastSnap);
  }, [lastSnap]);

  return (
    <BottomSheetContext.Provider value={{ isFullPage, onClose, collapse, expand }}>
      <SheetRoot
        open={vaulOpen}
        dismissible={dismissible}
        // Radix Dialog의 기본 modal은 시트 바깥(지도) 클릭을 막으므로 modeless로 연다.
        modal={false}
        shouldScaleBackground={false}
        snapPoints={snapPoints}
        fadeFromIndex={0}
        activeSnapPoint={activeSnap}
        setActiveSnapPoint={setActiveSnap}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            if (keepOpenWhileMounted) setHasBeenOpen(false);
            onClose();
          }
        }}
      >
        <SheetContent
          ref={setSnapObserverTarget}
          onOpenAutoFocus={() => initialFocusRef?.current?.focus({ preventScroll: true })}
          onCloseAutoFocus={
            finalFocusRef
              ? (event) => {
                  event.preventDefault();
                  finalFocusRef.current?.focus({ preventScroll: true });
                }
              : undefined
          }
          data-full-page={isFullPage ? '' : undefined}
          style={{ height: `${viewportHeight}px`, maxHeight: `${viewportHeight}px` }}
          className={cn(
            'transition-[border-radius,background-color] duration-200',
            isFullPage
              ? 'rounded-none bg-pli-black-100 pt-[env(safe-area-inset-top)]'
              : 'rounded-t-2xl',
            className,
          )}
        >
          {showHandle && !isFullPage ? <SheetHandle /> : null}
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </SheetContent>
      </SheetRoot>
    </BottomSheetContext.Provider>
  );
}

type SectionProps = React.ComponentProps<'div'>;

type TitleProps = React.ComponentProps<typeof DrawerPrimitive.Title>;

/** 시트 상단 고정 영역. 제목·검색창 등 스크롤되지 않는 헤더에 사용한다. */
function BottomSheetHeader({ className, ...props }: SectionProps) {
  return <div className={className} {...props} />;
}

/** 시트 접근성 제목. Header 안의 h2를 이 컴포넌트로 감싼다. */
function BottomSheetTitle({ className, ...props }: TitleProps) {
  return <DrawerPrimitive.Title data-slot="bottom-sheet-title" className={className} {...props} />;
}

/** 시트 본문 스크롤 영역. 리스트·카드 등 긴 콘텐츠를 담는다. */
function BottomSheetContent({ className, ...props }: SectionProps) {
  return (
    <div
      className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain px-5', className)}
      {...props}
    />
  );
}

type FullPageNavProps = React.ComponentProps<typeof TopBar>;

/**
 * 풀페이지 모드에서만 표시되는 상단 네비. 뒤로·닫기 버튼을 제공한다.
 * onBack을 명시적으로 넘기면(예: 검색으로 들어온 흐름에서 검색 화면으로 돌아가기)
 * 그걸 쓰고, 없으면 기본값인 접기(collapse)로 돌아간다.
 */
function BottomSheetFullPageNav({ onBack, ...props }: FullPageNavProps) {
  const { isFullPage, collapse, onClose } = useBottomSheet();

  if (!isFullPage) return null;

  return <TopBar {...props} onBack={onBack ?? collapse} onClose={onClose} />;
}

BottomSheet.Header = BottomSheetHeader;
BottomSheet.Title = BottomSheetTitle;
BottomSheet.Content = BottomSheetContent;
BottomSheet.FullPageNav = BottomSheetFullPageNav;

export { BottomSheet, useBottomSheet };
