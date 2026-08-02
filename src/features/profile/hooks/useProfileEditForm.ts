import { useState } from 'react';

import type { FieldMessage } from '@/features/profile/components/ProfileFieldMessage';
import { useNicknameCheckQuery } from '@/features/profile/hooks/useNicknameCheckQuery';
import {
  INTRODUCTION_MAX_LENGTH,
  validateIntroduction,
} from '@/features/profile/utils/validateIntroduction';
import { NAME_MAX_LENGTH, validateName } from '@/features/profile/utils/validateName';
import {
  NICKNAME_MAX_LENGTH,
  NICKNAME_MIN_LENGTH,
  NICKNAME_UNAVAILABLE_MESSAGE,
  validateNickname,
} from '@/features/profile/utils/validateNickname';
import type { UpdateMyProfileRequest } from '@/types/member.type';

export const NICKNAME_HELPER_MESSAGE = `한글, 영어, 숫자 포함 ${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자까지 가능해요.`;
export const NAME_HELPER_MESSAGE = `한글 ${NAME_MAX_LENGTH}자까지 가능해요.`;
export const INTRODUCTION_HELPER_MESSAGE = `한글, 영어, 숫자, 특수문자 포함 ${INTRODUCTION_MAX_LENGTH}자까지 가능해요.`;

const NICKNAME_CHECK_FAILED_MESSAGE = '닉네임 확인에 실패했어요. 다시 시도해주세요.';
const NAME_CHECK_FAILED_MESSAGE = '이름 확인에 실패했어요. 다시 시도해주세요.';

type ProfileEditValues = {
  nickname: string;
  name: string;
  introduction: string;
};

type ProfileEditField = {
  value: string;
  onValueChange: (value: string) => void;
  message: FieldMessage;
};

export function useProfileEditForm(initialValues: ProfileEditValues) {
  const [nickname, setNickname] = useState(initialValues.nickname);
  const [name, setName] = useState(initialValues.name);
  const [introduction, setIntroduction] = useState(initialValues.introduction);
  const [touched, setTouched] = useState({ nickname: false, name: false, introduction: false });

  const isNicknameUnchanged = nickname === initialValues.nickname;
  const isNameUnchanged = name === initialValues.name;
  const isIntroductionUnchanged = introduction === initialValues.introduction;

  const nicknameFormatError = validateNickname(nickname);
  const nameFormatError = validateName(name);
  const introductionFormatError = validateIntroduction(introduction);

  // 닉네임 사용 여부 확인 API 호출
  const nicknameCheck = useNicknameCheckQuery({
    field: 'nickname',
    value: nickname,
    isCheckable: (value) =>
      touched.nickname && value !== initialValues.nickname && validateNickname(value) === null,
  });

  // 이름 전용 검증 API가 없어 닉네임 확인 API를 함께 사용
  // 이름의 경우 비속어/사칭 단어(FORBIDDEN_WORD)만 오류로 간주
  const nameCheck = useNicknameCheckQuery({
    field: 'name',
    value: name,
    isCheckable: (value) =>
      touched.name &&
      value !== initialValues.name &&
      value.length > 0 &&
      validateName(value) === null,
  });

  // 닉네임, 이름, 소개 문구의 유효성 확인
  const isNameForbidden =
    nameCheck.result !== undefined &&
    !nameCheck.result.available &&
    nameCheck.result.reason === 'FORBIDDEN_WORD';

  const isNicknameValid =
    isNicknameUnchanged ||
    (nicknameFormatError === null &&
      !nicknameCheck.isChecking &&
      nicknameCheck.result?.available === true);

  const isNameValid =
    isNameUnchanged ||
    name.length === 0 ||
    (nameFormatError === null &&
      !nameCheck.isChecking &&
      nameCheck.result !== undefined &&
      !isNameForbidden);

  const isIntroductionValid = introductionFormatError === null;

  // 닉네임 필드 안내 문구 결정 로직
  const nicknameMessage: FieldMessage = (() => {
    if (!touched.nickname || isNicknameUnchanged) {
      return { text: NICKNAME_HELPER_MESSAGE, tone: 'neutral' };
    }
    if (nicknameFormatError) {
      return { text: nicknameFormatError, tone: 'error' };
    }
    if (nicknameCheck.isChecking) {
      return { text: '', tone: 'neutral' };
    }
    if (nicknameCheck.isError) {
      return { text: NICKNAME_CHECK_FAILED_MESSAGE, tone: 'error' };
    }
    if (!nicknameCheck.result) {
      return { text: '', tone: 'neutral' };
    }
    if (nicknameCheck.result.available) {
      return { text: '사용 가능한 닉네임이에요.', tone: 'success' };
    }
    return { text: NICKNAME_UNAVAILABLE_MESSAGE[nicknameCheck.result.reason], tone: 'error' };
  })();

  // 이름 필드 안내 문구 결정 로직
  const nameMessage: FieldMessage = (() => {
    if (!touched.name || isNameUnchanged || name.length === 0) {
      return { text: NAME_HELPER_MESSAGE, tone: 'neutral' };
    }
    if (nameFormatError) {
      return { text: nameFormatError, tone: 'error' };
    }
    if (nameCheck.isChecking) {
      return { text: '', tone: 'neutral' };
    }
    if (nameCheck.isError) {
      return { text: NAME_CHECK_FAILED_MESSAGE, tone: 'error' };
    }
    if (!nameCheck.result) {
      return { text: '', tone: 'neutral' };
    }
    if (isNameForbidden) {
      return { text: NICKNAME_UNAVAILABLE_MESSAGE.FORBIDDEN_WORD, tone: 'error' };
    }
    return { text: '사용 가능한 이름이에요.', tone: 'success' };
  })();

  // 소개 필드 안내 문구 결정 로직
  const introductionMessage: FieldMessage = (() => {
    if (introductionFormatError) {
      return { text: introductionFormatError, tone: 'error' };
    }
    if (!touched.introduction || introduction.length === 0) {
      return { text: INTRODUCTION_HELPER_MESSAGE, tone: 'neutral' };
    }
    return { text: '멋진 소개글이네요.', tone: 'success' };
  })();

  const isDirty = !isNicknameUnchanged || !isNameUnchanged || !isIntroductionUnchanged;

  // 요청에 포함하지 않은 필드는 변경되지 않으므로 수정한 필드만 담음
  const buildPayload = (): UpdateMyProfileRequest => ({
    ...(isNicknameUnchanged ? {} : { nickname }),
    ...(isNameUnchanged ? {} : { name }),
    ...(isIntroductionUnchanged ? {} : { introduction }),
  });

  const nicknameField: ProfileEditField = {
    value: nickname,
    onValueChange: (value) => {
      setNickname(value);
      setTouched((prev) => ({ ...prev, nickname: true }));
    },
    message: nicknameMessage,
  };

  const nameField: ProfileEditField = {
    value: name,
    onValueChange: (value) => {
      setName(value);
      setTouched((prev) => ({ ...prev, name: true }));
    },
    message: nameMessage,
  };

  const introductionField: ProfileEditField = {
    value: introduction,
    onValueChange: (value) => {
      setIntroduction(value);
      setTouched((prev) => ({ ...prev, introduction: true }));
    },
    message: introductionMessage,
  };

  return {
    nicknameField,
    nameField,
    introductionField,
    isDirty,
    isValid: isNicknameValid && isNameValid && isIntroductionValid,
    buildPayload,
  };
}
