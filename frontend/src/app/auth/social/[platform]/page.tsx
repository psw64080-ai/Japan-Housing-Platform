'use client';

import { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// 이 페이지는 window.open()으로 열리는 별도의 팝업창 전용 페이지입니다.
export default function SocialAuthPopup() {
  const params = useParams();
  const platform = params.platform as string;
  const [step, setStep] = useState<'LOGIN' | 'CONSENT'>('LOGIN');

  // 1단계: 플랫폼 로그인 완료 처리
  const handleLogin = () => {
    if (platform === 'google') {
       handleComplete(); // 구글은 보통 간소화
    } else {
       setStep('CONSENT');
    }
  };

  // 2단계: 최종 완료 및 부모 창에 신호 보내기
  const handleComplete = () => {
    if (window.opener) {
      // 부모 창(로그인 페이지)으로 인증 성공 메시지 전송
      window.opener.postMessage({ 
        type: 'SOCIAL_AUTH_SUCCESS', 
        platform,
        user: { 
            id: Date.now(), 
            name: `${platform === 'kakao' ? '카카오' : platform === 'naver' ? '네이버' : '구글'} 회원`,
            email: `${platform}@social.auth`
        }
      }, window.location.origin);
      
      // 팝업 창 닫기
      window.close();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
      
      {/* PLATFORM LOGIN UI */}
      {step === 'LOGIN' && (
        <div className="w-full max-w-[360px] text-center animate-in fade-in zoom-in duration-300">
           <div className="mb-12">
              {platform === 'google' ? (
                <div className="flex flex-col items-center">
                   <svg width="40" height="40" viewBox="0 0 48 48" className="mb-4"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
                   <h1 className="text-xl font-medium text-gray-800">Google 계정으로 로그인</h1>
                </div>
              ) : (
                <h1 className={`text-3xl font-black italic tracking-tighter ${platform === 'kakao' ? 'text-yellow-900' : 'text-green-600'}`}>
                  {platform.toUpperCase()}
                </h1>
              )}
           </div>
           
           <div className="space-y-4 mb-10">
              <input type="text" placeholder="아이디 또는 이메일" className="w-full border-b border-gray-200 py-3 outline-none focus:border-black text-sm font-bold" />
              <input type="password" placeholder="비밀번호" className="w-full border-b border-gray-200 py-3 outline-none focus:border-black text-sm font-bold" />
           </div>

           <button 
             onClick={handleLogin}
             className={`w-full py-4 rounded-xl font-black text-lg transition ${platform === 'kakao' ? 'bg-[#FEE500] text-black hover:bg-[#FADA0A]' : platform === 'naver' ? 'bg-[#03C75A] text-white hover:bg-[#02b350]' : 'bg-blue-600 text-white'}`}>
             {platform === 'google' ? '다음' : '로그인'}
           </button>
           
           <button onClick={() => window.close()} className="mt-8 text-xs text-gray-400 underline">취소</button>
        </div>
      )}

      {/* CONSENT UI */}
      {step === 'CONSENT' && (
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-4 duration-300">
           <div className="flex items-center gap-4 mb-8">
              <div className="bg-green-500 w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg">🏠</div>
              <div>
                 <h2 className="font-black text-gray-900 leading-tight tracking-tight">Housing Connect <span className="font-normal text-gray-400">연결</span></h2>
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Authorizing Application</p>
              </div>
           </div>

           <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
              <h3 className="text-sm font-black text-gray-800 mb-4 border-b border-gray-200 pb-2">서비스 이용 동의</h3>
              <ul className="space-y-3">
                 <li className="text-[11px] font-bold text-gray-500 flex items-center gap-2"> ✅ [필수] 프로필 정보 (이름, 이메일)</li>
                 <li className="text-[11px] font-bold text-gray-500 flex items-center gap-2"> ✅ [필수] 서비스 이용약관</li>
                 <li className="text-[11px] font-bold text-gray-400 flex items-center gap-2"> ⬜ [선택] 마케팅 수신</li>
              </ul>
           </div>

           <div className="flex gap-2">
              <button onClick={() => setStep('LOGIN')} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-xl font-black">이전</button>
              <button onClick={handleComplete} className="flex-1 bg-green-500 text-white py-4 rounded-xl font-black shadow-lg shadow-green-100 transition">동의하고 시작</button>
           </div>
        </div>
      )}
    </div>
  );
}
