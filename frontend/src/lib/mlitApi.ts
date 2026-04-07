/**
 * 일본 국토교통성 (MLIT) 부동산 정보 라이브러리 API 연동
 * API 키 발급 후 .env.local 파일에 NEXT_PUBLIC_MLIT_API_KEY=발급키 를 추가하세요.
 * 
 * 공식 문서: https://www.reinfolib.mlit.go.jp/help/apiManual/xit001/
 */

const MLIT_API_BASE = 'https://www.reinfolib.mlit.go.jp/ex-api/external';
const API_KEY = process.env.NEXT_PUBLIC_MLIT_API_KEY;

// 일본 도도부현 코드 매핑
export const PREFECTURE_CODES: Record<string, string> = {
  '홋카이도': '01',
  '아오모리현': '02',
  '이와테현': '03',
  '미야기현': '04',
  '아키타현': '05',
  '야마가타현': '06',
  '후쿠시마현': '07',
  '이바라키현': '08',
  '도치기현': '09',
  '군마현': '10',
  '사이타마현': '11',
  '치바현': '12',
  '도쿄도': '13',
  '가나가와현': '14',
  '니이가타현': '15',
  '도야마현': '16',
  '이시카와현': '17',
  '후쿠이현': '18',
  '야마나시현': '19',
  '나가노현': '20',
  '시즈오카현': '22',
  '아이치현': '23',
  '미에현': '24',
  '시가현': '25',
  '교토부': '26',
  '오사카부': '27',
  '효고현': '28',
  '나라현': '29',
  '와카야마현': '30',
  '히로시마현': '34',
  '후쿠오카현': '40',
};

// 주요 시구정촌 코드 매핑 (도쿄 23구 등)
export const CITY_CODES: Record<string, string> = {
  '신주쿠구': '13104',
  '시부야구': '13113',
  '미나토구': '13103',
  '치요다구': '13101',
  '주오구': '13102',
  '분쿄구': '13105',
  '다이토구': '13106',
  '스미다구': '13107',
  '고토구': '13108',
  '시나가와구': '13109',
  '메구로구': '13110',
  '오타구': '13111',
  '세타가야구': '13112',
  '나카노구': '13114',
  '스기나미구': '13115',
  '도시마구': '13116',
  '기타구': '13117',
  '아라카와구': '13118',
  '이타바시구': '13119',
  '네리마구': '13120',
  '아다치구': '13121',
  '가쓰시카구': '13122',
  '에도가와구': '13123',
  // 오사카
  '오사카시 키타구': '27127',
  '오사카시 나니와구': '27128',
  '오사카시 텐노지구': '27133',
};

// MLIT API 응답 타입
export interface MLITTransaction {
  Type: string;           // 거래 유형
  Region: string;         // 지역
  MunicipalityCode: string; // 시구정촌 코드
  Prefecture: string;     // 도도부현
  Municipality: string;   // 시구정촌
  DistrictName: string;   // 지구명
  TradePrice: string;     // 거래 총액(엔)
  PricePerUnit: string;   // 단위면적당 가격
  FloorPlan: string;      // 간취 (방 구조 - 1K, 2LDK 등)
  Area: string;           // 전용면적
  UnitPrice: string;      // 단가
  LandShape: string;      // 토지 형상
  Frontage: string;       // 접도 폭
  TotalFloorArea: string; // 연면적
  BuildingYear: string;   // 건축 연도
  Structure: string;      // 건물 구조
  Use: string;            // 용도
  Purpose: string;        // 지목
  Direction: string;      // 방향
  Classification: string; // 도시 계획
  CityPlanning: string;   // 도시 계획 용도
  BuildingCoverage: string; // 건폐율
  FloorAreaRatio: string;   // 용적률
  Period: string;         // 거래 시기
  Renovation: string;     // 리모델링
  Remarks: string;        // 비고
}

