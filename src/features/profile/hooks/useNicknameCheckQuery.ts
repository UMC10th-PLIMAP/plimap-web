import { useQuery } from '@tanstack/react-query';

import { checkNicknameAvailability } from '@/api/member';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const NICKNAME_CHECK_DEBOUNCE_MS = 400;

type UseNicknameCheckQueryParams = {
  field: 'nickname' | 'name';
  value: string;
  isCheckable: (value: string) => boolean;
};

/**
 * 닉네임 사용 가능 여부 확인 API를 디바운스해서 호출한다.
 * 이름 필드에서도 같은 API를 재사용한다.
 */
export function useNicknameCheckQuery({ field, value, isCheckable }: UseNicknameCheckQueryParams) {
  const debouncedValue = useDebouncedValue(value, NICKNAME_CHECK_DEBOUNCE_MS);
  const isSynced = debouncedValue === value;

  const { data, isFetching, isError } = useQuery({
    queryKey: ['nickname-check', field, debouncedValue],
    queryFn: () => checkNicknameAvailability(debouncedValue),
    enabled: isCheckable(debouncedValue),
  });

  return {
    result: data,
    isError,
    isChecking: !isSynced || isFetching,
  };
}
