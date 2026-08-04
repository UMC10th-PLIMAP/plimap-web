import type { ComponentProps } from 'react';

import {
  ProfileFieldMessage,
  type FieldMessage,
} from '@/features/profile/components/ProfileFieldMessage';

type ProfileTextFieldProps = Omit<ComponentProps<'input'>, 'value' | 'onChange'> & {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  countLimit: number;
  message: FieldMessage;
};

export function ProfileTextField({
  id,
  label,
  value,
  onValueChange,
  countLimit,
  message,
  ...inputProps
}: ProfileTextFieldProps) {
  const messageId = `${id}-message`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-[41px]">
        <label htmlFor={id} className="body-15-r w-[39px] shrink-0 text-grayscale-300">
          {label}
        </label>
        <div className="flex flex-1 items-center justify-between gap-2 rounded-lg border border-grayscale-1000 p-3">
          <input
            id={id}
            type="text"
            autoComplete="off"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            aria-invalid={message.tone === 'error'}
            aria-describedby={messageId}
            className="body-15-r w-full bg-transparent text-grayscale-100 outline-none placeholder:text-grayscale-700"
            {...inputProps}
          />
          <span
            className={`etc-13-r shrink-0 ${
              value.length > countLimit ? 'text-red' : 'text-grayscale-400'
            }`}
          >
            {value.length}/{countLimit}
          </span>
        </div>
      </div>
      <div className="pl-[80px]">
        <ProfileFieldMessage id={messageId} message={message} />
      </div>
    </div>
  );
}
