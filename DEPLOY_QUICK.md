# Render.com 배포 순서 (간단 요약)

## 빠른 배포 순서

### 1️⃣ PostgreSQL 데이터베이스 생성
- Render Dashboard → New + → PostgreSQL
- Name: `order-app-db`
- Plan: Free (또는 원하는 플랜)
- 생성 후 Internal Database URL 확인

### 2️⃣ 백엔드 서비스 배포
- Render Dashboard → New + → Web Service
- GitHub 저장소 연결
- 설정:
  - Name: `order-app-backend`
  - Environment: Node
  - Root Directory: `server`
  - Build Command: `npm install`
  - Start Command: `npm start`
- 환경 변수:
  ```
  NODE_ENV=production
  PORT=10000
  DB_HOST=<DB_HOST>
  DB_PORT=<DB_PORT>
  DB_NAME=<DB_NAME>
  DB_USER=<DB_USER>
  DB_PASSWORD=<DB_PASSWORD>
  ```
- 배포 후 Shell에서 실행:
  ```bash
  npm run db:init
  ```

### 3️⃣ 프런트엔드 서비스 배포
- Render Dashboard → New + → Static Site
- GitHub 저장소 연결
- 설정:
  - Name: `order-app-frontend`
  - Root Directory: `ui`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`
- 환경 변수:
  ```
  VITE_API_URL=https://order-app-backend.onrender.com/api
  ```

### 4️⃣ 완료!
- 프런트엔드 URL로 접속하여 테스트

## 참고 사항
- 자세한 가이드는 `DEPLOY.md` 파일 참고
- 데이터베이스 연결 정보는 Render Dashboard에서 확인
- 이미지 파일은 `ui/public/images` 폴더에 있어야 함

