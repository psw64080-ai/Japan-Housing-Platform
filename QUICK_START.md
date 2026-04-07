# 빠른 시작 가이드 (Windows)

## 📌 접속 안 됨 해결 체크리스트

### 🔍 Step 1: 필수 환경 확인

```powershell
# Java 설치 확인
java -version

# Node.js 설치 확인
node --version
npm --version

# PostgreSQL 서비스 확인 (Windows 서비스)
Get-Service PostgreSQL* | Select Name, Status
```

**결과**: 모두 설치되어 있어야 합니다.

---

## 🚀 Step 2: PostgreSQL 설정 (한번만)

### 2.1 PostgreSQL 접속

```powershell
# Windows CMD 또는 PowerShell에서
# (또는 pgAdmin 사용)
psql -U postgres
```

### 2.2 SQL 실행

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

---

## ⚡ Step 3: Backend 실행 (간단한 방법)

### 옵션 A: Maven 사용 (권장)

```powershell
# Maven 설치 확인
mvn --version

# 없다면 설치 (관리자 권한 필요)
# Windows: https://maven.apache.org/download.cgi 에서 다운로드 후 PATH 추가
```

**실행**:
```powershell
cd backend
mvn clean spring-boot:run
```

### 옵션 B: IDE 사용 (IntelliJ, VS Code)

1. **IntelliJ IDEA**:
   - `backend/src/main/java/com/ailawyer/housingjp/BackendApplication.java` 오픈
   - 클래스명 옆 ▶ 아이콘 클릭 → `Run 'BackendApplication'`

2. **VS Code**:
   - Extension Pack for Java 설치
   - `BackendApplication.java` 오픈 → `Run` 버튼 클릭

### 옵션 C: Gradle Wrapper 생성 후

```powershell
cd backend

# Gradle Wrapper 생성 (최초 1회)
# macOS/Linux:
./gradlew wrapper

# Windows:
# 또는 이 명령 실행:
java -jar "C:\Gradle 상태 확인" (복잡함)

# 이후 실행:
./gradlew.bat bootRun
```

---

## 🎨 Step 4: Frontend 실행

```powershell
cd frontend

# 의존성 설치 (첫 실행시만)
npm install

# 개발 서버 실행
npm run dev
```

**접속**: http://localhost:3000

---

## ✅ Step 5: 실행 확인

### Backend 확인 (새 터미널)

```powershell
# API 호출
curl http://localhost:8080/api/properties

# 또는 브라우저에서:
# http://localhost:8080/api/properties
```

**예상 응답**:
```json
[]
```

### Frontend 확인

- 브라우저: http://localhost:3000
- **보이는 것**: 홈페이지 로고, 네비게이션, 기능 소개 12개

---

## 🐛 자주 나오는 오류 및 해결

| 오류 메시지 | 원인 | 해결 방법 |
|-----------|------|----------|
| `'mvn'을(를) 찾을 수 없음` | Maven 미설치 | Maven 설치 또는 IDE 사용 |
| `Connection refused localhost:5432` | PostgreSQL 미실행 | Windows 서비스에서 PostgreSQL 시작 |
| `FATAL: Ident authentication failed` | PostgreSQL 비밀번호 오류 | `application.properties`의 비밀번호 확인 |
| `Port 3000 in use` | Node.js 포트 충돌 | 다른 앱 종료 또는 포트 변경 |
| `Port 8080 in use` | Spring Boot 포트 충돌 | 다른 앱 종료 또는 포트 변경 |
| `npm install` 실패 | 네트워크 또는 권한 문제 | `npm cache clean --force` 후 재시도 |

---

## 🆘 여전히 안 될 때

### 1. 포트 확인

```powershell
# 포트 사용 여부 확인
netstat -ano | findstr :3000
netstat -ano | findstr :8080
netstat -ano | findstr :5432

# 프로세스 종료 (PID 번호로)
taskkill /PID <PID번호> /F
```

### 2. 방화벽 확인

Windows Defender 방화벽에서 Java/Node.js 어플리케이션 허용

### 3. 환경 변수 확인

```powershell
# Java 경로
$env:JAVA_HOME

# Node.js 경로
$env:PATH
```

### 4. PostgreSQL 서비스 확인

```powershell
# 서비스 목록
Get-Service | findstr PostgreSQL

# 서비스 시작
Start-Service postgresql-x64-15

# 또는 Services 앱 열기:
services.msc
```

---

## 📱 로그인/회원가입 테스트

**http://localhost:3000** 접속 후:

1. **"登録"** 버튼 클릭 → 회원 가입
   - 이메일: `test@example.com`
   - 비밀번호: `password123`
   - 이름: `Test User`
   - 국적: `Korea` (또는 선택)

2. **"ログイン"** 버튼 클릭 → 로그인

3. 로그인 후 **"物件検索"** 으로 이동

---

## 🔄 프로세스 다시 시작

### Backend 다시 시작
```powershell
# 기존 프로세스 종료
# 터미널에서 Ctrl+C 누르기

# 다시 실행
mvn clean spring-boot:run
```

### Frontend 다시 시작
```powershell
# 기존 프로세스 종료 (Ctrl+C)

# 다시 실행
npm run dev
```

---

## 💡 팁

- **Backend 수정 후**: 자동 재시작 (Spring DevTools)
- **Frontend 수정 후**: 자동 새로고침 (Next.js Fast Refresh)
- **데이터베이스 수정 후**: Backend 재시작 필요 (JPA 스키마 업데이트)

---

**문제가 계속되면 다음 정보를 알려주세요:**
1. 오류 메시지 (전체)
2. 사용 중인 OS 및 버전
3. 설치된 Java/Node 버전
4. PostgreSQL 설치 여부 및 버전 

Happy Coding! 🚀
