# Render.com 배포 가이드

## 배포 순서

### 1단계: PostgreSQL 데이터베이스 생성

1. Render.com에 로그인하고 **Dashboard**로 이동
2. **New +** 버튼 클릭 → **PostgreSQL** 선택
3. 데이터베이스 설정:
   - **Name**: `order-app-db`
   - **Database**: `order_app` (또는 원하는 이름)
   - **User**: `order_app_user` (또는 원하는 이름)
   - **Plan**: Free (또는 원하는 플랜)
   - **Region**: 가장 가까운 리전 선택
4. **Create Database** 클릭
5. 데이터베이스가 생성되면 **Connections** 탭에서 연결 정보 확인:
   - Internal Database URL (이것을 사용)
   - 또는 각각의 값들 (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)

### 2단계: 백엔드 서비스 배포

1. Render Dashboard에서 **New +** → **Web Service** 선택
2. GitHub 저장소 연결:
   - 저장소를 GitHub에 푸시했는지 확인
   - GitHub 저장소 선택
   - Auto-Deploy: Yes (선택사항)
3. 서비스 설정:
   - **Name**: `order-app-backend`
   - **Environment**: `Node`
   - **Region**: 데이터베이스와 같은 리전 선택
   - **Branch**: `main` (또는 기본 브랜치)
   - **Root Directory**: `server` (백엔드 폴더)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. 환경 변수 설정 (Environment Variables):
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=<데이터베이스의 호스트>
   DB_PORT=<데이터베이스의 포트>
   DB_NAME=<데이터베이스 이름>
   DB_USER=<데이터베이스 사용자>
   DB_PASSWORD=<데이터베이스 비밀번호>
   ```
   - 데이터베이스의 Internal Database URL을 파싱하거나 개별 값 사용
   - 또는 데이터베이스 서비스와 연결하여 자동으로 가져오기
5. **Create Web Service** 클릭
6. 배포 완료 후 서비스 URL 확인 (예: `https://order-app-backend.onrender.com`)

### 3단계: 데이터베이스 초기화

백엔드가 배포되면 다음 명령어들을 실행해야 합니다:

**방법 1: Render Shell 사용**
1. 백엔드 서비스의 **Shell** 탭으로 이동
2. 다음 명령어 실행:
   ```bash
   cd server
   npm run db:tables
   npm run db:seed
   npm run db:update-images
   ```

**방법 2: 배포 후 자동 실행 스크립트 사용**
- `server/scripts/init-db.js` 파일을 만들어서 배포 시 자동 실행되도록 설정

### 4단계: 프런트엔드 서비스 배포

1. Render Dashboard에서 **New +** → **Static Site** 선택
2. GitHub 저장소 연결:
   - 같은 저장소 선택
   - Branch: `main`
3. 빌드 설정:
   - **Name**: `order-app-frontend`
   - **Root Directory**: `ui`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. 환경 변수 설정:
   ```
   VITE_API_URL=https://order-app-backend.onrender.com/api
   ```
   - 백엔드 서비스의 실제 URL로 변경
5. **Create Static Site** 클릭

### 5단계: 프런트엔드 API URL 업데이트

프런트엔드 코드에서 API URL을 환경 변수로 사용하도록 수정:

1. `ui/src/api.js` 파일 수정:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
   ```

2. 변경사항 커밋 및 푸시 (자동 재배포)

### 6단계: 이미지 파일 배포

이미지 파일 (`ui/public/images/*.jpg`)은 Git에 포함되어 있으면 자동으로 배포됩니다.

## 중요 사항

1. **환경 변수 보안**
   - `.env` 파일은 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)
   - Render.com의 Environment Variables에서만 설정

2. **CORS 설정**
   - 백엔드의 `server.js`에서 CORS가 이미 설정되어 있어야 합니다
   - 프런트엔드 도메인을 허용하도록 설정 고려

3. **데이터베이스 연결**
   - Render의 Internal Database URL 사용 권장
   - 외부에서 접근하려면 External Database URL 사용

4. **무료 플랜 제한사항**
   - 무료 플랜은 15분간 비활성 시 자동으로 sleep
   - 첫 요청 시 깨어나는데 시간이 걸릴 수 있음

5. **빌드 시간**
   - 무료 플랜에서 빌드 시간 제한이 있을 수 있음
   - 필요시 플랜 업그레이드 고려

## 트러블슈팅

### 백엔드가 배포되지 않는 경우
- Build Command와 Start Command 확인
- 환경 변수 확인
- 로그 확인

### 데이터베이스 연결 실패
- 환경 변수 값 확인
- Internal Database URL 사용 확인
- 데이터베이스가 실행 중인지 확인

### 프런트엔드에서 API 호출 실패
- CORS 설정 확인
- API URL 환경 변수 확인
- 네트워크 탭에서 실제 요청 URL 확인

