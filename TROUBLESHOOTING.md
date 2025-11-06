# 프런트엔드 배포 문제 해결 가이드

## "데이터를 불러오는데 실패했습니다" 오류 해결

### 즉시 확인 사항

#### 1. 환경 변수 설정 확인
Render Dashboard에서:
1. Static Site 서비스 (`order-app-frontend`) 클릭
2. 왼쪽 메뉴에서 **Environment** 클릭
3. `VITE_API_URL` 환경 변수가 있는지 확인
4. 값 형식 확인:
   - ✅ 올바른 형식: `https://order-app-backend.onrender.com/api`
   - ❌ 잘못된 형식: `http://order-app-backend.onrender.com/api` (http 사용)
   - ❌ 잘못된 형식: `https://order-app-backend.onrender.com` (끝에 /api 없음)

#### 2. 백엔드 서비스 확인
1. Render Dashboard에서 백엔드 Web Service 확인
2. 서비스 상태가 **Live**인지 확인
3. 서비스 URL 확인 (상단에 표시됨)
4. 브라우저에서 직접 접속하여 테스트:
   ```
   https://order-app-backend.onrender.com/api/menus
   ```
   - JSON 데이터가 표시되면 백엔드는 정상 작동 중
   - 오류가 나면 백엔드 문제

#### 3. 브라우저 콘솔 확인
프런트엔드 사이트에서:
1. **F12** 키 누르기 (개발자 도구 열기)
2. **Console** 탭 확인
3. 다음 정보 확인:
   - `🔍 API Base URL:` 로그 확인
   - `🔍 VITE_API_URL:` 로그 확인
   - 오류 메시지 확인

### 해결 방법

#### 방법 1: 환경 변수 추가/수정
1. Render Dashboard → Static Site 서비스 → Environment
2. **Add Environment Variable** 클릭
3. 입력:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://order-app-backend.onrender.com/api`
     - ⚠️ 백엔드의 실제 URL로 변경!
4. **Save Changes** 클릭
5. 자동 재배포 대기 (1-2분)

#### 방법 2: 백엔드 URL 확인
백엔드 URL을 모르는 경우:
1. Render Dashboard에서 백엔드 Web Service 클릭
2. 상단에 표시된 URL 복사
3. 예: `https://order-app-backend.onrender.com`
4. 끝에 `/api`를 추가하여 환경 변수에 설정

### 일반적인 문제

#### 문제 1: 환경 변수가 설정되지 않음
**증상**: 콘솔에 `VITE_API_URL: (설정되지 않음)` 표시

**해결**: Render Dashboard에서 `VITE_API_URL` 환경 변수 추가

#### 문제 2: 백엔드가 sleep 상태
**증상**: 첫 요청 시 타임아웃, 두 번째 요청은 성공

**해결**: 
- 무료 플랜의 정상 동작
- 첫 요청 후 30초 정도 기다렸다가 다시 시도
- 또는 유료 플랜으로 업그레이드

#### 문제 3: CORS 오류
**증상**: 브라우저 콘솔에 "CORS policy" 오류

**해결**: 백엔드 CORS 설정 확인 (현재는 모든 도메인 허용)

#### 문제 4: 404 오류
**증상**: API 요청이 404 반환

**해결**: 
- 백엔드 URL이 올바른지 확인
- `/api`가 포함되어 있는지 확인

### 디버깅 단계

1. ✅ 브라우저 콘솔(F12) 열기
2. ✅ 콘솔에서 API URL 확인
3. ✅ Network 탭에서 실제 요청 URL 확인
4. ✅ 백엔드 URL로 직접 접속 테스트
5. ✅ Render Dashboard에서 환경 변수 확인
6. ✅ 환경 변수 재설정 후 재배포

### 빠른 체크리스트

- [ ] Render Dashboard에서 `VITE_API_URL` 환경 변수 확인
- [ ] 백엔드 서비스가 Live 상태인지 확인
- [ ] 백엔드 URL 형식: `https://서비스명.onrender.com/api`
- [ ] 브라우저 콘솔에서 오류 메시지 확인
- [ ] 환경 변수 재설정 후 재배포 완료 대기

