'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/client';
import { saveAuth } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  
  // Social Auth Overlay
  const [isProcessing, setIsProcessing] = useState(false);

  // 🛡️ 부모 창에서 팝업창의 메시지를 수신하는 이벤트 리스너 등록
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 보안을 위해 같은 origin인지 확인합니다.
      if (event.origin !== window.location.origin) return;

      const { type, platform, user } = event.data;
      if (type === 'SOCIAL_AUTH_SUCCESS') {
        setIsProcessing(true); // 부모창에서 최종 처리 중 표시
        
        // 실제 JWT 토큰 발급 로직을 시뮬레이션합니다.
        setTimeout(() => {
          saveAuth('real_jwt_token_from_popup', {
            ...user,
            joinedAt: new Date().toISOString().split('T')[0]
          });
          setIsProcessing(false);
          router.push('/');
          router.refresh();
        }, 1000);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(email, password) as any;
      if (response && response.token) {
        saveAuth(response.token, response.user || { id: 1, name: email.split('@')[0], email, joinedAt: '2026-04-07' });
        router.push('/');
        router.refresh();
      } else throw new Error('인증 실패');
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialStart = (platform: string) => {
    // 🌐 진짜 팝업창 열기 (Popup Window open)
    const width = 460;
    const height = 640;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      `/auth/social/${platform}`, 
      `SocialAuth_${platform}`, 
      `width=${width},height=${height},left=${left},top=${top},scrollbars=no,resizable=no`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 relative">
      
      {/* 🔮 FINALIZING OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 z-[120] bg-white/70 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
           <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-100 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="font-extrabold text-gray-800">인증 정보를 동기화 중입니다...</p>
           </div>
        </div>
      )}

      {/* ═══ MAIN LOGIN UI (Clean Recovery Design) ═══ */}
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="bg-green-500 text-white p-2 rounded-lg shadow-lg"><span className="text-2xl">🏠</span></div>
            <span className="font-extrabold text-2xl text-green-600 tracking-tighter">Housing Connect</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">로그인</h1>
          <p className="text-gray-500 text-sm">정성을 다해 일본 생활의 시작을 돕겠습니다</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">이메일 계정</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition font-bold" placeholder="example@email.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">비밀번호</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition pr-12 font-bold" placeholder="비밀번호를 입력하세요" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPw ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 rounded-xl text-sm transition shadow-lg active:scale-95 disabled:opacity-50">
              {loading ? '🔐 로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-bold border-b border-gray-50 pb-6 mb-8">
            <span className="text-gray-300">계정이 없으신가요?</span>{' '}
            <Link href="/register" className="text-green-600 hover:underline">회원가입 하러가기 →</Link>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={() => handleSocialStart('kakao')} className="w-12 h-12 rounded-full bg-[#FEE500] text-[#3c1e1e] flex items-center justify-center text-xl shadow hover:scale-110 active:scale-95 transition border border-[#eee]" aria-label="Kakao login">💬</button>
            <button onClick={() => handleSocialStart('naver')} className="w-12 h-12 rounded-full bg-[#03C75A] text-white flex items-center justify-center text-lg font-black shadow hover:scale-110 active:scale-95 transition border border-[#eee]" aria-label="Naver login">N</button>
            <button onClick={() => handleSocialStart('google')} className="w-12 h-12 rounded-full bg-white text-gray-600 border border-gray-100 flex items-center justify-center text-xl shadow hover:scale-110 active:scale-95 transition" aria-label="Google login">
               <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M0 0h24v24H0z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
