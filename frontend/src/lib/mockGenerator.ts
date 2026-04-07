
const REGIONS = [
  {
    prefix: '도쿄도',
    wards: ['신주쿠구', '시부야구', '토시마구', '미나토구', '메구로구', '나카노구', '세타가야구', '다이토구', '치요다구'],
    stations: ['신주쿠역', '시부야역', '이케부쿠로역', '롯폰기역', '에비스역', '나카메구로역', '키치조지역', '우에노역']
  },
  {
    prefix: '오사카부',
    wards: ['츄오구', '기타구', '나니와구', '텐노지구', '요도가와구'],
    stations: ['우메다역', '난바역', '신오사카역', '텐노지역', '신사이바시역']
  },
  {
    prefix: '카나가와현',
    wards: ['요코하마시 니시구', '요코하마시 나카구', '가와사키시 가와사키구'],
    stations: ['요코하마역', '가와사키역', '미나토미라이역']
  }
];

const AMENITIES = ['에어컨', 'WiFi', '인터넷', '오토락', '헬스장', '콘시어지', '바닥난방', '택배보관함', '베란다', '주차장', '실내 세탁기', '욕실/화장실 분리'];

const NAMES1 = ['브라이즈', '프라우드', '파크하비오', '셀레스티아', '로렐타워', '웰스퀘어', '카사 알바', '소아비타', '그랜드', '어반', '루미에르', '크레스트'];
const NAMES2 = ['레지던스', '타워', '하임', '맨션', '에스테이트', '팰리스', '빌라', '코트'];

const ROOM_TYPES = ['1R', '1K', '1DK', '1LDK', '2DK', '2LDK', '3DK', '3LDK', '4LDK+'];

// 시드 기반 랜덤
function randomSeeded(seed: number) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function randChoice<T>(arr: T[], s: number) {
  return arr[Math.floor(randomSeeded(s) * arr.length)];
}

export function generateMassiveProperties(count: number = 10000): any[] {
  const result: any[] = [];
  
  for (let i = 1; i <= count; i++) {
    const s1 = i * 11;
    const s2 = i * 13;
    const s3 = i * 17;
    
    const regObj = randChoice(REGIONS, s1);
    const ward = randChoice(regObj.wards, s2);
    const station = randChoice(regObj.stations, s3);
    
    const n1 = randChoice(NAMES1, s1 + s2);
    const n2 = randChoice(NAMES2, s2 + s3);
    const roomType = randChoice(ROOM_TYPES, s1 * s2);
    
    let baseRent = 50000;
    if (roomType.includes('L') || roomType.includes('2') || roomType.includes('3')) baseRent += 60000;
    if (roomType.includes('3') || roomType.includes('4')) baseRent += 80000;
    if (ward === '미나토구' || ward === '시부야구' || ward === '신주쿠구') baseRent += 40000;
    
    // add noise
    const rent = baseRent + Math.floor(randomSeeded(s1 * s3) * 50) * 1000;
    
    const foreigner = randomSeeded(s2) > 0.3; // 70% welcome
    const pet = randomSeeded(s3) > 0.7; // 30% pet

    // Random amenities
    const aList = [];
    for(let a=0; a<AMENITIES.length; a++) {
      if (randomSeeded(s1 + a) > 0.5) aList.push(AMENITIES[a]);
    }
    if (aList.length === 0) aList.push('에어컨');

    const walkMins = Math.floor(randomSeeded(s1+s2+s3) * 15) + 1;
    
    // Images
    const imgIndex = i % 15;
    const imgId = [ '1522708323590-d24dbb6b0267', '1555854877-bab0e564b8d5', '1484154218962-a197022b5858', '1493809842364-78f1ada6f5e3', '1536376072261-38c75010e6c9', '1558618666-fcd25c85f82e', '1567767292278-a4f21aa2d36e', '1585128792020-803d29415281', '1560448204-e02f11c3d0e2', '1574362848149-11496d93a7c7', '1564078516393-cf04bd966897', '1502672260266-1c1ef2d93688', '1560185893-a55cbc8c57e8', '1615529851641-a1e6797bfa9c', '1564078516393-cf04bd966897' ][imgIndex];
    
    result.push({
      id: 1000 + i,
      title: `${n1} ${ward.replace('구','')} ${n2}`,
      address: `${regObj.prefix} ${ward} ${Math.floor(randomSeeded(s1)*5)+1}초메`,
      monthlyRent: rent,
      deposit: rent * (Math.floor(randomSeeded(s2)*3)), // 0~2 months deposit
      roomType: roomType,
      squareMeters: 15 + Math.floor(randomSeeded(s3)*60),
      nearbyStation: `JR/${station} 도보 ${walkMins}분`,
      amenities: aList.join(','),
      foreignerWelcome: foreigner,
      petFriendly: pet,
      averageRating: Number((3 + randomSeeded(s1*s2)*2).toFixed(1)),
      images: `https://images.unsplash.com/photo-${imgId}?w=600&h=400&fit=crop`
    });
  }
  return result;
}
