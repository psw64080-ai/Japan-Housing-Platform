'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCommunityPost, updateCommunityPost } from '@/lib/api/client';

const CATEGORIES = [
  { key: '주거질문', label: '🏠 주거질문' },
  { key: '생활팁', label: '💡 생활팁' },
  { key: '모임', label: '👥 모임' },
  { key: '긴급', label: '🚨 긴급' },
  { key: '자유', label: '💬 자유' },
];

const DEMO: Record<number, { title: string; content: string; category: string }> = {
  1: { title: '외국인이 도쿄에서 집 구할 때 보증인 없으면 진짜 못 구하나요?', content: '다음 달에 도쿄로 이사가는데 보증인이 없어서 걱정입니다. 보증회사(保証会社)를 이용하면 된다고 들었는데, 실제로 외국인이 보증회사 심사 통과하기 쉬운가요?', category: '주거질문' },
  2: { title: '시부야구 쓰레기 분리수거 완벽 정리 (2026년 최신)', content: '시부야구에 살면서 쓰레기 분리수거 때문에 정말 고생했는데, 이제 완벽하게 정리했습니다!', category: '생활팁' },
};

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const postId = parseInt(params.id);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('자유');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCommunityPost(postId) as any;
        if (data && data.id) {
          setTitle(data.title || '');
          setContent(data.content || '');
          setCategory(data.category || '자유');
        } else throw new Error('not found');
      } catch {
        const demo = DEMO[postId];
        if (demo) { setTitle(demo.title); setContent(demo.content); setCategory(demo.category); }
        else setError('게시글을 찾을 수 없습니다.');
      }
      setLoading(false);
    })();
  }, [postId]);

  const handleSave = async () => {
    if (!title.trim()) { setError('제목을 입력하세요.'); return; }
    if (!content.trim()) { setError('내용을 입력하세요.'); return; }

    setSaving(true);
    setError('');
    try {
      await updateCommunityPost(postId, { title: title.trim(), content: content.trim(), category });
      setSuccess(true);
      setTimeout(() => router.push(`/community/${postId}`), 1000);
    } catch (e: any) {
      setError(e.message || '수정에 실패했습니다.');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center text-gray-400"><p className="text-4xl mb-3 animate-pulse">✏️</p><p className="font-bold">게시글을 불러오는 중...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <Link href={`/community/${postId}`} className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-bold text-sm mb-6">← 게시글로</Link>

        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h1 className="text-xl font-extrabold text-gray-900 mb-1">✏️ 글 수정</h1>
          <p className="text-sm text-gray-500">게시글 #{postId}</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 font-bold text-sm p-4 mb-6">⚠️ {error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-600 font-bold text-sm p-4 mb-6">✅ 수정되었습니다!</div>}

        {/* 카테고리 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-3 text-sm">카테고리</h2>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className={`px-3 py-1.5 border text-xs font-bold transition ${
                  category === c.key ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-300'
                }`}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-2">제목</label>
          <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); setError(''); }}
            className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-green-400" />
        </div>

        {/* 내용 */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-bold text-gray-800 mb-2">내용</label>
          <textarea value={content} onChange={(e) => { setContent(e.target.value); setError(''); }}
            rows={12} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-green-400 resize-none leading-relaxed" />
        </div>

        <div className="flex gap-3 mb-10">
          <Link href={`/community/${postId}`} className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 text-sm text-center hover:bg-gray-50 transition">취소</Link>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 text-sm transition">
            {saving ? '저장 중...' : '💾 수정 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}