// MLIT 거래 데이터를 우리 Property 형식으로 변환
function convertMLITToProperty(item: MLITTransaction, index: number) {
  const tradePrice = parseInt(item.TradePrice?.replace(/,/g, '') || '0');
  const area = parseFloat(item.Area?.replace(/㎡/g, '') || '0');
  
  // 매월 임대료를 거래가 기준 추정 (거래가 / 300은 대략적인 월세 추정)
  const estimatedMonthlyRent = Math.round(tradePrice / 300 / 10000) * 10000;
  
  // Unsplash 이미지 풀
  const imgIds = [
    '1522708323590-d24dbb6b0267',
    '1555854877-bab0e564b8d5',
    '1484154218962-a197022b5858',
    '1536376072261-38c75010e6c9',
    '1558618666-fcd25c85f82e',
    '1585128792020-803d29415281',
    '1560448204-e02f11c3d0e2',
    '1574362848149-11496d93a7c7',
  ];

  return {
    id: 900000 + index,
    title: `${item.Municipality || ''} ${item.DistrictName || ''} ${item.FloorPlan || ''}`,
    address: `${item.Prefecture || ''}${item.Municipality || ''}${item.DistrictName || ''}`,
    monthlyRent: estimatedMonthlyRent > 0 ? estimatedMonthlyRent : 80000,
    deposit: estimatedMonthlyRent,
    roomType: item.FloorPlan || '1K',
    squareMeters: area > 0 ? area : 25,
    nearbyStation: '',
    amenities: '에어컨,인터넷',
    foreignerWelcome: true,
    petFriendly: false,
    averageRating: 3.5 + Math.random() * 1.5,
    images: `https://images.unsplash.com/photo-${imgIds[index % imgIds.length]}?w=600&h=400&fit=crop`,
    // 실제 거래 데이터 보존
    _mlitData: {
      tradePrice: item.TradePrice,
      period: item.Period,
      structure: item.Structure,
      buildingYear: item.BuildingYear,
    }
  };
}

/**
 * MLIT API에서 부동산 거래 데이터 가져오기
 * @param prefCode 도도부현 코드 (기본: 13 = 도쿄도)
 * @param year 연도 (기본: 2024)
 * @param quarter 분기 (1~4, 기본: 1)
 */
export async function fetchMLITProperties(
  prefCode = '13',
  year = 2024,
  quarter = 1
): Promise<any[]> {
  if (!API_KEY) {
    console.warn('[MLIT API] API 키 없음 → Mock 데이터 사용');
    return [];
  }

  try {
    const url = `${MLIT_API_BASE}/XIT001?year=${year}&quarter=${quarter}&prefectureCode=${prefCode}&priceClassification=02`;
    
    const res = await fetch(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEY,
      },
    });

    if (!res.ok) {
      console.error(`[MLIT API] 오류: ${res.status} ${res.statusText}`);
      return [];
    }

    const json = await res.json();
    const transactions: MLITTransaction[] = json?.data || [];
    
    console.log(`[MLIT API] ✅ ${transactions.length}건 데이터 수신`);
    
    // 임대 주택 관련 항목만 필터 (마션, 아파트 등)
    const rentals = transactions.filter(t => 
      t.Type?.includes('中古マンション') || 
      t.Type?.includes('アパート') ||
      t.Type?.includes('マンション')
    );
    
    return rentals.map((item, i) => convertMLITToProperty(item, i));
  } catch (err) {
    console.error('[MLIT API] 네트워크 오류:', err);
    return [];
  }
}

/**
 * 여러 지역 데이터 동시 로드
 */
export async function fetchAllRegionProperties(): Promise<any[]> {
  if (!API_KEY) return [];

  const prefCodes = ['13', '27', '14']; // 도쿄, 오사카, 가나가와
  const year = 2024;
  const quarters = [1, 2, 3, 4];

  const promises = prefCodes.flatMap(pref =>
    quarters.map(q => fetchMLITProperties(pref, year, q))
  );

  const results = await Promise.allSettled(promises);
  
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => (r as PromiseFulfilledResult<any[]>).value);
}
