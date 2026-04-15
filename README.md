<<<<<<< HEAD
# 🏘️ Japan Housing Platform - 완전 가이드

## 📋 프로젝트 개요

**일본에서 외국인을 위한 주택 검색 + 셰어하우스 플랫폼**

- **Backend**: Spring Boot 3.2 + Java 17 + PostgreSQL
- **Frontend**: Next.js 14 + React 18 + TypeScript
- **인증**: JWT 기반 로그인/회원가입
- **번역**: AI 자동 번역 (한글/일본어/영어)
- **계약**: 전자 서명 계약서 자동화

---

## 🚀 시작하기 (3가지 방법)

### ⚡ 방법 1: Docker (가장 간단, 권장) ✨ 

```bash
cd Japan-Housing-Platform
docker-compose up -d
```

👉 [Docker 가이드](./DOCKER_QUICK_START.md)

**특징**: 
- 설치 최소화 ✅
- 한 줄 명령어 ✅
- 모든 서비스 자동 구성 ✅
- 첫 실행: 5-10분, 이후: 즉시

---

### 📦 방법 2: 직접 설치 (상세 제어)

1. **필수 설치**:
   - Java 17+ ([다운로드](https://www.oracle.com/java/technologies/downloads/))
   - Node.js 18+ ([다운로드](https://nodejs.org/))
   - PostgreSQL 15+ ([다운로드](https://www.postgresql.org/download/))
   - Maven 3.8+ (선택사항, IDE로도 가능)

2. **실행**:

👉 [빠른 시작 가이드](./QUICK_START.md)

---

### 🔧 방법 3: IDE 사용 (개발자용)

**IntelliJ IDEA**:
1. `File > Open` → 프로젝트 폴더
2. `BackendApplication.java` 오픈 → ▶ 실행

**VS Code**:
1. Extension Pack for Java 설치
2. `BackendApplication.java` → Run 버튼

---

## 📍 접속 주소

| 서비스 | URL | 설명 |
|--------|-----|------|
| **Frontend** | http://localhost:3000 | 웹사이트 메인 |
| **Backend API** | http://localhost:8080/api | REST API |
| **PostgreSQL** | localhost:5432 | 데이터베이스 |

---

## ✅ 12개 기능 상태

### 완료된 기능 (10개) ✅

1. ✅ **외국인 맞춤 주택 검색** - 언어, 지역, 가격 필터
2. ✅ **셰어하우스 플랫폼** - 공동 생활 커뮤니티
3. ✅ **AI 번역/채팅 시스템** - 실시간 번역 메시지
4. ✅ **계약서 자동화** - 전자 서명 지원
5. ✅ **신뢰도 평가 시스템** - 5점 별점 리뷰
6. ✅ **로그인/회원가입** - JWT 인증 (새로 추가)
7. ✅ **지역별 생활정보** - 역, 거리 정보 (기본)
8. ✅ **비용 정보** - 보증금, 월세, 중개료 저장
9. ✅ **매물 저장** - 찜하기 기능 가능
10. ✅ **커뮤니티 기반** - 사용자 간 메시지/평점

### 부분 구현 (2개) 🟡

11. 🟡 **이사 서비스 마켓플레이스** - Entity 정의, API 미구현
12. 🟡 **생활 가이드** - 데이터 구조 예비 중

📊 **전체 완성도: 85%** (로그인 추가로 약 5% 상승)

👉 [기능 체크리스트](./FEATURE_CHECKLIST.md)

---

## 📁 프로젝트 구조

```
Japan-Housing-Platform/
├── backend/                    # Spring Boot 애플리케이션
│   ├── src/main/java/com/ailawyer/housingjp/
│   │   ├── model/             # JPA Entity (User, Property, Review 등)
│   │   ├── repository/        # Database 접근 계층
│   │   ├── service/           # 비즈니스 로직
│   │   ├── controller/        # REST API 엔드포인트
│   │   ├── dto/               # 데이터 전달 객체
│   │   ├── util/              # JWT 유틸
│   │   └── config/            # Spring 설정
│   ├── pom.xml               # Maven 설정 (새로 추가)
│   └── Dockerfile            # Docker 설정 (새로 추가)
│
├── frontend/                   # Next.js 애플리케이션
│   ├── src/
│   │   ├── app/              # 페이지들
│   │   │   ├── page.tsx           # 홈
│   │   │   ├── login/             # 로그인 (새로 추가)
│   │   │   ├── register/          # 회원가입 (새로 추가)
│   │   │   ├── properties/        # 매물 검색
│   │   │   ├── chat/              # 채팅
│   │   │   └── contracts/         # 계약서
│   │   ├── components/       # React 컴포넌트
│   │   └── lib/
│   │       └── api/client.ts # API 클라이언트
│   ├── Dockerfile           # Docker 설정 (새로 추가)
│   └── package.json
│
├── docker-compose.yml         # Docker 서비스 정의 (새로 추가)
├── DOCKER_QUICK_START.md      # Docker 가이드 (새로 추가)
├── QUICK_START.md             # 빠른 시작 (새로 추가)
├── FEATURE_CHECKLIST.md       # 기능 완성도 (새로 추가)
└── README.md                  # 이 파일

```

---

## 🔒 로그인 / 회원가입 (새로 추가)

### API 엔드포인트

```
POST /api/auth/register     # 회원가입
POST /api/auth/login        # 로그인
GET  /api/auth/me          # 현재 사용자 조회 (토큰 필요)
GET  /api/auth/users/{id}  # 사용자 프로필 조회
```

### 테스트 데이터

```
이메일: test@example.com
비밀번호: password123
이름: Test User
국적: Korea
```

### Frontend 페이지

- **회원가입**: http://localhost:3000/register
- **로그인**: http://localhost:3000/login

---

## 🔌 API 엔드포인트 (40+개)

### 인증 API
```
POST   /api/auth/register           회원가입
POST   /api/auth/login              로그인
GET    /api/auth/me                 현재 사용자
```

### 매물 API (Properties)
```
GET    /api/properties              모든 매물
GET    /api/properties/{id}         매물 상세
GET    /api/properties/foreigner-friendly    외국인 친화
GET    /api/properties/pet-friendly          펫 친화
POST   /api/properties              매물 등록
```

### 채팅 API (Messages)
```
POST   /api/messages                메시지 전송
GET    /api/messages/chat/{uid1}/{uid2}    채팅 히스토리
GET    /api/messages/unread/{userid}       읽지 않은 메시지
```

### 계약 API (Contracts)
```
POST   /api/contracts/generate      계약서 생성
PUT    /api/contracts/{id}/sign/tenant    세입자 서명
PUT    /api/contracts/{id}/sign/landlord  집주인 서명
```

### 번역 API
```
POST   /api/translation/translate   텍스트 번역
GET    /api/translation/languages   지원 언어
```

👉 전체 API 문서: [API.md](./API_DOCS.md) (작성 예정)

---

## 🗄️ 데이터베이스 테이블

```sql
users            -- 사용자 계정 및 프로필
properties       -- 주택 매물 정보
reviews          -- 매물/사용자 리뷰 (5점 별점)
contracts        -- 전자 계약서 관리
messages         -- 사용자 간 메시지 + 번역
sharehouses      -- 셰어하우스 커뮤니티
```

---

## 🛠️ 기술 스택

| 계층 | 기술 |
|------|------|
| **Backend** | Spring Boot 3.2, Java 17, Spring Data JPA |
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Database** | PostgreSQL 15 |
| **Authentication** | JWT (jsonwebtoken) |
| **Encryption** | BCrypt (비밀번호) |
| **API** | REST (HTTP) |
| **Containerization** | Docker, Docker Compose |

---

## 📚 설명서 및 가이드

### 빠른 시작
- ⚡ [Docker 가이드](./DOCKER_QUICK_START.md) - 가장 간단함
- 📦 [직접 설치 가이드](./QUICK_START.md) - 상세 설명
- 📋 [로컬 개발 설정](./LOCAL_DEV_SETUP.md) - PostgreSQL 설정

### 기능 및 상태
- ✅ [기능 체크리스트](./FEATURE_CHECKLIST.md) - 12개 기능 상태
- 🎯 [API 엔드포인트](./API_DOCS.md) - 작성 예정

### 개발
- 🏗️ Backend 구조: `backend/src/main/java/com/ailawyer/housingjp/`
- 🎨 Frontend 구조: `frontend/src/`
- 📝 커밋 메시지 규칙: [CONTRIBUTING.md](./CONTRIBUTING.md) - 작성 예정

---

## ⚠️ 주의사항

### 데이터베이스
- ⚠️ `spring.jpa.hibernate.ddl-auto=update` (자동 스키마 생성)
- 프로덕션에서는 `validate`로 변경 필수

### 보안
- ⚠️ JWT 시크릿 키 변경 필수 (`application.properties`)
- ⚠️ 비밀번호는 BCrypt로 암호화되어 저장됨
- ⚠️ CORS는 `http://localhost:3000` 으로 제한됨

### 환경변수
```properties
# backend/src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/japan_housing
spring.datasource.username=developer
spring.datasource.password=password123
jwt.secret=...변경필수...
```

---

## 🤝 기여하기

프로젝트 개선 사항:
1. 이사 서비스 마켓플레이스 (기능 7) 완성
2. 비용 계산기 고도화 (기능 8)
3. 매물 알림 시스템 (기능 9)
4. 3D VR 투어 (기능 10)
5. 커뮤니티 고도화 (기능 11)
6. 생활 가이드 CMS (기능 12)

---

## ❓ FAQ

**Q: 너무 많은 의존성이 필요한가요?**  
A: Docker 사용하면 자동 처리됨. 직접 설치하려면 Java, Node, PostgreSQL만 필수.

**Q: 포트 충돌이 발생했어요**  
A: `QUICK_START.md` 의 포트 충돌 섹션 참고

**Q: MacOS/Linux에서도 동작하나요?**  
A: 네, 모든 코드는 크로스 플랫폼. 경로만 `/` 사용.

**Q: 프로덕션 배포 가능한가요?**  
A: 아직 개발 단계. 다음 작업 필요:
- 환경변수 관리 (`.env`)
- HTTPS/SSL 설정
- 성능 최적화 (캐싱, CDN)
- 에러 로깅 (Sentry 등)

---

## 📞 지원

문제가 발생하면:

1. **로그 확인**
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

2. **포트 확인**
   ```bash
   netstat -ano | findstr :3000
   netstat -ano | findstr :8080
   ```

3. **재시작**
   ```bash
   docker-compose restart
   ```

---

## 📄 라이선스

MIT License - 자유롭게 사용 가능

---

## 🎉 시작해보세요!

### 가장 간단한 방법

```bash
# 1. 이 폴더로 이동
cd Japan-Housing-Platform

# 2. Docker 시작
docker-compose up -d

# 3. 브라우저에서 열기
# http://localhost:3000
```

**완료! 🚀**

---

**마지막 업데이트**: 2026년 3월 27일  
**버전**: 0.1.0-beta (로그인 기능 추가)

=======
# Japan-Housing-Platform
>>>>>>> 0e4853cf476e7d69f693c3d7a81784f825940cb0
