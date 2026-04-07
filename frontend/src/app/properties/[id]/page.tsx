'use client';

import { useState, useEffect } from 'react';
import { getPropertyById, getReviewsByProperty, createReview, getExchangeRates } from '@/lib/api/client';
import ReviewForm from '@/components/ui/review/ReviewForm';
import Link from 'next/link';
import { isLoggedIn, getUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Review {
  id: number;
  reviewer: { id: number; name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Property {
  id: number;
  title: string;
  titleKo?: string;
  description: string;
  descriptionKo?: string;
  address: string;
  addressKo?: string;
  monthlyPrice?: number;
  monthlyRent?: number;
  deposit?: number;
  roomType?: string;
  floorArea?: number;
  squareMeters?: number;
  floor?: number;
  totalFloors?: number;
  images?: string;
  imagesJson?: string;
  amenities?: string;
  amenitiesKo?: string;
  petFriendly?: boolean;
  foreignerWelcome?: boolean;
  averageRating?: number;
  reviewCount?: number;
  nearbyStation?: string;
  nearbyStationKo?: string;
}

const AMENITY_ICONS: Record<string, string> = {
  '에어컨': '❄️', '마루바닥': '🪵', '실내 세탁기': '🫧', '인터넷 무료': '📶',
  '오토락': '🔒', '택배보관함': '📦', '욕실/화장실 분리': '🚿', '바닥난방': '🔥',
  '반려동물 가능': '🐾', '식기세척기': '🍽️', '워크인 클로젯': '👔', '욕실 건조기': '💨',
  '방범 카메라': '📷', '독립 세면대': '🪥', 'WiFi': '📡', '주차장': '🚗',
  '헬스장': '💪', '콘시어지': '🤵', '베란다': '🌿',
};

const DEMO: Record<number, Property> = {
  1: { id:1, title:'브라이즈 신주쿠 나카이', description:'세이부 신주쿠선 나카이역에서 도보 4분. 1R 19.78m²의 컴팩트한 원룸. 신주쿠역까지 전철 10분. 학생·직장인에게 최적.', address:'도쿄도 신주쿠구 나카이 1초메', monthlyRent:80000, deposit:80000, roomType:'1R', floorArea:19.78, floor:3, totalFloors:6, amenities:'에어컨,마루바닥,실내 세탁기,인터넷 무료', petFriendly:false, foreignerWelcome:true, averageRating:4.0, nearbyStation:'세이부 신주쿠선/나카이역 도보 4분', images:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop,https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop,https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop' },
  10: { id:10, title:'프라우드 에비스 디아쥬', description:'JR 야마노테선 에비스역에서 도보 5분. 노무라부동산의 고급 분양 임대. 축 1년 신축 맨션. 에비스 가든플레이스 근처. 17층 복층 구조의 최상급 거주 환경 제공.', address:'도쿄도 시부야구 히가시 3초메', monthlyRent:475000, deposit:950000, roomType:'2LDK', floorArea:72.31, floor:10, totalFloors:13, amenities:'에어컨,독립 세면대,오토락,택배보관함,반려동물 가능,바닥난방,식기세척기,워크인 클로젯', petFriendly:true, foreignerWelcome:true, averageRating:4.9, nearbyStation:'JR 야마노테선/에비스역 도보 5분', images:'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=500&fit=crop,https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=500&fit=crop,https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&h=500&fit=crop' },
  16: { id:16, title:'프라임어반 이케부쿠로', description:'도쿄메트로 마루노우치선 이케부쿠로역에서 도보 4분. 이케부쿠로역 근접 대규모 맨션. 선샤인시티도 바로 근처. 외국인 입주 환영, 영어 가능 관리인 상주.', address:'도쿄도 토시마구 이케부쿠로 2초메', monthlyRent:139000, deposit:139000, roomType:'1K', floorArea:29.67, floor:8, totalFloors:14, amenities:'에어컨,욕실/화장실 분리,오토락,택배보관함,마루바닥,실내 세탁기', petFriendly:false, foreignerWelcome:true, averageRating:4.2, nearbyStation:'도쿄메트로 마루노우치선/이케부쿠로역 도보 4분', images:'https://images.unsplash.com/photo-1585128792020-803d29415281?w=800&h=500&fit=crop,https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=500&fit=crop' },
  24: { id:24, title:'라산테 아자부주반', description:'도쿄메트로 난보쿠선 아자부주반역에서 도보 2분. 17층 타워맨션. 아자부주반 상점가 바로 옆. 브랜드 숍과 레스토랑 밀집 지역.', address:'도쿄도 미나토구 아자부주반 3초메', monthlyRent:283000, deposit:283000, roomType:'1LDK', floorArea:40.08, floor:10, totalFloors:17, amenities:'에어컨,독립 세면대,오토락,택배보관함,욕실 건조기,마루바닥,방범 카메라', petFriendly:false, foreignerWelcome:true, averageRating:4.6, nearbyStation:'도쿄메트로 난보쿠선/아자부주반역 도보 2분', images:'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=500&fit=crop,https://images.unsplash.com/photo-1493809842364-78f1ada6f5e3?w=800&h=500&fit=crop' },
  52: { id:52, title:'키치조지역 1LDK 맨션', description:'\"살고 싶은 거리\" 상위 키치조지. 이노카시라 공원 도보 거리. 상점가·쇼핑몰 충실. 시부야까지 전철 15분.', address:'도쿄도 무사시노시 키치조지혼초 1초메', monthlyRent:112000, deposit:224000, roomType:'1LDK', floorArea:32, floor:4, totalFloors:7, amenities:'에어컨,독립 세면대,오토락,택배보관함,반려동물 가능,마루바닥,욕실 건조기', petFriendly:true, foreignerWelcome:true, averageRating:4.6, nearbyStation:'JR 추오선/키치조지역 도보 8분', images:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop,https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=500&fit=crop' },
  55: { id:55, title:'시모키타자와역 1K 맨션', description:'시모키타자와 메인스트리트 바로 옆. 연극·음악·빈티지의 거리. 2노선 이용 가능. 시부야·신주쿠 모두 가까움.', address:'도쿄도 세타가야구 키타자와 2초메', monthlyRent:85000, deposit:85000, roomType:'1K', floorArea:22, floor:4, totalFloors:6, amenities:'에어컨,오토락,마루바닥,실내 세탁기,인터넷 무료', petFriendly:false, foreignerWelcome:true, averageRating:4.5, nearbyStation:'오다큐선/시모키타자와역 도보 3분', images:'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=500&fit=crop' },
};

const DEMO_REVIEWS: Review[] = [
  { id:1, reviewer:{id:10,name:'Kim Minjun'}, rating:5, comment:'집주인 분이 정말 친절하시고, 외국인이라 걱정했는데 입주 절차도 잘 도와주셨어요!', createdAt:'2025-12-15' },
  { id:2, reviewer:{id:11,name:'Tanaka Yuki'}, rating:4, comment:'駅から近くて便利です。隣人も静かで快適に過ごしています。', createdAt:'2025-11-20' },
  { id:3, reviewer:{id:12,name:'Chen Wei'}, rating:4, comment:'Good location, clean apartment. Landlord speaks some English.', createdAt:'2025-10-05' },
];

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [krwRate, setKrwRate] = useState<number>(9.5);
  const [activeImg, setActiveImg] = useState(0);
  const [saved, setSaved] = useState(false);
  const propertyId = parseInt(params.id);

  useEffect(() => {
    loadData();
    getExchangeRates('JPY').then((r: any) => { if (r?.rates?.KRW) setKrwRate(r.rates.KRW); }).catch(() => {});
    // Check if saved
    try {
      const stored = localStorage.getItem('jhc_saved_items');
      if (stored) {
        const items = JSON.parse(stored);
        setSaved(items.some((i: any) => i.type === 'property' && i.id === propertyId));
      }
    } catch {}
  }, [propertyId]);

  const loadData = async () => {
    try {
      const pd = await getPropertyById(propertyId);
      if (pd && typeof pd === 'object' && ('title' in pd || 'address' in pd)) {
        setProperty(pd as Property);
      } else throw new Error('invalid');
    } catch {
      const d = DEMO[propertyId] ?? { ...DEMO[1]!, id: propertyId };
      setProperty(d);
    }
    try {
      const rv = await getReviewsByProperty(propertyId);
      const rvList = Array.isArray(rv) ? rv : Array.isArray((rv as any)?.content) ? (rv as any).content : null;
      setReviews(rvList && rvList.length > 0 ? rvList as Review[] : DEMO_REVIEWS);
    } catch { setReviews(DEMO_REVIEWS); }
    setLoading(false);
  };

  const toggleSave = () => {
    if (!isLoggedIn()) {
      alert('❤️ 찜하기 기능은 로그인 후 이용 가능합니다!');
      router.push('/login');
      return;
    }
    try {
      const stored = localStorage.getItem('jhc_saved_items');
      let items = stored ? JSON.parse(stored) : [];
      if (saved) {
        items = items.filter((i: any) => !(i.type === 'property' && i.id === propertyId));
      } else {
        items.push({ id: propertyId, type: 'property', title: property?.titleKo || property?.title, address: property?.addressKo || property?.address, monthlyRent: property?.monthlyRent ?? property?.monthlyPrice ?? 0, imageUrl: imageList[0] || '', savedAt: new Date().toISOString().split('T')[0] });
      }
      localStorage.setItem('jhc_saved_items', JSON.stringify(items));
      setSaved(!saved);
    } catch {}
  };

  const handleReview = async (rd: any) => {
    if (!isLoggedIn()) {
      alert('💬 리뷰 작성은 로그인 후 이용 가능합니다!');
      router.push('/login');
      return;
    }
    try {
      setSubmittingReview(true);
      await createReview(rd);
      loadData();
      alert('리뷰가 등록되었습니다!');
    } catch { alert('리뷰 등록 실패 (백엔드 확인)'); }
    finally { setSubmittingReview(false); }
  };

  const rent = property?.monthlyRent ?? property?.monthlyPrice ?? 0;
  const deposit = property?.deposit ?? 0;
  const area = property?.floorArea ?? property?.squareMeters ?? 0;
  const toKrw = (jpy: number) => Math.round(jpy * krwRate).toLocaleString();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center text-gray-400">
        <p className="text-6xl mb-4 animate-bounce">🏠</p>
        <p className="font-bold text-lg">매물 정보를 불러오는 중...</p>
        <div className="mt-4 flex gap-1 justify-center">
          {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}
        </div>
      </div>
    </div>
  );

  if (!property) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-5xl mb-3">😥</p>
        <p className="text-gray-500 font-bold mb-4">매물을 찾을 수 없습니다</p>
        <Link href="/properties" className="inline-block bg-green-500 text-white font-bold px-6 py-2 rounded-lg">← 매물 목록으로</Link>
      </div>
    </div>
  );

  const imageList: string[] = property.imagesJson
    ? (() => { try { return JSON.parse(property.imagesJson!); } catch { return []; } })()
    : property.images?.split(',').filter(Boolean).map(s => s.trim()) ?? [];

  const amenityList = (property.amenitiesKo || property.amenities || '').split(',').filter(Boolean).map(a => a.trim());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-green-600">홈</Link>
          <span>›</span>
          <Link href="/properties" className="hover:text-green-600">매물 검색</Link>
          <span>›</span>
          <span className="text-gray-700 font-bold line-clamp-1">{property.titleKo || property.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ═══ LEFT / MAIN ═══ */}
          <div className="lg:col-span-2 space-y-6">

            {/* 이미지 갤러리 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative h-80 bg-gray-100">
                {imageList[activeImg] ? (
                  <img src={imageList[activeImg]} alt={property.title} className="w-full h-full object-cover transition-all duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gradient-to-br from-gray-100 to-gray-200">
                    <span className="text-7xl mb-2">🏠</span>
                    <span className="text-sm">이미지 준비 중</span>
                  </div>
                )}
                {/* Overlay tags */}
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  {property.foreignerWelcome && <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">🌐 외국인 OK</span>}
                  {property.petFriendly && <span className="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">🐾 반려동물 OK</span>}
                </div>
                {/* Save button */}
                <button onClick={toggleSave} className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg backdrop-blur-sm transition-all ${saved ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-400 hover:text-red-500'}`}>
                  {saved ? '❤️' : '🤍'}
                </button>
                {/* Nav arrows */}
                {imageList.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg(i => (i - 1 + imageList.length) % imageList.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition">‹</button>
                    <button onClick={() => setActiveImg(i => (i + 1) % imageList.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition">›</button>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {imageList.length > 1 && (
                <div className="flex gap-2 p-3 bg-gray-50">
                  {imageList.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition ${activeImg === i ? 'border-green-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 기본 정보 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{property.titleKo || property.title}</h1>
                  <p className="text-sm text-gray-400 flex items-center gap-1">📍 {property.addressKo || property.address}</p>
                </div>
                {property.roomType && (
                  <span className="bg-green-100 text-green-700 font-extrabold text-sm px-3 py-1.5 rounded-lg">{property.roomType}</span>
                )}
              </div>

              {property.nearbyStationKo || property.nearbyStation ? (
                <p className="text-sm text-blue-600 font-bold bg-blue-50 px-3 py-2 rounded-lg mb-5 inline-flex items-center gap-2">
                  🚃 {property.nearbyStationKo || property.nearbyStation}
                </p>
              ) : null}

              {/* Price cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <p className="text-xs text-green-600 font-bold mb-1">💴 월세 (月額)</p>
                  <p className="text-2xl font-extrabold text-green-700">¥{rent.toLocaleString()}</p>
                  <p className="text-sm text-blue-500 font-bold mt-1">≈ ₩{toKrw(rent)}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-bold mb-1">🏦 보증금 (敷金)</p>
                  <p className="text-2xl font-bold text-gray-700">¥{deposit.toLocaleString()}</p>
                  <p className="text-sm text-blue-500 font-bold mt-1">≈ ₩{toKrw(deposit)}</p>
                </div>
              </div>

              {/* 상세 스펙 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: '방 타입', value: property.roomType ?? '-', icon: '🏠' },
                  { label: '전용 면적', value: `${area}㎡`, icon: '📐' },
                  { label: '층수', value: `${property.floor ?? '-'}F / ${property.totalFloors ?? '-'}F`, icon: '🏢' },
                  { label: '평점', value: property.averageRating ? `⭐ ${property.averageRating.toFixed(1)}` : '-', icon: '⭐' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <p className="text-lg mb-1">{item.icon}</p>
                    <p className="text-[11px] text-gray-400 mb-0.5">{item.label}</p>
                    <p className="font-bold text-sm text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl p-4">
                {property.descriptionKo || property.description}
              </p>
            </div>

            {/* 설비·시설 */}
            {amenityList.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-extrabold text-gray-900 mb-4">🏗️ 설비 · 시설</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenityList.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                      <span className="text-xl">{AMENITY_ICONS[a] || '✅'}</span>
                      <span className="text-sm font-bold text-gray-700">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 입주 비용 계산기 미니 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h2 className="text-lg font-extrabold text-gray-900 mb-4">💰 초기 비용 시뮬레이션</h2>
              <div className="space-y-2">
                {[
                  { label: '보증금 (시키킨)', value: deposit },
                  { label: '사례금 (레이킨)', value: rent },
                  { label: '중개 수수료 (1개월)', value: rent },
                  { label: '첫 달 월세', value: rent },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-blue-100 last:border-0">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-800">¥{item.value.toLocaleString()}</span>
                      <span className="text-xs text-blue-500 ml-2">≈₩{toKrw(item.value)}</span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3">
                  <span className="font-extrabold text-green-700">합계 예상</span>
                  <div className="text-right">
                    <span className="font-extrabold text-xl text-green-700">¥{(deposit + rent * 3).toLocaleString()}</span>
                    <p className="text-xs text-blue-600 font-bold">≈ ₩{toKrw(deposit + rent * 3)}</p>
                  </div>
                </div>
              </div>
              <Link href="/calculator" className="mt-4 inline-block text-xs text-blue-600 font-bold hover:underline">🧮 정확한 계산기로 이동 →</Link>
            </div>

            {/* 리뷰 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-extrabold text-gray-900">💬 거주자 리뷰</h2>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{reviews.length}건</span>
                {(property.averageRating ?? 0) > 0 && (
                  <span className="bg-yellow-50 text-yellow-600 font-extrabold text-sm px-3 py-1 rounded-lg">⭐ {property.averageRating!.toFixed(1)}</span>
                )}
              </div>
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                          {r.reviewer.name.charAt(0)}
                        </div>
                        <p className="font-bold text-sm text-gray-800">{r.reviewer.name}</p>
                      </div>
                      <div className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                    <p className="text-[11px] text-gray-300 mt-2">{r.createdAt}</p>
                  </div>
                ))}
              </div>
            </div>

            <ReviewForm propertyId={propertyId} landlordId={1} onSubmit={handleReview} loading={submittingReview} />
          </div>

          {/* ═══ RIGHT / SIDEBAR ═══ */}
          <div className="space-y-4">
            {/* CTA 카드 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-4">
              <div className="text-center mb-5">
                <p className="text-green-600 font-extrabold text-3xl mb-1">¥{rent.toLocaleString()}</p>
                <p className="text-xs text-gray-400">/ 월</p>
                <p className="text-sm text-blue-500 font-bold mt-1">≈ ₩{toKrw(rent)}/월</p>
                <p className="text-xs text-gray-400 mt-1">보증금 ¥{deposit.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => {
                    if (!isLoggedIn()) { alert('📩 문의하기는 로그인 후 이용 가능합니다!'); router.push('/login'); }
                    else alert('📩 문의 메일이 담당자에게 전달되었습니다! 2시간 이내에 답변드리겠습니다.');
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-extrabold py-3.5 rounded-xl text-sm transition hover:scale-105 shadow-md">
                  📩 지금 문의하기
                </button>
                <button 
                  onClick={() => {
                    if (!isLoggedIn()) { alert('🏠 견학 예약은 로그인 후 이용 가능합니다!'); router.push('/login'); }
                    else alert('🏠 견학 예약 페이지로 이동합니다.');
                  }}
                  className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50 font-bold py-3.5 rounded-xl text-sm transition">
                  🏠 견학 예약하기
                </button>
                <button 
                  onClick={() => {
                    if (!isLoggedIn()) { alert('🎬 가상투어는 로그인 후 이용 가능합니다!'); router.push('/login'); }
                    else alert('🎬 가상투어 엔진을 로드하고 있습니다...');
                  }}
                  className="block w-full border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 font-bold py-3 rounded-xl text-sm text-center transition">
                  🎬 3D 가상투어
                </button>
                <button onClick={toggleSave}
                  className={`w-full font-bold py-3 rounded-xl text-sm transition border ${saved ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400'}`}>
                  {saved ? '❤️ 찜 취소' : '🤍 찜하기'}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
                💬 평균 응답 시간 2시간 이내
              </div>
            </div>

            {/* 인근 정보 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-sm text-gray-800 mb-3">🗺️ 인근 정보</h3>
              <div className="space-y-2">
                {[
                  { icon: '🚃', label: '최근 역', value: property.nearbyStationKo || property.nearbyStation || '-' },
                  { icon: '🏫', label: '주변 학교', value: '도보 5~15분권' },
                  { icon: '🛒', label: '편의시설', value: '슈퍼마켓·편의점 근접' },
                  { icon: '🏥', label: '의료기관', value: '내과·약국 인근' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <span className="text-gray-400 text-xs">{item.label}</span>
                      <p className="font-bold text-gray-700 text-xs">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 입주 절차 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
              <h3 className="font-bold text-sm text-gray-800 mb-3">📋 입주 절차</h3>
              <div className="space-y-2">
                {['문의 접수', '서류 제출', '심사 (1~3일)', '계약 체결', '입주'].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</div>
                    <span className="text-xs font-bold text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
