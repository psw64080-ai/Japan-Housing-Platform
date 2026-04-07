# 로컬 개발 환경 설정 가이드

이 가이드는 Japan Housing Platform을 로컬 개발 환경에서 실행하는 방법을 설명합니다.

## 1. 필수 소프트웨어 설치

### 1.1 PostgreSQL 설치
- **Windows**: https://www.postgresql.org/download/windows/ 에서 설치
- **설치 중 포트**: `5432` (기본값)
- **설치 중 비밀번호**: `password123` 또는 원하는 비밀번호 설정 (기억해두기!)
- **설치 완료 후 확인**:
  ```bash
  psql --version
  ```

### 1.2 Java 17+ 설치
- **Windows**: https://www.oracle.com/java/technologies/downloads/ 에서 JDK 17 이상 설치
- **확인**:
  ```bash
  java -version
  ```

### 1.3 Node.js 18+ 설치
- **Windows**: https://nodejs.org/ 에서 LTS 버전 설치 (18.0.0 이상)
- **확인**:
  ```bash
  node --version
  npm --version
  ```

---

## 2. PostgreSQL 데이터베이스 설정

### 2.1 PostgreSQL 접속
```bash
# Windows에서 PostgreSQL 접속
psql -U postgres
```
비밀번호를 묻거나 (설치 중 설정한 비밀번호 입력)

### 2.2 데이터베이스 및 사용자 생성
```sql
-- 사용자 생성
CREATE USER developer WITH PASSWORD 'password123';

-- 데이터베이스 생성
CREATE DATABASE japan_housing OWNER developer;

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE japan_housing TO developer;

-- 종료
\q
```

### 2.3 테이블 생성 (옵션)
Spring Boot의 JPA가 자동으로 생성하지만, 수동으로 SQL을 실행하려면:

```bash
# PostgreSQL에 접속 후
psql -U postgres -d japan_housing -f backend/src/main/resources/init.sql
```

---

## 3. Backend (Spring Boot) 실행

### 3.1 기본 설정 확인
파일: `backend/src/main/resources/application.properties`

```properties
# PostgreSQL 연결 충 (이미 설정됨)
spring.datasource.url=jdbc:postgresql://localhost:5432/japan_housing
spring.datasource.username=developer
spring.datasource.password=password123
```

**만약 PostgreSQL 설정이 다르다면:**
- `spring.datasource.username`: PostgreSQL 사용자명
- `spring.datasource.password`: PostgreSQL 비밀번호
- 포트가 5432가 아니라면 URL 수정

### 3.2 Backend 실행

#### Windows PowerShell:
```bash
# 1. backend 폴더로 이동
cd backend

# 2. 프로젝트 빌드 및 실행
.\gradlew.bat bootRun
```

#### 또는 IDE 사용 (IntelliJ/Eclipse):
- `BackendApplication.java` 파일를 열고 우클릭
- `Run BackendApplication` 선택

### 3.3 Backend 실행 확인
```bash
# 새 터미널에서 실행
curl http://localhost:8080/api/properties
```

응답 예:
```json
[]
```

✅ Backend가 정상적으로 실행되면 포트 `8080`에서 API가 제공됩니다.

---

## 4. Frontend (Next.js) 실행

### 4.1 환경 설정 확인
파일: `frontend/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### 4.2 Frontend 실행

#### 첫 실행 (의존성 설치 필요):
```bash
# 1. frontend 폴더로 이동
cd frontend

# 2. npm 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

#### 이후 실행:
```bash
cd frontend
npm run dev
```

### 4.3 Frontend 실행 확인
- 브라우저 열기: http://localhost:3000
- 화면이 로드되면 정상 실행 ✅

---

## 5. API 테스트

### 5.1 샘플 데이터 추가
```bash
# 새 터미널에서 실행
curl -X POST http://localhost:8080/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新宿駅徒歩1分 新築アパート",
    "address": "東京都新宿区",
    "monthlyPrice": 150000,
    "roomType": "1K",
    "foreignerWelcome": true,
    "landlordId": 1
  }'
```

### 5.2 모든 Properties 조회
```bash
curl http://localhost:8080/api/properties
```

### 5.3 필터된 검색
```bash
# 150,000 이하 가격의 외국인 친화적 매물
curl "http://localhost:8080/api/properties/foreigner-friendly?maxPrice=150000"
```

---

## 6. 일반적인 오류 및 해결

| 오류 | 해결 방법 |
|------|----------|
| `FATAL: Ident authentication failed for user "developer"` | PostgreSQL 비밀번호 확인, `application.properties`의 비밀번호 수정 |
| `Connection refused: localhost:5432` | PostgreSQL 서버 실행 확인 (`services.msc`에서 PostgreSQL 서비스 시작) |
| `error listen EADDRINUSE :::3000` | 포트 3000이 이미 사용 중 - 기존 프로세스 종료 또는 다른 포트 사용 |
| `npm install 오류` | `npm cache clean --force` 실행 후 다시 시도 |
| `gradlew 오류 (Windows)` | PowerShell 실행 정책 확인: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |

---

## 7. 개발 흐름

### 7.1 Backend 개발
1. `backend/src/main/java/com/ailawyer/backend/` 에서 코드 수정
2. 변경 사항이 자동으로 컴파일되고 다시 로드됨 (Spring DevTools)
3. `curl` 또는 Postman으로 API 테스트

### 7.2 Frontend 개발
1. `frontend/src/` 에서 React/TypeScript 파일 수정
2. 저장 시 자동 새로고침 (Fast Refresh)
3. 브라우저에서 `http://localhost:3000` 확인

### 7.3 데이터베이스 스키마 변경
1. Entity 파일 수정 (`backend/src/main/java/com/ailawyer/backend/model/`)
2. Backend 다시 시작
3. JPA가 자동으로 스키마 생성/수정 (설정: `spring.jpa.hibernate.ddl-auto=update`)

---

## 8. 실행 확인 체크리스트

- [ ] PostgreSQL 실행 (`psql` 접속 가능)
- [ ] 데이터베이스 `japan_housing` 생성 완료
- [ ] Backend 실행 (`http://localhost:8080/api/properties` 응답)
- [ ] Frontend 실행 (`http://localhost:3000` 로드)
- [ ] API 연결 테스트 (Frontend에서 Properties 로드)

---

## 9. 다음 단계

✅ 모든 실행이 완료되면:

1. **Frontend에서 API 테스트**
   - http://localhost:3000/properties 로 이동
   - Properties 목록 조회 확인

2. **데이터 추가**
   - Properties 추가 API로 테스트 데이터 생성
   - 검색 및 필터 기능 테스트

3. **인증 시스템 구축** (다음 단계)
   - JWT 기반 로그인 구현
   - 사용자 인증 API 추가

4. **더 많은 기능 개발** (Phase 2)
   - ShareHouse 관리
   - 지역 정보(Google Maps)
   - 이동 마켓플레이스

---

**문제가 발생하면?**
- PostgreSQL 서비스 상태 확인
- 포트 5432, 8080, 3000이 사용 가능한지 확인
- Backend/Frontend 로그에서 오류 메시지 확인
- Java 버전이 17 이상인지 확인

Happy Coding! 🚀
