import CheckIcon from '@/assets/icons/check.svg?react';

type TermCheckboxProps = {
  checked: boolean;
  onToggle: () => void;
  label: string;
};

export function TermCheckbox({ checked, onToggle, label }: TermCheckboxProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      aria-label={label}
      className={`flex size-6 shrink-0 items-center justify-center ${
        checked ? 'text-neon' : 'text-grayscale-900'
      }`}
    >
      <CheckIcon />
    </button>
  );
}
