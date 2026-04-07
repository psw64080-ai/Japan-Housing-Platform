# Docker 빠른 시작 (권장, 가장 간단함)

## 📦 Docker와 Docker Compose 설치

### Windows에서 Docker 설치
1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop) 다운로드
2. 설치 실행 (관리자 권한)
3. 시스템 재시작
4. PowerShell에서 확인:
   ```powershell
   docker --version
   docker-compose --version
   ```

---

## 🚀 한 줄로 모든 서비스 시작

```powershell
# 프로젝트 루트 디렉토리에서
cd c:\aitest\Japan-Housing-Platform

# 모든 서비스 시작 (PostgreSQL + Backend + Frontend)
docker-compose up -d

# 또는 로그를 보면서 실행 (테스트용)
docker-compose up
```

**끝! ✨ 이제 접속하세요:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/properties
- **PostgreSQL**: localhost:5432

---

## ✅ 상태 확인

```powershell
# 모든 컨테이너 상태 보기
docker-compose ps

# 로그 보기
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

**예상 결과**:
```
NAME                    STATUS
japan-housing-db        Up (healthy)
japan-housing-backend   Up
japan-housing-frontend  Up
```

---

## 🔍 Backend 확인

```powershell
# API 호출 테스트
curl http://localhost:8080/api/properties

# 또는 브라우저에서:
# http://localhost:8080/api/properties
```

**응답**: `[]` (빈 배열 = 정상)

---

## 🎨 Frontend 접속

1. 브라우저 열기: **http://localhost:3000**
2. 네비게이션 확인:
   - 🏠 Japan Housing (로고)
   - 物件検索 (매물검색)
   - チャット (채팅)
   - 契約書 (계약서)
   - 登録 / ログイン (회원가입/로그인)

---

## 🛑 서비스 중지 및 정리

```powershell
# 모든 서비스 중지 (컨테이너는 유지)
docker-compose stop

# 모든 서비스 시작
docker-compose start

# 모든 서비스 중지 및 삭제
docker-compose down

# 데이터베이스 초기화 (주의!)
docker-compose down -v
```

---

## 🔄 코드 수정 후 재시작

### Backend 코드 수정
```powershell
# 1. Backend 이미지 다시 빌드
docker-compose build backend

# 2. Backend만 재시작
docker-compose up -d backend
```

### Frontend 코드 수정
```powershell
# 1. Frontend 이미지 다시 빌드
docker-compose build frontend

# 2. Frontend만 재시작
docker-compose up -d frontend
```

### 전체 재시작
```powershell
docker-compose restart
```

---

## 🐛 문제 해결

### 포트 충돌
```powershell
# 이미 사용 중인 포트 확인
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# docker-compose.yml에서 포트 변경
# ports: "3001:3000"  # 호스트:컨테이너
```

### Docker 재시작
```powershell
# Docker Desktop 재시작 또는
docker system restart

# 전체 정리 (주의!)
docker system prune -a
```

### 로그 확인
```powershell
# 특정 서비스 로그
docker-compose logs postgres
docker-compose logs backend
docker-compose logs frontend

# 실시간 로그 (Ctrl+C로 종료)
docker-compose logs -f
```

---

## 📊 명령어 빠른 참조

| 명령어 | 설명 |
|--------|------|
| `docker-compose up -d` | 모든 서비스 백그라운드 시작 |
| `docker-compose down` | 모든 서비스 중지 및 삭제 |
| `docker-compose logs` | 로그 보기 |
| `docker-compose ps` | 실행 중인 컨테이너 목록 |
| `docker-compose build` | 이미지 빌드 |
| `docker-compose restart` | 서비스 재시작 |
| `docker-compose exec postgres psql -U developer` | PostgreSQL 접속 |

---

## 💡 팁

1. **첫 실행은 느림**: Maven/npm 패키지 다운로드 중 (~5-10분)
2. **로그 확인**: 오류 발생 시 `docker-compose logs 서비스명` 으로 확인
3. **데이터 보존**: `docker-compose down`은 데이터 삭제 / `docker-compose stop`은 보존
4. **자동 재시작**: `docker-compose up -d` 후 시스템 재시작하면 자동 재시작

---

## 🎯 다음 단계

1. **http://localhost:3000** 접속 확인
2. **"登録"** 클릭 → 회원가입
3. **"ログイン"** → 로그인
4. **"物件検索"** → 매물 검색

모두 성공했나요? 🎉 그럼 이제 API를 테스트해봅시다!
