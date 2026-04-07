// 간단한 Backend Mock API 서버 (Node.js)
// Backend Java 구현 전까지 사용

const http = require('http');
const url = require('url');

// Mock 데이터
const mockData = {
  users: [
    { id: 1, email: 'test@example.com', name: 'Test User', role: 'SEEKER' },
    { id: 2, email: 'landlord@example.com', name: 'Landlord', role: 'LANDLORD' }
  ],
  properties: [
    {
      id: 1,
      title: '新宿駅徒歩1分 新築アパート',
      address: '東京都新宿区新宿',
      monthlyPrice: 150000,
      monthlyRent: 150000,
      deposit: 300000,
      roomType: '1K',
      floorArea: 25.5,
      foreignerWelcome: true,
      petFriendly: false,
      averageRating: 4.5,
      reviewCount: 12,
      landlordId: 2,
      images: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop'
    },
    {
      id: 2,
      title: '渋谷駅近く2DK',
      address: '東京都渋谷区渋谷',
      monthlyPrice: 180000,
      monthlyRent: 180000,
      deposit: 360000,
      roomType: '2DK',
      floorArea: 35.0,
      foreignerWelcome: true,
      petFriendly: true,
      averageRating: 4.7,
      reviewCount: 8,
      landlordId: 2,
      images: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop'
    },
    {
      id: 3,
      title: '池袋駅前1DK',
      address: '東京都豊島区池袋',
      monthlyPrice: 120000,
      monthlyRent: 120000,
      deposit: 240000,
      roomType: '1DK',
      floorArea: 28.0,
      foreignerWelcome: true,
      petFriendly: false,
      averageRating: 4.3,
      reviewCount: 5,
      landlordId: 2,
      images: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop'
    }
  ],
  reviews: [],
  messages: [],
  contracts: [],
  movingServices: [
    {
      id: 1,
      name: 'Nippon Express (일본통운)',
      description: '외국어 응대가 가능한 일본 최대 이삿짐 센터입니다.',
      rating: 4.8,
      priceEstimate: '약 50,000엔 부터 (도쿄 내 1인가구 기준)',
      contactNumber: '0120-123-456',
      languages: ['日本語', 'English', '한국어']
    },
    {
      id: 2,
      name: 'Sakai Moving Service (사카이 이사센터)',
      description: '저렴한 가격과 꼼꼼한 서비스로 유명합니다.',
      rating: 4.5,
      priceEstimate: '약 35,000엔 부터 (도쿄 내 1인가구 기준)',
      contactNumber: '0120-999-999',
      languages: ['日本語']
    },
    {
      id: 3,
      name: 'Global Movers Tokyo',
      description: '유학생 및 외국인을 위한 전문 소형 이사 서비스입니다.',
      rating: 4.9,
      priceEstimate: '약 20,000엔 부터',
      contactNumber: '03-1234-5678',
      languages: ['English', '한국어', '中文']
    }
  ],
  sharehouses: [
    {
      id: 1,
      title: 'Global Share 新宿',
      address: '東京都新宿区',
      monthlyPrice: 65000,
      availableRooms: 2,
      totalRooms: 10,
      description: '다양한 국적의 친구들이 모여사는 프리미엄 셰어하우스입니다. 한일 교류회가 매달 열립니다.',
      amenities: ['Wi-Fi', 'Free Coffee', 'Lounge', 'Washing Machine']
    },
    {
      id: 2,
      title: 'Sakura House 池袋',
      address: '東京都豊島区',
      monthlyPrice: 58000,
      availableRooms: 1,
      totalRooms: 6,
      description: '저렴한 가격의 학생/워홀러 추천 셰어하우스.',
      amenities: ['Wi-Fi', 'Common Kitchen', 'Bicycle Parking']
    }
  ],
  savedProperties: [
    { propertyId: 1, userId: 1 },
    { propertyId: 2, userId: 1 }
  ],
  guides: [
    {
      id: 1,
      title: '일본에서 쓰레기 버리는 방법 가이드',
      category: '생활 꿀팁',
      content: '일본의 쓰레기 분리수거는 매우 엄격합니다. 타는 쓰레기, 안타는 쓰레기로 주로 구분되며...',
      icon: '🗑️'
    },
    {
      id: 2,
      title: '공과금(전기/수도/가스) 납부 완벽 정리',
      category: '행정 처리',
      content: '입주 후 가장 먼저 해야 할 일은 공과금 명의 변경입니다...',
      icon: '💡'
    }
  ],
  communityPosts: [
    {
      id: 1,
      author: '김워홀',
      title: '신주쿠에 맛있는 한국 식당 어디있나요?',
      content: '이번에 새로 입주했는데 주변을 잘 몰라서요.',
      replies: 3,
      createdAt: '2026-03-30T00:00:00.000Z'
    },
    {
      id: 2,
      author: '이유학',
      title: '내일 구청 가서 재류카드 주소 변경 해야 하는데 같이 가실 분?',
      content: '신주쿠 구청입니다! 혼자가기 뻘쭘해서 구합니다~',
      replies: 1,
      createdAt: '2026-03-29T10:00:00.000Z'
    }
  ]
};

