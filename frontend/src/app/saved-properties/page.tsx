'use client';

import { useState, useEffect } from 'react';
import { getSavedProperties } from '@/lib/api/client';
import Link from 'next/link';

interface SavedProperty {
  id: number;
  title: string;
  address?: string;
  monthlyRent?: number;
  deposit?: number;
  size?: number;
  imageUrl?: string;
  savedAt?: string;
}

export default function SavedPropertiesPage() {
  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSavedProperties();
        setSaved(data as SavedProperty[]);
      } catch {
        setSaved([
          { id: 1, title: '신주쿠 1K 맨션', address: '도쿄도 신주쿠구 햐쿠닌초', monthlyRent: 75000, deposit: 150000, size: 25, savedAt: '2024-01-15' },
          { id: 2, title: '시부야 원룸', address: '도쿄도 시부야구 신센초', monthlyRent: 85000, deposit: 170000, size: 20, savedAt: '2024-01-12' },
          { id: 3, title: '이케부쿠로 1DK 아파트', address: '도쿄도 도시마구 히가시이케부쿠로', monthlyRent: 68000, deposit: 136000, size: 30, savedAt: '2024-01-10' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">💾 저장한 매물</h1>
          <p className="text-gray-500 text-sm">관심 목록에 저장한 매물들을 확인하세요</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse font-bold">불러오는 중...</div>
        ) : saved.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-500 font-bold">저장한 매물이 없습니다</p>
            <Link href="/properties" className="inline-block mt-4 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 text-sm transition">
              매물 검색하기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {saved.map((p) => (
              <Link key={p.id} href={`/properties/${p.id}`}>
                <div className="bg-white border border-gray-200 p-5 hover:shadow-lg hover:border-green-400 transition cursor-pointer flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-40 h-28 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">🏠</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-gray-800 mb-1">{p.title}</h3>
                    <p className="text-xs text-gray-400 mb-2">📍 {p.address}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                      <span>월세 <strong className="text-green-600">¥{p.monthlyRent?.toLocaleString()}</strong></span>
                      <span>보증금 ¥{p.deposit?.toLocaleString()}</span>
                      <span>{p.size}㎡</span>
                    </div>
                    <p className="text-[11px] text-gray-300">저장일: {p.savedAt}</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => { e.preventDefault(); }}
                      className="text-red-400 hover:text-red-600 text-xl transition"
                      title="저장 취소"
                    >
                      ❤️
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
