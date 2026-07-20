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

`develop` 브랜치를 대상으로 같은 저장소에서 생성한 Pull Request는 별도의 미리보기 환경도 생성합니다. PR 번호가 70이면 `https://pli-70.onebone.me`에서 확인할 수 있으며, 새 커밋이 push되면 같은 주소의 컨테이너가 교체됩니다. 공개 상태 확인까지 성공하면 워크플로가 PR에 미리보기 URL을 한 번만 댓글로 남깁니다. PR이 닫히거나 병합되면 해당 Traefik 라우트, Docker Compose 프로젝트, 배포 파일을 제거합니다. Fork에서 생성된 PR은 미리보기 배포 대상에서 제외합니다.

워크플로는 `pull_request_target`으로 base branch의 검토된 정의를 실행합니다. PR head 코드는 빌드 작업에서만 checkout하며, 배포 작업은 base commit의 `docker-compose.preview.yml`과 워크플로에 포함된 원격 스크립트만 사용합니다. 빌드가 반환한 OCI digest를 검증하고 같은 digest를 서버에서 pull하므로 배포 중 tag가 바뀌어도 다른 이미지가 실행되지 않습니다.

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

### PR 미리보기 호스트 설정

미리보기 주소는 `https://pli-<PR_NUMBER>.onebone.me` 형식입니다. 동시에 최대 12개를 유지하고, 개별 이미지 크기는 256 MiB로 제한하며, 기본 TTL은 7일입니다. 컨테이너 포트는 호스트에 publish하지 않으며, host-network Traefik이 격리된 Docker network의 컨테이너 IP로 직접 연결합니다. 컨테이너는 non-root, read-only filesystem, 제한된 tmpfs, 내부 network, capability 제거, CPU·메모리·PID·로그 제한을 사용합니다.

GitHub에는 배포용 `preview`와 자동 정리용 `preview-maintenance` Environment가 필요합니다. `preview`에는 required reviewer와 `Prevent self-review`를 켜고 관리자 bypass를 끄는 것을 권장합니다. `preview-maintenance`에는 required reviewer를 두지 않아 PR 종료 및 TTL 정리가 자동으로 실행되게 합니다. 배포 워크플로는 기존 `DEPLOY_HOST`, `DEPLOY_HOST_KNOWN_HOSTS`, `DEPLOY_HOST_SSH_KEY`, `GHCR_PULL_TOKEN`, 프론트엔드 빌드용 Secret과 Variable을 재사용합니다. 따라서 미리보기 생성과 갱신만 `preview` Environment 승인을 받은 뒤 진행됩니다.

미리보기는 프론트엔드만 격리하며 `VITE_API_BASE_URL`에 설정된 API와 기존 `VITE_*` 값을 공유합니다. `VITE_*` 값은 PR의 Docker build에서 읽을 수 있고 브라우저 번들에도 포함되므로 공개 가능한 값으로 취급하고 provider quota/referrer 제한을 적용해야 합니다. `pli-*.onebone.me`가 운영 서비스와 같은 registrable domain을 사용하는 결정에 따라 인증 쿠키는 반드시 host-only로 발급하고, CORS 및 OAuth callback은 필요한 hostname만 정확히 허용하며, CSRF 보호를 별도로 적용해야 합니다.

워크플로 정의에 포함된 호스트 계약은 공개 정보로 취급합니다. 실행 중 생성되는 상세 진단은 GitHub Actions로 전달하지 않고 호스트의 권한 제한 파일에 보관합니다. `.github/workflows/preview-reconcile.yml`은 `preview-maintenance` Environment를 사용해 매일 만료된 미리보기를 자동 정리합니다.

### 수동 배포 검증

```bash
pnpm build
env GHCR_OWNER=owner IMAGE_TAG=test HOST_PORT=3000 docker compose -f docker-compose.prod.yml config
env GHCR_OWNER=owner IMAGE_TAG=pr-70-000000000000 IMAGE_DIGEST=sha256:0000000000000000000000000000000000000000000000000000000000000000 docker compose -f docker-compose.preview.yml config
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
