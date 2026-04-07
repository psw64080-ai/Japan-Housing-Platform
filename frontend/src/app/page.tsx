'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProperties, getExchangeRates } from '@/lib/api/client';

type Property = {
  id: number;
  title: string;
  titleKo?: string;
  address: string;
  addressKo?: string;
  monthlyRent?: number;
  monthlyPrice?: number;
  averageRating: number;
  foreignerWelcome: boolean;
  petFriendly: boolean;
  squareMeters: number;
  imagesJson?: string;
  images?: string;
  nearbyStationKo?: string;
};

export default function Home() {
  const [featuredProps, setFeaturedProps] = useState<Property[]>([]);
  const [query, setQuery] = useState('');
  const [krwRate, setKrwRate] = useState<number>(9.5);

  const FALLBACK_PROPS: Property[] = [
    { id:1, title:'브라이즈 신주쿠 나카이', address:'도쿄도 신주쿠구 나카이 1초메', monthlyRent:80000, averageRating:4.0, foreignerWelcome:true, petFriendly:false, squareMeters:19.78, images:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop' },
    { id:10, title:'프라우드 에비스 디아쥬', address:'도쿄도 시부야구 히가시 3초메', monthlyRent:475000, averageRating:4.9, foreignerWelcome:true, petFriendly:true, squareMeters:72.31, images:'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&h=400&fit=crop' },
    { id:16, title:'프라임어반 이케부쿠로', address:'도쿄도 토시마구 이케부쿠로 2초메', monthlyRent:139000, averageRating:4.2, foreignerWelcome:true, petFriendly:false, squareMeters:29.67, images:'https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&h=400&fit=crop' },
    { id:24, title:'라산테 아자부주반', address:'도쿄도 미나토구 아자부주반 3초메', monthlyRent:283000, averageRating:4.6, foreignerWelcome:true, petFriendly:false, squareMeters:40.08, images:'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&h=400&fit=crop' },
    { id:52, title:'키치조지역 1LDK 맨션', address:'도쿄도 무사시노시 키치조지혼초 1초메', monthlyRent:112000, averageRating:4.6, foreignerWelcome:true, petFriendly:true, squareMeters:32, images:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop' },
    { id:55, title:'시모키타자와역 1K 맨션', address:'도쿄도 세타가야구 키타자와 2초메', monthlyRent:85000, averageRating:4.5, foreignerWelcome:true, petFriendly:false, squareMeters:22, images:'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=600&h=400&fit=crop' },
  ];

  useEffect(() => {
    getProperties()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.content ?? [];
        if (list.length > 0) { setFeaturedProps(list.slice(0, 6)); }
        else { setFeaturedProps(FALLBACK_PROPS); }
      })
      .catch(() => { setFeaturedProps(FALLBACK_PROPS); });
    getExchangeRates('JPY').then((r: any) => { if (r?.rates?.KRW) setKrwRate(r.rates.KRW); }).catch(() => {});
  }, []);

  const toKrw = (jpy: number) => Math.round(jpy * krwRate).toLocaleString();

  const handleSearch = () => {
    if (query.trim()) {
      window.location.href = `/properties?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="bg-light min-h-screen text-text pb-12">
      {/* 🟢 HERO SECTION: NAVER GREEN STYLE 🟢 */}
      <div className="bg-white border-b border-border py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-primary tracking-tight mb-3 sm:mb-4 text-center px-2">
              쉽고 빠른 일본 주택 찾기
            </h1>
            <p className="text-muted text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-center max-w-2xl px-2">
              외국인이라는 이유로 막막하셨나요? 일본어부터 복잡한 서류 절차, <br className="hidden md:block"/> AI 번역과 안전한 전자계약으로 한 번에 끝내보세요.
            </p>

            {/* SEARCH BAR - NAVER GREEN THICK BORDER STYLE */}
            <div className="w-full max-w-3xl mb-8 sm:mb-12 px-2">
              <div className="flex border-[3px] border-primary rounded-sm overflow-hidden bg-white shadow-sm">
                <input
                  type="text"
                  className="flex-1 bg-transparent px-3 sm:px-5 py-3 sm:py-4 outline-none text-sm sm:text-lg font-bold placeholder-muted min-w-0"
                  placeholder="도쿄, 오사카, 지하철역 이름 검색"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="bg-primary text-white font-extrabold text-sm sm:text-lg px-4 sm:px-10 py-3 sm:py-4 hover:bg-primary-dark transition flex items-center gap-1 sm:gap-2 flex-shrink-0"
                >
                  <span className="text-base sm:text-xl font-bold">🔍</span><span className="hidden sm:inline"> 검색</span>
                </button>
              </div>
            </div>

            {/* QUICK LINKS / CATEGORIES */}
            <div className="grid grid-cols-4 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-4 max-w-5xl w-full px-2">
              {[
                { label: '매물 찾기', icon: '🏢', href: '/properties' },
                { label: '셰어하우스', icon: '🏘️', href: '/sharehouses' },
                { label: '이사·청소', icon: '🚚', href: '/moving-services' },
                { label: '초기비용', icon: '💰', href: '/calculator' },
                { label: '전자계약', icon: '✍️', href: '/contracts' },
                { label: '동네 생활', icon: '🤝', href: '/community' },
                { label: '생활 가이드', icon: '📖', href: '/guides' }
              ].map((category) => (
                <Link key={category.label} href={category.href} className="sm:w-[120px]">
                  <div className="bg-white border border-border rounded-lg group p-2 sm:p-4 text-center hover:border-primary hover:shadow-md transition cursor-pointer flex flex-col items-center h-full">
                    <div className="text-2xl sm:text-3xl mb-1 sm:mb-3 group-hover:scale-110 transition-transform">
                      {category.icon}
                    </div>
                    <span className="text-[11px] sm:text-sm font-bold text-text group-hover:text-primary transition-colors leading-tight">
                      {category.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🏢 FEATURED PROPERTIES SECTION */}
      {featuredProps.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mb-16">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">최신 추천 하우스</h2>
              <p className="text-sm text-muted mt-1">AI가 추천하는 인기 다국어 대응 안심 매물</p>
            </div>
            <Link href="/properties">
              <span className="text-sm font-bold text-primary hover:underline flex items-center gap-1">전체보기 {'>'}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProps.map((p) => (
              <Link key={p.id} href={`/properties/${p.id}`}>
                <div className="bg-white border border-border overflow-hidden group cursor-pointer hover:shadow-lg transition hover:border-primary">
                  {/* Property Image */}
                  <div className="bg-light relative h-52 overflow-hidden border-b border-border">
                    {(() => {
                      let imgUrl: string | null = null;
                      if (p.imagesJson && p.imagesJson !== '[]') { try { imgUrl = JSON.parse(p.imagesJson)[0]; } catch {} }
                      if (!imgUrl && p.images) { imgUrl = p.images.split(',')[0]?.trim() || null; }
                      return imgUrl ? (
                        <img src={imgUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted bg-gray-100">
                          <span className="text-4xl mb-2">📸</span>
                          <span className="text-xs">이미지 준비중</span>
                        </div>
                      );
                    })()}
                    
                    {/* Tags overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {p.foreignerWelcome && <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 shadow-sm">외국인 OK</span>}
                      {p.petFriendly && <span className="bg-primary text-white text-xs font-bold px-2 py-1 shadow-sm">반려동물 OK</span>}
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="p-4">
                    <p className="text-xs text-muted mb-1 flex items-center gap-1 line-clamp-1 w-full truncate">
                      <span>📍</span> {p.addressKo || p.address}
                    </p>
                    <h3 className="font-bold text-base mb-3 line-clamp-1 group-hover:text-primary transition-colors h-6">{p.titleKo || p.title}</h3>
                    
                    <div className="flex items-center justify-between mt-auto border-t border-border pt-3">
                      <div>
                        <div className="text-primary font-extrabold text-lg">
                          <span className="text-sm font-semibold text-muted mr-1">월세</span>
                          ¥{(p.monthlyRent ?? p.monthlyPrice ?? 0).toLocaleString()}
                        </div>
                        <p className="text-[11px] text-blue-500 font-bold">≈ ₩{toKrw(p.monthlyRent ?? p.monthlyPrice ?? 0)}</p>
                      </div>
                      {(p.averageRating ?? 0) > 0 && (
                        <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 text-orange-600 text-xs font-bold rounded">
                          <span>⭐</span> {(p.averageRating ?? 0).toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 💡 WHY CHOOSE US? SECTION */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white border border-border p-8 md:p-12 mb-8">
          <h2 className="text-center text-2xl font-bold mb-10 text-text">Japan Housing Connect 특장점</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              {
                icon: '🌍',
                title: '언어 장벽 제로',
                desc: '집주인과 메신저 내용이 실시간 자동 번역됩니다. 현지어를 몰라도 계약에 문제 없습니다.',
              },
              {
                icon: '📝',
                title: '전자 서명 계약',
                desc: '복잡한 종이 문서 없이 100% 디지털로 안전하고 투명하게 전자 계약 서명이 진행됩니다.',
              },
              {
                icon: '🧮',
                title: '투명한 초기비용',
                desc: '보증금(敷金), 사례금(礼金) 등 숨겨진 비용 없이 처음부터 모든 초기비용을 시뮬레이션 합니다.',
              },
              {
                icon: '🛡️',
                title: '100% 검증 매물',
                desc: '외국인을 꺼려하는 불필요한 매물은 제외하고 실제 입주 가능한 안심 매물만 필터링합니다.',
              }
            ].map((f, i) => (
              <div key={i} className="text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-light rounded-full border border-border flex items-center justify-center text-3xl mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2 text-text">{f.title}</h3>
                <p className="text-sm text-muted text-center break-keep leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM BANNER */}
        <div className="bg-primary-light border border-primary p-4 sm:p-8 flex flex-col md:flex-row justify-between items-center rounded-sm">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h2 className="text-xl font-extrabold text-primary-dark mb-2">무료로 회원가입하고 더 많은 혜택을 누리세요!</h2>
            <p className="text-sm font-medium text-green-800">관심 매물 찜하기, 커뮤니티 글쓰기 기능이 오픈됩니다.</p>
          </div>
          <Link href="/register">
            <button className="bg-primary text-white font-bold py-3 px-8 text-sm hover:scale-105 transition-transform shadow-sm">
              시작하기
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

