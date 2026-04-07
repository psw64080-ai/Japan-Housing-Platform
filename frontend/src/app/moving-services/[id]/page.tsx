'use client';

import { useState, useEffect } from 'react';
import { getMovingServiceById, getExchangeRates } from '@/lib/api/client';
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

const DEMO: Record<number, MovingService> = {
  1: { id:1, name:'닛폰운수 (Nippon Express)', description:'일본 최대 물류기업. 해외이사에 특화하며 한국어 대응 가능한 직원 배치. 꼼꼼한 포장과 확실한 배송으로 신뢰도 No.1. 유학생 할인도 있음.', rating:4.8, priceEstimate:'1인분 약 38,000엔~ / 가족 약 80,000엔~', contactNumber:'0120-154-022', website:'https://www.nittsu.co.jp', languages:['일본어','English','한국어','중국어'], features:['해외이사 대응','한국어 대응','포장 서비스','보험 포함','한국 배송'] },
  2: { id:2, name:'사카이 이사센터 (Sakai Moving)', description:'판다 마크로 유명. "성의를 담아 함께"를 모토로 합리적 가격과 꼼꼼한 서비스를 제공.', rating:4.5, priceEstimate:'1인분 약 30,000엔~ / 가족 약 65,000엔~', contactNumber:'0120-00-1141', website:'https://www.hikkoshi-sakai.co.jp', languages:['일본어'], features:['합리적 가격','한국 배송','포장재 무료','웹 견적'] },
  3: { id:3, name:'아트 이사센터 (Art Moving)', description:'"0123" 전화번호로 유명. 여성 전용의 "레이디스 팩"은 짐싸기·풀기까지 모두 맡길 수 있는 플랜 충실.', rating:4.6, priceEstimate:'1인분 약 35,000엔~ / 가족 약 70,000엔~', contactNumber:'0120-0123-33', website:'https://www.the0123.com', languages:['일본어','English'], features:['레이디스 팩','시니어 플랜','가구이동','불용품 인수'] },
  4: { id:4, name:'야마토 컨비니언스 (Yamato)', description:'쿠로네코 야마토의 이사 서비스. "1박스 이사 서비스"는 전용 BOX에 짐을 넣기만 하면 되는 간편 이사. 저비용으로 인기.', rating:4.4, priceEstimate:'1박스BOX: 약 18,000엔~ / 일반 1인 약 30,000엔~', contactNumber:'0120-008-008', website:'https://www.008008.jp', languages:['일본어','English'], features:['1박스BOX 플랜','저비용','편의점 접수','한국 배송'] },
  5: { id:5, name:'아리상 마크 이사사 (Ari-san)', description:'개미 마크가 목표. 학생·1인 거주자 전용으로 특화한 플랜 충실. "미니 이사 플랜"과 같이 구내 소량 짐에 최적.', rating:4.3, priceEstimate:'미니 플랜: 약 15,000엔~ / 1인 약 25,000엔~', contactNumber:'0120-77-2626', website:'https://www.2626.co.jp', languages:['일본어'], features:['미니 플랜','학생할인','저렴','소량OK'] },
};

/* 업체별 플랜 정보 */
const PLANS: Record<number, { name: string; price: string; desc: string }[]> = {
  1: [
    { name: '단신 플랜', price: '약 38,000엔~', desc: '1인 가구 짐 전부. 포장·운반·설치 포함' },
    { name: '가족 플랜', price: '약 80,000엔~', desc: '2인 이상 가구. 대형 가전·가구 포함' },
    { name: '해외 배송', price: '약 60,000엔~', desc: '한국으로 짐 배송. 통관 수속 대행' },
    { name: '유학생 할인', price: '약 28,000엔~', desc: '학생증 제시 시 할인 적용' },
  ],
  2: [
    { name: '절약 코스', price: '약 30,000엔~', desc: '큰 짐만 운반. 소량 짐은 본인 포장' },
    { name: '표준 코스', price: '약 45,000엔~', desc: '포장~운반~배치까지 올인원' },
    { name: '프리미엄', price: '약 65,000엔~', desc: '가족용. 전기 공사·가전 설치 포함' },
  ],
  3: [
    { name: '기본 팩', price: '약 35,000엔~', desc: '운반·배치 기본 서비스' },
    { name: '레이디스 팩', price: '약 50,000엔~', desc: '여성 스태프가 포장부터 정리까지' },
    { name: '시니어 팩', price: '약 55,000엔~', desc: '고령자 배려. 정리·불용품 처분 포함' },
    { name: '학생 팩', price: '약 25,000엔~', desc: '학생 전용 할인 플랜' },
  ],
  4: [
    { name: '1박스 BOX', price: '약 18,000엔~', desc: '전용 BOX 1개분. 소량 짐에 최적' },
    { name: '단신 플랜', price: '약 30,000엔~', desc: '1인 가구. 편의점에서도 접수 가능' },
    { name: '한국 배송', price: '약 35,000엔~', desc: '한국행 택배 배송 서비스' },
  ],
  5: [
    { name: '미니 플랜', price: '약 15,000엔~', desc: '같은 건물·근거리 이동' },
    { name: '1인 플랜', price: '약 25,000엔~', desc: '1인 가구 표준 이사' },
    { name: '학생 플랜', price: '약 19,000엔~', desc: '학생증 제시 시 특별 할인' },
  ],
};

