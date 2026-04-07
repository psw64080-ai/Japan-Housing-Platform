'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api/client';
import { saveAuth } from '@/lib/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Certification State
  const [certSent, setCertSent] = useState(false);
  const [certCode, setCertCode] = useState('');
  const [timer, setTimer] = useState(180); // 3 mins
  const [isVerified, setIsVerified] = useState(false);

  // Terms State
  const [agreements, setAgreements] = useState({
    all: false, terms: false, privacy: false, location: false, marketing: false
  });

  // Info State
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', birth: '', gender: 'male', isForeigner: false, phone: ''
  });

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (certSent && timer > 0 && !isVerified) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [certSent, timer, isVerified]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleAllAgree = (val: boolean) => {
    setAgreements({ all: val, terms: val, privacy: val, location: val, marketing: val });
  };

  const handleSingleAgree = (key: keyof typeof agreements, val: boolean) => {
    const next = { ...agreements, [key]: val };
    next.all = next.terms && next.privacy && next.location && next.marketing;
    setAgreements(next);
  };

  const sendCert = () => {
    if (!formData.phone) { alert('휴대전화번호를 입력해 주세요.'); return; }
    setCertSent(true);
    setTimer(180);
    alert('인증번호(123456)가 발송되었습니다. 📱');
  };

  const verifyCode = () => {
    if (certCode === '123456') {
      setIsVerified(true);
      alert('인증이 완료되었습니다! ✅');
    } else {
      alert('인증번호가 일치하지 않습니다.');
    }
  };

  const handleRegister = async () => {
    if (!isVerified) { alert('휴대전화 인증이 필요합니다.'); return; }
    
    try {
      // 🏰 실제 백엔드(Spring Boot) 연동: 회원 정보 DB 저장 요청
      const res = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        nationality: formData.isForeigner ? 'Foreigner' : 'Korean',
        role: 'USER',
        phoneNumber: formData.phone
      }) as any;

      if (res && res.token) {
        // 서버에서 받은 실제 JWT 토큰과 유저 데이터 저장
        const userData = res.user || { id: Date.now(), name: formData.name, email: formData.email, joinedAt: new Date().toISOString() };
        saveAuth(res.token, userData);
        
        alert('환영합니다! 정식 회원가입이 완료되었습니다. 🏠✨');
        router.push('/');
        router.refresh();
      } else {
        throw new Error('가입 결과가 올바르지 않습니다.');
      }
    } catch (err: any) {
      alert('회원가입 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      console.error('Register error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 shadow-sm">
      <div className="mb-8 text-center animate-in fade-in duration-700">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
           <span className="text-2xl">🏠</span>
           <span className="font-black text-2xl text-green-600 tracking-tighter">Housing Connect</span>
        </Link>
      </div>

      <div className="w-full max-w-[460px]">
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer group">
                <input type="checkbox" checked={agreements.all} onChange={(e) => handleAllAgree(e.target.checked)}
                  className="w-6 h-6 rounded-full border-gray-300 text-green-500 focus:ring-green-500 cursor-pointer" />
                <span className="font-extrabold text-gray-900 text-lg group-hover:text-green-600 transition">전체 동의하기</span>
              </label>
              <div className="space-y-4 pt-2">
                {[
                  { key: 'terms', label: '필수', text: '이용약관' },
                  { key: 'privacy', label: '필수', text: '개인정보 수집 및 이용' },
                  { key: 'location', label: '선택', text: '위치기반서비스 이용약관' },
                  { key: 'marketing', label: '선택', text: '프로모션 소식 수신' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={(agreements as any)[item.key]}
                        onChange={(e) => handleSingleAgree(item.key as any, e.target.checked)}
                        className="w-5 h-5 rounded-full border-gray-300 text-green-500 focus:ring-green-500" />
                      <span className="text-sm font-bold text-gray-700">
                        <span className={item.label === '필수' ? 'text-green-600' : 'text-gray-400'}>[{item.label}]</span> {item.text}
                      </span>
                    </label>
                    <button className="text-[11px] text-gray-400 hover:underline">보기</button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => { if (agreements.terms && agreements.privacy) setStep(2); else alert('필수 약관에 동의해 주세요.'); }}
              className="w-full mt-10 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl text-lg transition shadow-lg active:scale-95">다음 단계로</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
                <span className="w-6 text-xl">👤</span>
                <input type="email" placeholder="아이디 (이메일)" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="flex-1 ml-2 outline-none text-sm font-bold placeholder:text-gray-300" />
              </div>
              <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
                <span className="w-6 text-xl">🔒</span>
                <input type="password" placeholder="비밀번호" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="flex-1 ml-2 outline-none text-sm font-bold placeholder:text-gray-300" />
              </div>
              <div className="flex items-center px-4 py-3.5">
                <span className="w-6 text-xl">📛</span>
                <input type="text" placeholder="이름" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="flex-1 ml-2 outline-none text-sm font-bold placeholder:text-gray-300" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
                <span className="w-6 text-xl">📅</span>
                <input type="text" placeholder="생년월일 8자리" className="flex-1 ml-2 outline-none text-sm font-bold placeholder:text-gray-300" />
              </div>
              <div className="flex divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/30">
                <button onClick={() => setFormData({...formData, gender: 'male'})} className={`flex-1 py-3 text-xs font-black transition ${formData.gender === 'male' ? 'bg-white text-green-600' : 'text-gray-400'}`}>남자</button>
                <button onClick={() => setFormData({...formData, gender: 'female'})} className={`flex-1 py-3 text-xs font-black transition ${formData.gender === 'female' ? 'bg-white text-green-600' : 'text-gray-400'}`}>여자</button>
                <button onClick={() => setFormData({...formData, isForeigner: false})} className={`flex-1 py-3 text-xs font-black transition ${!formData.isForeigner ? 'bg-white text-green-600' : 'text-gray-400'}`}>내국인</button>
                <button onClick={() => setFormData({...formData, isForeigner: true})} className={`flex-1 py-3 text-xs font-black transition ${formData.isForeigner ? 'bg-white text-green-600' : 'text-gray-400'}`}>외국인</button>
              </div>
              
              {/* Phone Certification Group (Naver Style) */}
              <div className="flex items-center px-4 py-3.5 border-b border-gray-100 bg-white">
                <span className="w-6 text-xl">📱</span>
                <input type="text" placeholder="휴대전화번호" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="flex-1 ml-2 outline-none text-sm font-bold placeholder:text-gray-300" />
                <button onClick={sendCert} disabled={isVerified}
                  className="text-xs font-black text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 transition whitespace-nowrap disabled:text-gray-300 disabled:bg-gray-50">
                  {certSent ? (isVerified ? '인증완료' : '재발송') : '인증요청'}
                </button>
              </div>

              {certSent && !isVerified && (
                <div className="animate-in slide-in-from-top-2 flex items-center px-4 py-3.5 bg-green-50/50">
                  <span className="w-6 text-lg">🔑</span>
                  <input type="text" placeholder="인증번호 6자리" value={certCode} onChange={(e) => setCertCode(e.target.value)}
                    className="flex-1 ml-2 outline-none text-sm font-bold bg-transparent placeholder:text-gray-300" />
                  <span className="text-xs font-bold text-red-500 mr-3">{formatTime(timer)}</span>
                  <button onClick={verifyCode} className="text-xs font-black text-white bg-green-500 px-4 py-1.5 rounded-lg shadow-md hover:bg-green-600 transition">인증</button>
                </div>
              )}
            </div>

            <button onClick={handleRegister} disabled={!isVerified}
              className={`w-full py-4.5 rounded-xl text-lg font-black transition shadow-lg active:scale-95 ${isVerified ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-100' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}>
              회원가입 완료
            </button>
            <button onClick={() => setStep(1)} className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition">← 이전 단계로</button>
          </div>
        )}
        <div className="mt-12 text-center text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-tighter">
          Copyright © Housing Connect Corp. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}
