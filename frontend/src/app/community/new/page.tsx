'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn, getUser } from '@/lib/auth';

const CATEGORIES = ['주거질문', '생활팁', '모임', '긴급', '자유'];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('주거질문');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) {
      alert('🔒 커뮤니티 글쓰기는 로그인 후 이용 가능합니다!');
      router.push('/login');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('제목을 입력해 주세요.'); return; }
    if (!content.trim()) { setError('내용을 입력해 주세요.'); return; }
    setSubmitting(true);
    setError('');

      try {
        const currentUser = getUser();
        if (!currentUser) {
          alert('로그인이 필요한 서비스입니다.');
          router.push('/login');
          return;
        }

        // 로컬 스토리지에 임시 저장 (백엔드 연동 전)
        const stored = localStorage.getItem('jhc_community_posts');
        const posts = stored ? JSON.parse(stored) : [];
        const newPost = {
          id: Date.now(),
          title: title.trim(),
          content: content.trim(),
          category,
          author: currentUser.name,
          likes: 0,
          commentsCount: 0,
          views: 0,
          likedBy: [],
          createdAt: new Date().toISOString(),
          source: 'user',
        };
        posts.unshift(newPost);
        localStorage.setItem('jhc_community_posts', JSON.stringify(posts));
        alert('게시글이 등록되었습니다! 🎉');
        router.push('/community');
      } catch {
      setError('게시글 등록에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/community" className="hover:text-green-600">커뮤니티</Link>
          <span>›</span>
          <span className="text-gray-700 font-bold">새 글 작성</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5">
            <h1 className="text-xl font-extrabold text-white">✍️ 새 글 작성</h1>
            <p className="text-green-100 text-sm mt-1">일본 생활 정보를 이웃들과 나눠보세요</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">카테고리 선택</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition border ${
                      category === cat
                        ? 'bg-green-500 text-white border-green-500 shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">제목 <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="제목을 입력하세요 (최대 100자)"
                maxLength={100}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{title.length}/100</p>
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">내용 <span className="text-red-400">*</span></label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="내용을 입력하세요..."
                rows={10}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{content.length}자</p>
            </div>

            {/* 에러 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            {/* 유의사항 */}
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
              <p className="font-bold text-gray-700 mb-2">📌 작성 유의사항</p>
              <p>• 타인을 비방하거나 불쾌감을 주는 내용은 삭제될 수 있습니다</p>
              <p>• 개인정보(전화번호, 주소 등)는 공개하지 않도록 주의해 주세요</p>
              <p>• 광고성 게시글은 사전 통보 없이 삭제됩니다</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Link href="/community" className="flex-1 text-center border border-gray-200 text-gray-600 font-bold py-3.5 rounded-xl text-sm hover:bg-gray-50 transition">
                취소
              </Link>
              <button type="submit" disabled={submitting}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-extrabold py-3.5 rounded-xl text-sm transition disabled:opacity-60 hover:scale-105">
                {submitting ? '등록 중...' : '🚀 게시글 등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
