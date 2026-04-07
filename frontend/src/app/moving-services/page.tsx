'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMovingServices, getExchangeRates } from '@/lib/api/client';
import Link from 'next/link';

interface MovingService {
  id: number;
  name: string;
  description?: string;
  rating?: number;
  priceEstimate?: string;
  contactNumber?: string;
  website?: string;
  languages?: string[];
  features?: string[];
  source?: string;
}

const FALLBACK: MovingService[] = [
  { id:1, name:'닛폰운수 (Nippon Express)', description:'일본 최대 물류기업. 해외이사에 특화하며 한국어 대응 가능한 직원 배치. 꼼꼼한 포장과 확실한 배송으로 신뢰도 No.1. 유학생 할인도 있음.', rating:4.8, priceEstimate:'1인분 약 38,000엔~ / 가족 약 80,000엔~', contactNumber:'0120-154-022', languages:['일본어','English','한국어','중국어'], features:['해외이사 대응','한국어 대응','포장 서비스','보험 포함','한국 배송'] },
  { id:2, name:'사카이 이사센터 (Sakai Moving)', description:'판다 마크로 유명. "성의를 담아 함께"를 모토로 합리적 가격과 꼼꼼한 서비스를 제공.', rating:4.5, priceEstimate:'1인분 약 30,000엔~ / 가족 약 65,000엔~', contactNumber:'0120-00-1141', languages:['일본어'], features:['합리적 가격','한국 배송','포장재 무료','웹 견적'] },
  { id:3, name:'아트 이사센터 (Art Moving)', description:'"0123" 전화번호로 유명. 여성 전용의 "레이디스 팩"은 짐싸기·풀기까지 모두 맡길 수 있는 플랜 충실.', rating:4.6, priceEstimate:'1인분 약 35,000엔~ / 가족 약 70,000엔~', contactNumber:'0120-0123-33', languages:['일본어','English'], features:['레이디스 팩','시니어 플랜','가구이동','불용품 인수'] },
  { id:4, name:'야마토 컨비니언스 (Yamato)', description:'쿠로네코 야마토의 이사 서비스. "1박스 이사 서비스"는 전용 BOX에 짐을 넣기만 하면 되는 간편 이사.', rating:4.4, priceEstimate:'1박스BOX: 약 18,000엔~ / 일반 1인 약 30,000엔~', contactNumber:'0120-008-008', languages:['일본어','English'], features:['1박스BOX 플랜','저비용','편의점 접수','한국 배송'] },
  { id:5, name:'아리상 마크 이사사 (Ari-san)', description:'개미 마크가 목표. 학생·1인 거주자 전용으로 특화한 플랜 충실.', rating:4.3, priceEstimate:'미니 플랜: 약 15,000엔~ / 1인 약 25,000엔~', contactNumber:'0120-77-2626', languages:['일본어'], features:['미니 플랜','학생할인','저렴','소량OK'] },
];

const SORT_OPTIONS = [
  { value: '', label: '기본순' },
  { value: 'rating', label: '평점순' },
  { value: 'name', label: '이름순' },
];

const LANG_OPTIONS = [
  { value: '', label: '전체 언어' },
  { value: '한국어', label: '🇰🇷 한국어 대응' },
  { value: 'english', label: '🇬🇧 영어 대응' },
  { value: '중국어', label: '🇨🇳 중국어 대응' },
];

export default function MovingServicesPage() {
  const [services, setServices] = useState<MovingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [lang, setLang] = useState('');
  const [krwRate, setKrwRate] = useState(9.5);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.q = search.trim();
      if (sort) params.sort = sort;
      if (lang) params.lang = lang;
      const data = await getMovingServices(params as any);
      if (Array.isArray(data) && data.length > 0) setServices(data as MovingService[]);
      else setServices(FALLBACK);
    } catch {
      setServices(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, [search, sort, lang]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { getExchangeRates('JPY').then((r: any) => { if (r?.rates?.KRW) setKrwRate(r.rates.KRW); }).catch(() => {}); }, []);

  const ratingStars = (r: number) => '★'.repeat(Math.floor(r)) + (r % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(r));

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">🚚 이사·청소 서비스</h1>
          <p className="text-gray-500 text-sm">외국인 대응 가능한 이사·청소 업체를 비교해보세요</p>
        </div>

        {/* 검색 & 필터 */}
        <div className="bg-white border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="업체명, 서비스로 검색..."
                className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition"
              />
            </div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-white"
            >
              {LANG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
          <p className="text-xs text-gray-400 mb-4 font-bold">{services.length}건의 이사·청소 업체</p>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse font-bold">불러오는 중...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 font-bold">조건에 맞는 업체가 없습니다</p>
            <button onClick={() => { setSearch(''); setLang(''); setSort(''); }} className="mt-3 text-green-600 text-sm font-bold hover:underline">필터 초기화</button>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((s) => (
              <Link key={s.id} href={`/moving-services/${s.id}`} className="block">
                <div className="bg-white border border-gray-200 p-5 hover:shadow-lg hover:border-green-400 transition group">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      {/* 업체명 + 평점 */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-base text-gray-800 group-hover:text-green-600 transition">{s.name}</h3>
                        {s.rating && (
                          <span className="text-yellow-500 text-sm font-bold">★ {s.rating}</span>
                        )}
                      </div>

                      {/* 설명 */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{s.description}</p>

                      {/* 대응 언어 */}
                      {s.languages && s.languages.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {s.languages.map((l) => (
                            <span key={l} className={`text-[11px] font-bold px-2 py-0.5 ${l === '한국어' ? 'bg-blue-100 text-blue-700' : l === 'English' ? 'bg-purple-100 text-purple-700' : l === '중국어' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                              {l}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 특징 태그 */}
                      {s.features && s.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {s.features.slice(0, 5).map((f) => (
                            <span key={f} className="text-[11px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5">{f}</span>
                          ))}
                        </div>
                      )}

                      {/* 연락처 */}
                      <p className="text-xs text-gray-400">📞 {s.contactNumber}</p>
                    </div>

                    {/* 가격 & 버튼 */}
                    <div className="flex flex-col items-end gap-2 min-w-[140px]">
                      <span className="text-green-600 font-extrabold text-lg">¥~</span>
                      <p className="text-[11px] text-gray-400 text-right">{s.priceEstimate}</p>
                      <span className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-5 py-2 transition inline-block text-center">
                        견적 요청
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 이사 팁 배너 */}
        <div className="mt-10 bg-amber-50 border border-amber-200 p-6">
          <h3 className="font-bold text-amber-800 mb-3">📦 일본 이사 꿀팁</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
            <div>
              <p className="font-bold mb-1">🗓️ 이사 시기</p>
              <p>3~4월 이사 시즌은 요금이 2배까지 상승! 6~8월이 가장 저렴합니다.</p>
            </div>
            <div>
              <p className="font-bold mb-1">💰 견적 비교</p>
              <p>최소 3사 이상 견적을 받아 비교하세요. 같은 조건이라도 업체마다 최대 50% 차이!</p>
            </div>
            <div>
              <p className="font-bold mb-1">📋 퇴거 청소</p>
              <p>퇴거 시 원상복구 청소를 하면 보증금(시키킨) 환급률이 올라갑니다.</p>
            </div>
            <div>
              <p className="font-bold mb-1">🌐 외국어 대응</p>
              <p>닛폰운수는 한국어 전담 상담원이 있어 가장 안심. 영어 대응은 아트·야마토도 가능.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
