'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn, getUser, AuthUser, logoutUser, updateUser } from '@/lib/auth';
import { getSavedProperties, getContracts, getCommunityPosts, getExchangeRates, getWeather } from '@/lib/api/client';

interface SavedProp { id: number; title?: string; address?: string; monthlyRent?: number; deposit?: number; imageUrl?: string; }
interface Contract { id: number; propertyTitle?: string; status: string; monthlyRent?: number; startDate?: string; endDate?: string; }
interface Post { id: number; title: string; likes?: number; commentsCount?: number; createdAt?: string; }

const CHECKLIST_ITEMS = [
  { key: 'visa', label: '재류카드(在留カード) 발급', desc: '공항 입국 시 수령', icon: '🛂' },
  { key: 'address', label: '구청 전입신고(転入届)', desc: '입국 14일 이내', icon: '🏛️' },
  { key: 'bank', label: '은행 계좌 개설', desc: 'ゆうちょ, SMBC 등', icon: '🏦' },
  { key: 'phone', label: '핸드폰 개통', desc: 'SIM카드 or 계약', icon: '📱' },
  { key: 'insurance', label: '국민건강보험(国保) 가입', desc: '구청에서 신청', icon: '🏥' },
  { key: 'mynum', label: '마이넘버카드 신청', desc: '구청에서 신청, 1~2개월 소요', icon: '💳' },
  { key: 'garbage', label: '쓰레기 분리수거 확인', desc: '지역별 요일 확인', icon: '🗑️' },
  { key: 'earthquake', label: '재난 대피소 위치 확인', desc: '근처 避難所 파악', icon: '🌋' },
];

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tab, setTab] = useState<'dashboard' | 'saved' | 'contracts' | 'posts' | 'checklist'>('dashboard');
  const [saved, setSaved] = useState<SavedProp[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [krwRate, setKrwRate] = useState(9.5);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    const u = getUser();
    setUser(u);
    if (u) setEditName(u.name);

    // 체크리스트 로컬스토리지 복원
    try { const c = JSON.parse(localStorage.getItem('jhc_checklist') || '{}'); setChecklist(c); } catch {}

    // API 데이터 로드
    getSavedProperties().then((d: any) => { if (Array.isArray(d)) setSaved(d.slice(0, 6)); }).catch(() => {
      setSaved([
        { id:1, title:'신주쿠산초메 1K 맨션', address:'신주쿠구', monthlyRent:89000 },
        { id:4, title:'아자부주반 타워 2LDK', address:'미나토구', monthlyRent:420000 },
        { id:10, title:'에비스 디아쥬 1LDK', address:'시부야구', monthlyRent:475000 },
        { id:13, title:'나카노 스테이션프론트', address:'나카노구', monthlyRent:78000 },
      ]);
    });
    getContracts({ tenantId: 1 }).then((d: any) => { if (Array.isArray(d)) setContracts(d); }).catch(() => {
      setContracts([
        { id:1, propertyTitle:'신주쿠산초메 1K', status:'active', monthlyRent:89000, startDate:'2026-04-01', endDate:'2028-03-31' },
        { id:2, propertyTitle:'에비스 디아쥬 1LDK', status:'draft', monthlyRent:475000, startDate:'2026-05-01', endDate:'2028-04-30' },
      ]);
    });
    getCommunityPosts().then((d: any) => { if (Array.isArray(d)) setMyPosts(d.filter((p: any) => !p.source).slice(0, 5)); }).catch(() => {});
    getWeather().then((w: any) => { if (w) setWeather(w); }).catch(() => {});
    getExchangeRates('JPY').then((r: any) => { if (r?.rates?.KRW) setKrwRate(r.rates.KRW); }).catch(() => {});
  }, []);

  const toggleCheck = (key: string) => {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    localStorage.setItem('jhc_checklist', JSON.stringify(next));
  };

  const handleUpdateProfile = () => {
    if (editName.trim()) { const u = updateUser({ name: editName }); setUser(u); setIsEditing(false); }
  };

  const handleLogout = () => { logoutUser(); router.push('/'); router.refresh(); };
  const toKrw = (jpy: number) => `₩${Math.round(jpy * krwRate).toLocaleString()}`;
  const checkDone = CHECKLIST_ITEMS.filter(c => checklist[c.key]).length;
  const statusCfg: Record<string, { label: string; color: string }> = {
    draft: { label: '서명 대기', color: 'bg-amber-100 text-amber-700' },
    active: { label: '계약 체결', color: 'bg-green-100 text-green-700' },
    cancelled: { label: '취소됨', color: 'bg-red-100 text-red-700' },
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 프로필 헤더 */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage:'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize:'24px 24px' }} />
        <div className="max-w-5xl mx-auto px-4 py-10 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-white p-1 shadow-xl flex-shrink-0" style={{ borderRadius:'20px' }}>
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 text-white flex items-center justify-center text-3xl font-black" style={{ borderRadius:'16px' }}>
                {user.name.charAt(0)}
              </div>
            </div>
            <div className="text-white flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold mb-0.5">{user.name}님, 환영합니다!</h1>
              <p className="text-green-100 text-sm">{user.email}</p>
            </div>
            <div className="hidden md:flex gap-2">
              <button onClick={() => setIsEditing(!isEditing)} className="bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 text-sm border border-white/30 transition">프로필 편집</button>
              <button onClick={handleLogout} className="bg-red-500/80 hover:bg-red-500 text-white font-bold px-4 py-2 text-sm transition">로그아웃</button>
            </div>
          </div>
          {/* 날씨 & 환율 위젯 */}
          <div className="flex gap-4 mt-5 flex-wrap">
            {weather && (
              <div className="bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2 text-white text-sm flex items-center gap-2">
                🌤️ 도쿄 {weather.temperature ?? weather.current?.temperature_2m ?? '--'}°C
              </div>
            )}
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2 text-white text-sm flex items-center gap-2">
              💱 1엔 = ₩{krwRate.toFixed(2)}
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2 text-white text-sm flex items-center gap-2">
              📅 {new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'long' })}
            </div>
          </div>
        </div>
      </div>

      {/* 프로필 편집 패널 */}
      {isEditing && (
        <div className="max-w-5xl mx-auto px-4 mt-4">
          <div className="bg-white border border-gray-200 p-5 flex items-center gap-4">
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
              className="flex-1 border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-400" placeholder="이름" />
            <button onClick={handleUpdateProfile} className="bg-green-500 text-white font-bold px-5 py-2 text-sm">저장</button>
            <button onClick={() => { setIsEditing(false); setEditName(user.name); }} className="border border-gray-200 text-gray-500 font-bold px-5 py-2 text-sm">취소</button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 mt-6">
        {/* 탭 메뉴 */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {[
            { id: 'dashboard' as const, label: '📊 대시보드', count: undefined },
            { id: 'saved' as const, label: '❤️ 찜한 매물', count: saved.length },
            { id: 'contracts' as const, label: '📝 내 계약', count: contracts.length },
            { id: 'posts' as const, label: '💬 내 게시글', count: myPosts.length },
            { id: 'checklist' as const, label: '✅ 입주 체크리스트', count: `${checkDone}/${CHECKLIST_ITEMS.length}` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold whitespace-nowrap border transition ${
                tab === t.id ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'
              }`}>
              {t.label}
              {t.count !== undefined && <span className={`text-[11px] px-1.5 py-0.5 ${tab === t.id ? 'bg-white/20' : 'bg-gray-100'}`}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* 대시보드 탭 */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            {/* 요약 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: '찜한 매물', val: saved.length, icon: '❤️', color: 'bg-rose-50 text-rose-500 border-rose-100', href: '#', onClick: () => setTab('saved') },
                { label: '진행 중 계약', val: contracts.filter(c => c.status === 'active' || c.status === 'draft').length, icon: '📝', color: 'bg-blue-50 text-blue-500 border-blue-100', href: '#', onClick: () => setTab('contracts') },
                { label: '커뮤니티 글', val: myPosts.length, icon: '💬', color: 'bg-purple-50 text-purple-500 border-purple-100', href: '#', onClick: () => setTab('posts') },
                { label: '입주 체크', val: `${checkDone}/${CHECKLIST_ITEMS.length}`, icon: '✅', color: 'bg-green-50 text-green-500 border-green-100', href: '#', onClick: () => setTab('checklist') },
              ].map((c, i) => (
                <button key={i} onClick={c.onClick} className={`${c.color} border p-5 text-left hover:shadow-md transition`}>
                  <p className="text-2xl mb-1">{c.icon}</p>
                  <p className="text-2xl font-extrabold">{c.val}</p>
                  <p className="text-[11px] font-bold opacity-70">{c.label}</p>
                </button>
              ))}
            </div>

            {/* 퀵 액션 */}
            <div className="bg-white border border-gray-200 p-5">
              <h3 className="font-bold text-gray-800 text-sm mb-3">⚡ 빠른 메뉴</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: '매물 검색', icon: '🔍', href: '/properties' },
                  { label: '비용 계산기', icon: '🧮', href: '/calculator' },
                  { label: 'AI 챗봇', icon: '🤖', href: '/chat' },
                  { label: '생활 가이드', icon: '📚', href: '/guides' },
                  { label: '셰어하우스', icon: '🏘️', href: '/sharehouses' },
                  { label: '이사·청소', icon: '🚛', href: '/moving-services' },
                  { label: '전자 계약', icon: '📋', href: '/contracts' },
                  { label: '커뮤니티', icon: '🤝', href: '/community' },
                ].map((a, i) => (
                  <Link key={i} href={a.href} className="flex items-center gap-2 p-3 border border-gray-100 hover:border-green-300 hover:bg-green-50 transition text-sm font-bold text-gray-700">
                    <span className="text-lg">{a.icon}</span> {a.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* 최근 계약 + 체크리스트 미니 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800 text-sm">📝 최근 계약</h3>
                  <button onClick={() => setTab('contracts')} className="text-[11px] text-green-600 font-bold">전체 보기 →</button>
                </div>
                {contracts.slice(0, 3).map(c => {
                  const cfg = statusCfg[c.status] || { label: c.status, color: 'bg-gray-100 text-gray-600' };
                  return (
                    <Link key={c.id} href={`/contracts/${c.id}`} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-5 px-5 transition">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 truncate">{c.propertyTitle}</p>
                        <p className="text-[11px] text-gray-400">{c.startDate} ~ {c.endDate}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 ml-2 ${cfg.color}`}>{cfg.label}</span>
                    </Link>
                  );
                })}
                {contracts.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">계약 내역이 없습니다</p>}
              </div>

              <div className="bg-white border border-gray-200 p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800 text-sm">✅ 입주 체크리스트</h3>
                  <span className="text-[11px] text-green-600 font-bold">{checkDone}/{CHECKLIST_ITEMS.length} 완료</span>
                </div>
                <div className="w-full bg-gray-100 h-2 mb-3"><div className="bg-green-500 h-full transition-all" style={{ width:`${(checkDone / CHECKLIST_ITEMS.length) * 100}%` }}></div></div>
                {CHECKLIST_ITEMS.slice(0, 4).map(item => (
                  <button key={item.key} onClick={() => toggleCheck(item.key)} className="flex items-center gap-2 py-2 w-full text-left hover:bg-gray-50 -mx-5 px-5 transition">
                    <span className={`w-5 h-5 border-2 flex items-center justify-center text-[10px] flex-shrink-0 ${checklist[item.key] ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                      {checklist[item.key] ? '✓' : ''}
                    </span>
                    <span className={`text-sm font-bold ${checklist[item.key] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.icon} {item.label}</span>
                  </button>
                ))}
                <button onClick={() => setTab('checklist')} className="text-[11px] text-green-600 font-bold mt-2">전체 보기 →</button>
              </div>
            </div>
          </div>
        )}

        {/* 찜한 매물 탭 */}
        {tab === 'saved' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-gray-900">❤️ 찜한 매물 {saved.length}개</h2>
              <Link href="/properties/compare" className="bg-blue-500 text-white text-xs font-bold px-4 py-2 hover:bg-blue-600 transition">📊 매물 비교하기</Link>
            </div>
            {saved.length === 0 ? (
              <div className="bg-white border border-gray-200 py-16 text-center">
                <p className="text-4xl mb-3">💔</p><p className="text-gray-400 font-bold text-sm">아직 찜한 매물이 없습니다</p>
                <Link href="/properties" className="inline-block mt-3 bg-green-500 text-white text-sm font-bold px-5 py-2">매물 검색하기</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {saved.map(p => (
                  <Link key={p.id} href={`/properties/${p.id}`} className="bg-white border border-gray-200 p-4 flex gap-4 hover:shadow-md hover:border-green-300 transition group">
                    <div className="w-24 h-24 bg-gray-100 flex-shrink-0 overflow-hidden">
                      {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition" /> :
                        <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate mb-1">{p.title}</p>
                      <p className="text-[11px] text-gray-400 mb-2">📍 {p.address}</p>
                      <p className="text-green-600 font-extrabold">¥{p.monthlyRent?.toLocaleString()}<span className="text-gray-400 font-normal text-xs"> /월</span></p>
                      {p.monthlyRent && <p className="text-[11px] text-gray-400">{toKrw(p.monthlyRent)}</p>}
                    </div>
                    <span className="text-red-400 text-lg flex-shrink-0">❤️</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 내 계약 탭 */}
        {tab === 'contracts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-gray-900">📝 내 계약 {contracts.length}건</h2>
              <Link href="/contracts/new" className="bg-green-500 text-white text-xs font-bold px-4 py-2 hover:bg-green-600 transition">+ 새 계약</Link>
            </div>
            {contracts.map(c => {
              const cfg = statusCfg[c.status] || { label: c.status, color: 'bg-gray-100 text-gray-600' };
              return (
                <Link key={c.id} href={`/contracts/${c.id}`} className="block bg-white border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">{c.propertyTitle}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-1 ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>💰 ¥{c.monthlyRent?.toLocaleString()}/월</span>
                    <span>📅 {c.startDate} ~ {c.endDate}</span>
                  </div>
                </Link>
              );
            })}
            {contracts.length === 0 && <div className="bg-white border border-gray-200 py-16 text-center"><p className="text-gray-400 font-bold">계약 내역이 없습니다</p></div>}
          </div>
        )}

        {/* 내 게시글 탭 */}
        {tab === 'posts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-gray-900">💬 내 게시글</h2>
              <Link href="/community/new" className="bg-green-500 text-white text-xs font-bold px-4 py-2 hover:bg-green-600 transition">+ 글쓰기</Link>
            </div>
            {myPosts.map(p => (
              <Link key={p.id} href={`/community/${p.id}`} className="block bg-white border border-gray-200 p-4 hover:shadow-md hover:border-green-300 transition">
                <h3 className="font-bold text-sm text-gray-800 mb-1">{p.title}</h3>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>❤️ {p.likes || 0}</span><span>💬 {p.commentsCount || 0}</span>
                </div>
              </Link>
            ))}
            {myPosts.length === 0 && <div className="bg-white border py-16 text-center"><p className="text-gray-400 font-bold">작성한 글이 없습니다</p></div>}
          </div>
        )}

        {/* 입주 체크리스트 탭 */}
        {tab === 'checklist' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-extrabold text-gray-900">✅ 일본 입주 체크리스트</h2>
                <span className="text-green-600 font-bold text-sm">{checkDone}/{CHECKLIST_ITEMS.length} 완료</span>
              </div>
              <div className="w-full bg-gray-100 h-3 mb-6"><div className="bg-green-500 h-full transition-all" style={{ width:`${(checkDone / CHECKLIST_ITEMS.length) * 100}%` }}></div></div>
              <div className="space-y-1">
                {CHECKLIST_ITEMS.map(item => (
                  <button key={item.key} onClick={() => toggleCheck(item.key)}
                    className={`flex items-center gap-4 w-full p-4 text-left border transition ${checklist[item.key] ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:border-green-200'}`}>
                    <span className={`w-7 h-7 border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${checklist[item.key] ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'}`}>✓</span>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${checklist[item.key] ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.icon} {item.label}</p>
                      <p className="text-[11px] text-gray-400">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4">
              <p className="text-xs text-amber-700">💡 <strong>팁:</strong> 입국 후 가장 먼저 구청(区役所)에서 전입신고와 건강보험 가입을 하세요. 마이넘버카드는 나중에 우편으로 받을 수 있습니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