export default function MovingServiceDetailPage({ params }: { params: { id: string } }) {
  const [service, setService] = useState<MovingService | null>(null);
  const [loading, setLoading] = useState(true);
  const [krwRate, setKrwRate] = useState(9.5);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const serviceId = parseInt(params.id);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMovingServiceById(serviceId);
        if (data && typeof data === 'object' && ('name' in data)) setService(data as MovingService);
        else throw new Error('invalid');
      } catch {
        setService(DEMO[serviceId] ?? DEMO[1]!);
      }
      setLoading(false);
    };
    load();
    getExchangeRates('JPY').then((r: any) => { if (r?.rates?.KRW) setKrwRate(r.rates.KRW); }).catch(() => {});
  }, [serviceId]);

  const toKrw = (yen: number) => `₩${Math.round(yen * krwRate).toLocaleString()}`;
  const plans = PLANS[serviceId] ?? PLANS[1]!;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center text-gray-400"><p className="text-4xl mb-3 animate-pulse">🚚</p><p className="font-bold">업체 정보를 불러오는 중...</p></div>
    </div>
  );

  if (!service) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><p className="text-4xl mb-3">😥</p><p className="text-gray-500 font-bold">업체 정보를 찾을 수 없습니다</p>
        <Link href="/moving-services" className="inline-block mt-4 bg-green-500 text-white font-bold text-sm px-6 py-2">← 업체 목록</Link></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/moving-services" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-bold text-sm mb-6">← 이사·청소 업체 목록으로</Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 헤더 카드 */}
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{service.name}</h1>
                  {service.rating && (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 text-lg">{'★'.repeat(Math.floor(service.rating))}{'☆'.repeat(5 - Math.floor(service.rating))}</span>
                      <span className="text-xl font-extrabold">{service.rating}</span>
                      <span className="text-sm text-gray-400">/ 5.0</span>
                    </div>
                  )}
                </div>
                {service.source && (
                  <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1">✓ 실제 업체</span>
                )}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-5">{service.description}</p>

              {/* 대응 언어 */}
              {service.languages && service.languages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 font-bold mb-2">🌐 대응 언어</p>
                  <div className="flex flex-wrap gap-2">
                    {service.languages.map((l) => (
                      <span key={l} className={`text-sm font-bold px-3 py-1 ${l === '한국어' ? 'bg-blue-100 text-blue-700 border border-blue-200' : l === 'English' ? 'bg-purple-100 text-purple-700 border border-purple-200' : l === '중국어' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        {l === '한국어' ? '🇰🇷 ' : l === 'English' ? '🇬🇧 ' : l === '중국어' ? '🇨🇳 ' : '🇯🇵 '}{l}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 요금 정보 */}
              <div className="bg-green-50 border border-green-100 p-4 mb-4">
                <p className="text-xs text-gray-500 mb-1">💰 예상 요금</p>
                <p className="text-lg font-extrabold text-green-600">{service.priceEstimate}</p>
              </div>

              {/* 연락처 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-100 p-3">
                  <p className="text-xs text-gray-500 mb-1">📞 전화번호</p>
                  <p className="font-bold text-sm">{service.contactNumber}</p>
                </div>
                {service.website && (
                  <div className="bg-gray-50 border border-gray-100 p-3">
                    <p className="text-xs text-gray-500 mb-1">🌐 공식 웹사이트</p>
                    <p className="font-bold text-sm text-green-600 truncate">{service.website.replace('https://', '')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 플랜 비교 */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-extrabold text-gray-900 mb-4">📋 이사 플랜</h2>
              <div className="space-y-3">
                {plans.map((p, i) => (
                  <div key={i} className="border border-gray-100 p-4 hover:border-green-300 transition">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm text-gray-800">{p.name}</h3>
                      <span className="text-green-600 font-extrabold text-sm">{p.price}</span>
                    </div>
                    <p className="text-sm text-gray-500">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 특징 */}
            {service.features && service.features.length > 0 && (
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-lg font-extrabold text-gray-900 mb-4">✨ 서비스 특징</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {service.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 bg-gray-50 p-3 border border-gray-100">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-gray-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 이사 준비 체크리스트 */}
            <div className="bg-amber-50 border border-amber-200 p-6">
              <h3 className="font-bold text-amber-800 mb-3">✅ 이사 준비 체크리스트</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-amber-700">
                <div className="flex items-start gap-2"><span>☐</span><span>전입신고 (引っ越し届け) — 시·구청에 14일 이내</span></div>
                <div className="flex items-start gap-2"><span>☐</span><span>전기·가스·수도 이전 — 이사 1주일 전 연락</span></div>
                <div className="flex items-start gap-2"><span>☐</span><span>인터넷 이전 — 2~4주 전 신청</span></div>
                <div className="flex items-start gap-2"><span>☐</span><span>우체국 전송 신청 (転居届)</span></div>
                <div className="flex items-start gap-2"><span>☐</span><span>구거주지 퇴거 청소</span></div>
                <div className="flex items-start gap-2"><span>☐</span><span>쓰레기 처분 — 粗大ゴミ 예약</span></div>
                <div className="flex items-start gap-2"><span>☐</span><span>이사 업체 견적 3사 비교</span></div>
                <div className="flex items-start gap-2"><span>☐</span><span>인감·주민카드(マイナンバー) 주소변경</span></div>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 견적 요청 */}
            <div className="bg-white border border-gray-200 p-6 sticky top-4">
              <p className="text-center text-lg font-extrabold text-gray-800 mb-1">{service.name.split('(')[0].trim()}</p>
              {service.rating && (
                <p className="text-center text-yellow-500 font-bold mb-4">★ {service.rating} / 5.0</p>
              )}

              <button
                onClick={() => setQuoteOpen(!quoteOpen)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 mb-3 text-sm transition"
              >
                📩 무료 견적 요청
              </button>

              {quoteOpen && (
                <div className="border border-green-200 bg-green-50 p-4 mb-3 space-y-3">
                  <input type="text" placeholder="이름" className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                  <input type="tel" placeholder="전화번호" className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                  <input type="date" placeholder="이사 희망일" className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-400" />
                  <select className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-white">
                    <option>이사 규모 선택</option>
                    <option>1인 가구 (짐 적음)</option>
                    <option>1인 가구 (짐 보통)</option>
                    <option>2인 가구</option>
                    <option>가족 (3인 이상)</option>
                    <option>해외 배송</option>
                  </select>
                  <textarea placeholder="추가 요청사항 (한국어 OK)" rows={3} className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-400 resize-none" />
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 text-sm transition">견적 요청 보내기</button>
                </div>
              )}

              <button className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50 font-bold py-3 mb-3 text-sm transition">
                📞 전화 상담 ({service.contactNumber})
              </button>

              <Link href="/moving-services" className="block w-full border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600 font-bold py-3 text-sm text-center transition">
                ← 다른 업체 보기
              </Link>
            </div>

            {/* 시즌별 요금 안내 */}
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="font-bold text-sm text-gray-800 mb-3">📅 시즌별 요금 가이드</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">1~2월</span>
                  <span className="text-green-600 font-bold">비수기 (저렴)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">3~4월</span>
                  <span className="text-red-500 font-bold">성수기 (1.5~2배)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">5~7월</span>
                  <span className="text-green-600 font-bold">비수기 (저렴)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">8~9월</span>
                  <span className="text-yellow-600 font-bold">준성수기</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">10~12월</span>
                  <span className="text-green-600 font-bold">비수기 (저렴)</span>
                </div>
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <p className="text-[11px] text-gray-400">💡 주중 이사는 주말보다 약 20% 저렴!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
