'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSharehouses, getExchangeRates } from '@/lib/api/client';
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
  source?: string;
}

const FALLBACK: Sharehouse[] = [
  { id:1, name:'Oakhouse Shinjuku', title:'Oakhouse 신주쿠 (오크하우스)', address:'도쿄도 신주쿠구 니시신주쿠 7초메', monthlyRent:65000, deposit:30000, availableRooms:3, totalRooms:12, description:'일본 최대 셰어하우스 운영회사 "오크하우스"의 신주쿠 물건. 다국적 입주자와 교류 가능.', amenities:['Wi-Fi','공용라운지','공용주방','세탁기'], features:['다국적 운영','셰어하우스 형태','가구포함','초기비용 저렴'], images:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop' },
  { id:2, name:'Sakura House Ikebukuro', title:'사쿠라하우스 이케부쿠로', address:'도쿄도 토시마구 이케부쿠로 2초메', monthlyRent:58000, deposit:0, availableRooms:2, totalRooms:8, description:'1992년 창업 노포 셰어하우스. 단기~장기 체류 모두 대응. 보증인 불요.', amenities:['Wi-Fi','공용주방','세탁기','코인세탁'], features:['보증인 불요','보증금 제로','단기OK','가구포함'], images:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop' },
  { id:3, name:'Borderless House Shibuya', title:'보더리스하우스 시부야', address:'도쿄도 시부야구 진난 1초메', monthlyRent:72000, deposit:30000, availableRooms:1, totalRooms:10, description:'"국제교류"가 테마인 셰어하우스. 매주 교류 이벤트.', amenities:['Wi-Fi','공용거실','공용주방','옥상테라스'], features:['국제교류','언어교환','이벤트 매주','외국인 50%'], images:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
  { id:4, name:'Social Apartment Nakano', title:'소셜아파트먼트 나카노', address:'도쿄도 나카노구 나카노 4초메', monthlyRent:78000, deposit:50000, availableRooms:4, totalRooms:40, description:'대형 셰어하우스 "소셜아파트먼트". 피트니스·시어터룸 완비.', amenities:['Wi-Fi','피트니스 센터','시어터룸','코워킹스페이스'], features:['대규모','충실 설비','개인실완비','커뮤니티'], images:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop' },
  { id:5, name:'Share Style Koenji', title:'셰어스타일 코엔지', address:'도쿄도 스기나미구 코엔지미나미 3초메', monthlyRent:48000, deposit:20000, availableRooms:2, totalRooms:6, description:'코엔지의 소규모 아늑한 셰어하우스. 월세 최저가.', amenities:['Wi-Fi','공용주방','세탁기','옥상'], features:['저렴','아늑함','소규모','서브컬처'], images:'https://images.unsplash.com/photo-1493809842364-78f1ada6f5e3?w=800&h=600&fit=crop' },
];

const SORT_OPTIONS = [
  { value: '', label: '기본순' },
  { value: 'rent_asc', label: '월세 낮은순' },
  { value: 'rent_desc', label: '월세 높은순' },
  { value: 'rooms', label: '빈 방 많은순' },
];

export default function SharehousesPage() {
  const [houses, setHouses] = useState<Sharehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [krwRate, setKrwRate] = useState(9.5);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (search.trim()) params.q = search.trim();
      if (sort) params.sort = sort;
      if (maxRent) params.maxRent = Number(maxRent);
      const data = await getSharehouses(params as any);
      if (Array.isArray(data) && data.length > 0) setHouses(data as Sharehouse[]);
      else setHouses(FALLBACK);
    } catch {
      setHouses(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, [search, sort, maxRent]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { getExchangeRates('JPY').then((r: any) => { if (r?.rates?.KRW) setKrwRate(r.rates.KRW); }).catch(() => {}); }, []);

  const toKrw = (jpy: number) => Math.round(jpy * krwRate).toLocaleString();

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">🏘️ 셰어하우스</h1>
          <p className="text-gray-500 text-sm">외국인과 일본인이 함께 사는 셰어하우스를 찾아보세요</p>
        </div>

        {/* 검색 & 필터 */}
        <div className="bg-white border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="셰어하우스 이름, 지역으로 검색..."
                className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"
              />
            </div>
            <select
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              className="border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-white"
            >
              <option value="">월세 상한 없음</option>
              <option value="50000">~¥50,000 (~₩{toKrw(50000)})</option>
              <option value="60000">~¥60,000 (~₩{toKrw(60000)})</option>
              <option value="70000">~¥70,000 (~₩{toKrw(70000)})</option>
              <option value="80000">~¥80,000 (~₩{toKrw(80000)})</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-white"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* 결과 카운트 */}
        {!loading && (
          <p className="text-xs text-gray-400 mb-4 font-bold">{houses.length}건의 셰어하우스</p>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse font-bold">불러오는 중...</div>
        ) : houses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 font-bold">조건에 맞는 셰어하우스가 없습니다</p>
            <button onClick={() => { setSearch(''); setMaxRent(''); setSort(''); }} className="mt-3 text-green-600 text-sm font-bold hover:underline">필터 초기화</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {houses.map((h) => (
              <Link key={h.id} href={`/sharehouses/${h.id}`} className="block">
                <div className="bg-white border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-400 transition group h-full flex flex-col">
                  {/* 이미지 */}
                  <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 relative overflow-hidden">
                    {h.images ? (
                      <img src={h.images} alt={h.title || h.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="flex items-center justify-center h-full"><span className="text-5xl">🏠</span></div>
                    )}
                    {/* 빈 방 배지 */}
                    {(h.availableRooms ?? 0) > 0 ? (
                      <span className="absolute top-3 right-3 bg-green-500 text-white text-[11px] font-bold px-2 py-1">
                        빈 방 {h.availableRooms}개
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-[11px] font-bold px-2 py-1">만실</span>
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-base text-gray-800 mb-1 group-hover:text-green-600 transition">{h.title || h.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">📍 {h.address}</p>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{h.description}</p>

                    {/* 편의시설 */}
                    {h.amenities && h.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {h.amenities.slice(0, 4).map((a) => (
                          <span key={a} className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 border border-green-100">{a}</span>
                        ))}
                        {h.amenities.length > 4 && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5">+{h.amenities.length - 4}</span>
                        )}
                      </div>
                    )}

                    {/* 특징 태그 */}
                    {h.features && h.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {h.features.slice(0, 4).map((f) => (
                          <span key={f} className="text-[11px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5">{f}</span>
                        ))}
                      </div>
                    )}

                    {/* 가격 & 방 정보 */}
                    <div className="flex items-end justify-between border-t border-gray-100 pt-3 mt-auto">
                      <div>
                        <p className="text-green-600 font-extrabold text-lg">¥{h.monthlyRent?.toLocaleString()}<span className="text-xs font-normal text-gray-400">/월</span></p>
                        <p className="text-xs text-blue-500 font-bold">≈ ₩{toKrw(h.monthlyRent ?? 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-bold">
                          👥 {h.availableRooms ?? 0}/{h.totalRooms ?? 0}실
                        </p>
                        {h.deposit !== undefined && (
                          <p className="text-[11px] text-gray-400">보증금 ¥{h.deposit.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 안내 배너 */}
        <div className="mt-10 bg-green-50 border border-green-200 p-6">
          <h3 className="font-bold text-green-800 mb-2">💡 셰어하우스란?</h3>
          <p className="text-sm text-green-700 leading-relaxed">
            셰어하우스는 개인 방은 따로 있고, 주방·거실·욕실 등을 공유하는 주거 형태입니다. 
            일반 원룸보다 저렴하면서도 다국적 입주자와의 교류가 가능해 일본에 처음 오는 외국인에게 인기입니다. 
            보증인이 필요 없고, 가구 포함인 곳이 많아 초기 비용도 절약할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
