# 프런트엔드 Render 배포 가이드

## 사전 준비

### 1. 코드 확인
프런트엔드 코드는 이미 배포 준비가 되어 있습니다:
- ✅ API URL이 환경 변수로 설정됨 (`VITE_API_URL`)
- ✅ 빌드 스크립트 설정됨 (`npm run build`)
- ✅ 이미지 파일이 `public/images` 폴더에 있음

### 2. 백엔드 URL 확인
백엔드가 배포되어 있고 URL을 알고 있어야 합니다.
예: `https://order-app-backend.onrender.com`

## Render Static Site 배포 과정

### 1단계: Render Dashboard 접속
1. Render.com에 로그인
2. Dashboard로 이동

### 2단계: Static Site 생성
1. **New +** 버튼 클릭
2. **Static Site** 선택

### 3단계: 저장소 연결
1. **Connect Repository** 섹션에서:
   - GitHub 저장소 선택
   - Branch: `main` (또는 기본 브랜치)
   - Auto-Deploy: `Yes` (코드 푸시 시 자동 재배포)

### 4단계: 빌드 설정
다음 설정을 입력합니다:

- **Name**: `order-app-frontend` (또는 원하는 이름)
- **Root Directory**: `ui` (프런트엔드 폴더)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist` (Vite 빌드 출력 폴더)

### 5단계: 환경 변수 설정
**Environment Variables** 섹션에서 다음 환경 변수를 추가:

```
VITE_API_URL=https://order-app-backend.onrender.com/api
```

**중요**: 
- 백엔드 서비스의 실제 URL로 변경해야 합니다
- `https://`로 시작해야 합니다
- 끝에 `/api`를 포함해야 합니다

### 6단계: 배포
1. **Create Static Site** 버튼 클릭
2. 배포가 시작되면 로그를 확인합니다
3. 빌드가 완료되면 사이트 URL이 생성됩니다

### 7단계: 배포 확인
1. 생성된 URL로 접속하여 테스트
2. 브라우저 개발자 도구의 Network 탭에서 API 호출 확인
3. CORS 오류가 발생하면 백엔드 CORS 설정 확인

## 배포 후 확인 사항

### ✅ 정상 작동 확인
- [ ] 메뉴 목록이 표시되는가?
- [ ] 옵션 선택이 작동하는가?
- [ ] 장바구니에 추가가 되는가?
- [ ] 주문하기가 작동하는가?
- [ ] 관리자 화면이 작동하는가?
- [ ] 이미지가 표시되는가?

### 🔍 문제 해결

#### API 호출 실패
- 환경 변수 `VITE_API_URL`이 올바른지 확인
- 백엔드 서비스가 실행 중인지 확인
- 브라우저 콘솔에서 CORS 오류 확인

#### 이미지가 표시되지 않음
- `ui/public/images` 폴더의 이미지 파일이 Git에 포함되어 있는지 확인
- 이미지 경로가 `/images/파일명.jpg` 형식인지 확인

#### 빌드 실패
- `npm install`이 성공하는지 확인
- `npm run build`가 로컬에서 성공하는지 확인
- 빌드 로그에서 오류 메시지 확인

## 환경 변수 설정 예시

Render Dashboard의 Environment Variables 섹션:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://order-app-backend.onrender.com/api` |

**주의**: 
- Vite 환경 변수는 `VITE_` 접두사가 필요합니다
- 값에 따옴표를 사용하지 마세요
- 백엔드 URL은 실제 배포된 URL로 변경해야 합니다

## 자동 재배포

Auto-Deploy가 활성화되어 있으면:
- GitHub에 코드를 푸시하면 자동으로 재배포됩니다
- 환경 변수 변경 시에도 자동 재배포됩니다

## 커스텀 도메인 (선택사항)

1. Static Site 설정에서 **Custom Domains** 섹션으로 이동
2. 도메인 추가 및 DNS 설정
3. SSL 인증서 자동 발급

