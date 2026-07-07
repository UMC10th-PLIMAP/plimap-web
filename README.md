# PLIMAP Web

PLIMAP은 지도 위 장소에 어울리는 음악을 핀으로 남기고, 주변 장소에서 다른 사람이 남긴 음악을 발견하는 웹 서비스입니다.

이 저장소는 PLIMAP 프론트엔드 개발을 위한 협업 환경과 컨벤션을 관리합니다.

## 팀원 및 역할 분담

| 담당 영역   | 주요 화면/업무                                        | 담당자     |
| ----------- | ----------------------------------------------------- | ---------- |
| 인증/프로필 | 로그인, 회원가입, 닉네임, 프로필 사진                 | @JeongGyul |
| 메인 지도   | 지도 축척, 현재 위치, 핀 표시                         | @L0521     |
| 핀 등록     | 장소 선택, 지도 선택, 노래 검색, 상세 입력, 등록 완료 | @kim3360   |
| 핀 조회     | 장소 검색, 거리 조건 UI, 핀 선택, 곡 상세 정보        | @onebone   |

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
| Map API                  | Google Maps      |
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
pnpm dev
```

## 배포

이 저장소는 `develop` 브랜치 push 또는 GitHub Actions 수동 실행으로 테스트용 GHCR 이미지를 빌드한 뒤 배포 서버의 Docker Compose 서비스로 배포합니다. 실제 웹 서비스 배포는 별도로 Vercel에서도 진행합니다.

### GitHub Variables

| 이름                | 설명                         | 예시                      |
| ------------------- | ---------------------------- | ------------------------- |
| `DEPLOY_HOST_USER`  | SSH 접속 사용자              | `deploy`                  |
| `VITE_API_BASE_URL` | 프론트엔드가 호출할 API 주소 | `https://api.example.com` |

운영 설정값은 동일한 이름의 GitHub Secret과 Variable이 모두 있으면 Secret을 우선 사용하고, 값이 없으면 Variable, 기본값 순서로 적용합니다. 단, `DEPLOY_HOST`, `DEPLOY_HOST_KNOWN_HOSTS`, `DEPLOY_HOST_SSH_KEY`, `GHCR_PULL_TOKEN`, `VITE_GOOGLE_MAPS_API_KEY`, `VITE_KAKAO_REST_API_KEY`는 Secret만 사용합니다.

### GitHub Secrets

| 이름                       | 설명                               | 예시              |
| -------------------------- | ---------------------------------- | ----------------- |
| `DEPLOY_HOST`              | 배포 대상 서버 호스트 또는 IP      |                   |
| `DEPLOY_HOST_KNOWN_HOSTS`  | 배포 서버의 pinned known_hosts 값  |                   |
| `DEPLOY_HOST_SSH_KEY`      | 배포 서버에 접속할 SSH private key |                   |
| `DEPLOY_HOST_PORT`         | SSH 포트                           | `22`              |
| `DEPLOY_PATH`              | 서버 배포 디렉터리                 | `/opt/plimap-web` |
| `HOST_PORT`                | 서버에서 노출할 웹 포트            | `3000`            |
| `GHCR_PULL_USERNAME`       | 서버에서 GHCR 이미지를 pull할 계정 |                   |
| `GHCR_PULL_TOKEN`          | GHCR pull 권한이 있는 토큰         |                   |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API 키                 |                   |
| `VITE_KAKAO_REST_API_KEY`  | Kakao Local REST API 키            |                   |

`VITE_`로 시작하는 값은 GitHub Secrets로 관리하더라도 프론트엔드 빌드 결과물에는 포함될 수 있습니다.

### 수동 배포 검증

```bash
pnpm build
env GHCR_OWNER=owner IMAGE_TAG=test HOST_PORT=3000 docker compose -f docker-compose.prod.yml config
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
