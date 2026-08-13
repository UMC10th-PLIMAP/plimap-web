# PLIMAP Web

PLIMAP은 지도 위 장소에 어울리는 음악을 핀으로 남기고, 주변 장소에서 다른 사람이 남긴 음악을 발견하는 웹 서비스입니다.

이 저장소는 PLIMAP 프론트엔드 애플리케이션과 개발·배포 설정을 관리합니다.

## 팀원 및 역할 분담

| 담당 영역   | 주요 화면/업무                                        | 담당자     |
| ----------- | ----------------------------------------------------- | ---------- |
| 인증/프로필 | 로그인, 회원가입, 닉네임, 프로필 사진                 | @JeongGyul |
| 메인 지도   | 지도 축척, 현재 위치, 핀 표시                         | @L0521     |
| 핀 등록     | 장소 선택, 지도 선택, 노래 검색, 상세 입력, 등록 완료 | @kim3360   |
| 핀 조회     | 장소 검색, 거리 조건 UI, 핀 선택, 곡 상세 정보        | @onebone   |

## 기술 스택

| 구분             | 기술             |
| ---------------- | ---------------- |
| Framework        | React            |
| Language         | TypeScript       |
| Build Tool       | Vite             |
| Package Manager  | pnpm             |
| Styling          | Tailwind CSS     |
| UI Registry      | shadcn/ui        |
| State Management | Zustand          |
| API Client       | axios            |
| Server State     | TanStack Query   |
| Routing          | React Router     |
| Map API          | Google Maps      |
| Code Convention  | ESLint, Prettier |

## 폴더 구조

```text
src/
  api/
  assets/
  components/
  features/
    auth/
    home/
    map/
    notification/
    pin/
    profile/
    settings/
  hooks/
  layouts/
  lib/
  pages/
  routes/
  store/
  types/
  utils/
```

## 브랜치, 커밋, PR 컨벤션

### Branch

- `main`: 릴리스 기준 브랜치
- `develop`: 개발 통합 및 개발 환경 자동 배포 브랜치
- `feat/{issue-number}-{title}`: 기능 작업 브랜치

예시:

```text
feat/58-place-recommendation
```

### Commit

- `feat`: 기능 추가
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `style`: 스타일 수정
- `chore`: 설정 및 기타 작업

### PR

- 기능 단위 PR 생성
- `feat` → `develop` → `main` 흐름으로 병합
- PR 생성 전 아래 명령어로 코드 확인

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm build
```

## 실행 방법

환경 변수 예시 파일을 복사한 뒤 실제 개발용 값을 입력합니다.

```bash
cp .env.example .env
```

| 환경 변수                  | 용도               |
| -------------------------- | ------------------ |
| `VITE_API_BASE_URL`        | 백엔드 서버 origin |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API 키 |
| `VITE_GOOGLE_MAPS_MAP_ID`  | Google Maps Map ID |

`VITE_API_BASE_URL`에는 `/api`를 붙이지 않습니다. 프론트엔드 API 클라이언트가 `/api/v1/...` 경로를 추가합니다. 로컬 백엔드를 8080 포트에서 실행한다면 `.env.example`의 `http://localhost:8080` 값을 사용할 수 있습니다.

의존성을 설치하고 개발 서버를 실행합니다.

```bash
pnpm install
pnpm dev
```

## 배포

`develop`에 push된 변경 사항은 개발 환경에 자동 배포됩니다. `main`에 push된 변경 사항은 GCP Cloud Run의 운영 환경에 배포됩니다.

같은 저장소에서 `develop`을 대상으로 생성한 Pull Request에는 PR별 미리보기 환경이 제공됩니다. 미리보기 주소는 `https://pr-<PR_NUMBER>.plimap.kr` 형식이며, 예를 들어 PR #70은 `https://pr-70.plimap.kr`에서 확인할 수 있습니다. 새 커밋을 push하면 같은 주소의 미리보기가 갱신되고, 준비가 완료되면 PR에 주소가 댓글로 남습니다.

미리보기 환경은 동시에 최대 12개까지 유지되며 마지막 배포 후 7일이 지나면 열린 PR이라도 정리될 수 있습니다. 정리된 미리보기는 새 커밋을 push하면 다시 배포됩니다. PR을 닫거나 병합하면 남아 있는 미리보기는 제거됩니다. Fork에서 생성된 PR은 미리보기 대상이 아닙니다.

`release-deploy` workflow는 `API_DOMAIN` GitHub Variable을 `plimap.kr`로 설정하고 개발 환경의 `VITE_API_BASE_URL`로 `https://dev.<API_DOMAIN>`을 사용합니다. 미리보기 빌드는 `VITE_API_BASE_URL`로 `https://dev.plimap.kr`을 사용하므로 미리보기와 개발 환경은 같은 개발 API에 요청을 보냅니다. `VITE_API_BASE_URL`에는 `/api`가 포함되지 않으며 실제 API 요청 경로는 해당 origin 아래의 `/api/v1/...`입니다.

운영 환경은 `main`의 변경 사항을 GCP Cloud Run `plimap-web-prod`에 배포합니다. `plimap.kr`의 `/`은 프론트 Cloud Run으로, `/api/**`와 `/oauth/**`는 백엔드 Cloud Run으로 라우팅합니다.

운영 환경과 최초 배포 절차는 [Deployment Guide](docs/DEPLOYMENT.md)를 참고합니다.

## 화면 목록 및 플로우

### 인증 및 온보딩

- 로그인
- 카카오·Google OAuth 로그인 및 회원가입
- 이용약관 동의
- 프로필 닉네임 설정
- 프로필 사진 등록 또는 건너뛰기
- 가입 완료 안내

### 홈

- 인기 장소 및 저장한 장소 조회
- 친구가 등록한 핀과 추천 콘텐츠 확인
- 친구 검색

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
- 장소 상세 및 거리 확인
- 500m 이내 여부에 따른 핀 등록 UI 처리
- 핀 선택
- 곡 상세 정보와 등록자 프로필 확인
- 핀 좋아요, 장소 북마크, 신고

### 프로필 및 설정

- 내 프로필 및 다른 사용자 프로필 조회
- 팔로워·팔로잉 목록과 친구 검색
- 프로필 수정 및 내 핀 모아보기
- 알림 조회
- 핀 수정·삭제
- 로그아웃, 회원 탈퇴, 약관 확인
