# Deployment Guide

## 환경 구분

| 환경    | 브랜치/이벤트     | 배포 위치                       | 공개 주소                          |
| ------- | ----------------- | ------------------------------- | ---------------------------------- |
| Dev     | `develop` push    | 개인 서버 Docker                | `https://dev.plimap.kr`            |
| Preview | `develop` 대상 PR | 개인 서버 격리 Docker           | `https://pr-<PR_NUMBER>.plimap.kr` |
| Prod    | `main` push       | GCP Cloud Run `plimap-web-prod` | `https://plimap.kr`                |

Dev와 Preview의 기존 개인 서버 배포는 유지합니다. Prod만 GCP Cloud Run과 External Application Load Balancer를 사용합니다.

## Prod 요청 흐름

```text
Browser
  -> GCP External Application Load Balancer (plimap.kr)
       -> /api/**, /oauth/** : plimap-api-prod
       -> other paths       : plimap-web-prod
```

프론트 Prod 이미지는 `VITE_API_BASE_URL=https://plimap.kr`로 빌드합니다. API와 OAuth는 같은 Origin의 `/api/**`, `/oauth/**` 경로를 사용하므로 Prod 브라우저 요청에는 별도 교차 Origin CORS 설정이 필요하지 않습니다.

`/actuator/**`, `/swagger-ui/**`, `/v3/api-docs/**`는 Load Balancer에서 백엔드로 전달하지 않습니다. 프론트 Nginx도 해당 경로를 `404`로 처리합니다.

## GitHub production Environment

다음 Environment Variable을 사용합니다.

- `PROD_GCP_PROJECT_ID=plimap`
- `PROD_GCP_REGION=asia-northeast3`
- `PROD_GCP_WIF_PROVIDER=projects/902362979890/locations/global/workloadIdentityPools/github-actions/providers/plimap-web-prod`
- `PROD_GCP_DEPLOYER_SERVICE_ACCOUNT=plimap-web-prod-deployer@plimap.iam.gserviceaccount.com`
- `PROD_ARTIFACT_REPOSITORY=plimap-docker`
- `PROD_CLOUD_RUN_SERVICE=plimap-web-prod`
- `PROD_RUNTIME_SERVICE_ACCOUNT=plimap-web-prod@plimap.iam.gserviceaccount.com`
- `PROD_PUBLIC_BASE_URL=https://plimap.kr`
- `PROD_PUBLIC_SMOKE_ENABLED=false` (DNS/TLS 전환 후 `true`)

다음 값은 Environment Secret으로 별도 입력합니다. 실제 값은 저장소, 이슈, Actions 로그에 기록하지 않습니다.

- `PROD_VITE_GOOGLE_MAPS_API_KEY`
- `PROD_VITE_GOOGLE_MAPS_MAP_ID`
- `PROD_VITE_KAKAO_REST_API_KEY`

브라우저에 포함되는 Vite 빌드 값은 서버 비밀로 간주할 수 없습니다. Google Maps와 Kakao 콘솔에서 Prod 키를 `https://plimap.kr` 사용으로 제한해야 합니다.

## Release 및 배포

1. `develop -> main` Release PR을 검증하고 병합합니다.
2. `Deploy Prod`가 정확한 `main` commit을 이미지로 빌드해 Artifact Registry에 push합니다.
3. 이미지 digest를 확인하고 Cloud Run에 0% candidate revision으로 배포합니다.
4. Ready 상태와 digest가 일치하면 candidate를 100%로 승격합니다.
5. DNS/TLS 전환 후에는 `PROD_PUBLIC_SMOKE_ENABLED=true`로 바꾸고 GitHub Actions의 `Deploy Prod`를 `workflow_dispatch`로 수동 재실행해 공개 루트와 예약 경로를 검증합니다.
6. 승격 후 검증에 실패하면 직전 100% revision으로 되돌립니다.

Cloud Run은 request-based billing, 1 vCPU, 512 MiB, concurrency 80, timeout 60초, min 0, max 2를 사용합니다. Ingress는 `internal-and-cloud-load-balancing`으로 제한하고 기본 `run.app` URL은 비활성화합니다.

## 최초 DNS/TLS 전환 게이트

가비아 DNS의 `plimap.kr` A 레코드는 다음 조건을 모두 만족한 뒤 Load Balancer의 글로벌 IPv4로 변경합니다.

- 프론트 Prod Environment Secret 3개 입력
- `main`에 운영 배포 workflow와 애플리케이션 코드 반영
- `plimap-web-prod` 실제 프론트 revision Ready 및 100% 트래픽 확인
- `plimap-api-prod` 실제 애플리케이션 revision Ready 및 100% 트래픽 확인
- Load Balancer의 `/`, `/api/**`, `/oauth/**` 경로 설정 확인

DNS 전파 후 Google-managed certificate가 `ACTIVE`가 되면 공개 smoke를 활성화합니다. DNS 전환 전에는 인증서가 `PROVISIONING`일 수 있습니다.
