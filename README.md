# PLIMAP Web

PLIMAP은 지도 위 장소에 어울리는 음악을 핀으로 남기고, 주변 장소에서 다른 사람이 남긴 음악을 발견하는 웹 서비스입니다.

이 저장소는 PLIMAP 프론트엔드 개발을 위한 협업 환경과 컨벤션을 관리합니다.

## 팀원 및 역할 분담

| 담당 영역   | 주요 화면/업무                                        | 담당자 |
| ----------- | ----------------------------------------------------- | ------ |
| 인증/프로필 | 로그인, 회원가입, 닉네임, 프로필 사진                 | 최정규 |
| 메인 지도   | 지도 축척, 현재 위치, 핀 표시                         | 이승준 |
| 핀 등록     | 장소 선택, 지도 선택, 노래 검색, 상세 입력, 등록 완료 | 김태우 |
| 핀 조회     | 장소 검색, 거리 조건 UI, 핀 선택, 곡 상세 정보        | TBD    |

## 기술 스택

| 구분                     | 기술             |
| ------------------------ | ---------------- |
| Framework                | React            |
| Language                 | TypeScript       |
| Build Tool               | Vite             |
| Package Manager          | pnpm             |
| Styling                  | Tailwind CSS     |
| UI Registry              | shadcn/ui        |
| State Management         | Zustand          |
| API Client               | axios            |
| Server State             | TanStack Query   |
| Routing                  | React Router     |
| Map API                  | Naver Maps       |
| Place Search / Geocoding | Kakao Local      |
| Code Convention          | ESLint, Prettier |

## 폴더 구조

```text
src/
  api/
  hooks/
  features/
    auth/
    map/
    pin/
    profile/
  routes/
  store/
  types/
  utils/
```

## 브랜치, 커밋, PR 컨벤션

### Branch

- `main`: 배포 기준 브랜치
- `develop`: 개발 통합 브랜치
- `feat/{issue-number}-{title}`: 기능 작업 브랜치

예시:

```text
feat/58-savings-recommendation
```

### Commit

- `feat`: 기능 추가
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `style`: 스타일 수정
- `chore`: 설정 및 기타 작업

### PR

- 기능 단위 PR 생성
- `feature` → `develop` → `main` 흐름으로 병합
- PR 생성 전 아래 명령어로 코드 확인

```bash
pnpm lint:fix
pnpm format
```

## 실행 방법

```bash
pnpm install
```

## 화면 목록 및 플로우

### 인증 및 온보딩

- 로그인
- 카카오 회원가입
- 구글 회원가입
- 프로필 닉네임 설정
- 프로필 사진 등록

### 메인 지도

- 축척에 따른 메인 지도 화면
- 현재 위치 기반 지도 표시
- 지도 위 핀 표시
- 등록하기 버튼 진입

### 핀 등록 플로우

- 등록하기 버튼 선택
- 장소 검색 또는 지도에서 위치 선택
- 핀 등록 가능 여부 확인
- 노래 검색
- 상세 정보 입력
- 등록 완료

### 핀 조회 플로우

- 장소 검색
- 원하는 장소 선택
- 500m 이내/밖 여부에 따른 UI 처리
- 핀 선택
- 곡 상세 정보 확인
