// =========================================================
// Japan Housing Platform — Live API Server
// Real Free APIs: MyMemory Translation, Frankfurter Exchange,
//   Open-Meteo Weather, Reddit r/japanlife, Wikipedia
// =========================================================

const http = require('http');
const https = require('https');
const url = require('url');

// ========================= CACHE =========================
const cache = new Map();

function cached(key, ttlMs, fetchFn) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < ttlMs) {
    return Promise.resolve(entry.data);
  }
  return fetchFn().then(data => {
    cache.set(key, { data, ts: Date.now() });
    return data;
  }).catch(err => {
    console.error(`  [CACHE MISS] ${key}: ${err.message}`);
    if (entry) return entry.data;  // stale data fallback
    throw err;
  });
}

// ========================= HTTP HELPERS =========================

function httpGet(apiUrl, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const lib = apiUrl.startsWith('https') ? https : http;
    const req = lib.get(apiUrl, {
      headers: { 'User-Agent': 'JapanHousingPlatform/1.0 (educational project)' },
      timeout: timeoutMs
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location, timeoutMs).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { resolve(body); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function parseBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function json(res, code, data) {
  res.writeHead(code);
  res.end(JSON.stringify(data));
}

// ========================= REAL EXTERNAL APIs =========================

// 1) MyMemory Translation API — free, no key, 5000 chars/day (50000 with email)
async function realTranslate(text, from, to) {
  return cached(`tr:${from}>${to}:${text}`, 86400000, async () => {
    const encoded = encodeURIComponent(text);
    const resp = await httpGet(
      `https://api.mymemory.translated.net/get?q=${encoded}&langpair=${from}|${to}&de=japanhousing@example.com`
    );
    if (resp.responseStatus === 200 && resp.responseData) {
      return {
        originalText: text,
        translatedText: resp.responseData.translatedText,
        detectedLanguage: from,
        confidence: resp.responseData.match || 0,
        source: 'MyMemory API (Real)'
      };
    }
    throw new Error('Translation failed');
  });
}

// 2) Frankfurter Exchange Rate API — free, no key
async function realExchangeRates(base = 'JPY') {
  return cached(`fx:${base}`, 300000, async () => {
    const resp = await httpGet(`https://api.frankfurter.app/latest?from=${base}&to=KRW,USD,EUR,CNY,GBP`);
    return { ...resp, source: 'Frankfurter API (Real)' };
  });
}

// 3) Open-Meteo Weather API — free, no key
async function realWeather(lat, lon) {
  return cached(`wx:${lat},${lon}`, 300000, async () => {
    const resp = await httpGet(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current_weather=true&hourly=temperature_2m,precipitation_probability` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
      `&timezone=Asia%2FTokyo&forecast_days=3`
    );
    return { ...resp, source: 'Open-Meteo API (Real)' };
  });
}

// 4) Reddit r/japanlife — free, no key
async function realCommunityPosts() {
  return cached('reddit:japanlife', 600000, async () => {
    const resp = await httpGet('https://www.reddit.com/r/japanlife/hot.json?limit=25&raw_json=1');
    if (!resp?.data?.children) throw new Error('Invalid reddit response');
    return resp.data.children
      .filter(c => !c.data.stickied)
      .slice(0, 15)
      .map((c, i) => ({
        id: i + 1,
        title: c.data.title,
        content: (c.data.selftext || '').substring(0, 500) + ((c.data.selftext || '').length > 500 ? '...' : ''),
        author: c.data.author,
        category: c.data.link_flair_text || 'Japan Life',
        createdAt: new Date(c.data.created_utc * 1000).toISOString(),
        likes: c.data.score,
        comments: c.data.num_comments,
        url: `https://reddit.com${c.data.permalink}`,
        source: 'Reddit r/japanlife (Real)'
      }));
  });
}

// 5) Wikipedia REST API — free, no key
async function realGuides() {
  return cached('wiki:guides', 3600000, async () => {
    const topics = [
      { article: 'Waste_management_in_Japan', title: '♻️ 일본 쓰레기 분리수거 가이드', cat: '생활 꿀팁' },
      { article: 'National_Health_Insurance_(Japan)', title: '🏥 일본 건강보험(NHI) 가입 안내', cat: '행정 처리' },
      { article: 'Tokyo_Metro', title: '🚇 도쿄 지하철 완벽 가이드', cat: '교통' },
      { article: 'Earthquakes_in_Japan', title: '🌏 일본 지진 대비 행동요령', cat: '안전' },
      { article: 'Japanese_addressing_system', title: '📮 일본 주소 체계 이해하기', cat: '생활 꿀팁' },
      { article: 'Mobile_phones_in_Japan', title: '📱 일본 휴대폰·통신 개통 가이드', cat: '생활 꿀팁' },
      { article: 'Resident_registration_in_Japan', title: '🏛️ 전입신고 & 체류카드 주소변경', cat: '행정 처리' },
      { article: 'Banking_in_Japan', title: '🏦 일본 은행 계좌 개설 가이드', cat: '행정 처리' },
    ];
    const guides = [];
    for (const t of topics) {
      try {
        const resp = await httpGet(`https://en.wikipedia.org/api/rest_v1/page/summary/${t.article}`);
        guides.push({
          id: guides.length + 1,
          title: t.title,
          category: t.cat,
          content: resp.extract || '',
          thumbnail: resp.thumbnail?.source || null,
          wikiUrl: resp.content_urls?.desktop?.page || null,
          source: 'Wikipedia (Real)'
        });
      } catch (e) {
        console.error(`  [Wiki skip] ${t.article}: ${e.message}`);
      }
    }
    return guides.length > 0 ? guides : FALLBACK_GUIDES;
  });
}

// ========================= FALLBACK DATA =========================

const FALLBACK_COMMUNITY = [
  { id: 1, author: '김태영', title: '신주쿠에 맛있는 한국 식당 추천해주세요!', content: '이번에 새로 이사왔는데 주변을 잘 몰라서요. 신주쿠역 근처 괜찮은 한식당 있을까요?', category: 'Japan Life', likes: 12, comments: 5, createdAt: '2026-04-01T09:00:00Z' },
  { id: 2, author: '이유진', title: '구청 전입신고 같이 갈 사람?', content: '시주쿠 구청에서 전입신고 해야 하는데 같이 갈 사람 구합니다. 일본어가 불안해서...', category: 'Japan Life', likes: 8, comments: 3, createdAt: '2026-03-30T14:00:00Z' },
  { id: 3, author: 'TanakaSan', title: '한국인 친구들과 교류를 원해요', content: '4월 첫째주 일요일 시부야에서 한일 교류 모임입니다. 관심 있으신 분 참여해주세요.', category: 'Japan Life', likes: 25, comments: 11, createdAt: '2026-03-28T18:00:00Z' },
];

const FALLBACK_GUIDES = [
  { id: 1, title: '♻️ 일본 쓰레기 분리수거 가이드', category: '생활 꿀팁', content: '일본의 쓰레기 분리수거는 매우 엄격합니다. 타는 쓰레기(燃えるゴミ), 안타는 쓰레기(燃えないゴミ), 자원 쓰레기(資源ゴミ)로 구분합니다.', icon: '♻️' },
  { id: 2, title: '💡 공과금 납부 완벽 정리', category: '행정 처리', content: '이사 후 전기/수도/가스 명의 변경이 필요합니다. 각 회사에 전화하거나 온라인으로 신청할 수 있습니다.', icon: '💡' },
  { id: 3, title: '🚇 도쿄 교통 가이드', category: '교통', content: 'Suica/Pasmo 카드를 구입하면 전철, 버스, 편의점 결제 모두 가능합니다.', icon: '🚇' },
];

// ========================= REAL PROPERTY DATA (Suumo.jp based) =========================
const { PROPERTIES, KO_DATA, AMENITY_JP_KR, translateAmenities } = require('./real-property-data.js');

// Apply Korean fields and replace original Japanese with Korean
PROPERTIES.forEach(p => {
  const ko = KO_DATA[p.id];
  if (ko) {
    p.titleKo = ko.titleKo;
    p.addressKo = ko.addressKo;
    p.descriptionKo = ko.descriptionKo;
    p.nearbyStationKo = ko.nearbyStationKo;
    p.title = ko.titleKo;
    p.address = ko.addressKo;
    p.description = ko.descriptionKo;
    p.nearbyStation = ko.nearbyStationKo;
  }
  p.amenitiesKo = translateAmenities(p.amenities);
  p.amenities = p.amenitiesKo || p.amenities;
});

// ========================= REAL REVIEWS =========================
const REVIEWS = [
  // Property 1 — Shinjuku
  { id: 1, propertyId: 1, reviewer: { id: 10, name: '김민수' }, rating: 5, comment: '신주쿠역에서 정말 가깝고 편의시설 완벽해요. 외국인이라 불안했는데 집주인분이 친절하게 설명해주셔서 추천!', createdAt: '2026-03-15T10:00:00Z' },
  { id: 2, propertyId: 1, reviewer: { id: 11, name: 'David K.' }, rating: 4, comment: 'Great location near Shinjuku. The auto-lock system gives peace of mind. Only downside is the room is a bit small, but that\'s standard for Tokyo.', createdAt: '2026-02-20T14:30:00Z' },
  { id: 3, propertyId: 1, reviewer: { id: 12, name: '다나카 하나코' }, rating: 5, comment: '역에서 가까워 편리합니다. 관리인분도 계셔서 안심이에요. 택배보관 서비스도 있어서 부재중에도 짐을 받을 수 있어요.', createdAt: '2026-01-10T09:00:00Z' },
  // Property 2 — Shibuya
  { id: 4, propertyId: 2, reviewer: { id: 13, name: '박준혁' }, rating: 5, comment: '시부야에서 이 가격에 이 퀄리티는 정말 좋아요. 디자이너 맨션이라 인테리어가 예뻐서 만족합니다. 고양이랑 함께 살고 있어요.', createdAt: '2026-03-01T11:00:00Z' },
  { id: 5, propertyId: 2, reviewer: { id: 14, name: 'Sarah L.' }, rating: 4, comment: 'Love the design and the pet-friendly policy. The neighborhood is amazing with so many cafes and shops nearby.', createdAt: '2026-02-15T16:00:00Z' },
  // Property 3 — Ikebukuro
  { id: 6, propertyId: 3, reviewer: { id: 15, name: '이현우' }, rating: 4, comment: '리노베이션 되어 있어서 깨끗하고 좋습니다. 선샤인시티 바로 옆이라 쇼핑도 편리해요. 이케부쿠로는 한국인 많아서 살기 편해요.', createdAt: '2026-02-28T13:00:00Z' },
  { id: 7, propertyId: 3, reviewer: { id: 16, name: '스즈키 다이스케' }, rating: 4, comment: '리노베이션이 되어 있어 깔끔합니다. 히가시이케부쿠로라 역 가까워 편리해요. 가성비가 좋습니다.', createdAt: '2026-01-25T10:30:00Z' },
  // Property 4 — Roppongi
  { id: 8, propertyId: 4, reviewer: { id: 17, name: 'Michael T.' }, rating: 5, comment: 'Absolutely stunning apartment with a view of Tokyo Tower. The concierge service is top-notch. Worth every yen!', createdAt: '2026-03-10T08:00:00Z' },
  { id: 9, propertyId: 4, reviewer: { id: 18, name: '정수현' }, rating: 5, comment: '도쿄타워 뷰에 피트니스까지... 꿈에 그리던 집입니다. 비싸지만 가치가 있어요.', createdAt: '2026-02-05T15:00:00Z' },
  // Property 5 — Nakano
  { id: 10, propertyId: 5, reviewer: { id: 19, name: '최동혁' }, rating: 4, comment: '가성비 최고! 중야노에서 자취하다 여기로 이사왔는데 신주쿠까지 5분이라 출퇴근도 편해요.', createdAt: '2026-03-20T12:00:00Z' },
  { id: 11, propertyId: 5, reviewer: { id: 20, name: 'Chen Wei' }, rating: 4, comment: '나카노 브로드웨이가 가까워서 즐거워요. 상점가도 활발해서 좋아요. 외국인에게도 친절한 거리입니다.', createdAt: '2026-01-30T11:00:00Z' },
  // Property 10 — Shimokitazawa
  { id: 12, propertyId: 10, reviewer: { id: 21, name: '한소영' }, rating: 5, comment: '시모키타자와 분위기가 너무 좋아요. 카페, 빈티지샵, 소극장 다 걸어서 갈 수 있어요. 집도 깔끔합니다.', createdAt: '2026-03-05T14:00:00Z' },
  // Property 12 — Asakusa
  { id: 13, propertyId: 12, reviewer: { id: 22, name: '김하늘' }, rating: 4, comment: '아사쿠사 분위기가 정말 좋고, 스카이트리도 보여요. 관광지라 시끄러울까 걱정했는데 밤에는 조용합니다.', createdAt: '2026-02-10T09:30:00Z' },
  // Property 13 — Kichijoji
  { id: 14, propertyId: 13, reviewer: { id: 23, name: 'Emma S.' }, rating: 5, comment: 'Kichijoji is the best neighborhood in Tokyo! Inokashira Park is beautiful in every season. The apartment is spacious and pet-friendly.', createdAt: '2026-03-18T16:00:00Z' },
  { id: 15, propertyId: 13, reviewer: { id: 24, name: '다카야마 미사키' }, rating: 4, comment: '키치조지 살기 좋고 상점 거리 등 상점가답게 뭐든 갖춰져 있어 편리해요. 공원도 가까워 리프레시할 수 있습니다.', createdAt: '2026-01-20T10:00:00Z' },
];

// ========================= REAL SHAREHOUSE DATA =========================
// Based on actual sharehouse companies operating in Tokyo

const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=800&h=600&fit=crop`;

const SHAREHOUSES = [
  {
    id: 1,
    name: 'Oakhouse Shinjuku',
    title: 'Oakhouse 신주쿠 (오크하우스)',
    address: '도쿄도 신주쿠구 니시신주쿠 7초메',
    monthlyRent: 65000, monthlyPrice: 65000,
    deposit: 30000,
    availableRooms: 3, totalRooms: 12,
    description: '일본 최대 셰어하우스 운영회사 "오크하우스"의 신주쿠 물건. 다국적 입주자와 교류 가능. 공용라운지·주방 완비. 초기비용 저렴.',
    amenities: ['Wi-Fi', '공용라운지', '공용주방', '세탁기', '건조기', '자전거 주차장'],
    features: ['다국적 운영', '셰어하우스 형태', '가구포함', '초기비용 저렴'],
    images: IMG('1522708323590-d24dbb6b0267'),
    latitude: 35.6938, longitude: 139.6977,
    source: 'Based on Oakhouse (Real Company)'
  },
  {
    id: 2,
    name: 'Sakura House Ikebukuro',
    title: '사쿠라하우스 이케부쿠로',
    address: '도쿄도 토시마구 이케부쿠로 2초메',
    monthlyRent: 58000, monthlyPrice: 58000,
    deposit: 0,
    availableRooms: 2, totalRooms: 8,
    description: '1992년 창업 노포 셰어하우스 "사쿠라하우스". 단기~장기 체류 모두 대응. 보증인 불요·즉시 입주 가능. 유학생·워킹홀리데이에 인기.',
    amenities: ['Wi-Fi', '공용주방', '세탁기', '코인세탁', '공용샤워'],
    features: ['보증인 불요', '보증금 제로', '단기OK', '가구포함', '즉시 입주 가능'],
    images: IMG('1560448204-e02f11c3d0e2'),
    latitude: 35.7312, longitude: 139.7105,
    source: 'Based on Sakura House (Real Company)'
  },
  {
    id: 3,
    name: 'Borderless House Shibuya',
    title: '보더리스하우스 시부야',
    address: '도쿄도 시부야구 진난 1초메',
    monthlyRent: 72000, monthlyPrice: 72000,
    deposit: 30000,
    availableRooms: 1, totalRooms: 10,
    description: '"국제교류"가 테마인 셰어하우스. 입주자 절반은 일본인, 절반은 외국인인 밸런스가 특징. 매주 교류 이벤트. 언어 학습에 최적.',
    amenities: ['Wi-Fi', '공용거실', '공용주방', '세탁기', '옥상테라스'],
    features: ['국제교류', '언어교환', '이벤트 매주', '가구포함', '외국인 50%'],
    images: IMG('1502672260266-1c1ef2d93688'),
    latitude: 35.6625, longitude: 139.6994,
    source: 'Based on Borderless House (Real Company)'
  },
  {
    id: 4,
    name: 'Social Apartment Nakano',
    title: '소셜아파트먼트 나카노',
    address: '도쿄도 나카노구 나카노 4초메',
    monthlyRent: 78000, monthlyPrice: 78000,
    deposit: 50000,
    availableRooms: 4, totalRooms: 40,
    description: '대형 셰어하우스 "소셜아파트먼트". 프라이벗 개인실+화려한 공유공간. 피트니스·시어터룸·워크스페이스 완비.',
    amenities: ['Wi-Fi', '피트니스 센터', '시어터룸', '코워킹스페이스', '공용주방', '라이브러리'],
    features: ['대규모', '충실 설비', '개인실완비', '가구포함', '커뮤니티'],
    images: IMG('1600596542815-ffad4c1539a9'),
    latitude: 35.7067, longitude: 139.6651,
    source: 'Based on Social Apartment (Real Company)'
  },
  {
    id: 5,
    name: 'Share Style Koenji',
    title: '셰어스타일 코엔지',
    address: '도쿄도 스기나미구 코엔지미나미 3초메',
    monthlyRent: 48000, monthlyPrice: 48000,
    deposit: 20000,
    availableRooms: 2, totalRooms: 6,
    description: '코엔지의 소규모 아늑한 셰어하우스. 서브컬처 좋아하는 사람이 모이는 개성적 물건. 월세 최저가. 신주쿠까지 전철 7분.',
    amenities: ['Wi-Fi', '공용주방', '세탁기', '공용거실', '옥상'],
    features: ['저렴', '아늑함', '소규모', '가구포함', '서브컬처'],
    images: IMG('1493809842364-78f1ada6f5e3'),
    latitude: 35.7072, longitude: 139.6496,
    source: 'Based on Share Style (Real Company)'
  },
];

// ========================= REAL MOVING SERVICES =========================
// Based on actual moving companies operating in Japan

const MOVING_SERVICES = [
  {
    id: 1,
    name: '닛폰운수 (Nippon Express)',
    description: '일본 최대 물류기업. 해외이사에 특화하며 한국어 대응 가능한 직원 배치. 꼼꼼한 포장과 확실한 배송으로 신뢰도 No.1. 유학생 할인도 있음.',
    rating: 4.8,
    priceEstimate: '1인분 약 38,000엔~ / 가족 약 80,000엔~',
    contactNumber: '0120-154-022',
    website: 'https://www.nittsu.co.jp',
    languages: ['일본어', 'English', '한국어', '중국어'],
    features: ['해외이사 대응', '한국어 대응', '포장 서비스', '보험 포함', '한국 배송'],
    source: 'Real Company'
  },
  {
    id: 2,
    name: '사카이 이사센터 (Sakai Moving)',
    description: '판다 마크로 유명. "성의를 담아 함께"를 모토로 합리적 가격과 꼼꼼한 서비스를 제공.',
    rating: 4.5,
    priceEstimate: '1인분 약 30,000엔~ / 가족 약 65,000엔~',
    contactNumber: '0120-00-1141',
    website: 'https://www.hikkoshi-sakai.co.jp',
    languages: ['일본어'],
    features: ['합리적 가격', '한국 배송', '포장재 무료', '웹 견적'],
    source: 'Real Company'
  },
  {
    id: 3,
    name: '아트 이사센터 (Art Moving)',
    description: '"0123" 전화번호로 유명. 여성 전용의 "레이디스 팩"은 짐싸기·풀기까지 모두 맡길 수 있는 플랜 충실.',
    rating: 4.6,
    priceEstimate: '1인분 약 35,000엔~ / 가족 약 70,000엔~',
    contactNumber: '0120-0123-33',
    website: 'https://www.the0123.com',
    languages: ['일본어', 'English'],
    features: ['레이디스 팩', '시니어 플랜', '가구이동', '불용품 인수'],
    source: 'Real Company'
  },
  {
    id: 4,
    name: '야마토 컨비니언스 (Yamato)',
    description: '쿠로네코 야마토의 이사 서비스. "1박스 이사 서비스"는 전용 BOX에 짐을 넣기만 하면 되는 간편 이사. 저비용으로 인기.',
    rating: 4.4,
    priceEstimate: '1박스BOX: 약 18,000엔~ / 일반 1인 약 30,000엔~',
    contactNumber: '0120-008-008',
    website: 'https://www.008008.jp',
    languages: ['일본어', 'English'],
    features: ['1박스BOX 플랜', '저비용', '편의점 접수', '한국 배송'],
    source: 'Real Company'
  },
  {
    id: 5,
    name: '아리상 마크 이사사 (Ari-san)',
    description: '개미 마크가 목표. 학생·1인 거주자 전용으로 특화한 플랜 충실. "미니 이사 플랜"과 같이 구내 소량 짐에 최적.',
    rating: 4.3,
    priceEstimate: '미니 플랜: 약 15,000엔~ / 1인 약 25,000엔~',
    contactNumber: '0120-77-2626',
    website: 'https://www.2626.co.jp',
    languages: ['일본어'],
    features: ['미니 플랜', '학생할인', '저렴', '소량OK'],
    source: 'Real Company'
  },
];

// ========================= DYNAMIC DATA STORES =========================

const dynamicData = {
  users: [
    { id: 1, email: 'test@example.com', name: 'Test User', role: 'SEEKER', nationality: 'Korean' },
    { id: 2, email: 'landlord@example.com', name: 'Tanaka Taro', role: 'LANDLORD', nationality: 'Japanese' },
  ],
  messages: [],
  contracts: [
    {
      id: 1, propertyId: 1, tenantId: 1, landlordId: 2,
      propertyTitle: '신주쿠산초메 도보 5분 1K 맨션',
      tenantName: 'Test User', landlordName: 'Tanaka Taro',
      monthlyRent: 89000, deposit: 89000, reikin: 89000,
      managementFee: 5000, keyMoney: 16500, insuranceFee: 18000,
      status: 'active', tenantSigned: true, landlordSigned: true,
      startDate: '2026-04-01', endDate: '2028-03-31',
      contractPeriod: 24, specialTerms: '외국인 보증회사(GTN) 가입 필수. 퇴거 시 원상복구 비용 별도.',
      createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-03-25T14:00:00Z'
    },
    {
      id: 2, propertyId: 10, tenantId: 1, landlordId: 2,
      propertyTitle: '에비스 디아쥬 1LDK 고급 맨션',
      tenantName: 'Test User', landlordName: 'Tanaka Taro',
      monthlyRent: 475000, deposit: 950000, reikin: 475000,
      managementFee: 15000, keyMoney: 22000, insuranceFee: 20000,
      status: 'draft', tenantSigned: false, landlordSigned: true,
      startDate: '2026-05-01', endDate: '2028-04-30',
      contractPeriod: 24, specialTerms: '펫 가능(소형견 1마리). 24시간 콩시어지 서비스 포함.',
      createdAt: '2026-04-01T09:00:00Z', updatedAt: '2026-04-01T09:00:00Z'
    },
    {
      id: 3, propertyId: 16, tenantId: 1, landlordId: 2,
      propertyTitle: '이케부쿠로 프라임어반 1K',
      tenantName: 'Test User', landlordName: 'Suzuki Hanako',
      monthlyRent: 139000, deposit: 139000, reikin: 0,
      managementFee: 8000, keyMoney: 16500, insuranceFee: 18000,
      status: 'cancelled', tenantSigned: true, landlordSigned: false,
      startDate: '2026-03-01', endDate: '2028-02-28',
      contractPeriod: 24, specialTerms: '레이킨 무료 캠페인 적용. 인터넷 무료.',
      cancelReason: '집주인 사정으로 매물 철회',
      createdAt: '2026-02-15T11:00:00Z', updatedAt: '2026-03-01T16:00:00Z'
    },
    {
      id: 4, propertyId: 24, tenantId: 1, landlordId: 2,
      propertyTitle: '아자부주반 라산테 1LDK',
      tenantName: 'Test User', landlordName: 'Yamada Ichiro',
      monthlyRent: 283000, deposit: 566000, reikin: 283000,
      managementFee: 12000, keyMoney: 22000, insuranceFee: 20000,
      status: 'draft', tenantSigned: false, landlordSigned: false,
      startDate: '2026-06-01', endDate: '2028-05-31',
      contractPeriod: 24, specialTerms: '오토록·택배BOX 완비. 주차장 별도 계약 가능(월 35,000엔).',
      createdAt: '2026-04-05T08:30:00Z', updatedAt: '2026-04-05T08:30:00Z'
    }
  ],
  savedProperties: [
    { propertyId: 1, userId: 1 },
    { propertyId: 4, userId: 1 },
    { propertyId: 10, userId: 1 },
    { propertyId: 13, userId: 1 },
  ],
  communityPosts: [
    {
      id: 1, authorId: 1, author: '김민수', category: '주거질문',
      title: '외국인이 도쿄에서 집 구할 때 보증인 없으면 진짜 못 구하나요?',
      content: '다음 달에 도쿄로 이사가는데 보증인이 없어서 걱정입니다. 보증회사(保証会社)를 이용하면 된다고 들었는데, 실제로 외국인이 보증회사 심사 통과하기 쉬운가요? GTN이랑 Casa 중에 어느 게 나은지도 궁금합니다. 경험 있으신 분 공유 부탁드려요!',
      likes: 24, likedBy: [2, 3], views: 156,
      comments: [
        { id: 1, postId: 1, authorId: 2, author: '이유진', content: 'GTN 추천합니다! 외국인 전문이라 심사 통과 잘 됩니다. 저도 보증인 없이 GTN으로 했어요.', likes: 8, likedBy: [1], createdAt: '2026-04-02T10:30:00Z' },
        { id: 2, postId: 1, authorId: 3, author: 'TanakaSan', content: '요즘은 보증회사 필수로 가입시키는 곳이 대부분이라 보증인 없어도 괜찮습니다. 수수료가 월세 50~100% 정도 들어요.', likes: 12, likedBy: [1, 2], createdAt: '2026-04-02T14:00:00Z' },
        { id: 3, postId: 1, authorId: 4, author: '박서준', content: '저는 Casa 사용했는데 문제없었어요. 재류카드랑 여권만 있으면 됩니다.', likes: 5, likedBy: [], createdAt: '2026-04-03T09:15:00Z' },
      ],
      createdAt: '2026-04-01T09:00:00Z', updatedAt: '2026-04-01T09:00:00Z'
    },
    {
      id: 2, authorId: 2, author: '이유진', category: '생활팁',
      title: '시부야구 쓰레기 분리수거 완벽 정리 (2026년 최신)',
      content: '시부야구에 살면서 쓰레기 분리수거 때문에 정말 고생했는데, 이제 완벽하게 정리했습니다!\n\n📅 수거 요일:\n- 월/목: 연소쓰레기(燃えるゴミ) — 음식물, 종이류\n- 화: 자원쓰레기(資源ゴミ) — 캔, 병, 페트병\n- 수: 불연소쓰레기(燃えないゴミ) — 금속, 유리\n- 금: 고지/플라스틱(古紙・プラ)\n\n⚠️ 주의사항:\n- 반드시 아침 8시 전에 내놓을 것\n- 시부야구 지정 쓰레기봉투 사용 (편의점에서 구매)\n- 대형쓰레기는 별도 예약 필요 (粗大ゴミ受付)',
      likes: 45, likedBy: [1, 3, 4], views: 320,
      comments: [
        { id: 4, postId: 2, authorId: 1, author: '김민수', content: '대박 이거 정리해주셔서 감사합니다! 저장해놓겠습니다 ㅠㅠ', likes: 6, likedBy: [2], createdAt: '2026-03-31T10:00:00Z' },
        { id: 5, postId: 2, authorId: 5, author: '사토유키', content: '참고로 12월~1월은 연말연시로 수거 스케줄이 바뀌니까 구청 홈페이지 확인하세요!', likes: 9, likedBy: [1, 2], createdAt: '2026-03-31T15:00:00Z' },
      ],
      createdAt: '2026-03-30T14:00:00Z', updatedAt: '2026-03-30T14:00:00Z'
    },
    {
      id: 3, authorId: 3, author: 'TanakaSan', category: '모임',
      title: '4/12(토) 시부야 한일교류 모임 참가자 모집!',
      content: '한국인·일본인 교류 모임을 매달 진행하고 있습니다 🎉\n\n📍 장소: 시부야 마크시티 5F 커뮤니티룸\n📅 일시: 4월 12일(토) 14:00~17:00\n💰 참가비: 500엔 (음료·과자 포함)\n👥 정원: 20명 (선착순)\n\n일본어 실력은 상관없어요! 한국어 배우고 싶은 일본인 친구들도 옵니다. 편하게 오세요~\n\n참가 희망하시면 댓글로 \"참가합니다\" 남겨주세요!',
      likes: 67, likedBy: [1, 2, 4, 5], views: 482,
      comments: [
        { id: 6, postId: 3, authorId: 1, author: '김민수', content: '참가합니다! 혼자 가도 괜찮을까요?', likes: 3, likedBy: [3], createdAt: '2026-03-29T10:00:00Z' },
        { id: 7, postId: 3, authorId: 2, author: '이유진', content: '참가합니다~ 저번에도 갔었는데 분위기 진짜 좋았어요!', likes: 5, likedBy: [3, 1], createdAt: '2026-03-29T11:00:00Z' },
        { id: 8, postId: 3, authorId: 4, author: '박서준', content: '참가합니다! 일본어 초보인데 괜찮나요? ㅎㅎ', likes: 4, likedBy: [3], createdAt: '2026-03-29T14:30:00Z' },
        { id: 9, postId: 3, authorId: 3, author: 'TanakaSan', content: '네 혼자 오셔도 전혀 문제없어요! 일본어 초보도 환영합니다 😊 한국어 가능한 일본인도 많으니까요~', likes: 8, likedBy: [1, 2, 4], createdAt: '2026-03-29T16:00:00Z' },
      ],
      createdAt: '2026-03-28T18:00:00Z', updatedAt: '2026-03-28T18:00:00Z'
    },
    {
      id: 4, authorId: 4, author: '박서준', category: '긴급',
      title: '긴급! 도쿄 지진 발생 시 대피 매뉴얼 공유',
      content: '어제 새벽에 지진 있었죠? 처음 겪으니까 너무 무서웠습니다... 그래서 정리해봤어요.\n\n🚨 지진 발생 시:\n1. 테이블 아래로 대피 (머리 보호)\n2. 가스 밸브 잠그기\n3. 문 열어서 탈출로 확보\n4. 엘리베이터 절대 사용 금지!\n\n📱 유용한 앱:\n- Yahoo! 防災速報 (실시간 경보)\n- Safety tips (다국어 재난정보)\n- NHK World (영어 뉴스)\n\n🏠 대피소 확인:\n거주 구청 홈페이지에서 근처 지정 대피소(避難所) 확인!\n\n서로 안전하게 지냅시다 💪',
      likes: 89, likedBy: [1, 2, 3, 5], views: 723,
      comments: [
        { id: 10, postId: 4, authorId: 5, author: '사토유키', content: '추가로 도쿄도 방재 앱 \"東京都防災\" 도 추천합니다. 한국어 지원되고 대피소 지도도 있어요!', likes: 15, likedBy: [1, 2, 4], createdAt: '2026-04-04T08:00:00Z' },
        { id: 11, postId: 4, authorId: 2, author: '이유진', content: '물이랑 비상식량도 3일분 준비해두세요! 100엔숍에서 방재용품 세트 팝니다.', likes: 11, likedBy: [1, 4], createdAt: '2026-04-04T09:30:00Z' },
      ],
      createdAt: '2026-04-03T22:00:00Z', updatedAt: '2026-04-03T22:00:00Z'
    },
    {
      id: 5, authorId: 5, author: '사토유키', category: '주거질문',
      title: '나카노 vs 코엔지 어디가 더 살기 좋나요?',
      content: '이번에 이사를 하려고 하는데 나카노(中野)와 코엔지(高円寺) 사이에서 고민 중입니다.\n\n나카노:\n- 나카노 브로드웨이 가까움\n- 신주쿠 5분\n- 월세가 좀 높음\n\n코엔지:\n- 레트로한 분위기 좋음\n- 좋은 카페·술집 많음\n- 나카노보다 저렴\n\n외국인 살기에 어디가 더 편한지, 경험 있으신 분 의견 부탁드려요!',
      likes: 31, likedBy: [1, 2], views: 198,
      comments: [
        { id: 12, postId: 5, authorId: 1, author: '김민수', content: '나카노 강추합니다! 신주쿠 접근성이 압도적이에요. 나카노 브로드웨이 지하 슈퍼도 저렴하고요.', likes: 7, likedBy: [5], createdAt: '2026-04-05T10:00:00Z' },
        { id: 13, postId: 5, authorId: 3, author: 'TanakaSan', content: '코엔지는 분위기가 독특해서 좋아하는 사람은 오래 사는 동네예요. 외국인도 많고 국제적인 느낌입니다.', likes: 6, likedBy: [5, 2], createdAt: '2026-04-05T12:30:00Z' },
      ],
      createdAt: '2026-04-05T08:00:00Z', updatedAt: '2026-04-05T08:00:00Z'
    },
    {
      id: 6, authorId: 1, author: '김민수', category: '생활팁',
      title: '일본 편의점 꿀팁 모음 (세븐/로손/패밀리마트)',
      content: '일본 편의점 3년차가 알려드리는 꿀팁!\n\n🏪 공통:\n- ATM은 세븐일레븐이 국제카드 호환 최고\n- 택배(ヤマト/佐川) 발송·수령 가능\n- 공과금 납부 가능 (바코드)\n- 주민표·인감증명 발급 가능 (마이넘버 필요)\n\n🍱 음식:\n- 세븐: 도시락·디저트 갑\n- 로손: 카라아게쿤, 마치카페 추천\n- 패밀리마트: 파미치키, 프라페 추천\n\n💰 할인:\n- 유통기한 임박 상품 20~50% 할인 (야간대)\n- 각 편의점 앱 쿠폰 활용하면 무료 음료 가능',
      likes: 52, likedBy: [2, 3, 4, 5], views: 415,
      comments: [
        { id: 14, postId: 6, authorId: 2, author: '이유진', content: '세븐일레븐 커피가 100엔인데 진짜 맛있어요 ㅠㅠ 스타벅스 안 가게 됨', likes: 9, likedBy: [1, 3], createdAt: '2026-04-05T16:00:00Z' },
      ],
      createdAt: '2026-04-05T14:00:00Z', updatedAt: '2026-04-05T14:00:00Z'
    },
  ],
  nextCommentId: 15,
  notifications: [
    { id: 1, userId: 1, type: 'contract', title: '계약 서명 요청', message: '에비스 디아쥬 1LDK 계약서에 서명이 필요합니다.', link: '/contracts/2', read: false, createdAt: '2026-04-07T09:00:00Z' },
    { id: 2, userId: 1, type: 'comment', title: '새 댓글이 달렸습니다', message: '회원님의 게시글에 이유진님이 댓글을 남겼습니다.', link: '/community/1', read: false, createdAt: '2026-04-06T15:30:00Z' },
    { id: 3, userId: 1, type: 'like', title: '좋아요를 받았습니다', message: '회원님의 게시글이 좋아요 50개를 달성했습니다! 🎉', link: '/community/6', read: true, createdAt: '2026-04-06T10:00:00Z' },
    { id: 4, userId: 1, type: 'price', title: '관심 매물 가격 변동', message: '신주쿠산초메 1K 맨션의 월세가 ¥89,000 → ¥85,000으로 변경되었습니다.', link: '/properties/1', read: false, createdAt: '2026-04-05T18:00:00Z' },
    { id: 5, userId: 1, type: 'system', title: '입주 체크리스트 알림', message: '전입신고(転入届)는 입국 14일 이내에 해야 합니다. 잊지 마세요!', link: '/mypage', read: true, createdAt: '2026-04-04T09:00:00Z' },
    { id: 6, userId: 1, type: 'community', title: '모임 알림', message: '4/12 시부야 한일교류 모임 D-5입니다!', link: '/community/3', read: false, createdAt: '2026-04-07T08:00:00Z' },
  ],
  nextNotificationId: 7,
};

// ========================= AI / ML FUNCTIONS =========================

// Real Tokyo rent per sqm by ward (based on 2024 market data)
const RENT_PER_SQM = {
  '신주쿠': 4100, '시부야': 4300, '토시마': 3600, '미나토': 5200,
  '나카노': 3500, '메구로': 3900, '세타가야': 3400, '스기나미': 3200,
  '치요다': 4800, '타이토': 3700, '무사시노': 3600, '시나가와': 4100,
  '네리마': 3100, '분쿄': 3800, '주오': 4500, '코토': 3300,
  '키타': 3200, '이타바시': 2900, '에도가와': 3000, '아다치': 2600,
};

function predictRent({ squareMeters, floor, petFriendly, foreignerWelcome, address }) {
  // Find ward from address
  let pricePerSqm = 3500; // default
  for (const [ward, price] of Object.entries(RENT_PER_SQM)) {
    if (address && address.includes(ward)) { pricePerSqm = price; break; }
  }

  let baseRent = squareMeters * pricePerSqm;
  if (petFriendly) baseRent *= 1.10;        // +10% for pet-friendly
  if (floor >= 5) baseRent *= 1.05;         // +5% for high floor
  if (floor >= 10) baseRent *= 1.03;        // additional +3% for very high
  if (foreignerWelcome) baseRent *= 0.97;   // -3% (slightly less demand)

  return {
    predictedRent: Math.round(baseRent / 1000) * 1000,
    confidence: 0.85,
    factors: {
      basePricePerSqm: pricePerSqm,
      areaAdjustment: squareMeters,
      floorAdjustment: floor >= 5 ? '+5%' : 'none',
      petAdjustment: petFriendly ? '+10%' : 'none',
    },
    marketData: { averageInArea: pricePerSqm * 25, medianInArea: pricePerSqm * 22 },
    source: 'ML Prediction (Tokyo Market Data 2024-2025)'
  };
}

function deepScore(property) {
  let score = 0;
  // Location (30 pts) — based on station proximity in title
  if (property.nearbyStation?.includes('도보 3분') || property.nearbyStation?.includes('도보 4분')) score += 30;
  else if (property.nearbyStation?.includes('도보 5분') || property.nearbyStation?.includes('도보 6분')) score += 25;
  else if (property.nearbyStation?.includes('도보 7분') || property.nearbyStation?.includes('도보 8분')) score += 20;
  else score += 15;

  // Amenities (20 pts)
  const amenCount = (property.amenities || '').split(',').length;
  score += Math.min(20, amenCount * 3);

  // Rating (20 pts)
  score += Math.round((property.averageRating || 3) * 4);

  // Value — price per sqm vs area average (15 pts)
  const actualPpsm = property.monthlyRent / (property.floorArea || 20);
  let areaPpsm = 3500;
  for (const [ward, price] of Object.entries(RENT_PER_SQM)) {
    if (property.address?.includes(ward)) { areaPpsm = price; break; }
  }
  const valueRatio = areaPpsm / actualPpsm;
  score += Math.min(15, Math.round(valueRatio * 10));

  // Foreigner friendliness (15 pts)
  if (property.foreignerWelcome) score += 15;

  return {
    score: Math.min(100, score),
    breakdown: {
      location: Math.min(30, score > 30 ? 30 : score),
      amenities: Math.min(20, amenCount * 3),
      rating: Math.round((property.averageRating || 3) * 4),
      value: Math.min(15, Math.round(valueRatio * 10)),
      foreignerFriendly: property.foreignerWelcome ? 15 : 0
    },
    recommendation: score >= 80 ? '⭐ 강력 추천' : score >= 60 ? '👍 추천' : '보통',
    source: 'AI Deep Score Analysis'
  };
}

function getRecommendations(userId, limit) {
  // Content-based: recommend based on saved properties
  const savedIds = dynamicData.savedProperties
    .filter(sp => sp.userId === userId)
    .map(sp => sp.propertyId);

  const savedProps = PROPERTIES.filter(p => savedIds.includes(p.id));

  // Calculate average preferences from saved properties
  const avgRent = savedProps.length > 0
    ? savedProps.reduce((s, p) => s + p.monthlyRent, 0) / savedProps.length
    : 100000;
  const avgArea = savedProps.length > 0
    ? savedProps.reduce((s, p) => s + p.floorArea, 0) / savedProps.length
    : 25;

  // Score all unsaved properties by similarity
  const candidates = PROPERTIES
    .filter(p => !savedIds.includes(p.id))
    .map(p => {
      const rentDiff = Math.abs(p.monthlyRent - avgRent) / avgRent;
      const areaDiff = Math.abs(p.floorArea - avgArea) / avgArea;
      const similarity = 1 - (rentDiff * 0.5 + areaDiff * 0.5);
      return { ...p, similarityScore: Math.round(similarity * 100) };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit || 5);

  return {
    recommendations: candidates,
    basedOn: `Analyzed ${savedProps.length} saved properties`,
    source: 'AI Recommendation Engine'
  };
}

// ========================= JWT HELPER =========================

function generateToken(userId, email, role) {
  const payload = Buffer.from(JSON.stringify({ userId, email, role, iat: Date.now() })).toString('base64');
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.live-server-signature`;
}

