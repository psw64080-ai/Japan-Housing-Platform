'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createCommunityPost } from '@/lib/api/client';

const CATEGORIES = [
  { key: '주거질문', label: '🏠 주거질문', desc: '집 구하기, 이사, 계약 관련' },
  { key: '생활팁', label: '💡 생활팁', desc: '쓰레기, 공과금, 편의점 등' },
  { key: '모임', label: '👥 모임', desc: '교류회, 스터디, 동호회' },
  { key: '긴급', label: '🚨 긴급', desc: '재난, 사건, 긴급 도움' },
  { key: '자유', label: '💬 자유', desc: '자유 주제 게시글' },
];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('자유');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) { setError('제목을 입력하세요.'); return; }
    if (!content.trim()) { setError('내용을 입력하세요.'); return; }
    if (title.trim().length < 5) { setError('제목은 5자 이상 입력하세요.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await createCommunityPost({ title: title.trim(), content: content.trim(), category }) as any;
      if (res?.id) router.push(`/community/${res.id}`);
      else router.push('/community');
    } catch (e: any) {
      setError(e.message || '게시글 작성에 실패했습니다.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/community" className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-bold text-sm mb-6">← 커뮤니티</Link>

        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h1 className="text-xl font-extrabold text-gray-900 mb-1">📝 새 글 작성</h1>
          <p className="text-sm text-gray-500">일본 생활에 관한 질문이나 정보를 이웃들과 공유해보세요</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 font-bold text-sm p-4 mb-6">⚠️ {error}</div>
        )}

        {/* 카테고리 선택 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-3 text-sm">카테고리</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => { setCategory(c.key); setError(''); }}
                className={`p-3 border text-center transition ${
                  category === c.key
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300 text-gray-600'
                }`}>
                <p className="text-sm font-bold">{c.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{c.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-2">제목</label>
          <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); setError(''); }}
            placeholder="제목을 입력하세요 (5자 이상)" maxLength={100}
            className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-green-400" />
          <p className="text-[11px] text-gray-400 mt-1 text-right">{title.length}/100</p>
        </div>

        {/* 내용 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-2">내용</label>
          <textarea value={content} onChange={(e) => { setContent(e.target.value); setError(''); }}
            placeholder="내용을 입력하세요. 이모지, 줄바꿈을 자유롭게 사용하세요."
            rows={12} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-green-400 resize-none leading-relaxed" />
          <p className="text-[11px] text-gray-400 mt-1 text-right">{content.length}자</p>
        </div>

        {/* 작성 팁 */}
        <div className="bg-amber-50 border border-amber-200 p-4 mb-6">
          <h3 className="font-bold text-xs text-amber-700 mb-1.5">💡 좋은 글 작성 팁</h3>
          <ul className="text-[11px] text-amber-600 space-y-0.5">
            <li>• 제목에 핵심 키워드를 포함하면 더 많은 분들이 봅니다</li>
            <li>• 질문글은 거주 지역/상황을 구체적으로 써주세요</li>
            <li>• 정보 공유글은 날짜와 출처를 함께 기재해주세요</li>
          </ul>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 mb-10">
          <Link href="/community" className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 text-sm text-center hover:bg-gray-50 transition">취소</Link>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 text-sm transition">
            {saving ? '게시 중...' : '📝 게시하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
