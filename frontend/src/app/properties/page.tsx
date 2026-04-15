'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { getProperties, getExchangeRates, getSavedPropertyIds } from '@/lib/api/client';
import SaveButton from '@/components/SaveButton';

type Property = {
  id: number;
  title: string;
  titleKo?: string;
  address: string;
  addressKo?: string;
  monthlyRent: number;
  deposit?: number;
  averageRating: number;
  foreignerWelcome: boolean;
  petFriendly: boolean;
  squareMeters: number;
  roomType?: string;
  floorArea?: number;
  nearbyStation?: string;
  nearbyStationKo?: string;
  descriptionKo?: string;
  amenities?: string;
  amenitiesKo?: string;
  images?: string;
  imagesJson?: string;
};

/* helper: extract first image URL from any format */
function getImageUrl(p: { images?: string; imagesJson?: string }): string | null {
  if (p.imagesJson && p.imagesJson !== '[]') {
    try { const arr = JSON.parse(p.imagesJson); if (arr[0]) return arr[0]; } catch {}
  }
  if (p.images) return p.images.split(',')[0]?.trim() || null;
  return null;
}

/* ── Korean→Japanese keyword mapping for search ── */
const KR_JP_MAP: Record<string, string> = {
  '신주쿠': '新宿', '시부야': '渋谷', '이케부쿠로': '池袋', '나카노': '中野',
  '시나가와': '品川', '코엔지': '高円寺', '메구로': '目黒', '미타카': '三鷹',
  '키치조지': '吉祥寺', '요코하마': '横浜', '오사카': '大阪', '교토': '京都',
  '우에노': '上野', '아키하바라': '秋葉原', '롯폰기': '六本木', '아사쿠사': '浅草',
  '도쿄': '東京', '에비스': '恵比寿', '다이칸야마': '代官山', '나카메구로': '中目黒',
  '아자부': '麻布', '시모키타자와': '下北沢', '지유가오카': '自由が丘',
};

function expandSearch(q: string): string[] {
  const lower = q.toLowerCase().trim();
  const results = [lower];
  for (const [kr, jp] of Object.entries(KR_JP_MAP)) {
    if (lower.includes(kr)) results.push(lower.replace(kr, jp));
  }
  return results;
}