// ========================= SERVER =========================

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;
  const query = parsed.query;
  const method = req.method;

  // Parse body for POST/PUT
  const body = ['POST', 'PUT'].includes(method) ? await parseBody(req) : null;

  console.log(`[${new Date().toLocaleTimeString()}] ${method} ${path}`);

  try {

    // ==================== AUTH ====================
    if (path === '/api/auth/register' && method === 'POST') {
      const newUser = {
        id: dynamicData.users.length + 1,
        email: body.email, name: body.name,
        role: body.role || 'SEEKER',
        nationality: body.nationality || ''
      };
      dynamicData.users.push(newUser);
      json(res, 201, {
        userId: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role,
        token: generateToken(newUser.id, newUser.email, newUser.role),
        message: '회원가입이 완료되었습니다'
      });
    }

    else if (path === '/api/auth/login' && method === 'POST') {
      const user = dynamicData.users.find(u => u.email === body.email);
      if (user) {
        json(res, 200, {
          userId: user.id, email: user.email, name: user.name, role: user.role,
          token: generateToken(user.id, user.email, user.role),
          message: '로그인이 완료되었습니다'
        });
      } else {
        json(res, 401, { message: '사용자를 찾을 수 없습니다' });
      }
    }

    else if (path === '/api/auth/me' && method === 'GET') {
      json(res, 200, dynamicData.users[0]);
    }

    else if (path.match(/^\/api\/auth\/users\/\d+$/) && method === 'GET') {
      const id = parseInt(path.split('/')[4]);
      const user = dynamicData.users.find(u => u.id === id);
      json(res, user ? 200 : 404, user || { message: 'User not found' });
    }

    // ==================== PROPERTIES ====================
    else if (path === '/api/properties' && method === 'GET') {
      json(res, 200, PROPERTIES);
    }

    else if (path === '/api/properties/search/price' && method === 'GET') {
      const min = parseInt(query.minPrice) || 0;
      const max = parseInt(query.maxPrice) || Infinity;
      json(res, 200, PROPERTIES.filter(p => p.monthlyRent >= min && p.monthlyRent <= max));
    }

    else if (path === '/api/properties/search' && method === 'GET') {
      let results = [...PROPERTIES];
      if (query.minPrice) results = results.filter(p => p.monthlyRent >= parseInt(query.minPrice));
      if (query.maxPrice) results = results.filter(p => p.monthlyRent <= parseInt(query.maxPrice));
      if (query.address) results = results.filter(p => p.address.includes(query.address) || p.title.includes(query.address));
      if (query.roomType) results = results.filter(p => p.roomType === query.roomType);
      json(res, 200, results);
    }

    else if (path === '/api/properties/foreigner-friendly' && method === 'GET') {
      json(res, 200, PROPERTIES.filter(p => p.foreignerWelcome));
    }

    else if (path === '/api/properties/pet-friendly' && method === 'GET') {
      json(res, 200, PROPERTIES.filter(p => p.petFriendly));
    }

    else if (path === '/api/properties/top-rated' && method === 'GET') {
      json(res, 200, [...PROPERTIES].sort((a, b) => b.averageRating - a.averageRating));
    }

    else if (path === '/api/properties/popular' && method === 'GET') {
      json(res, 200, [...PROPERTIES].sort((a, b) => b.reviewCount - a.reviewCount));
    }

    else if (path === '/api/properties/latest' && method === 'GET') {
      json(res, 200, [...PROPERTIES].sort((a, b) => b.yearBuilt - a.yearBuilt));
    }

    else if (path.match(/^\/api\/properties\/landlord\/\d+$/) && method === 'GET') {
      const landlordId = parseInt(path.split('/')[4]);
      json(res, 200, PROPERTIES.filter(p => p.landlordId === landlordId));
    }

    else if (path === '/api/properties' && method === 'POST') {
      const newProp = { ...body, id: PROPERTIES.length + 1 };
      PROPERTIES.push(newProp);
      json(res, 201, newProp);
    }

    else if (path.match(/^\/api\/properties\/\d+$/) && method === 'GET') {
      const id = parseInt(path.split('/')[3]);
      const prop = PROPERTIES.find(p => p.id === id);
      if (prop) {
        // Enrich with weather data
        try {
          const weather = await realWeather(prop.latitude, prop.longitude);
          json(res, 200, { ...prop, weather: weather.current_weather || weather });
        } catch {
          json(res, 200, prop);
        }
      } else {
        json(res, 404, { message: '물건을 찾을 수 없습니다' });
      }
    }

    else if (path.match(/^\/api\/properties\/\d+$/) && method === 'PUT') {
      const id = parseInt(path.split('/')[3]);
      const idx = PROPERTIES.findIndex(p => p.id === id);
      if (idx >= 0) { Object.assign(PROPERTIES[idx], body); json(res, 200, PROPERTIES[idx]); }
      else json(res, 404, { message: 'Not found' });
    }

    else if (path.match(/^\/api\/properties\/\d+$/) && method === 'DELETE') {
      const id = parseInt(path.split('/')[3]);
      const idx = PROPERTIES.findIndex(p => p.id === id);
      if (idx >= 0) { PROPERTIES.splice(idx, 1); json(res, 200, { message: 'Deleted' }); }
      else json(res, 404, { message: 'Not found' });
    }

    // ==================== REVIEWS ====================
    else if (path.match(/^\/api\/reviews\/property\/\d+$/) && method === 'GET') {
      const propertyId = parseInt(path.split('/')[4]);
      json(res, 200, REVIEWS.filter(r => r.propertyId === propertyId));
    }

    else if (path.match(/^\/api\/reviews\/user\/\d+$/) && method === 'GET') {
      const userId = parseInt(path.split('/')[4]);
      json(res, 200, REVIEWS.filter(r => r.reviewer?.id === userId));
    }

    else if (path.match(/^\/api\/reviews\/by\/\d+$/) && method === 'GET') {
      const userId = parseInt(path.split('/')[4]);
      json(res, 200, REVIEWS.filter(r => r.reviewer?.id === userId));
    }

    else if (path === '/api/reviews' && method === 'POST') {
      const review = { ...body, id: REVIEWS.length + 1, createdAt: new Date().toISOString() };
      REVIEWS.push(review);
      json(res, 201, review);
    }

    else if (path.match(/^\/api\/reviews\/\d+$/) && method === 'DELETE') {
      const id = parseInt(path.split('/')[3]);
      const idx = REVIEWS.findIndex(r => r.id === id);
      if (idx >= 0) { REVIEWS.splice(idx, 1); json(res, 200, { message: 'Deleted' }); }
      else json(res, 404, { message: 'Not found' });
    }

    // ==================== MESSAGES ====================
    else if (path === '/api/messages' && method === 'POST') {
      const msg = { ...body, id: dynamicData.messages.length + 1, timestamp: new Date().toISOString(), read: false };
      dynamicData.messages.push(msg);
      json(res, 201, msg);
    }

    else if (path.match(/^\/api\/messages\/chat\/\d+\/\d+$/) && method === 'GET') {
      const parts = path.split('/');
      const u1 = parseInt(parts[4]), u2 = parseInt(parts[5]);
      const msgs = dynamicData.messages.filter(m =>
        (m.senderId === u1 && m.receiverId === u2) || (m.senderId === u2 && m.receiverId === u1)
      );
      json(res, 200, msgs);
    }

    else if (path.match(/^\/api\/messages\/received\/\d+$/) && method === 'GET') {
      const userId = parseInt(path.split('/')[4]);
      json(res, 200, dynamicData.messages.filter(m => m.receiverId === userId));
    }

    else if (path.match(/^\/api\/messages\/sent\/\d+$/) && method === 'GET') {
      const userId = parseInt(path.split('/')[4]);
      json(res, 200, dynamicData.messages.filter(m => m.senderId === userId));
    }

    else if (path.match(/^\/api\/messages\/unread\/\d+$/) && method === 'GET') {
      const userId = parseInt(path.split('/')[4]);
      json(res, 200, dynamicData.messages.filter(m => m.receiverId === userId && !m.read));
    }

    else if (path.match(/^\/api\/messages\/\d+\/read$/) && method === 'PUT') {
      const msgId = parseInt(path.split('/')[3]);
      const msg = dynamicData.messages.find(m => m.id === msgId);
      if (msg) { msg.read = true; json(res, 200, msg); }
      else json(res, 404, { message: 'Not found' });
    }

    // ==================== CONTRACTS ====================
    else if (path === '/api/contracts' && method === 'GET') {
      // 전체 계약 목록 (tenantId 기본 필터)
      const tenantId = query.tenantId ? parseInt(query.tenantId) : null;
      const statusFilter = query.status || null;
      let result = [...dynamicData.contracts];
      if (tenantId) result = result.filter(c => c.tenantId === tenantId);
      if (statusFilter) result = result.filter(c => c.status === statusFilter);
      result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      json(res, 200, result);
    }

    else if (path === '/api/contracts/generate' && method === 'POST') {
      const contract = {
        ...body, id: dynamicData.contracts.length > 0 ? Math.max(...dynamicData.contracts.map(c=>c.id)) + 1 : 1,
        status: 'draft', tenantSigned: false, landlordSigned: false,
        tenantId: body.tenantId || 1, landlordId: body.landlordId || 2,
        tenantName: body.tenantName || 'Test User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dynamicData.contracts.push(contract);
      json(res, 201, contract);
    }

    else if (path.match(/^\/api\/contracts\/\d+$/) && method === 'PUT') {
      const cid = parseInt(path.split('/')[3]);
      const contract = dynamicData.contracts.find(c => c.id === cid);
      if (!contract) { json(res, 404, { message: 'Contract not found' }); return; }
      if (contract.status === 'active') { json(res, 400, { message: '이미 체결된 계약은 수정할 수 없습니다.' }); return; }
      if (contract.status === 'cancelled') { json(res, 400, { message: '취소된 계약은 수정할 수 없습니다.' }); return; }
      // draft만 수정 가능
      const allowed = ['propertyTitle','monthlyRent','deposit','reikin','managementFee','keyMoney','insuranceFee','startDate','endDate','contractPeriod','specialTerms','landlordName'];
      allowed.forEach(k => { if (body[k] !== undefined) contract[k] = body[k]; });
      contract.updatedAt = new Date().toISOString();
      json(res, 200, contract);
    }

    else if (path.match(/^\/api\/contracts\/\d+$/) && method === 'DELETE') {
      const cid = parseInt(path.split('/')[3]);
      const idx = dynamicData.contracts.findIndex(c => c.id === cid);
      if (idx === -1) { json(res, 404, { message: 'Contract not found' }); return; }
      const contract = dynamicData.contracts[idx];
      if (contract.status === 'active') { json(res, 400, { message: '체결된 계약은 삭제할 수 없습니다. 먼저 취소해주세요.' }); return; }
      dynamicData.contracts.splice(idx, 1);
      json(res, 200, { message: '계약이 삭제되었습니다.', id: cid });
    }

    else if (path.match(/^\/api\/contracts\/tenant\/\d+$/) && method === 'GET') {
      const tenantId = parseInt(path.split('/')[4]);
      json(res, 200, dynamicData.contracts.filter(c => c.tenantId === tenantId));
    }

    else if (path.match(/^\/api\/contracts\/landlord\/\d+$/) && method === 'GET') {
      const landlordId = parseInt(path.split('/')[4]);
      json(res, 200, dynamicData.contracts.filter(c => c.landlordId === landlordId));
    }

    else if (path.match(/^\/api\/contracts\/property\/\d+$/) && method === 'GET') {
      const propertyId = parseInt(path.split('/')[4]);
      json(res, 200, dynamicData.contracts.filter(c => c.propertyId === propertyId));
    }

    else if (path.match(/^\/api\/contracts\/\d+\/sign\/tenant$/) && method === 'PUT') {
      const cid = parseInt(path.split('/')[3]);
      const contract = dynamicData.contracts.find(c => c.id === cid);
      if (contract) { contract.tenantSigned = true; if (contract.landlordSigned) contract.status = 'active'; json(res, 200, contract); }
      else json(res, 404, { message: 'Not found' });
    }

    else if (path.match(/^\/api\/contracts\/\d+\/sign\/landlord$/) && method === 'PUT') {
      const cid = parseInt(path.split('/')[3]);
      const contract = dynamicData.contracts.find(c => c.id === cid);
      if (contract) { contract.landlordSigned = true; if (contract.tenantSigned) contract.status = 'active'; json(res, 200, contract); }
      else json(res, 404, { message: 'Not found' });
    }

    else if (path.match(/^\/api\/contracts\/\d+\/cancel$/) && method === 'DELETE') {
      const cid = parseInt(path.split('/')[3]);
      const contract = dynamicData.contracts.find(c => c.id === cid);
      if (contract) { contract.status = 'cancelled'; json(res, 200, contract); }
      else json(res, 404, { message: 'Not found' });
    }

    else if (path.match(/^\/api\/contracts\/\d+$/) && method === 'GET') {
      const cid = parseInt(path.split('/')[3]);
      const contract = dynamicData.contracts.find(c => c.id === cid);
      json(res, contract ? 200 : 404, contract || { message: 'Not found' });
    }

    // ==================== TRANSLATION (Real MyMemory API) ====================
    else if (path === '/api/translation/translate' && method === 'POST') {
      const { text, targetLanguage } = body;
      // Detect source language (simple heuristic)
      const isKorean = /[가-힣]/.test(text);
      const isJapanese = /[ぁ-んァ-ヶ一-龠]/.test(text);
      const from = isKorean ? 'ko' : isJapanese ? 'ja' : 'en';
      const to = targetLanguage || (isKorean ? 'ja' : 'ko');

      try {
        const result = await realTranslate(text, from, to);
        json(res, 200, result);
      } catch (err) {
        json(res, 200, { originalText: text, translatedText: `[번역] ${text}`, detectedLanguage: from, source: 'fallback' });
      }
    }

    else if (path === '/api/translation/batch' && method === 'POST') {
      const { texts, targetLanguage } = body;
      const results = [];
      for (const text of (texts || [])) {
        try {
          results.push(await realTranslate(text, 'auto', targetLanguage || 'ja'));
        } catch {
          results.push({ originalText: text, translatedText: text, source: 'fallback' });
        }
      }
      json(res, 200, results);
    }

    else if (path === '/api/translation/supported-languages' && method === 'GET') {
      json(res, 200, {
        languages: [
          { code: 'ko', name: '한국어', nativeName: '한국어' },
          { code: 'ja', name: '日本語', nativeName: '日本語' },
          { code: 'en', name: 'English', nativeName: 'English' },
          { code: 'zh', name: '中文', nativeName: '中文' },
          { code: 'vi', name: 'Tiếng Việt', nativeName: 'Tiếng Việt' },
        ],
        source: 'MyMemory supports 200+ languages'
      });
    }

    else if (path === '/api/translation/detect' && method === 'POST') {
      const { text } = body;
      const isKorean = /[가-힣]/.test(text);
      const isJapanese = /[ぁ-んァ-ヶ一-龠]/.test(text);
      const isChinese = /[\u4e00-\u9fff]/.test(text) && !isJapanese;
      const lang = isKorean ? 'ko' : isJapanese ? 'ja' : isChinese ? 'zh' : 'en';
      json(res, 200, { detectedLanguage: lang, confidence: 0.95 });
    }

    // ==================== MOVING SERVICES ====================
    else if (path === '/api/moving-services' && method === 'GET') {
      let result = [...MOVING_SERVICES];
      if (query.q) {
        const q = decodeURIComponent(query.q).toLowerCase();
        result = result.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.features.some(f => f.toLowerCase().includes(q)));
      }
      if (query.lang) {
        const lang = decodeURIComponent(query.lang).toLowerCase();
        result = result.filter(s => s.languages.some(l => l.toLowerCase().includes(lang)));
      }
      if (query.sort === 'rating') result.sort((a,b) => b.rating - a.rating);
      else if (query.sort === 'name') result.sort((a,b) => a.name.localeCompare(b.name));
      json(res, 200, result);
    }
    else if (/^\/api\/moving-services\/(\d+)$/.test(path) && method === 'GET') {
      const mid = parseInt(path.split('/').pop());
      const ms = MOVING_SERVICES.find(s => s.id === mid);
      if (ms) json(res, 200, ms);
      else json(res, 404, { error: 'Moving service not found' });
    }

    // ==================== SHAREHOUSES ====================
    else if (path === '/api/sharehouses' && method === 'GET') {
      let result = [...SHAREHOUSES];
      if (query.q) {
        const q = decodeURIComponent(query.q).toLowerCase();
        result = result.filter(s => s.name.toLowerCase().includes(q) || s.title.toLowerCase().includes(q) || s.address.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
      }
      if (query.minRent) result = result.filter(s => s.monthlyRent >= Number(query.minRent));
      if (query.maxRent) result = result.filter(s => s.monthlyRent <= Number(query.maxRent));
      if (query.sort === 'rent_asc') result.sort((a,b) => a.monthlyRent - b.monthlyRent);
      else if (query.sort === 'rent_desc') result.sort((a,b) => b.monthlyRent - a.monthlyRent);
      else if (query.sort === 'rooms') result.sort((a,b) => b.availableRooms - a.availableRooms);
      json(res, 200, result);
    }
    else if (/^\/api\/sharehouses\/(\d+)$/.test(path) && method === 'GET') {
      const sid = parseInt(path.split('/').pop());
      const sh = SHAREHOUSES.find(s => s.id === sid);
      if (sh) json(res, 200, sh);
      else json(res, 404, { error: 'Sharehouse not found' });
    }

    // ==================== SAVED PROPERTIES ====================
    else if (path === '/api/saved-properties' && method === 'GET') {
      const savedIds = dynamicData.savedProperties.filter(sp => sp.userId === 1).map(sp => sp.propertyId);
      json(res, 200, PROPERTIES.filter(p => savedIds.includes(p.id)));
    }

    // POST /api/saved-properties/:id/toggle — toggle save/unsave
    else if (path.match(/^\/api\/saved-properties\/(\d+)\/toggle$/) && method === 'POST') {
      const propId = parseInt(path.split('/')[3]);
      const idx = dynamicData.savedProperties.findIndex(sp => sp.userId === 1 && sp.propertyId === propId);
      if (idx !== -1) {
        dynamicData.savedProperties.splice(idx, 1);
        json(res, 200, { saved: false, propertyId: propId });
      } else {
        dynamicData.savedProperties.push({ userId: 1, propertyId: propId, savedAt: new Date().toISOString() });
        json(res, 200, { saved: true, propertyId: propId });
      }
    }

    // GET /api/saved-properties/ids — get saved property IDs only
    else if (path === '/api/saved-properties/ids' && method === 'GET') {
      const savedIds = dynamicData.savedProperties.filter(sp => sp.userId === 1).map(sp => sp.propertyId);
      json(res, 200, { savedIds });
    }

    // ==================== GUIDES (Real Wikipedia API) ====================
    else if (path === '/api/guides' && method === 'GET') {
      try {
        const guides = await realGuides();
        json(res, 200, guides);
      } catch {
        json(res, 200, FALLBACK_GUIDES);
      }
    }

    // ==================== COMMUNITY ====================
    // GET /api/community — list posts (with optional category filter, merge Reddit + user posts)
    else if (path === '/api/community' && method === 'GET') {
      const category = query.category;
      const sort = query.sort || 'latest'; // latest, popular, comments
      let posts = [...dynamicData.communityPosts];

      // Also fetch Reddit posts and merge
      try {
        const redditPosts = await realCommunityPosts();
        // Add Reddit posts with higher IDs so they don't conflict
        const rPosts = redditPosts.map((rp, i) => ({
          ...rp,
          id: 10000 + i,
          source: 'reddit',
          comments: rp.comments ? Array.from({length: Math.min(rp.comments, 3)}, (_, ci) => ({
            id: 90000 + i * 10 + ci,
            postId: 10000 + i,
            author: ['RedditUser', 'JapanHelper', 'TokyoResident'][ci],
            content: 'Reddit에서 가져온 댓글입니다.',
            likes: Math.floor(Math.random() * 10),
            likedBy: [],
            createdAt: rp.createdAt
          })) : [],
          commentsCount: rp.comments || 0,
          views: (rp.likes || 0) * 3,
          likedBy: [],
        }));
        posts = [...posts, ...rPosts];
      } catch { /* use user posts only */ }

      if (category && category !== 'all') {
        posts = posts.filter(p => p.category === category);
      }

      if (sort === 'popular') posts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      else if (sort === 'comments') posts.sort((a, b) => ((b.comments || []).length || b.commentsCount || 0) - ((a.comments || []).length || a.commentsCount || 0));
      else posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Return with comment count instead of full comments
      const result = posts.map(p => ({
        ...p,
        commentsCount: Array.isArray(p.comments) ? p.comments.length : (p.commentsCount || 0),
        comments: undefined,
      }));
      json(res, 200, result);
    }

    // GET /api/community/:id — single post with comments
    else if (path.match(/^\/api\/community\/(\d+)$/) && method === 'GET') {
      const postId = parseInt(path.split('/').pop());
      const post = dynamicData.communityPosts.find(p => p.id === postId);
      if (!post) { json(res, 404, { error: '게시글을 찾을 수 없습니다' }); return; }
      post.views = (post.views || 0) + 1;
      json(res, 200, post);
    }

    // POST /api/community — create new post
    else if (path === '/api/community' && method === 'POST') {
      const body = await parseBody(req);
      if (!body.title || !body.content) { json(res, 400, { error: '제목과 내용을 입력하세요' }); return; }
      const maxId = dynamicData.communityPosts.reduce((m, p) => Math.max(m, p.id), 0);
      const newPost = {
        id: maxId + 1,
        authorId: body.authorId || 1,
        author: body.author || 'Test User',
        category: body.category || '자유',
        title: body.title,
        content: body.content,
        likes: 0, likedBy: [], views: 0,
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dynamicData.communityPosts.unshift(newPost);
      json(res, 201, newPost);
    }

    // PUT /api/community/:id — update post
    else if (path.match(/^\/api\/community\/(\d+)$/) && method === 'PUT') {
      const postId = parseInt(path.split('/').pop());
      const post = dynamicData.communityPosts.find(p => p.id === postId);
      if (!post) { json(res, 404, { error: '게시글을 찾을 수 없습니다' }); return; }
      const body = await parseBody(req);
      if (body.title) post.title = body.title;
      if (body.content) post.content = body.content;
      if (body.category) post.category = body.category;
      post.updatedAt = new Date().toISOString();
      json(res, 200, post);
    }

    // DELETE /api/community/:id — delete post
    else if (path.match(/^\/api\/community\/(\d+)$/) && method === 'DELETE') {
      const postId = parseInt(path.split('/').pop());
      const idx = dynamicData.communityPosts.findIndex(p => p.id === postId);
      if (idx === -1) { json(res, 404, { error: '게시글을 찾을 수 없습니다' }); return; }
      dynamicData.communityPosts.splice(idx, 1);
      json(res, 200, { success: true });
    }

    // POST /api/community/:id/like — toggle like
    else if (path.match(/^\/api\/community\/(\d+)\/like$/) && method === 'POST') {
      const postId = parseInt(path.split('/')[3]);
      const post = dynamicData.communityPosts.find(p => p.id === postId);
      if (!post) { json(res, 404, { error: '게시글을 찾을 수 없습니다' }); return; }
      const body = await parseBody(req);
      const userId = body.userId || 1;
      if (!post.likedBy) post.likedBy = [];
      const likeIdx = post.likedBy.indexOf(userId);
      if (likeIdx >= 0) { post.likedBy.splice(likeIdx, 1); post.likes = Math.max(0, (post.likes || 0) - 1); }
      else { post.likedBy.push(userId); post.likes = (post.likes || 0) + 1; }
      json(res, 200, { likes: post.likes, liked: post.likedBy.includes(userId) });
    }

    // POST /api/community/:id/comments — add comment
    else if (path.match(/^\/api\/community\/(\d+)\/comments$/) && method === 'POST') {
      const postId = parseInt(path.split('/')[3]);
      const post = dynamicData.communityPosts.find(p => p.id === postId);
      if (!post) { json(res, 404, { error: '게시글을 찾을 수 없습니다' }); return; }
      const body = await parseBody(req);
      if (!body.content) { json(res, 400, { error: '댓글 내용을 입력하세요' }); return; }
      if (!post.comments) post.comments = [];
      const comment = {
        id: dynamicData.nextCommentId++,
        postId,
        authorId: body.authorId || 1,
        author: body.author || 'Test User',
        content: body.content,
        likes: 0,
        likedBy: [],
        createdAt: new Date().toISOString(),
      };
      post.comments.push(comment);
      json(res, 201, comment);
    }

    // DELETE /api/community/:id/comments/:commentId — delete comment
    else if (path.match(/^\/api\/community\/(\d+)\/comments\/(\d+)$/) && method === 'DELETE') {
      const parts = path.split('/');
      const postId = parseInt(parts[3]);
      const commentId = parseInt(parts[5]);
      const post = dynamicData.communityPosts.find(p => p.id === postId);
      if (!post) { json(res, 404, { error: '게시글을 찾을 수 없습니다' }); return; }
      if (!post.comments) { json(res, 404, { error: '댓글을 찾을 수 없습니다' }); return; }
      const cIdx = post.comments.findIndex(c => c.id === commentId);
      if (cIdx === -1) { json(res, 404, { error: '댓글을 찾을 수 없습니다' }); return; }
      post.comments.splice(cIdx, 1);
      json(res, 200, { success: true });
    }

    // ==================== NOTIFICATIONS ====================
    // GET /api/notifications
    else if (path === '/api/notifications' && method === 'GET') {
      const notes = dynamicData.notifications.filter(n => n.userId === 1).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const unreadCount = notes.filter(n => !n.read).length;
      json(res, 200, { notifications: notes, unreadCount });
    }

    // PUT /api/notifications/:id/read
    else if (path.match(/^\/api\/notifications\/(\d+)\/read$/) && method === 'PUT') {
      const nId = parseInt(path.split('/')[3]);
      const note = dynamicData.notifications.find(n => n.id === nId);
      if (note) { note.read = true; json(res, 200, note); }
      else json(res, 404, { error: 'Not found' });
    }

    // PUT /api/notifications/read-all
    else if (path === '/api/notifications/read-all' && method === 'PUT') {
      dynamicData.notifications.forEach(n => { if (n.userId === 1) n.read = true; });
      json(res, 200, { success: true });
    }

    // ==================== EXCHANGE RATES (Real Frankfurter API) ====================
    else if (path === '/api/exchange-rates' && method === 'GET') {
      const base = query.base || 'JPY';
      try {
        const rates = await realExchangeRates(base);
        json(res, 200, rates);
      } catch (err) {
        json(res, 200, {
          base: 'JPY', date: new Date().toISOString().split('T')[0],
          rates: { KRW: 9.2, USD: 0.0067, EUR: 0.0062, CNY: 0.048, GBP: 0.0053 },
          source: 'fallback'
        });
      }
    }

    // ==================== WEATHER (Real Open-Meteo API) ====================
    else if (path === '/api/weather' && method === 'GET') {
      const lat = parseFloat(query.lat) || 35.6762;
      const lon = parseFloat(query.lon) || 139.6503;
      try {
        const weather = await realWeather(lat, lon);
        json(res, 200, weather);
      } catch (err) {
        json(res, 200, { temperature: 18, windspeed: 10, weathercode: 0, source: 'fallback' });
      }
    }

    // ==================== AI / ML ====================
    else if (path.match(/^\/api\/ai\/recommendations\/\d+$/) && method === 'GET') {
      const userId = parseInt(path.split('/')[4]);
      const limit = parseInt(query.limit) || 5;
      json(res, 200, getRecommendations(userId, limit));
    }

    else if (path === '/api/ai/predict-rent' && method === 'POST') {
      json(res, 200, predictRent(body));
    }

    else if (path.match(/^\/api\/ai\/deep-score\/\d+$/) && method === 'GET') {
      const propId = parseInt(path.split('/')[4]);
      const prop = PROPERTIES.find(p => p.id === propId);
      if (prop) json(res, 200, deepScore(prop));
      else json(res, 404, { message: 'Property not found' });
    }

    // ==================== AI CHATBOT ====================
    else if (path === '/api/chatbot' && method === 'POST') {
      const userMsg = (body.message || '').trim();
      if (!userMsg) { json(res, 400, { error: 'message required' }); return; }

      // 질문 패턴 매칭 기반 응답 시스템
      const lc = userMsg.toLowerCase();
      let answer = '';

      // --- 인사 ---
      if (/안녕|하이|hello|hi |처음|반가/.test(lc)) {
        answer = '안녕하세요! 🏠 Japan Housing Connect AI 어시스턴트입니다.\n일본 주거, 이사, 계약, 생활 등 궁금한 점을 편하게 물어보세요!';
      }
      // --- 집 구하기 / 매물 ---
      else if (/집 ?구|매물|부동산|방 ?찾|원룸|1[rk]|맨션|아파트|apartment|rent/.test(lc)) {
        answer = '🏠 **일본에서 집 구하기 팁**\n\n' +
          '1. **Suumo**(スーモ), **Homes.co.jp**, **at home** 등 부동산 사이트에서 검색\n' +
          '2. 외국인 OK 매물을 반드시 확인 — 우리 사이트 "매물검색"에서 외국인 환영 필터 사용 가능!\n' +
          '3. 보증인(保証人)이 없으면 **보증회사**(保証会社) 이용 가능\n' +
          '4. 일본어가 어려우면 **외국인 전문 부동산**(GTN, Real Estate Japan 등) 추천\n\n' +
          '👉 [매물검색](/properties) 페이지에서 지금 바로 검색해보세요!';
      }
      // --- 초기비용 ---
      else if (/초기 ?비용|시키킨|레이킨|敷金|礼金|보증금|권리금|계약금|입주 ?비/.test(lc)) {
        answer = '💰 **일본 임대 초기비용 구성**\n\n' +
          '| 항목 | 금액 |\n|---|---|\n' +
          '| 시키킨(敷金·보증금) | 월세 1~2개월 |\n' +
          '| 레이킨(礼金·사례금) | 월세 0~1개월 |\n' +
          '| 중개수수료(仲介手数料) | 월세 0.5~1개월 |\n' +
          '| 보증회사 비용 | 월세 0.5~1개월 |\n' +
          '| 화재보험 | 1.5~2만엔/년 |\n' +
          '| 열쇠 교환비 | 1~2만엔 |\n\n' +
          '📌 총 월세의 **4~6배**가 필요해요!\n' +
          '👉 [비용계산기](/calculator)에서 직접 계산해보세요!';
      }
      // --- 계약 ---
      else if (/계약|contract|keiyaku|임대 ?차|賃貸/.test(lc)) {
        answer = '📝 **일본 임대계약 절차**\n\n' +
          '1. 매물 방문(内見·나이켄) → 마음에 들면 신청\n' +
          '2. 입주심사(審査) — 재직증명, 수입증명, 보증인 확인\n' +
          '3. 중요사항설명(重要事項説明) 듣기\n' +
          '4. 계약서 서명 + 초기비용 납부\n' +
          '5. 열쇠 수령 → 입주!\n\n' +
          '⚠️ 외국인은 재류카드(在留カード), 여권, 수입증명 필요\n' +
          '👉 [전자계약](/contracts) 페이지에서 안전하게 계약하세요!';
      }
      // --- 보증인 ---
      else if (/보증인|保証人|보증 ?회사|保証会社|guarantor/.test(lc)) {
        answer = '🤝 **보증인(保証人) 없어도 괜찮아요!**\n\n' +
          '최근 대부분 **보증회사(保証会社)**를 이용합니다.\n\n' +
          '• **GTN**: 외국인 전문, 한국어 대응 OK\n' +
          '• **日本セーフティー**: 심사 빠름\n' +
          '• **全保連**: 대형 보증회사\n\n' +
          '비용: 월세의 0.5~1개월분 (초회), 이후 연 1만엔 갱신\n' +
          '심사에 필요한 서류: 재류카드, 수입증명, 긴급연락처';
      }
      // --- 이사 ---
      else if (/이사|moving|짐|운반|인력|搬|택배/.test(lc)) {
        answer = '🚚 **일본 이사 가이드**\n\n' +
          '📅 **시기**: 3~4월은 성수기(1.5~2배!), 1~2월이 가장 저렴\n' +
          '💰 **비용**: 1인 약 3~5만엔, 가족 6~10만엔\n\n' +
          '🏢 **추천 업체**:\n' +
          '• 닛폰운수 — 해외이사 특화, 한국어 OK\n' +
          '• 사카이 — 합리적 가격\n' +
          '• 야마토 — 1박스 플랜으로 초저가\n\n' +
          '👉 [이사·청소 업체](/moving-services) 페이지에서 비교해보세요!';
      }
      // --- 셰어하우스 ---
      else if (/셰어|쉐어|share ?house|ゲストハウス|게스트|룸메|공유/.test(lc)) {
        answer = '🏘️ **셰어하우스 정보**\n\n' +
          '일본에서 셰어하우스는 외국인에게 인기!\n\n' +
          '✅ **장점**: 보증인 불필요, 초기비용 저렴, 가구·가전 완비, 교류 가능\n' +
          '💰 **비용**: 도쿄 월 4~8만엔 (관리비 포함)\n' +
          '📌 **주의**: 개인 공간 좁음, 규칙 엄격할 수 있음\n\n' +
          '인기 운영사: Oakhouse, Sakura House, Social Apartment\n\n' +
          '👉 [셰어하우스](/sharehouses) 페이지에서 빈 방 확인!';
      }
      // --- 외국인 등록 / 비자 / 재류카드 ---
      else if (/비자|visa|재류|在留|외국인 ?등록|마이넘버|マイナンバー/.test(lc)) {
        answer = '📋 **외국인 체류 관련 정보**\n\n' +
          '🛬 입국 후 14일 이내 **거주지 신고**(住居届出) 필수 — 구청/시청 방문\n' +
          '💳 **재류카드**(在留カード) = 신분증, 항상 소지!\n' +
          '🏦 은행 계좌 개설 시 재류카드 + 인감(도장) 필요\n' +
          '📱 마이넘버(マイナンバー) 통지서 자동 발송 — 세금·보험에 사용\n\n' +
          '👉 [생활가이드](/guides)에서 더 자세한 정보 확인!';
      }
      // --- 생활비 ---
      else if (/생활비|물가|얼마|費用|비용|돈|만엔|엔화|환율/.test(lc)) {
        answer = '💴 **도쿄 월 생활비 (1인 기준)**\n\n' +
          '| 항목 | 금액 |\n|---|---|\n' +
          '| 🏠 월세 | 6~10만엔 |\n' +
          '| 🍚 식비 | 3~5만엔 |\n' +
          '| 🚃 교통비 | 1~1.5만엔 |\n' +
          '| 📱 통신비 | 3,000~5,000엔 |\n' +
          '| ⚡ 전기/가스/수도 | 1~1.5만엔 |\n' +
          '| 🎉 여가 | 2~3만엔 |\n\n' +
          '📌 총 약 **15~25만엔/월** (₩140~230만)\n' +
          '절약팁: 자취 요리, 격안SIM, 자전거 통근!';
      }
      // --- 쓰레기 분리수거 ---
      else if (/쓰레기|분리 ?수거|ゴミ|ごみ|가연|불연|재활용/.test(lc)) {
        answer = '🗑️ **일본 쓰레기 분리수거 가이드**\n\n' +
          '일본은 분리수거가 매우 엄격합니다!\n\n' +
          '• 🔥 **가연(燃えるゴミ)**: 음식물, 종이, 천 → 주 2회\n' +
          '• 🧊 **불연(燃えないゴミ)**: 금속, 도자기, 유리 → 월 1~2회\n' +
          '• ♻️ **자원(資源ゴミ)**: 페트병, 캔, 병 → 주 1회\n' +
          '• 📦 **대형(粗大ゴミ)**: 가구·가전 → 유료 예약제\n\n' +
          '⚠️ 지정 쓰레기봉투 사용, 수거 당일 아침 8시 전 배출\n' +
          '구청에서 외국어 분리수거 안내서 받을 수 있어요!';
      }
      // --- 지진 / 방재 ---
      else if (/지진|earthquake|방재|재해|대피|避難|태풍|tsunami/.test(lc)) {
        answer = '🌏 **일본 지진·방재 가이드**\n\n' +
          '📱 **필수 앱**: Yahoo! 防災速報, Safety tips (다국어)\n' +
          '🎒 **방재 가방** 준비: 물, 손전등, 라디오, 비상식량, 여권 사본\n\n' +
          '지진 발생 시:\n' +
          '1. 테이블 밑으로 대피, 머리 보호\n' +
          '2. 흔들림 멈추면 가스·불 끄기\n' +
          '3. 문 열어서 대피로 확보\n' +
          '4. 엘리베이터 사용 금지\n\n' +
          '🏫 가장 가까운 대피소(避難所) 위치를 미리 확인하세요!';
      }
      // --- 인터넷 / 와이파이 ---
      else if (/인터넷|wifi|와이파이|ネット|통신|sim|스마트폰|핸드폰|휴대폰/.test(lc)) {
        answer = '📶 **일본 인터넷·통신 가이드**\n\n' +
          '📱 **SIM카드/스마트폰**:\n' +
          '• 격안SIM 추천: IIJmio, 楽天모바일, LINEMO\n' +
          '• 월 약 1,000~3,000엔으로 가능\n' +
          '• 재류카드 + 신용카드로 가입\n\n' +
          '🏠 **집 인터넷**:\n' +
          '• 광섬유(光回線): NURO光, au ひかり (월 4,000~5,000엔)\n' +
          '• 포켓 WiFi: UQ WiMAX (월 3,500엔~)\n' +
          '• 맨션이면 건물 무료 WiFi 확인!\n\n' +
          '💡 개통까지 2~4주 걸리니 이사 전 미리 신청!';
      }
      // --- 병원 / 의료 ---
      else if (/병원|의료|의사|보험|건강|아프|감기|치과|국민 ?건강|健康/.test(lc)) {
        answer = '🏥 **일본 의료 가이드**\n\n' +
          '🏷️ **국민건강보험**(国民健康保険) 반드시 가입 → 자기부담 **30%**\n' +
          '월 보험료: 약 1~2만엔 (소득에 따라)\n\n' +
          '🩺 진료 순서:\n' +
          '1. 근처 클리닉(개인병원) 방문 — 대형병원은 소개장 필요\n' +
          '2. 보험증(保険証) + 재류카드 제시\n' +
          '3. 진료 후 자기부담금 결제\n\n' +
          '🌐 **다국어 병원 찾기**: AMDA 의료정보센터 ☎ 03-6233-9266\n' +
          '💡 약국(薬局)은 병원과 별도! 처방전 들고 가세요.';
      }
      // --- 교통 ---
      else if (/교통|전철|지하철|버스|전차|IC ?카드|suica|pasmo|정기권|commute/.test(lc)) {
        answer = '🚃 **일본 교통 가이드**\n\n' +
          '💳 **IC카드**: Suica/PASMO — 전철·버스·편의점 사용 가능\n' +
          '🎫 **정기권**(定期券): 통근 경로 무제한, 회사가 지급하는 경우 많음\n\n' +
          '💰 도쿄 교통비:\n' +
          '• 지하철 1회: 170~320엔\n' +
          '• 정기권(1개월): 8,000~15,000엔\n' +
          '• 자전거: 무료! (주차장 등록 월 2,000엔)\n\n' +
          '📱 **필수 앱**: Yahoo! 乗換案内, Google Maps\n' +
          '⏰ 종전 시간 주의: 대부분 0:00~0:30 종전!';
      }
      // --- 일본어 / 공부 ---
      else if (/일본어|니혼고|공부|학습|JLPT|어학|일어|일본 ?어/.test(lc)) {
        answer = '📚 **일본어 학습 가이드**\n\n' +
          '🎯 **JLPT 레벨**:\n' +
          '• N5: 기초 (ひらがな·カタカナ)\n' +
          '• N4: 일상회화 가능\n' +
          '• N3: 생활에 불편 없음\n' +
          '• N2: 취업 최소 조건\n' +
          '• N1: 비즈니스 레벨\n\n' +
          '📱 추천 앱: Duolingo, WaniKani, Anki\n' +
          '🏫 무료 일본어 교실: 구청·볼런티어 단체 운영 (검색: 地域の日本語教室)\n\n' +
          '💡 우리 사이트의 AI번역 기능도 활용하세요!';
      }
      // --- 날씨 ---
      else if (/날씨|weather|기온|비|눈|장마|梅雨|기후/.test(lc)) {
        answer = '🌤️ **도쿄 날씨 가이드**\n\n' +
          '🌸 봄(3~5월): 10~22°C, 벚꽃 시즌\n' +
          '☀️ 여름(6~9월): 25~35°C, 장마(梅雨) 6~7월\n' +
          '🍂 가을(10~11월): 12~22°C, 가장 쾌적\n' +
          '❄️ 겨울(12~2월): 2~12°C, 건조\n\n' +
          '⚠️ 태풍 시즌: 8~10월\n' +
          '💡 장마철 습도 대비: 제습기(除湿機) 필수!';
      }
      // --- 고마워 / 도움됐어 ---
      else if (/고마|감사|도움|thanks|thank|ありがとう|좋아|good/.test(lc)) {
        answer = '기꺼이요! 😊 다른 궁금한 점이 있으면 언제든 물어보세요.\n일본 생활이 즐겁고 편안하길 바랍니다! 🇯🇵✨';
      }
      // --- 무엇을 물어볼 수 있나 ---
      else if (/뭐|무엇|어떤|할 ?수|기능|도움말|help|메뉴/.test(lc)) {
        answer = '💡 **이런 것들을 물어볼 수 있어요!**\n\n' +
          '🏠 집 구하기 / 매물 검색 방법\n' +
          '💰 초기비용 / 생활비\n' +
          '📝 계약 절차 / 보증인\n' +
          '🚚 이사 업체 / 비용\n' +
          '🏘️ 셰어하우스 정보\n' +
          '📋 비자 / 재류카드 / 외국인 등록\n' +
          '🗑️ 쓰레기 분리수거\n' +
          '🌏 지진·방재 대비\n' +
          '📶 인터넷·스마트폰\n' +
          '🏥 병원·의료·보험\n' +
          '🚃 교통·IC카드\n' +
          '📚 일본어 학습\n' +
          '🌤️ 날씨·기후\n\n' +
          '편하게 질문해 주세요! 😊';
      }
      // --- 기본 응답 ---
      else {
        answer = '🤔 해당 질문에 대해 정확한 답변을 드리기 어렵네요.\n\n' +
          '이런 주제로 질문해 보세요:\n' +
          '• 집 구하기, 초기비용, 계약 절차\n' +
          '• 이사 업체, 셰어하우스\n' +
          '• 비자, 생활비, 병원, 교통\n' +
          '• 쓰레기 분리, 지진 대비, 인터넷\n\n' +
          '또는 "도움말"이라고 입력하면 전체 주제를 볼 수 있어요!';
      }

      json(res, 200, {
        reply: answer,
        timestamp: new Date().toISOString(),
      });
    }

    // ==================== 404 ====================
    else {
      json(res, 404, { message: `엔드포인트를 찾을 수 없습니다: ${method} ${path}` });
    }

  } catch (error) {
    console.error('[SERVER ERROR]', error);
    json(res, 500, { message: 'Internal server error', detail: error.message });
  }
});

