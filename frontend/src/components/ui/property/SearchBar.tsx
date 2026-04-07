'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [foreignerFriendly, setForeignerFriendly] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (foreignerFriendly) params.append('foreignerFriendly', 'true');
    if (petFriendly) params.append('petFriendly', 'true');
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="bg-white border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">상세검색</h3>
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">키워드·주소</label>
          <input
            type="text"
            className="w-full border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none"
            placeholder="지역명·역명·주소로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">최소 월세</label>
            <input
              type="number"
              className="w-full border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none"
              placeholder="최소"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">최대 월세</label>
            <input
              type="number"
              className="w-full border border-gray-200 px-3 py-2 text-sm focus:border-green-400 focus:outline-none"
              placeholder="최대"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={foreignerFriendly}
              onChange={(e) => setForeignerFriendly(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-600">외국인 전용</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={petFriendly}
              onChange={(e) => setPetFriendly(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-slate-600">반려동물 가능</span>
          </label>
        </div>

        <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 text-sm transition">
          검색
        </button>
      </form>
    </div>
  );
}
