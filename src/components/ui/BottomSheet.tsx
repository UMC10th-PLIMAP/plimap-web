import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { TopBar } from '@/components/ui/TopBar';

import { cn } from '@/lib/utils';

type SnapPoint = number | string;

const DEFAULT_SNAP_POINTS: SnapPoint[] = [0.5, 1];

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
function SheetContent({ className, children, ...props }: SheetContentProps) {
  return (
    <SheetPortal>
      <DrawerPrimitive.Content
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
  showHandle = true,
  dismissible = true,
  snapPoints = DEFAULT_SNAP_POINTS,
  defaultSnapPoint,
  className,
}: BottomSheetProps) {
  const firstSnap = defaultSnapPoint ?? snapPoints[0] ?? null;
  const lastSnap = snapPoints[snapPoints.length - 1];
  const [activeSnap, setActiveSnap] = React.useState<SnapPoint | null>(firstSnap);
  const [prevOpen, setPrevOpen] = React.useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setActiveSnap(firstSnap);
    }
  }

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
        open={open}
        dismissible={dismissible}
        shouldScaleBackground={false}
        snapPoints={snapPoints}
        fadeFromIndex={0}
        activeSnapPoint={activeSnap}
        setActiveSnapPoint={setActiveSnap}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            onClose();
          }
        }}
      >
        <SheetContent
          data-full-page={isFullPage ? '' : undefined}
          className={cn(
            'h-full max-h-full transition-[border-radius,background-color] duration-200',
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

/** 풀페이지 모드에서만 표시되는 상단 네비. 뒤로(접기)·닫기 버튼을 제공한다. */
function BottomSheetFullPageNav(props: FullPageNavProps) {
  const { isFullPage, collapse, onClose } = useBottomSheet();

  if (!isFullPage) return null;

  return <TopBar {...props} onBack={collapse} onClose={onClose} />;
}

BottomSheet.Header = BottomSheetHeader;
BottomSheet.Title = BottomSheetTitle;
BottomSheet.Content = BottomSheetContent;
BottomSheet.FullPageNav = BottomSheetFullPageNav;

export { BottomSheet, useBottomSheet };