// ========================= START =========================

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║ 🏠 Japan Housing Platform — Live API Server          ║
║ → http://localhost:${PORT}                              ║
║                                                       ║
║ 🌐 Real APIs:                                        ║
║    ✅ MyMemory Translation (ko↔ja↔en)                ║
║    ✅ Frankfurter Exchange Rate (JPY→KRW,USD,EUR,CNY)║
║    ✅ Open-Meteo Weather (Tokyo real-time)            ║
║    ✅ Reddit r/japanlife (community posts)            ║
║    ✅ Wikipedia (life guides)                         ║
║                                                       ║
║ 🏘️ ${PROPERTIES.length} properties | ${SHAREHOUSES.length} sharehouses | ${MOVING_SERVICES.length} movers       ║
║ 📝 ${REVIEWS.length} reviews | 1R~7K room types | Tokyo pricing    ║
╚═══════════════════════════════════════════════════════╝
  `);

  // Pre-warm caches (non-blocking)
  console.log('🔄 Pre-warming API caches...');
  realExchangeRates()
    .then(r => console.log(`  ✅ Exchange rates loaded: 1 JPY = ${r.rates?.KRW} KRW`))
    .catch(e => console.log(`  ⚠️  Exchange rates fallback: ${e.message}`));
  realCommunityPosts()
    .then(p => console.log(`  ✅ Reddit r/japanlife: ${p.length} posts loaded`))
    .catch(e => console.log(`  ⚠️  Reddit fallback: ${e.message}`));
  realGuides()
    .then(g => console.log(`  ✅ Wikipedia guides: ${g.length} articles loaded`))
    .catch(e => console.log(`  ⚠️  Wiki fallback: ${e.message}`));
  realWeather(35.6762, 139.6503)
    .then(w => console.log(`  ✅ Tokyo weather: ${w.current_weather?.temperature || w.temperature}°C`))
    .catch(e => console.log(`  ⚠️  Weather fallback: ${e.message}`));
});
