export type FieldMessageTone = 'neutral' | 'success' | 'error';

export type FieldMessage = {
  text: string;
  tone: FieldMessageTone;
};

const FIELD_MESSAGE_TONE_CLASS: Record<FieldMessageTone, string> = {
  neutral: 'text-grayscale-500',
  success: 'text-green',
  error: 'text-red',
};

type ProfileFieldMessageProps = {
  id: string;
  message: FieldMessage;
};

export function ProfileFieldMessage({ id, message }: ProfileFieldMessageProps) {
  return (
    <p
      id={id}
      aria-live="polite"
      className={`etc-13-r min-h-5 ${FIELD_MESSAGE_TONE_CLASS[message.tone]}`}
    >
      {message.text}
    </p>
  );
}
