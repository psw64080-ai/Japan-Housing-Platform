'use client';

import { useState, useEffect } from 'react';
import { getSharehouseById, getExchangeRates } from '@/lib/api/client';
import Link from 'next/link';

interface Sharehouse {
  id: number;
  name: string;
  title?: string;
  address?: string;
  monthlyRent?: number;
  deposit?: number;
  availableRooms?: number;
  totalRooms?: number;
  description?: string;
  amenities?: string[];
  features?: string[];
  images?: string;
  latitude?: number;
  longitude?: number;
  source?: string;
}

const DEMO: Record<number, Sharehouse> = {
  1: { id:1, name:'Oakhouse Shinjuku', title:'Oakhouse 신주쿠 (오크하우스)', address:'도쿄도 신주쿠구 니시신주쿠 7초메', monthlyRent:65000, deposit:30000, availableRooms:3, totalRooms:12, description:'일본 최대 셰어하우스 운영회사 "오크하우스"의 신주쿠 물건. 다국적 입주자와 교류 가능. 공용라운지·주방 완비. 초기비용 저렴.', amenities:['Wi-Fi','공용라운지','공용주방','세탁기','건조기','자전거 주차장'], features:['다국적 운영','셰어하우스 형태','가구포함','초기비용 저렴'], images:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop' },
  2: { id:2, name:'Sakura House Ikebukuro', title:'사쿠라하우스 이케부쿠로', address:'도쿄도 토시마구 이케부쿠로 2초메', monthlyRent:58000, deposit:0, availableRooms:2, totalRooms:8, description:'1992년 창업 노포 셰어하우스 "사쿠라하우스". 단기~장기 체류 모두 대응. 보증인 불요·즉시 입주 가능. 유학생·워킹홀리데이에 인기.', amenities:['Wi-Fi','공용주방','세탁기','코인세탁','공용샤워'], features:['보증인 불요','보증금 제로','단기OK','가구포함','즉시 입주 가능'], images:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop' },
  3: { id:3, name:'Borderless House Shibuya', title:'보더리스하우스 시부야', address:'도쿄도 시부야구 진난 1초메', monthlyRent:72000, deposit:30000, availableRooms:1, totalRooms:10, description:'"국제교류"가 테마인 셰어하우스. 입주자 절반은 일본인, 절반은 외국인인 밸런스가 특징. 매주 교류 이벤트. 언어 학습에 최적.', amenities:['Wi-Fi','공용거실','공용주방','세탁기','옥상테라스'], features:['국제교류','언어교환','이벤트 매주','가구포함','외국인 50%'], images:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
  4: { id:4, name:'Social Apartment Nakano', title:'소셜아파트먼트 나카노', address:'도쿄도 나카노구 나카노 4초메', monthlyRent:78000, deposit:50000, availableRooms:4, totalRooms:40, description:'대형 셰어하우스 "소셜아파트먼트". 프라이벗 개인실+화려한 공유공간. 피트니스·시어터룸·워크스페이스 완비.', amenities:['Wi-Fi','피트니스 센터','시어터룸','코워킹스페이스','공용주방','라이브러리'], features:['대규모','충실 설비','개인실완비','가구포함','커뮤니티'], images:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop' },
  5: { id:5, name:'Share Style Koenji', title:'셰어스타일 코엔지', address:'도쿄도 스기나미구 코엔지미나미 3초메', monthlyRent:48000, deposit:20000, availableRooms:2, totalRooms:6, description:'코엔지의 소규모 아늑한 셰어하우스. 서브컬처 좋아하는 사람이 모이는 개성적 물건. 월세 최저가. 신주쿠까지 전철 7분.', amenities:['Wi-Fi','공용주방','세탁기','공용거실','옥상'], features:['저렴','아늑함','소규모','가구포함','서브컬처'], images:'https://images.unsplash.com/photo-1493809842364-78f1ada6f5e3?w=800&h=600&fit=crop' },
};

export default function SharehouseDetailPage({ params }: { params: { id: string } }) {
  const [house, setHouse] = useState<Sharehouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [krwRate, setKrwRate] = useState(9.5);
  const houseId = parseInt(params.id);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSharehouseById(houseId);
        if (data && typeof data === 'object' && ('name' in data)) setHouse(data as Sharehouse);
        else throw new Error('invalid');
      } catch {
        setHouse(DEMO[houseId] ?? DEMO[1]!);
      }
      setLoading(false);
    };
    load();
    getExchangeRates('JPY').then((r: any) => { if (r?.rates?.KRW) setKrwRate(r.rates.KRW); }).catch(() => {});
  }, [houseId]);

  const rent = house?.monthlyRent ?? 0;
  const deposit = house?.deposit ?? 0;
  const toKrw = (jpy: number) => Math.round(jpy * krwRate).toLocaleString();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center text-gray-400"><p className="text-4xl mb-3 animate-pulse">🏘️</p><p className="font-bold">셰어하우스 정보를 불러오는 중...</p></div>
    </div>
  );

  if (!house) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><p className="text-4xl mb-3">😥</p><p className="text-gray-500 font-bold">셰어하우스를 찾을 수 없습니다</p>
        <Link href="/sharehouses" className="inline-block mt-4 bg-green-500 text-white font-bold text-sm px-6 py-2">← 셰어하우스 목록</Link></div>
    </div>
  );

  const occupancyRate = house.totalRooms ? Math.round(((house.totalRooms - (house.availableRooms ?? 0)) / house.totalRooms) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/sharehouses" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-bold text-sm mb-6">← 셰어하우스 목록으로</Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 이미지 */}
            <div className="bg-white border border-gray-200 overflow-hidden">
              <div className="relative h-80 bg-gradient-to-br from-green-400 to-green-600">
                {house.images ? (
                  <img src={house.images} alt={house.title || house.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white"><span className="text-6xl mb-2">🏘️</span><span className="text-sm">이미지 준비 중</span></div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {(house.availableRooms ?? 0) > 0 ? (
                    <span className="bg-green-500 text-white text-[11px] font-bold px-2.5 py-1">✅ 빈 방 {house.availableRooms}개</span>
                  ) : (
                    <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-1">만실</span>
                  )}
                  <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1">🌐 외국인 OK</span>
                </div>
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="bg-white border border-gray-200 p-6">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{house.title || house.name}</h1>
              <p className="text-sm text-gray-400 mb-5">📍 {house.address}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 border border-green-100 p-4">
                  <p className="text-xs text-gray-500 mb-1">월세 (月額)</p>
                  <p className="text-2xl font-extrabold text-green-600">¥{rent.toLocaleString()}</p>
                  <p className="text-sm text-blue-500 font-bold mt-1">≈ ₩{toKrw(rent)}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs text-gray-500 mb-1">보증금 (デポジット)</p>
                  <p className="text-2xl font-bold text-gray-700">{deposit === 0 ? '무료' : `¥${deposit.toLocaleString()}`}</p>
                  {deposit > 0 && <p className="text-sm text-blue-500 font-bold mt-1">≈ ₩{toKrw(deposit)}</p>}
                </div>
              </div>

              {/* 방 현황 */}
              <div className="bg-gray-50 border border-gray-100 p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-700">🏠 방 현황</p>
                  <p className="text-sm text-gray-500">{(house.totalRooms ?? 0) - (house.availableRooms ?? 0)}/{house.totalRooms ?? 0}실 입주 중</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full transition-all duration-500" style={{ width: `${occupancyRate}%` }}></div>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-[11px] text-gray-400">입주율 {occupancyRate}%</p>
                  <p className="text-[11px] text-green-600 font-bold">빈 방 {house.availableRooms ?? 0}개</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-6">{house.description}</p>

              {house.source && (
                <p className="text-[11px] text-gray-300 italic">ℹ️ {house.source}</p>
              )}
            </div>

            {/* 편의시설 */}
            {house.amenities && house.amenities.length > 0 && (
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-lg font-extrabold text-gray-900 mb-4">🏗️ 시설·설비</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {house.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 bg-gray-50 p-3 border border-gray-100">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-gray-700">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 특징 */}
            {house.features && house.features.length > 0 && (
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-lg font-extrabold text-gray-900 mb-4">✨ 특징</h2>
                <div className="flex flex-wrap gap-2">
                  {house.features.map((f) => (
                    <span key={f} className="bg-green-50 text-green-700 border border-green-200 font-bold text-sm px-4 py-2">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 셰어하우스 가이드 */}
            <div className="bg-blue-50 border border-blue-200 p-6">
              <h3 className="font-bold text-blue-800 mb-3">📋 셰어하우스 입주 가이드</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <p>1️⃣ <strong>문의·견학 예약</strong> — 먼저 연락해서 견학 날짜를 잡으세요</p>
                <p>2️⃣ <strong>견학·면담</strong> — 실제 물건과 공용공간을 확인하세요</p>
                <p>3️⃣ <strong>계약·입금</strong> — 보증금+첫 달 월세를 입금하면 계약 완료</p>
                <p>4️⃣ <strong>입주</strong> — 가구 포함이라 짐만 가지고 바로 입주!</p>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 p-6 sticky top-4">
              <p className="text-center text-green-600 font-extrabold text-2xl mb-1">¥{rent.toLocaleString()}<span className="text-sm font-normal text-gray-400">/월</span></p>
              <p className="text-center text-sm text-blue-500 font-bold mb-1">≈ ₩{toKrw(rent)}/월</p>
              <p className="text-center text-xs text-gray-400 mb-5">
                보증금 {deposit === 0 ? '무료!' : `¥${deposit.toLocaleString()} (≈₩${toKrw(deposit)})`}
              </p>

              {(house.availableRooms ?? 0) > 0 ? (
                <>
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 mb-3 text-sm transition">📩 입주 문의하기</button>
                  <button className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50 font-bold py-3 mb-3 text-sm transition">🏠 견학 예약</button>
                </>
              ) : (
                <div className="bg-red-50 border border-red-200 p-4 mb-3 text-center">
                  <p className="text-red-600 font-bold text-sm">현재 만실입니다</p>
                  <p className="text-xs text-red-400 mt-1">빈 방이 나오면 알려드릴게요</p>
                </div>
              )}

              <button className="w-full border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 font-bold py-3 text-sm transition">
                {(house.availableRooms ?? 0) > 0 ? '🔔 빈 방 알림 설정' : '🔔 공실 알림 받기'}
              </button>
            </div>

            {/* 비용 비교 */}
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="font-bold text-sm text-gray-800 mb-3">💰 일반 원룸 vs 셰어하우스</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">월세</span>
                  <span className="font-bold text-green-600">¥{rent.toLocaleString()} <span className="text-gray-400 font-normal">vs ¥100,000~</span></span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">보증금</span>
                  <span className="font-bold text-green-600">{deposit === 0 ? '무료' : `¥${deposit.toLocaleString()}`} <span className="text-gray-400 font-normal">vs 월세 1~2개월분</span></span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">가구·가전</span>
                  <span className="font-bold text-green-600">포함 <span className="text-gray-400 font-normal">vs 별도 구입 필요</span></span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">보증인</span>
                  <span className="font-bold text-green-600">불요 <span className="text-gray-400 font-normal">vs 필요</span></span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-[11px] text-gray-400 text-center">셰어하우스는 초기비용이 일반 원룸 대비 약 1/3~1/5 수준!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