/* ── Real Suumo.jp-based property fallback data (Korean) ── */
const DEMO_PROPERTIES: Property[] = [
  { id:1, title:'브라이즈 신주쿠 나카이', address:'도쿄도 신주쿠구 나카이 1초메', monthlyRent:80000, deposit:80000, roomType:'1R', squareMeters:19.78, floorArea:19.78, nearbyStation:'세이부 신주쿠선/나카이역 도보 4분', amenities:'에어컨,마루바닥,실내 세탁기,인터넷 무료', foreignerWelcome:true, petFriendly:false, averageRating:4.0, images:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop' },
  { id:3, title:'ZOOM 신주쿠 나츠메자카', address:'도쿄도 신주쿠구 와카마츠초', monthlyRent:142000, deposit:142000, roomType:'1R', squareMeters:36.45, floorArea:36.45, nearbyStation:'도에이 오에도선/와카마츠카와다역 도보 4분', amenities:'에어컨,욕실/화장실 분리,오토락,택배보관함,마루바닥,욕실 건조기,인터넷 무료', foreignerWelcome:true, petFriendly:false, averageRating:4.3, images:'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop' },
  { id:6, title:'더 파크하비오 카구라자카', address:'도쿄도 신주쿠구 요코테라마치', monthlyRent:133000, deposit:133000, roomType:'1K', squareMeters:25.29, floorArea:25.29, nearbyStation:'도에이 오에도선/우시고메카구라자카역 도보 4분', amenities:'에어컨,욕실/화장실 분리,오토락,택배보관함,마루바닥,욕실 건조기', foreignerWelcome:true, petFriendly:false, averageRating:4.5, images:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop' },
  { id:9, title:'파크하비오 시부야혼마치 레지던스', address:'도쿄도 시부야구 혼마치 4초메', monthlyRent:209000, deposit:209000, roomType:'1LDK', squareMeters:44.9, floorArea:44.9, nearbyStation:'도에이 오에도선/니시신주쿠고초메역 도보 7분', amenities:'에어컨,욕실/화장실 분리,독립 세면대,오토락,택배보관함,욕실 건조기,마루바닥', foreignerWelcome:true, petFriendly:false, averageRating:4.3, images:'https://images.unsplash.com/photo-1493809842364-78f1ada6f5e3?w=600&h=400&fit=crop' },
  { id:10, title:'프라우드 에비스 디아쥬', address:'도쿄도 시부야구 히가시 3초메', monthlyRent:475000, deposit:950000, roomType:'2LDK', squareMeters:72.31, floorArea:72.31, nearbyStation:'JR 야마노테선/에비스역 도보 5분', amenities:'에어컨,독립 세면대,오토락,택배보관함,반려동물 가능,바닥난방,식기세척기,워크인 클로젯', foreignerWelcome:true, petFriendly:true, averageRating:4.9, images:'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&h=400&fit=crop' },
  { id:11, title:'더 파크하우스 신주쿠교엔니시', address:'도쿄도 시부야구 센다가야 5초메', monthlyRent:150000, deposit:300000, roomType:'1R', squareMeters:30.8, floorArea:30.8, nearbyStation:'JR 야마노테선/요요기역 도보 4분', amenities:'에어컨,독립 세면대,오토락,택배보관함,욕실 건조기,마루바닥,방범 카메라', foreignerWelcome:true, petFriendly:false, averageRating:4.5, images:'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop' },
  { id:13, title:'파크코트 에비스', address:'도쿄도 시부야구 히가시 3초메', monthlyRent:700000, deposit:1400000, roomType:'2LDK', squareMeters:64.04, floorArea:64.04, nearbyStation:'JR 야마노테선/에비스역 도보 2분', amenities:'에어컨,오토락,콘시어지,택배보관함,반려동물 가능,바닥난방,식기세척기,헬스장', foreignerWelcome:true, petFriendly:true, averageRating:4.9, images:'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&h=400&fit=crop' },
  { id:16, title:'프라임어반 이케부쿠로', address:'도쿄도 토시마구 이케부쿠로 2초메', monthlyRent:139000, deposit:139000, roomType:'1K', squareMeters:29.67, floorArea:29.67, nearbyStation:'도쿄메트로 마루노우치선/이케부쿠로역 도보 4분', amenities:'에어컨,욕실/화장실 분리,오토락,택배보관함,마루바닥,실내 세탁기', foreignerWelcome:true, petFriendly:false, averageRating:4.2, images:'https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&h=400&fit=crop' },
  { id:17, title:'콘포리아 리브 히가시이케부쿠로', address:'도쿄도 토시마구 히가시이케부쿠로 2초메', monthlyRent:163000, deposit:163000, roomType:'1DK', squareMeters:31.14, floorArea:31.14, nearbyStation:'JR 야마노테선/오츠카역 도보 7분', amenities:'에어컨,독립 세면대,오토락,택배보관함,욕실 건조기,마루바닥', foreignerWelcome:true, petFriendly:false, averageRating:4.5, images:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop' },
  { id:18, title:'셀레스티아 이케부쿠로 릿쿄도오리', address:'도쿄도 토시마구 니시이케부쿠로 5초메', monthlyRent:152000, deposit:152000, roomType:'1LDK', squareMeters:34.99, floorArea:34.99, nearbyStation:'도쿄메트로 유라쿠초선/카나메초역 도보 5분', amenities:'에어컨,독립 세면대,오토락,택배보관함,욕실 건조기,마루바닥,인터넷 무료', foreignerWelcome:true, petFriendly:false, averageRating:4.6, images:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop' },
  { id:24, title:'라산테 아자부주반', address:'도쿄도 미나토구 아자부주반 3초메', monthlyRent:283000, deposit:283000, roomType:'1LDK', squareMeters:40.08, floorArea:40.08, nearbyStation:'도쿄메트로 난보쿠선/아자부주반역 도보 2분', amenities:'에어컨,독립 세면대,오토락,택배보관함,욕실 건조기,마루바닥,방범 카메라', foreignerWelcome:true, petFriendly:false, averageRating:4.6, images:'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&h=400&fit=crop' },
  { id:25, title:'더 파크하우스 시로카네니초메 타워', address:'도쿄도 미나토구 시로카네 2초메', monthlyRent:490000, deposit:490000, roomType:'2LDK', squareMeters:74.8, floorArea:74.8, nearbyStation:'도에이 미타선/시로카네다이역 도보 5분', amenities:'에어컨,독립 세면대,오토락,콘시어지,택배보관함,반려동물 가능,바닥난방,식기세척기', foreignerWelcome:true, petFriendly:true, averageRating:4.8, images:'https://images.unsplash.com/photo-1493809842364-78f1ada6f5e3?w=600&h=400&fit=crop' },
  { id:28, title:'로렐타워 르네 하마마츠초', address:'도쿄도 미나토구 카이간 2초메', monthlyRent:146000, deposit:146000, roomType:'1R', squareMeters:25.73, floorArea:25.73, nearbyStation:'JR 야마노테선/하마마츠초역 도보 11분', amenities:'에어컨,독립 세면대,오토락,택배보관함,욕실 건조기,마루바닥', foreignerWelcome:true, petFriendly:false, averageRating:4.4, images:'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=600&h=400&fit=crop' },
  { id:32, title:'웰스퀘어 가쿠게이다이가쿠', address:'도쿄도 메구로구 타카반 3초메', monthlyRent:122000, deposit:122000, roomType:'1K', squareMeters:20.28, floorArea:20.28, nearbyStation:'도큐 토요코선/가쿠게이다이가쿠역 도보 2분', amenities:'에어컨,욕실/화장실 분리,오토락,택배보관함,마루바닥,욕실 건조기', foreignerWelcome:true, petFriendly:false, averageRating:4.4, images:'https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&h=400&fit=crop' },
  { id:36, title:'시티코프 히라누마', address:'도쿄도 메구로구 카미메구로 3초메', monthlyRent:145000, deposit:145000, roomType:'1R', squareMeters:26.2, floorArea:26.2, nearbyStation:'도큐 토요코선/나카메구로역 도보 2분', amenities:'에어컨,욕실/화장실 분리,마루바닥,베란다,실내 세탁기', foreignerWelcome:true, petFriendly:false, averageRating:4.1, images:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop' },
  { id:38, title:'M&M 하임', address:'도쿄도 나카노구 추오 4초메', monthlyRent:122000, deposit:0, roomType:'1LDK', squareMeters:38.19, floorArea:38.19, nearbyStation:'도쿄메트로 마루노우치선/신나카노역 도보 4분', amenities:'에어컨,욕실/화장실 분리,마루바닥,실내 세탁기,베란다', foreignerWelcome:true, petFriendly:false, averageRating:4.2, images:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop' },
  { id:40, title:'카사 알바', address:'도쿄도 나카노구 와카미야 3초메', monthlyRent:164000, deposit:82000, roomType:'2LDK', squareMeters:53.57, floorArea:53.57, nearbyStation:'세이부 신주쿠선/토리츠카세이역 도보 3분', amenities:'에어컨,독립 세면대,마루바닥,베란다,추가난방,실내 세탁기', foreignerWelcome:true, petFriendly:false, averageRating:4.3, images:'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&h=400&fit=crop' },
  { id:44, title:'셀레스티아 미나미카라스야마', address:'도쿄도 세타가야구 미나미카라스야마 1초메', monthlyRent:215000, deposit:0, roomType:'2LDK', squareMeters:59.9, floorArea:59.9, nearbyStation:'게이오선/로카코엔역 도보 7분', amenities:'에어컨,독립 세면대,욕실 건조기,마루바닥,베란다,추가난방,워크인 클로젯', foreignerWelcome:true, petFriendly:false, averageRating:4.5, images:'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=600&h=400&fit=crop' },
  { id:45, title:'소아비타 산겐자야', address:'도쿄도 세타가야구 다이시도 4초메', monthlyRent:210000, deposit:210000, roomType:'2LDK', squareMeters:47.31, floorArea:47.31, nearbyStation:'도큐 덴엔토시선/산겐자야역 도보 6분', amenities:'에어컨,독립 세면대,마루바닥,베란다,추가난방,실내 세탁기', foreignerWelcome:true, petFriendly:false, averageRating:4.4, images:'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&h=400&fit=crop' },
  { id:50, title:'아키하바라역 1K 맨션', address:'도쿄도 치요다구 소토칸다 3초메', monthlyRent:95000, deposit:95000, roomType:'1K', squareMeters:21, floorArea:21, nearbyStation:'JR 야마노테선/아키하바라역 도보 4분', amenities:'에어컨,오토락,택배보관함,인터넷 무료,마루바닥,방범 카메라', foreignerWelcome:true, petFriendly:false, averageRating:4.4, images:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop' },
  { id:51, title:'아사쿠사역 1DK 맨션', address:'도쿄도 다이토구 아사쿠사 1초메', monthlyRent:88000, deposit:88000, roomType:'1DK', squareMeters:26.5, floorArea:26.5, nearbyStation:'도에이 아사쿠사선/아사쿠사역 도보 5분', amenities:'에어컨,욕실/화장실 분리,마루바닥,실내 세탁기,오토락,베란다', foreignerWelcome:true, petFriendly:false, averageRating:4.5, images:'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop' },
  { id:52, title:'키치조지역 1LDK 맨션', address:'도쿄도 무사시노시 키치조지혼초 1초메', monthlyRent:112000, deposit:224000, roomType:'1LDK', squareMeters:32, floorArea:32, nearbyStation:'JR 추오선/키치조지역 도보 8분', amenities:'에어컨,독립 세면대,오토락,택배보관함,반려동물 가능,마루바닥,욕실 건조기', foreignerWelcome:true, petFriendly:true, averageRating:4.6, images:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop' },
  { id:55, title:'시모키타자와역 1K 맨션', address:'도쿄도 세타가야구 키타자와 2초메', monthlyRent:85000, deposit:85000, roomType:'1K', squareMeters:22, floorArea:22, nearbyStation:'오다큐선/시모키타자와역 도보 3분', amenities:'에어컨,오토락,마루바닥,실내 세탁기,인터넷 무료', foreignerWelcome:true, petFriendly:false, averageRating:4.5, images:'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=600&h=400&fit=crop' },
  { id:56, title:'네리마역 2DK 맨션', address:'도쿄도 네리마구 토요타마키타 6초메', monthlyRent:92000, deposit:92000, roomType:'2DK', squareMeters:35.5, floorArea:35.5, nearbyStation:'도에이 오에도선/네리마역 도보 5분', amenities:'에어컨,마루바닥,실내 세탁기,베란다,반려동물 가능,자전거 주차장', foreignerWelcome:true, petFriendly:true, averageRating:4.2, images:'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&h=400&fit=crop' },
  { id:59, title:'이타바시역 3DK 가족형', address:'도쿄도 이타바시구 이타바시 1초메', monthlyRent:115000, deposit:115000, roomType:'3DK', squareMeters:52, floorArea:52, nearbyStation:'JR 사이쿄선/이타바시역 도보 4분', amenities:'에어컨,마루바닥,실내 세탁기,베란다,반려동물 가능,자전거 주차장,추가난방', foreignerWelcome:true, petFriendly:true, averageRating:4.0, images:'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop' },
];

const ROOM_TYPES = ['전체', '1R', '1K', '1DK', '1LDK', '2DK', '2LDK', '3DK'];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* filters */
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(300000);
  const [roomType, setRoomType] = useState('전체');
  const [foreignerOnly, setForeignerOnly] = useState(false);
  const [petOnly, setPetOnly] = useState(false);
  const [amenityFilter, setAmenityFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rent-asc' | 'rent-desc' | 'rating'>('rent-asc');
  const [krwRate, setKrwRate] = useState<number>(9.5);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  const AMENITY_OPTIONS = ['에어컨', 'WiFi', '인터넷', '오토락', '헬스장', '콘시어지', '바닥난방', '택배보관함', '베란다', '주차장'];

  /* Korean↔Japanese amenity mapping for cross-language matching */
  const AMENITY_MAP: Record<string, string[]> = {
    '에어컨': ['에어컨', 'エアコン', 'aircon'],
    'WiFi': ['wifi', 'wi-fi', 'インターネット無料'],
    '인터넷': ['인터넷', 'インターネット', 'internet'],
    '오토락': ['오토락', 'オートロック', 'auto-lock'],
    '헬스장': ['헬스장', 'フィットネスジム', 'ジム', 'gym'],
    '콘시어지': ['콘시어지', 'コンシェルジュ', 'concierge'],
    '바닥난방': ['바닥난방', '床暖房', 'floor-heating'],
    '택배보관함': ['택배보관함', '宅配ボックス', 'delivery-box'],
    '베란다': ['베란다', 'バルコニー', 'balcony'],
    '주차장': ['주차장', '駐車場', 'parking'],
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProperties();
        const list = Array.isArray(res) ? res : ((res as any)?.content ?? []);
        if (list.length > 0) { setProperties(list); } else { setProperties(DEMO_PROPERTIES); }
      } catch {
        setProperties(DEMO_PROPERTIES);
      } finally { setLoading(false); }
    };
    load();
    getExchangeRates('JPY').then((r: any) => { if (r?.rates?.KRW) setKrwRate(r.rates.KRW); }).catch(() => {});
    getSavedPropertyIds().then((r: any) => { if (r?.savedIds) setSavedIds(r.savedIds); }).catch(() => {});
  }, []);

  const toKrw = (jpy: number) => Math.round(jpy * krwRate).toLocaleString();

  const toggleAmenity = (a: string) => {
    setAmenityFilter((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  const filtered = useMemo(() => {
    const keywords = expandSearch(search);
    let list = properties.filter((p) => {
      /* text search */
      if (search.trim()) {
        const haystack = `${p.titleKo ?? ''} ${p.title ?? ''} ${p.addressKo ?? ''} ${p.address ?? ''} ${p.nearbyStationKo ?? ''} ${p.nearbyStation ?? ''} ${p.amenities ?? ''} ${p.amenitiesKo ?? ''}`.toLowerCase();
        if (!keywords.some((kw) => haystack.includes(kw))) return false;
      }
      /* price */
      const rent = p.monthlyRent ?? 0;
      if (rent < minPrice || rent > maxPrice) return false;
      /* room type */
      if (roomType !== '전체' && p.roomType !== roomType) return false;
      /* toggles */
      if (foreignerOnly && !p.foreignerWelcome) return false;
      if (petOnly && !p.petFriendly) return false;
      /* amenities — match both Korean and Japanese names */
      if (amenityFilter.length > 0) {
        const pAmenities = (p.amenities ?? '').toLowerCase();
        if (!amenityFilter.every((a) => {
          const synonyms = AMENITY_MAP[a] || [a];
          return synonyms.some((s) => pAmenities.includes(s.toLowerCase()));
        })) return false;
      }
      return true;
    });
    /* sort */
    list.sort((a, b) => {
      if (sortBy === 'rent-asc') return (a.monthlyRent ?? 0) - (b.monthlyRent ?? 0);
      if (sortBy === 'rent-desc') return (b.monthlyRent ?? 0) - (a.monthlyRent ?? 0);
      return (b.averageRating ?? 0) - (a.averageRating ?? 0);
    });
    return list;
  }, [properties, search, minPrice, maxPrice, roomType, foreignerOnly, petOnly, amenityFilter, sortBy]);

  const resetFilters = () => { setSearch(''); setMinPrice(0); setMaxPrice(300000); setRoomType('전체'); setForeignerOnly(false); setPetOnly(false); setAmenityFilter([]); setSortBy('rent-asc'); };

  return (
    <div className="min-h-screen bg-light py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between border-b border-border/50 pb-5">
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold text-text mb-2 tracking-tight">🏢 일본 매물 검색</h1>
            <p className="text-muted text-[15px] font-medium tracking-tight">외국인 환영 매물부터 반려동물 OK까지, 조건에 맞는 안전한 주택을 찾아보세요.</p>
          </div>
          <Link href="/properties/compare" className="text-sm font-bold text-primary border-2 border-primary px-5 py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm mt-4 sm:mt-0 whitespace-nowrap truncate w-fit self-start sm:self-end">
            📊 매물 비교하기
          </Link>
        </div>

        {/* Search bar + filter toggle */}
        <div className="bg-white border text-text font-bold text-sm tracking-tight border-border/60 rounded-2xl p-5 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input 
              type="text" 
              placeholder="지역명, 역이름, 혹은 기타 키워드로 검색해보세요" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-gray-50 border border-border/60 rounded-xl px-5 py-3.5 text-base outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all min-w-0" 
            />
            <button className="bg-primary hover:bg-primary-dark text-white rounded-xl font-extrabold text-base px-8 py-3.5 transition-all shadow-sm flex items-center justify-center gap-2 flex-shrink-0">
              <span>🔍</span> 검색
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="flex items-center gap-1 text-[15px] text-primary font-extrabold hover:text-primary-dark transition-colors">
              {filtersOpen ? '▲ 상세 필터 닫기' : '▼ 상세 필터 열기'}
            </button>
            <div className="bg-gray-50 px-3 py-1 rounded-lg text-sm text-muted font-bold border border-gray-100">
              검색결과: <span className="text-primary text-base font-extrabold ml-0.5">{filtered.length}</span><span className="font-medium text-xs ml-0.5">건</span>
            </div>
          </div>
        </div>

        {/* Filters panel */}
        {filtersOpen && (
          <div className="bg-white border border-gray-200 p-5 mb-6 space-y-5">
            {/* Price range */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">💰 월세 범위 (엔)</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} placeholder="최소" step={10000} min={0}
                  className="w-full sm:w-32 border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500" />
                <span className="text-gray-400 text-sm hidden sm:inline">~</span>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} placeholder="최대" step={10000} min={0}
                  className="w-full sm:w-32 border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500" />
                <span className="text-xs text-gray-400">¥{minPrice.toLocaleString()} ~ ¥{maxPrice.toLocaleString()}</span>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[[30000,60000,'3~6만'],[60000,100000,'6~10만'],[100000,150000,'10~15만'],[150000,300000,'15만~']].map(([mn,mx,label]) => (
                  <button key={String(label)} onClick={() => { setMinPrice(mn as number); setMaxPrice(mx as number); }}
                    className="text-xs border border-gray-300 px-3 py-1 hover:border-green-500 hover:text-green-600 transition">{label}</button>
                ))}
              </div>
            </div>

            {/* Room type */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">🏠 방 타입</p>
              <div className="flex gap-2 flex-wrap">
                {ROOM_TYPES.map((rt) => (
                  <button key={rt} onClick={() => setRoomType(rt)}
                    className={`text-xs font-bold px-4 py-2 border transition ${roomType === rt ? 'bg-green-500 text-white border-green-500' : 'border-gray-300 text-gray-600 hover:border-green-400'}`}>{rt}</button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex gap-6 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={foreignerOnly} onChange={(e) => setForeignerOnly(e.target.checked)} className="w-4 h-4 accent-green-500" />
                <span className="text-sm font-bold text-gray-700">🌐 외국인 환영만</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={petOnly} onChange={(e) => setPetOnly(e.target.checked)} className="w-4 h-4 accent-green-500" />
                <span className="text-sm font-bold text-gray-700">🐾 반려동물 OK만</span>
              </label>
            </div>

            {/* Amenities */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">🏗️ 설비·어메니티</p>
              <div className="flex gap-2 flex-wrap">
                {AMENITY_OPTIONS.map((a) => (
                  <button key={a} onClick={() => toggleAmenity(a)}
                    className={`text-xs font-bold px-3 py-1.5 border transition ${amenityFilter.includes(a) ? 'bg-green-100 text-green-700 border-green-400' : 'border-gray-300 text-gray-500 hover:border-green-300'}`}>
                    {amenityFilter.includes(a) ? '✓ ' : ''}{a}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort + Reset */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">정렬:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="border border-gray-300 text-sm px-3 py-1.5 outline-none focus:border-green-500">
                  <option value="rent-asc">월세 낮은순</option>
                  <option value="rent-desc">월세 높은순</option>
                  <option value="rating">평점 높은순</option>
                </select>
              </div>
              <button onClick={resetFilters} className="text-xs text-red-400 hover:text-red-500 font-bold transition">🔄 필터 초기화</button>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-4 animate-pulse">🔍</div>
            <p className="font-bold">매물을 불러오는 중...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <div className="text-4xl mb-4">📭</div>
            <p className="font-extrabold text-lg text-text">조건에 맞는 매물이 없습니다</p>
            <p className="text-sm mt-3 font-medium">검색 조건을 변경하거나 <button onClick={resetFilters} className="text-primary font-bold hover:underline">필터를 초기화</button>해 보세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p) => (
              <Link key={p.id} href={`/properties/${p.id}`}>
                <div className="bg-white border flex flex-col h-full border-border/50 rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-60 bg-light relative overflow-hidden">
                    {getImageUrl(p) ? (
                      <div className="w-full h-full">
                        <img src={getImageUrl(p)!} alt={p.title}
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted">
                        <span className="text-4xl mb-2">📸</span>
                        <span className="text-xs">이미지 준비중</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {p.foreignerWelcome && <span className="bg-primary/90 backdrop-blur-sm text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-sm">🌐 외국인 환영</span>}
                      {p.petFriendly && <span className="bg-blue-500/90 backdrop-blur-sm text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-sm">🐾 반려동물 가능</span>}
                    </div>
                    {p.roomType && <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-extrabold px-3 py-1.5 rounded-full tracking-wider">{p.roomType}</span>}
                    <div className="absolute bottom-3 right-3 z-10 transition-transform hover:scale-110">
                      <SaveButton propertyId={p.id} initialSaved={savedIds.includes(p.id)} size="sm" />
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs text-muted mb-2 flex items-center truncate w-full">
                      <span className="text-base mr-1">📍</span> {p.addressKo || p.address}
                    </p>
                    <h3 className="font-extrabold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors text-text/90 leading-snug h-12">{p.titleKo || p.title}</h3>
                    {(p.nearbyStationKo || p.nearbyStation) && <p className="text-xs font-medium text-muted/80 mb-3 truncate bg-gray-50 px-2 py-1 rounded w-max border border-gray-100">🚃 {p.nearbyStationKo || p.nearbyStation}</p>}
                    
                    <div className="flex items-center justify-between mt-auto border-t border-border/40 pt-4">
                      <div>
                        <span className="text-primary font-extrabold text-2xl tracking-tighter">¥{(p.monthlyRent ?? 0).toLocaleString()}<span className="text-sm font-semibold text-muted/80 ml-1">/월</span></span>
                        <p className="text-[12px] text-blue-500/80 font-bold tracking-tight mt-0.5">약 ₩{toKrw(p.monthlyRent ?? 0)}</p>
                      </div>
                      {(p.averageRating ?? 0) > 0 && (
                        <div className="flex flex-col items-end">
                           <div className="flex items-center gap-1 bg-yellow-100/80 px-2.5 py-1 text-yellow-700 text-sm font-extrabold rounded-lg">
                             <span>⭐</span> {(p.averageRating).toFixed(1)}
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
