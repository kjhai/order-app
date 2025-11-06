# 환경 변수 파일 사용 가이드

## ⚠️ 중요: Render 배포 시에는 사용하지 않습니다!

### Render.com 배포 시
- ❌ `.env.production` 파일을 Git에 커밋하지 마세요
- ✅ Render Dashboard의 Environment Variables에서 설정하세요
- Render는 빌드 시 Dashboard의 환경 변수를 주입합니다

### 로컬 개발용 (선택사항)
로컬에서 프로덕션 빌드를 테스트할 때만 사용할 수 있습니다:

1. `ui/.env.production.local` 파일 생성 (Git에 커밋되지 않음)
2. 내용:
   ```
   VITE_API_URL=https://order-app-backend.onrender.com/api
   ```
3. 로컬에서 빌드 테스트:
   ```bash
   npm run build
   npm run preview
   ```

## Render 배포 시 올바른 방법

### 방법 1: Render Dashboard에서 설정 (권장)
1. Static Site 서비스 → Environment
2. Key: `VITE_API_URL`
3. Value: `https://order-app-backend.onrender.com/api`
4. Save

### 방법 2: render.yaml 사용 (고급)
`render.yaml` 파일에 환경 변수를 정의할 수 있지만,
Static Site의 경우 Dashboard에서 설정하는 것이 더 간단합니다.

## 왜 파일을 사용하지 않나요?

1. **보안**: URL이나 민감한 정보가 Git에 노출될 수 있음
2. **유연성**: 환경별로 다른 URL을 쉽게 변경 가능
3. **표준**: Render.com의 표준 방법
4. **자동화**: 환경 변수 변경 시 자동 재배포

## 결론

- ✅ Render 배포: Dashboard에서 환경 변수 설정
- ✅ 로컬 개발: `.env.production.local` 파일 사용 가능 (Git에 커밋 안 됨)
- ❌ `.env.production` 파일을 Git에 커밋하지 마세요

