export function NotificationRowSkeleton() {
  return (
    <li className="flex items-center gap-2.5 motion-safe:animate-pulse" aria-hidden>
      <div className="size-10 shrink-0 rounded-full bg-pli-black-50" />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="h-3 rounded bg-pli-black-50" />
        <div className="h-3 w-2/3 rounded bg-pli-black-50" />
      </div>

      <div className="h-8 w-[102px] shrink-0 rounded-lg bg-pli-black-50" />
    </li>
  );
}
