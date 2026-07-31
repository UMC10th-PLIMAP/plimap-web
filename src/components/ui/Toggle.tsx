import { cn } from '@/lib/utils';

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  'aria-label'?: string;
};

export function Toggle({ checked, onChange, ...props }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex h-8 w-[52px] shrink-0 items-center rounded-full px-0.5 py-1 transition-colors',
        checked ? 'justify-end bg-neon' : 'justify-start bg-pli-black-50',
      )}
      {...props}
    >
      <span
        className={cn('size-6 rounded-full bg-grayscale-0', checked && 'ring-1 ring-grayscale-300')}
      />
    </button>
  );
}
