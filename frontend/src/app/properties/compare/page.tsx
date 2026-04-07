'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSavedProperties } from '@/lib/api/client';

interface Property {
  id: number;
  title: string;
  titleKo?: string;
  area: string;
  areaKo?: string;
  rent: number;
  deposit: number;
  adminFee?: number;
  roomType: string;
  size?: number;
  floor?: string;
  buildYear?: number;
  accessStation?: string;
  accessMinutes?: number;
  foreigner: boolean;
  pet?: boolean;
  amenities?: string[];
  images?: string[];
  rating?: number;
}

const FALLBACK: Property[] = [
  { id:1, title:'新宿三丁目 1K', titleKo:'신주쿠산초메 1K', area:'新宿区', areaKo:'신주쿠구', rent:85000, deposit:85000, adminFee:5000, roomType:'1K', size:25.5, floor:'3F/8F', buildYear:2019, accessStation:'新宿三丁目', accessMinutes:4, foreigner:true, pet:false, amenities:['에어컨','오토락','욕실건조기'], rating:4.5 },
  { id:2, title:'渋谷 ワンルーム', titleKo:'시부야 원룸', area:'渋谷区', areaKo:'시부야구', rent:95000, deposit:95000, adminFee:8000, roomType:'1R', size:22.0, floor:'5F/10F', buildYear:2021, accessStation:'渋谷', accessMinutes:6, foreigner:true, pet:true, amenities:['에어컨','오토락','택배보관함'], rating:4.7 },
];

const COMPARE_FIELDS: { key: string; label: string; format?: (v: any, p: Property) => string }[] = [
  { key: 'rent', label: '월세 (¥)', format: (v) => `¥${v?.toLocaleString()} (~₩${Math.round((v||0)*9.2).toLocaleString()})` },
  { key: 'deposit', label: '보증금 (¥)', format: (v) => `¥${v?.toLocaleString()}` },
  { key: 'adminFee', label: '관리비 (¥)', format: (v) => v ? `¥${v.toLocaleString()}` : '없음' },
  { key: 'roomType', label: '방 타입' },
  { key: 'size', label: '면적', format: (v) => v ? `${v}㎡` : '-' },
  { key: 'floor', label: '층수' },
  { key: 'buildYear', label: '건축년도', format: (v) => v ? `${v}년` : '-' },
  { key: 'accessStation', label: '최근역', format: (v, p) => v ? `${v} ${p.accessMinutes || '?'}분` : '-' },
  { key: 'foreigner', label: '외국인 환영', format: (v) => v ? '✅ 가능' : '❌ 불가' },
  { key: 'pet', label: '반려동물', format: (v) => v ? '✅ 가능' : '❌ 불가' },
  { key: 'amenities', label: '시설', format: (v) => Array.isArray(v) ? v.join(', ') : '-' },
  { key: 'rating', label: '평점', format: (v) => v ? `⭐ ${v}` : '-' },
];

export default function ComparePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSavedProperties() as any;
        setProperties(Array.isArray(data) && data.length > 0 ? data : FALLBACK);
      } catch {
        setProperties(FALLBACK);
      }
      setLoading(false);
    })();
  }, []);

  const toggle = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  const compared = properties.filter(p => selected.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">📊 매물 비교하기</h1>
        <p className="text-sm text-gray-500">찜한 매물 중 최대 4개를 선택해 비교하세요</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">불러오는 중...</div>
      ) : (
        <>
          {/* Property Selection */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-700 mb-3">비교할 매물 선택 ({selected.length}/4)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {properties.map(p => {
                const isSelected = selected.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={`text-left p-3 border-2 rounded-lg transition ${
                      isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-bold text-gray-800 truncate flex-1">{p.titleKo || p.title}</span>
                      {isSelected && <span className="text-green-500 ml-1">✓</span>}
                    </div>
                    <p className="text-[11px] text-gray-400">{p.areaKo || p.area}</p>
                    <p className="text-xs font-bold text-green-600 mt-1">¥{p.rent?.toLocaleString()}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison Table */}
          {compared.length >= 2 ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 font-bold text-gray-500 bg-gray-50 min-w-[120px] sticky left-0 z-10">항목</th>
                    {compared.map(p => (
                      <th key={p.id} className="p-4 text-center min-w-[180px]">
                        <Link href={`/properties/${p.id}`} className="text-primary font-bold hover:underline text-sm">
                          {p.titleKo || p.title}
                        </Link>
                        <p className="text-[11px] text-gray-400 mt-0.5">{p.areaKo || p.area}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_FIELDS.map((field, idx) => (
                    <tr key={field.key} className={idx % 2 === 0 ? 'bg-gray-50/50' : ''}>
                      <td className="p-4 font-bold text-gray-600 text-xs bg-gray-50 sticky left-0 z-10">{field.label}</td>
                      {compared.map(p => {
                        const val = (p as any)[field.key];
                        const display = field.format ? field.format(val, p) : (val ?? '-');
                        // Highlight best rent (lowest)
                        const isBestRent = field.key === 'rent' && val === Math.min(...compared.map(c => c.rent || Infinity));
                        return (
                          <td key={p.id} className={`p-4 text-center text-xs ${isBestRent ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                            {display}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <p className="text-4xl mb-3">📊</p>
              <p className="font-bold mb-1">2개 이상 선택하면 비교표가 나타납니다</p>
              <p className="text-xs">위에서 비교할 매물을 선택해주세요</p>
            </div>
          )}

          {compared.length >= 2 && (
            <div className="mt-6 flex justify-center gap-4">
              <button onClick={() => setSelected([])} className="text-sm text-gray-500 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                초기화
              </button>
              <Link href="/properties" className="text-sm text-white bg-primary px-6 py-2 rounded-lg font-bold hover:bg-green-600 transition">
                매물 더 보기
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
