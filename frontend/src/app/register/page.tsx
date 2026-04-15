'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api/client';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    nationality: '',
    role: 'SEEKER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        name: form.name,
        nationality: form.nationality,
        role: form.role,
      });
      router.push('/');
    } catch {
      setError('회원가입에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-green-600 mb-2">회원가입</h1>
          <p className="text-gray-500 text-sm">무료로 가입하고 일본 주거 서비스를 시작하세요</p>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">이름</label>
              <input name="name" type="text" required value={form.name} onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 transition"
                placeholder="홍길동" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">이메일</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 transition"
                placeholder="example@email.com" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">비밀번호</label>
                <input name="password" type="password" required value={form.password} onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 transition"
                  placeholder="8자 이상" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">비밀번호 확인</label>
                <input name="passwordConfirm" type="password" required value={form.passwordConfirm} onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 transition"
                  placeholder="다시 입력" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">국적</label>
                <input name="nationality" type="text" value={form.nationality} onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 transition"
                  placeholder="한국" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">회원 유형</label>
                <select name="role" value={form.role} onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-500 transition bg-white">
                  <option value="SEEKER">집을 찾는 사람</option>
                  <option value="LANDLORD">집주인</option>
                  <option value="SHAREOWNER">셰어하우스 호스트</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 text-sm transition disabled:opacity-50 mt-2">
              {loading ? '가입 중...' : '무료 회원가입'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-green-600 font-bold hover:underline">로그인</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