// 간단한 JWT 토큰 (실제와 동일한 형식)
function generateToken(userId, email, role) {
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify({ userId, email, role })).toString('base64')}.signature`;
}

const server = http.createServer((req, res) => {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${pathname}`);

  // ==================== 인증 API ====================
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const newUser = {
        id: mockData.users.length + 1,
        email: data.email,
        name: data.name,
        role: data.role || 'SEEKER'
      };
      mockData.users.push(newUser);
      res.writeHead(201);
      res.end(JSON.stringify({
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        token: generateToken(newUser.id, newUser.email, newUser.role),
        message: '회원가입이 완료되었습니다'
      }));
    });
  }

  else if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const user = mockData.users.find(u => u.email === data.email);
      if (user) {
        res.writeHead(200);
        res.end(JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          token: generateToken(user.id, user.email, user.role),
          message: '로그인이 완료되었습니다'
        }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({ message: '사용자를 찾을 수 없습니다' }));
      }
    });
  }

  else if (pathname === '/api/auth/me' && req.method === 'GET') {
    const user = mockData.users[0];
    res.writeHead(200);
    res.end(JSON.stringify(user));
  }

  // ==================== Property API ====================
  else if (pathname === '/api/properties' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.properties));
  }

  else if (pathname.match(/\/api\/properties\/\d+/) && req.method === 'GET') {
    const id = parseInt(pathname.split('/')[3]);
    const property = mockData.properties.find(p => p.id === id);
    if (property) {
      res.writeHead(200);
      res.end(JSON.stringify(property));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ message: '찾을 수 없습니다' }));
    }
  }

  else if (pathname === '/api/properties/foreigner-friendly' && req.method === 'GET') {
    const filtered = mockData.properties.filter(p => p.foreignerWelcome);
    res.writeHead(200);
    res.end(JSON.stringify(filtered));
  }

  else if (pathname === '/api/properties/pet-friendly' && req.method === 'GET') {
    const filtered = mockData.properties.filter(p => p.petFriendly);
    res.writeHead(200);
    res.end(JSON.stringify(filtered));
  }

  else if (pathname === '/api/properties/top-rated' && req.method === 'GET') {
    const sorted = [...mockData.properties].sort((a, b) => b.averageRating - a.averageRating);
    res.writeHead(200);
    res.end(JSON.stringify(sorted));
  }

  // ==================== Review API ====================
  else if (pathname.match(/\/api\/reviews\/property\/\d+/) && req.method === 'GET') {
    const propertyId = parseInt(pathname.split('/')[4]);
    const reviews = mockData.reviews.filter(r => r.propertyId === propertyId);
    res.writeHead(200);
    res.end(JSON.stringify(reviews));
  }

  else if (pathname === '/api/reviews' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const review = JSON.parse(body);
      review.id = mockData.reviews.length + 1;
      mockData.reviews.push(review);
      res.writeHead(201);
      res.end(JSON.stringify(review));
    });
  }

  // ==================== Message API ====================
  else if (pathname === '/api/messages' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const message = JSON.parse(body);
      message.id = mockData.messages.length + 1;
      mockData.messages.push(message);
      res.writeHead(201);
      res.end(JSON.stringify(message));
    });
  }

  else if (pathname.match(/\/api\/messages\/chat\/\d+\/\d+/) && req.method === 'GET') {
    const parts = pathname.split('/');
    const userId1 = parseInt(parts[4]);
    const userId2 = parseInt(parts[5]);
    const messages = mockData.messages.filter(m => 
      (m.senderId === userId1 && m.receiverId === userId2) || 
      (m.senderId === userId2 && m.receiverId === userId1)
    );
    res.writeHead(200);
    res.end(JSON.stringify(messages));
  }

  // ==================== Contract API ====================
  else if (pathname === '/api/contracts/generate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const contract = JSON.parse(body);
      contract.id = mockData.contracts.length + 1;
      contract.status = 'draft';
      mockData.contracts.push(contract);
      res.writeHead(201);
      res.end(JSON.stringify(contract));
    });
  }

  // ==================== Translation API ====================
  else if (pathname === '/api/translation/translate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { text } = JSON.parse(body);
      res.writeHead(200);
      res.end(JSON.stringify({
        originalText: text,
        translatedText: `[번역됨] ${text}`,
        detectedLanguage: 'ko'
      }));
    });
  }

  // ==================== Moving Services API ====================
  else if (pathname === '/api/moving-services' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.movingServices));
  }

  // ==================== Sharehouse API ====================
  else if (pathname === '/api/sharehouses' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.sharehouses));
  }

  // ==================== Saved Properties (Wishlist) API ====================
  else if (pathname === '/api/saved-properties' && req.method === 'GET') {
    // userId 1의 찜 목록만 가져온다고 가정
    const savedIds = mockData.savedProperties.filter(sp => sp.userId === 1).map(sp => sp.propertyId);
    const properties = mockData.properties.filter(p => savedIds.includes(p.id));
    res.writeHead(200);
    res.end(JSON.stringify(properties));
  }

  // ==================== Guides API ====================
  else if (pathname === '/api/guides' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.guides));
  }

  // ==================== Community API ====================
  else if (pathname === '/api/community' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(mockData.communityPosts));
  }

  // 기본 응답
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: '엔드포인트를 찾을 수 없습니다' }));
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🏠 Japan Housing Mock API Server     ║
║   ⚡ Ready on http://localhost:${PORT}   ║
╚════════════════════════════════════════╝
  `);
});
