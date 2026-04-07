# 🚀 Japan Housing Connect - 개발 완전 가이드 (초보자용)

> "개발이 처음이신 분들도 따라 할 수 있는 단계별 개발 방법 설명서"

---

## 📌 목차
1. [개발이 뭐냐? (기초 개념)](#개발이-뭐냐-기초-개념)
2. [우리 프로젝트의 구조 이해하기](#우리-프로젝트의-구조-이해하기)
3. [필요한 도구 설치 (설치 가이드)](#필요한-도구-설치-설치-가이드)
4. [개발 환경 셋업](#개발-환경-셋업)
5. [첫 번째 기능 만들기 (STEP BY STEP)](#첫-번째-기능-만들기-step-by-step)
6. [개발 사이클 이해하기](#개발-사이클-이해하기)
7. [프로그래밍 기초 개념](#프로그래밍-기초-개념)
8. [실전 개발 예제](#실전-개발-예제)
9. [문제 해결 가이드 (디버깅)](#문제-해결-가이드-디버깅)
10. [배포 방법](#배포-방법)

---

## 개발이 뭐냐? (기초 개념)

### 🎯 개발 = 요리하기

개발을 요리에 비유하면:

```
요리:                          개발:
┌─────────────────────────────────────────────────┐
│ 1. 메뉴판 작성        →     요구사항 분석        │
│ 2. 재료 준비          →     개발 환경 준비       │
│ 3. 요리법 따르기      →     코딩 (프로그래밍)   │
│ 4. 중간중간 맛보기    →     테스트              │
│ 5. 접시에 담기        →     배포/출시           │
│ 6. 손님 반응 보기     →     유지보수            │
└─────────────────────────────────────────────────┘
```

### 🏗️ 웹사이트 구조 = 건물

```
건물:                              웹사이트:
┌──────────────────────────────────────────────┐
│                                              │
│  1층 (사람들이 보는 곳)  →  Frontend (UI)    │
│     ├─ 공실                ├─ HTML (구조)     │
│     ├─ 가구                ├─ CSS (디자인)    │
│     └─ 전등                └─ JavaScript      │
│                                              │
│  내부 시설 (보이지 않는 곳) → Backend (로직)  │
│     ├─ 전기선              ├─ 데이터 처리     │
│     ├─ 수도관              ├─ 저장/관리       │
│     └─ 환기시스템          └─ 계산            │
│                                              │
│  지하 (정보 저장) → Database (저장소)        │
│     └─ 창고 (데이터 보관)                     │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 우리 프로젝트의 구조 이해하기

### 📁 프로젝트 폴더 구조 (최종)

```
Japan-Housing-Platform/
│
├─ frontend/                    # 사용자가 보는 화면
│  ├─ src/
│  │  ├─ app/                  # 페이지들 (주택 검색, 채팅 등)
│  │  ├─ components/           # 재사용 가능한 UI 부품들
│  │  │  ├─ PropertyCard.tsx   # 주택 카드
│  │  │  ├─ SearchBar.tsx      # 검색창
│  │  │  └─ ChatBox.tsx        # 채팅창
│  │  └─ lib/                  # 유틸리티 함수들
│  
├─ backend/                    # 데이터 처리 (사용자는 안 봄)
│  └─ src/main/java/
│     └─ com/ailawyer/backend/
│        ├─ controller/        # API 조정실 (요청 받기)
│        ├─ service/           # 비즈니스 로직
│        ├─ repository/        # 데이터베이스 연결
│        └─ model/             # 데이터 구조
│
├─ database/                   # 데이터 저장소
│
└─ BUSINESS_PLAN.md            # 기획서 (이미 작성함)
```

### 🔄 세 부분이 어떻게 통신하나?

```
사용자 액션:
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Frontend (사용자 화면)                                  │
│  "주택 검색" 클릭                                         │
│         ↓                                                │
│  Backend (서버가 처리)                                   │
│  "서울 강남역 주변 30만원 이하 아파트 찾아"              │
│         ↓                                                │
│  Database (데이터 창고)                                  │
│  [검색 결과 리스트] 10개 찾아서 결과 반환                │
│         ↓                                                │
│  Frontend (사용자 화면)                                  │
│  아파트 카드 10개 화면에 표시                             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 필요한 도구 설치 (설치 가이드)

### 🛠️ 최소 필요한 도구 5가지

#### 1️⃣ **Git** - 코드 저장소 (Google Drive 같은 것)
```
역할: 코드 변경 이력 관리 + 팀 협력
설치: https://git-scm.com/download/win
확인: 터미널에 "git --version" 입력 → 버전이 나오면 OK
```

#### 2️⃣ **Node.js** - JavaScript 실행 도구 (Frontend용)
```
역할: Next.js 개발 서버 실행
설치: https://nodejs.org/en/download/
버전: LTS (Long Term Support) 권장
확인: 터미널에 "node --version" → v18.x.x 이상 나오면 OK
```

#### 3️⃣ **Java JDK** - Java 컴파일러 (Backend용)
```
역할: Spring Boot 서버 실행
설치: https://www.oracle.com/java/technologies/downloads/
버전: Java 17 이상
확인: 터미널에 "java -version" → 버전이 나오면 OK
```

#### 4️⃣ **VS Code** - 코드 편집기
```
역할: 코드 작성 및 편집
설치: https://code.visualstudio.com/
권장 확장프로그램: 
  - ES7+ React/Redux/React-Native snippets
  - REST Client
  - Thunder Client
```

#### 5️⃣ **PostgreSQL** - 데이터베이스
```
역할: 사용자, 주택 정보 저장
설치: https://www.postgresql.org/download/
설정: 기본 포트 5432, 비밀번호 기억해두기
```

### 📦 설치 체크리스트

```
☐ Git 설치 완료
☐ Node.js 18+ 설치 완료
☐ Java JDK 17+ 설치 완료
☐ VS Code 설치 완료
☐ PostgreSQL 설치 및 실행 중
```

---

## 개발 환경 셋업

### 🚀 Step 1: 프로젝트 다운로드 (Git Clone)

**터미널 명령어:**
```bash
# 프로젝트 폴더로 이동
cd c:\aitest

# Git에서 프로젝트 다운로드
git clone https://github.com/your-repo/Japan-Housing-Platform.git

# 프로젝트 폴더로 이동
cd Japan-Housing-Platform
```

**설명:** Git clone은 다운로드와 같습니다. 클라우드 저장소에서 코드를 받아오는 것입니다.

---

### 🚀 Step 2: Frontend 환경 준비 (Node.js Panel)

**터미널에 입력:**
```bash
# frontend 폴더로 이동
cd frontend

# 필요한 라이브러리 설치 (첫 1회만, 5-10분 걸림)
npm install

# 개발 서버 실행
npm run dev
```

**결과:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

브라우저에서 `http://localhost:3000` 열면 사이트가 띄워집니다!

---

### 🚀 Step 3: Backend 환경 준비 (Java/Spring Boot)

**터미널에 입력 (frontend 실행 중인 터미널과 다른 터미널):**

```bash
# 프로젝트 루트 폴더로 이동
cd c:\aitest\Japan-Housing-Platform\backend

# Gradle 빌드 (Windows)
.\gradlew.bat build

# 또는 (Mac/Linux)
./gradlew build

# Spring Boot 서버 실행
.\gradlew.bat bootRun
```

**결과:**
```
Started BackendApplication in 5.123 seconds
Tomcat started on port(s): 8080
```

서버가 `http://localhost:8080`에서 실행됩니다!

---

### 🚀 Step 4: 데이터베이스 준비

**PostgreSQL 설치 후:**

```bash
# PostgreSQL 연결
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE japan_housing;

# 사용자 생성 (옵션)
CREATE USER developer WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE japan_housing TO developer;
```

---

## 첫 번째 기능 만들기 (STEP BY STEP)

### 🎯 목표: "주택 목록 페이지" 만들기

이것은 간단하지만 실제 개발 과정을 보여주는 예제입니다.

#### **1단계: 기능 계획**

```
주택 목록 기능:
  ├─ 주택 데이터 3개 표시
  ├─ 각 주택 카드에 사진, 가격, 위치 표시
  ├─ "더보기" 버튼
  └─ 반응형 디자인 (모바일/PC 모두 보기 좋음)
```

#### **2단계: 데이터 만들기 (Backend)**

**파일**: `backend/src/main/java/com/ailawyer/backend/model/Property.java`

```java
package com.ailawyer.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "properties")
public class Property {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;           // 제목: "신주쿠역 1분 거리 신축 아파트"
    private String address;         // 주소
    private Integer price;          // 월세 (엔화)
    private String imageUrl;        // 사진 URL
    private String description;     // 설명
    
    // Getter, Setter 생략
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getAddress() { return address; }
    public Integer getPrice() { return price; }
    public String getImageUrl() { return imageUrl; }
    
    // Constructor
    public Property(String title, String address, Integer price, String imageUrl, String description) {
        this.title = title;
        this.address = address;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
    }
}
```

**설명:**
- `@Entity`: 이것은 데이터베이스 테이블
- `@Table(name = "properties")`: 테이블 이름은 "properties"
- `private String title;`: 각 주택의 제목

#### **3단계: 데이터 가져오기 - API 만들기**

**파일**: `backend/src/main/java/com/ailawyer/backend/controller/PropertyController.java`

```java
package com.ailawyer.backend.controller;

import com.ailawyer.backend.model.Property;
import com.ailawyer.backend.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {
    
    @Autowired
    private PropertyRepository propertyRepository;
    
    // GET /api/properties → 모든 주택 리스트 반환
    @GetMapping
    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }
    
    // GET /api/properties/1 → 주택 ID 1의 상세 정보
    @GetMapping("/{id}")
    public Property getPropertyById(@PathVariable Long id) {
        return propertyRepository.findById(id).orElse(null);
    }
}
```

**설명:**
- `@RestController`: API 만드는 클래스  
- `@GetMapping`: GET 요청 처리 (데이터 가져오기)
- `getAllProperties()`: 모든 주택 리스트 반환

#### **4단계: 화면 만들기 (Frontend)**

**파일**: `frontend/src/app/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

interface Property {
    id: number;
    title: string;
    address: string;
    price: number;
    imageUrl: string;
}

export default function PropertyList() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    
    // 페이지 로드될 때 데이터 가져오기
    useEffect(() => {
        fetchProperties();
    }, []);
    
    const fetchProperties = async () => {
        try {
            // Backend API에 요청
            const response = await fetch('http://localhost:8080/api/properties');
            const data = await response.json();
            setProperties(data);
            setLoading(false);
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            setLoading(false);
        }
    };
    
    if (loading) return <div>로딩 중...</div>;
    
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">주택 검색</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <div key={property.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                        {/* 사진 */}
                        <img 
                            src={property.imageUrl} 
                            alt={property.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                        />
                        
                        {/* 정보 */}
                        <div className="p-4">
                            <h2 className="text-lg font-semibold">{property.title}</h2>
                            <p className="text-gray-600 text-sm">{property.address}</p>
                            <p className="text-blue-600 font-bold text-xl mt-2">
                                ¥{property.price.toLocaleString()}/월
                            </p>
                        </div>
                        
                        {/* 상세 보기 버튼 */}
                        <button className="w-full bg-blue-500 text-white py-2 rounded-b-lg hover:bg-blue-600">
                            상세 보기
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

**설명:**
- `useEffect`: 페이지 로드될 때 한 번만 실행
- `fetchProperties()`: Backend API에서 데이터 가져오기
- `properties.map()`: 각 주택마다 카드 만들기
- `grid grid-cols-3`: 반응형 레이아웃 (PC는 3개씩, 모바일은 1개씩)

#### **5단계: 테스트**

1. Backend 서버 실행: `.\gradlew.bat bootRun`
2. Frontend 개발 서버 실행: `npm run dev`
3. 브라우저 열기: http://localhost:3000
4. 주택 목록이 보이는지 확인

---

## 개발 사이클 이해하기

### 🔄 매일 반복되는 개발 프로세스

```
┌───────────────────────────────────────────┐
│                                           │
│  1. 요구사항 읽기                         │
│     예: "주택 검색 기능 만들기"           │
│         ↓                                 │
│  2. 기능 설계하기                         │
│     ├─ 어떤 데이터가 필요한가?            │
│     ├─ Backend API 어떻게 만들 건가?     │
│     └─ Frontend UI는 어떻게?             │
│         ↓                                 │
│  3. 코드 작성하기                         │
│     ├─ Backend 개발                      │
│     └─ Frontend 개발                     │
│         ↓                                 │
│  4. 로컬 테스트 (자기 PC에서)            │
│     ├─ 서버 돌려보기                     │
│     ├─ 화면 확인                         │
│     └─ 버그 찾기                         │
│         ↓                                 │
│  5. 버그 수정 (디버깅)                   │
│         ↓                                 │
│  6. Git에 저장 (Commit)                  │
│     예: "기능: 주택 검색 API 구현"       │
│         ↓                                 │
│  7. 다음 기능으로                        │
│         ↓                                 │
│  반복... (✨ 모든 기능 완성!)             │
│                                           │
└───────────────────────────────────────────┘
```

### 📝 매일 해야 할 일

**아침 (1시간)**
- 어제 작업 상황 확인
- 오늘 할 일 결정
- 코드 작성 시작

**낮 (4시간)**
- 기능 개발
- 테스트

**저녁 (1시간)**
- 버그 수정
- 코드 정리
- Git에 저장
- 내일 할 일 계획

---

## 프로그래밍 기초 개념

### 🧠 필수 알아야 할 5가지 개념

#### **1️⃣ 변수 (Variable) - 상자에 데이터 보관**

```java
// Backend (Java)
String propertyName = "신주쿠역 1분 신축 아파트";  // 텍스트
int price = 150000;                               // 정수
double rating = 4.5;                              // 소수
boolean isAvailable = true;                       // 참/거짓
```

```typescript
// Frontend (TypeScript)
const propertyName: string = "신주쿠역 1분 신축 아파트";
const price: number = 150000;
const isAvailable: boolean = true;
```

#### **2️⃣ 함수 (Function) - 반복 작업 자동화**

```java
// Backend
public int calculateDeposit(int monthlyRent) {
    return monthlyRent * 2;  // 보증금 계산 (월세 × 2)
}

// 사용
int deposit = calculateDeposit(150000);  // 결과: 300000
```

```typescript
// Frontend
function formatPrice(price: number): string {
    return `¥${price.toLocaleString()}`;
}

// 사용
console.log(formatPrice(150000));  // 결과: "¥150,000"
```

#### **3️⃣ 반복문 (Loop) - 여러 번 반복**

```java
// Backend: 10개 주택 데이터 출력
for (int i = 1; i <= 10; i++) {
    System.out.println("주택 " + i);
}
```

```typescript
// Frontend: 주택 목록 표시
const properties = [
    { id: 1, title: "신주쿠 아파트" },
    { id: 2, title: "시부야 주택" },
    { id: 3, title: "시나가와 빌" }
];

properties.forEach(property => {
    console.log(property.title);
});
```

#### **4️⃣ 조건문 (If Statement) - 상황에 따라 다르게**

```java
// Backend: 외국인 친화적인 주택만 필터
if (property.isForeignerFriendly == true) {
    // 이 주택을 목록에 추가
}
```

```typescript
// Frontend: 가격이 200,000엔 이상이면 경고
if (property.price > 200000) {
    alert("비싼 주택입니다!");
}
```

#### **5️⃣ 객체/클래스 (Object/Class) - 관련 데이터 묶기**

```java
// Backend: 주택 정보를 한곳에
public class Property {
    public String title;        // 제목
    public String address;      // 주소
    public int price;          // 가격
    public String imageUrl;    // 사진
}

// 사용
Property house = new Property();
house.title = "신주쿠역 1분 신축 아파트";
house.price = 150000;
```

---

## 실전 개발 예제

### 📖 예제 1: "가격 필터링" 기능 만들기

**요구사항**: 사용자가 입력한 가격 범위 내의 주택만 표시

#### **Backend API 만들기**

파일: `backend/src/main/java/com/ailawyer/backend/controller/PropertyController.java`

```java
// 가격으로 필터링하는 API 추가
@GetMapping("/search")
public List<Property> searchByPrice(
    @RequestParam Integer minPrice,
    @RequestParam Integer maxPrice
) {
    return propertyRepository.findByPriceBetween(minPrice, maxPrice);
}
```

**설명:**
- `@RequestParam`: URL 파라미터로부터 데이터 받기
- 예: `/api/properties/search?minPrice=100000&maxPrice=200000`
- 이 API는 100,000~200,000엔 사이의 주택 반환

파일: `backend/src/main/java/com/ailawyer/backend/repository/PropertyRepository.java`

```java
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByPriceBetween(Integer minPrice, Integer maxPrice);
}
```

#### **Frontend 화면 만들기**

파일: `frontend/src/components/PriceFilter.tsx`

```typescript
'use client';

import { useState } from 'react';

interface Property {
    id: number;
    title: string;
    price: number;
}

export default function PriceFilter() {
    const [minPrice, setMinPrice] = useState(100000);
    const [maxPrice, setMaxPrice] = useState(300000);
    const [results, setResults] = useState<Property[]>([]);
    
    // 검색 버튼 클릭
    const handleSearch = async () => {
        const response = await fetch(
            `http://localhost:8080/api/properties/search?minPrice=${minPrice}&maxPrice=${maxPrice}`
        );
        const data = await response.json();
        setResults(data);
    };
    
    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">주택 가격 검색</h2>
            
            {/* 가격 입력 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium">최소 가격 (¥)</label>
                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium">최대 가격 (¥)</label>
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
            </div>
            
            {/* 검색 버튼 */}
            <button
                onClick={handleSearch}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
                검색
            </button>
            
            {/* 결과 표시 */}
            <div className="mt-6">
                <h3 className="font-semibold mb-2">검색 결과: {results.length}개</h3>
                {results.map(property => (
                    <div key={property.id} className="border-b py-2">
                        <p className="font-semibold">{property.title}</p>
                        <p className="text-blue-600">¥{property.price.toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

---

### 📖 예제 2: "AI 번역" 기능 기본 구조

**요구사항**: 채팅에서 한국어를 자동으로 일본어로 번역

#### **Backend 번역 API**

파일: `backend/src/main/java/com/ailawyer/backend/service/TranslationService.java`

```java
package com.ailawyer.backend.service;

import com.google.cloud.translate.Translate;
import com.google.cloud.translate.TranslateOptions;
import com.google.cloud.translate.Translation;
import org.springframework.stereotype.Service;

@Service
public class TranslationService {
    
    public String translateText(String text, String targetLanguage) {
        // Google Translate API 초기화
        Translate translate = TranslateOptions.getDefaultInstance().getService();
        
        // 번역 실행
        Translation translation = translate.translate(
            text,
            Translate.TranslateOption.targetLanguage(targetLanguage)
        );
        
        return translation.getTranslatedText();
    }
}
```

파일: `backend/src/main/java/com/ailawyer/backend/controller/TranslationController.java`

```java
@RestController
@RequestMapping("/api/translate")
public class TranslationController {
    
    @Autowired
    private TranslationService translationService;
    
    @PostMapping
    public String translate(
        @RequestParam String text,
        @RequestParam String targetLanguage
    ) {
        return translationService.translateText(text, targetLanguage);
    }
}
```

#### **Frontend 번역 기능**

파일: `frontend/src/components/ChatWithTranslation.tsx`

```typescript
'use client';

import { useState } from 'react';

interface Message {
    id: number;
    sender: string;
    original: string;
    translated: string;
    language: string;
}

export default function ChatWithTranslation() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    
    const sendMessage = async () => {
        if (!message.trim()) return;
        
        try {
            // Backend API로 번역 요청
            const translatedResponse = await fetch('http://localhost:8080/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: message,
                    targetLanguage: 'ja'  // 일본어로 번역
                })
            });
            
            const translated = await translatedResponse.json();
            
            // 메시지 저장
            const newMessage: Message = {
                id: messages.length + 1,
                sender: '나',
                original: message,
                translated: translated,
                language: 'ko'
            };
            
            setMessages([...messages, newMessage]);
            setMessage('');
            
        } catch (error) {
            console.error('번역 실패:', error);
        }
    };
    
    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">번역이 포함된 채팅</h2>
            
            {/* 메시지 목록 */}
            <div className="bg-gray-100 rounded-lg p-3 h-64 overflow-y-auto mb-4">
                {messages.map((msg) => (
                    <div key={msg.id} className="mb-3 p-2 bg-white rounded">
                        <p className="text-sm text-gray-500">{msg.sender}</p>
                        <p className="font-semibold">{msg.original}</p>
                        <p className="text-blue-600 text-sm">번역: {msg.translated}</p>
                    </div>
                ))}
            </div>
            
            {/* 입력창 */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="메시지 입력..."
                    className="flex-1 border rounded px-3 py-2"
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    전송
                </button>
            </div>
        </div>
    );
}
```

---

## 문제 해결 가이드 (디버깅)

### 🐛 자주 나는 에러와 해결 방법

#### **에러 1: "Cannot find module 'react'"**

```
❌ 에러 내용:
Cannot find module 'react' from '/path/to/project'

✅ 해결 방법:
cd frontend
npm install
npm run dev
```

#### **에러 2: "Port 3000 already in use"**

```
❌ 에러 내용:
Error: listen EADDRINUSE: address already in use :::3000

✅ 해결 방법:
# Windows: 포트 사용 중인 프로세스 종료
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# 또는 다른 포트 사용
npm run dev -- -p 3001
```

#### **에러 3: "Connection refused" (Backend 연결 안 됨)**

```
❌ 에러 내용:
Failed to fetch http://localhost:8080/api/properties
Connection refused

✅ 해결 방법:
1. Backend 서버 확인: 터미널에서 ".\gradlew.bat bootRun" 실행
2. 포트 확인: http://localhost:8080 브라우저에서 접속 확인
3. CORS 설정 (Backend 허용하도록 수정)
```

#### **에러 4: "데이터베이스 연결 실패"**

```
❌ 에러 내용:
org.postgresql.util.PSQLException: Connection to localhost:5432 refused

✅ 해결 방법:
1. PostgreSQL 실행 중인지 확인
2. 포트 5432 열려있는지 확인
3. application.properties 확인:
   spring.datasource.url=jdbc:postgresql://localhost:5432/japan_housing
   spring.datasource.username=postgres
   spring.datasource.password=(설정한 비밀번호)
```

### 🔍 디버깅 팁

**팁 1: 콘솔 로그 보기**

```typescript
// Frontend에서 변수 값 확인
console.log('price:', property.price);
console.log('모든 주택:', properties);
```

```java
// Backend에서 변수 값 확인
System.out.println("가격: " + property.getPrice());
System.out.println("모든 주택: " + properties);
```

**팁 2: 브라우저 개발자 도구**

```
F12 또는 마우스 우클릭 → 검사 (Inspect)
┌─────────────────────────────────┐
│ Elements | Console | Network    │
├─────────────────────────────────┤
│                                 │
│ Network 탭: API 요청/응답 확인   │
│ Console 탭: 에러 메시지 확인    │
│                                 │
└─────────────────────────────────┘
```

**팁 3: VS Code 디버거 사용**

`.vscode/launch.json` 생성:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}",
      "breakOnLoad": true
    }
  ]
}
```

---

## 배포 방법

### 🌐 웹사이트를 인터넷에 공개하기

#### **배포 아키텍처**

```
┌─────────────────────────────────────────────────────┐
│                  인터넷 사용자                       │
│                  (누구나 접근)                       │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ↓                       ↓
    Frontend                 Backend
    (www.website.com)        (api.website.com)
    Vercel/Netlify           AWS/Google Cloud
    (Next.js 배포)           (Spring Boot 배포)
         │                       │
         ├───────────────────────┤
              ↓
        PostgreSQL 데이터베이스
        (Amazon RDS)
```

#### **Step 1: Frontend 배포 (Next.js)**

**선택지 1: Vercel (가장 쉬움)**

```bash
# Node.js installed 확인
node --version

# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
cd frontend
vercel
```

**선택지 2: Netlify**

1. https://netlify.com 접속
2. GitHub 계정 연결
3. 저장소 선택
4. 자동 배포

#### **Step 2: Backend 배포 (Spring Boot)**

**선택지 1: AWS Elastic Beanstalk**

```bash
# AWS CLI 설치 (https://aws.amazon.com/cli/)
aws --version

# 빌드
cd backend
./gradlew.bat build

# AWS에 배포
eb init
eb create
eb deploy
```

**선택지 2: Google Cloud Run**

```bash
# Google Cloud SDK 설치
gcloud --version

# 빌드 및 배포
gcloud run deploy japan-housing-backend \
  --source . \
  --platform managed \
  --region us-central1
```

#### **Step 3: 데이터베이스 배포**

**AWS RDS (관리형 PostgreSQL)**

1. AWS Management Console 접속
2. RDS 서비스 선택
3. "Create Database" 클릭
4. PostgreSQL 선택
5. 설정 후 생성

#### **배포 후 확인**

```bash
# 배포된 사이트 확인
- Frontend: https://your-site.vercel.app
- Backend API: https://api-your-site.azurewebsites.net/api/properties
```

---

## 🎓 추가 학습 자료

### 📚 초보자용 학습 경로

**1주차: 기초**
- JavaScript/TypeScript 기초 (변수, 함수, 객체)
- React 기초 (component, state, props)

**2주차: Frontend**
- Next.js 레이아웃과 라우팅
- CSS/Tailwind CSS

**3주차: Backend**
- Java/Spring Boot 기초
- REST API 이해

**4주차: 데이터베이스**
- SQL 기초
- JPA/Hibernate

**5주차: 통합**
- Frontend + Backend 연결
- API 통신

### 🎬 추천 유튜브 채널
- **Academind** - Frontend/React
- **Spring Boot in Action** - Backend
- **Tech With Tim** - Web Development 기초

### 📖 추천 책
- "Learning React" by Alex Banks
- "Spring in Action" by Craig Walls
- "Beginning Django and DRF" (참고용)

### 💻 추천 온라인 코스
- Udemy: "Complete React Course"
- Codecademy: "Learn Java"
- Coursera: "Google Cloud 배포"

---

## 📊 진행 체크리스트

```
Phase 1: 환경 준비 (1주)
 ☐ Git, Node.js, Java, PostgreSQL 설치
 ☐ VS Code 설정
 ☐ 프로젝트 Clone

Phase 2: 기초 학습 (2주)
 ☐ JavaScript/TypeScript 이해
 ☐ React 기초
 ☐ Spring Boot 기초
 ☐ REST API 이해

Phase 3: 첫 번째 기능 (1주)
 ☐ Backend API 만들기
 ☐ Frontend 화면 만들기
 ☐ Database 연결
 ☐ 테스트 및 디버깅

Phase 4: 추가 기능 (3주)
 ☐ 주택 검색 필터링
 ☐ 사용자 로그인
 ☐ 채팅 기능
 ☐ AI 번역

Phase 5: 배포 (1주)
 ☐ Frontend Vercel 배포
 ☐ Backend AWS 배포
 ☐ 데이터베이스 RDS 마이그레이션
 ☐ 도메인 구매 및 설정

총 소요 시간: 8주
```

---

## 🆘 도움 받기

개발하다가 막히면?

1. **Google에 검색** - "react useState error" 같이 검색
2. **Stack Overflow** - 전세계 개발자의 Q&A 사이트
3. **GitHub Issues** - 라이브러리 버그 보고
4. **ChatGPT** - AI에게 묻기 (매우 유용!)

### ChatGPT 활용법

```
좋은 질문:
"React에서 useState를 사용해서 배열에 아이템 추가하는 방법은?"

나쁜 질문:
"코드를 만들어줘"
```

---

## 최종 조언

> **"개발은 처음엔 어렵지만, 하루하루 반복되는 패턴입니다."**

### 성공하는 팁

1. **작은 것부터 시작** - 전체를 못해도 한 기능이라도 완성하세요
2. **매일 30분** - 한 번에 8시간보다 매일 30분이 더 효과적
3. **기록하기** - 배운 것을 노트에 정리
4. **물어보기** - 모르는 것은 부끄럽지 않음
5. **무시하지 않기** - 에러 메시지를 읽으면 해결책이 보임

---

**준비됐나요? 그럼 코딩을 시작해봅시다! 💪**

다음 단계:
1. 도구 설치 ✓
2. 첫 번째 기능 개발 시작
3. 배포
4. 성공! 🎉
